#include <SPI.h>
#include <Wire.h>
#include <math.h>

/* ============================================================
   1) MAX17048 (I2C)
   ============================================================ */
#define MAX17048_ADDR 0x36
#define REG_VCELL     0x02
#define REG_SOC       0x04

float readVoltage();
float readSOC();
uint16_t readRegister16(uint8_t reg);

/* ============================================================
   2) External ADC (SPI)
   ============================================================ */
#define CS_ADC_Pwr          0b00000010
#define ADC_CTRL_PORT       PORTH
#define ADC_CTRL_PORT_DIR   DDRH
#define ALM_ADC_Pwr         0b00100000
#define ADC_ALM_PORT        PORTE
#define ADC_ALM_PORT_DIR    DDRE

void ADCinit();
void ADCread(uint16_t channel, uint8_t* rtrnChnl, float *rtrnVolt);
float ADCconvert(uint8_t channel, float voltage);

/* ============================================================
   3) SOLAR + bq24071
   ============================================================ */
#define PIN_PGSOLAR    7
#define PIN_EN_SOLAR   8
#define PIN_PGCHGR     10
#define PIN_STAT1      11
#define PIN_STAT2      12
#define PIN_CE         13
#define PIN_MODE       14

bool solarPowerPath = false;
bool solarAutoMode  = false;

const unsigned long PG_DEBOUNCE_MS = 30;

static inline bool odAsserted(int pin) {
  return (digitalRead(pin) == LOW);
}

void odWrite(int pin, bool high) {
  if (high) pinMode(pin, INPUT);
  else {
    pinMode(pin, OUTPUT);
    digitalWrite(pin, LOW);
  }
}

String decodeCharging(bool stat1_on, bool stat2_on, bool pg_ok) {
  if (stat1_on && !stat2_on) return "Fast charging";
  if (!stat1_on && stat2_on) return "Charge done";
  if (stat1_on && stat2_on) {
    if (!pg_ok) return "NO INPUT / SLEEP";
    return "Precharge or fault";
  }
  if (!pg_ok) return "NO INPUT / SLEEP";
  return "Suspend / standby";
}

bool getDebouncedPGCHGR() {
  static bool lastStable = false;
  static bool lastRead = false;
  static unsigned long tChange = 0;

  bool now = odAsserted(PIN_PGCHGR);
  if (now != lastRead) {
    lastRead = now;
    tChange = millis();
  }
  if (millis() - tChange >= PG_DEBOUNCE_MS)
    lastStable = lastRead;

  return lastStable;
}

/* ============================================================
   SETUP
   ============================================================ */
void setup() {
  Serial.begin(115200);

  Wire.begin();
  Wire.setClock(100000);
  SPI.begin();

  ADCinit();

  pinMode(PIN_PGSOLAR, INPUT_PULLUP);
  pinMode(PIN_EN_SOLAR, OUTPUT);
  digitalWrite(PIN_EN_SOLAR, LOW);

  pinMode(PIN_PGCHGR, INPUT);
  pinMode(PIN_STAT1, INPUT);
  pinMode(PIN_STAT2, INPUT);

  odWrite(PIN_CE, false);
  odWrite(PIN_MODE, false);
}

/* ============================================================
   LOOP
   ============================================================ */
void loop() {

    /* ---------- SERIAL MANUAL SOLAR CONTROL ---------- */
  if (Serial.available() > 0) {
    char c = Serial.read();

    if (c == '1') {
      solarAutoMode = false;
      solarPowerPath = true;
      digitalWrite(PIN_EN_SOLAR, HIGH);
    }
    else if (c == '0') {
      solarAutoMode = false;
      solarPowerPath = false;
      digitalWrite(PIN_EN_SOLAR, LOW);
    }
  }



  /* ---------- BATTERY ---------- */
  float voltage = readVoltage();
  float soc     = readSOC();

  /* ---------- ADC ---------- */
  float adcValues[16];
  for (int i = 0; i < 16; i++) adcValues[i] = NAN;

  for (uint16_t channel = 0; channel < 16; channel++) {
    uint8_t rtrnChnl;
    float rtrnVolt;
    ADCread(channel, &rtrnChnl, &rtrnVolt);
    adcValues[rtrnChnl] = ADCconvert(rtrnChnl, rtrnVolt);
  }

  /* ---------- SOLAR + CHARGER ---------- */
  bool solarSupplyOK = (digitalRead(PIN_PGSOLAR) == LOW);
  bool inputPowerOK  = getDebouncedPGCHGR();

  if (inputPowerOK) {
    odWrite(PIN_CE, true);
    odWrite(PIN_MODE, true);
  } else {
    odWrite(PIN_CE, false);
    odWrite(PIN_MODE, false);
  }

  if (solarAutoMode) {
    solarPowerPath = solarSupplyOK;
    digitalWrite(PIN_EN_SOLAR, solarPowerPath);
  }

  if (inputPowerOK) {
    solarAutoMode = false;
    solarPowerPath = false;
    digitalWrite(PIN_EN_SOLAR, LOW);
  }

  bool stat1_on = odAsserted(PIN_STAT1);
  bool stat2_on = odAsserted(PIN_STAT2);

  String chargingStatus = decodeCharging(stat1_on, stat2_on, inputPowerOK);
  String sourceMode = solarPowerPath ? "SOLAR" : (inputPowerOK ? "ADAPTER" : "USB");

  /* ---------- JSON BUILD ---------- */
  String json = "{";

  json += "\"battery\":{";
  json += "\"voltage_V\":" + String(voltage, 3) + ",";
  json += "\"soc_percent\":" + String(soc, 2);
  json += "},";

  json += "\"solar_charger\":{";
  json += "\"solar_supply_ok\":" + String(solarSupplyOK ? "true" : "false") + ",";
  json += "\"solar_power_path\":" + String(solarPowerPath ? "true" : "false") + ",";
  json += "\"solar_mode\":" + String(solarAutoMode ? "true" : "false") + ",";
  json += "\"input_power_ok\":" + String(inputPowerOK ? "true" : "false") + ",";
  json += "\"charger_enabled\":" + String(inputPowerOK ? "true" : "false") + ",";
  json += "\"source_mode\":\"" + sourceMode + "\",";
  json += "\"charging_status\":\"" + chargingStatus + "\",";
  json += "\"stat1\":" + String(stat1_on ? "true" : "false") + ",";
  json += "\"stat2\":" + String(stat2_on ? "true" : "false");
  json += "},";

  json += "\"adc\":{";
  bool first = true;
  for (int i = 0; i < 16; i++) {
    if (!isnan(adcValues[i])) {
      if (!first) json += ",";
      json += "\"ch_" + String(i) + "\":" + String(adcValues[i], 2);
      first = false;
    }
  }
  json += "}";

  json += "}";

  /* ---------- FINAL OUTPUT ---------- */
  Serial.println(json);

  delay(2000);
}

/* ============================================================
   MAX17048
   ============================================================ */
float readVoltage() {
  return readRegister16(REG_VCELL) * 0.000078125;
}

float readSOC() {
  return readRegister16(REG_SOC) * 0.00390625;
}

uint16_t readRegister16(uint8_t reg) {
  Wire.beginTransmission(MAX17048_ADDR);
  Wire.write(reg);
  Wire.endTransmission(false);
  Wire.requestFrom(MAX17048_ADDR, (uint8_t)2);
  uint8_t msb = Wire.read();
  uint8_t lsb = Wire.read();
  return (uint16_t(msb) << 8) | lsb;
}

/* ============================================================
   ADC
   ============================================================ */
void ADCinit() {
  ADC_CTRL_PORT_DIR |= CS_ADC_Pwr;
  ADC_ALM_PORT_DIR &= ~ALM_ADC_Pwr;
  ADC_CTRL_PORT |= CS_ADC_Pwr;
}

void ADCread(uint16_t channel, uint8_t* rtrnChnl, float *rtrnVolt) {
  uint16_t command = 0b0001100001000000 | (channel << 7);
  ADC_CTRL_PORT &= ~CS_ADC_Pwr;
  uint16_t output = SPI.transfer16(command);
  ADC_CTRL_PORT |= CS_ADC_Pwr;
  *rtrnChnl = (output & 0xF000) >> 12;
  output &= 0x0FFF;
  *rtrnVolt = (float(output) * 5.0 / 4096.0) * 1000.0;
}

float ADCconvert(uint8_t channel, float voltage) {

  // ---------- CURRENT CHANNELS ----------
  if (((channel >= 2) && (channel <= 5)) || ((channel >= 13) && (channel <= 15))) {
    float Vsense = voltage / 50.0;
    if (channel >= 13)
      return Vsense / 0.033;      // 33 mΩ
    else
      return Vsense / 0.43;       // 430 mΩ
  }

  // ---------- BATTERY TEMPERATURE (ch0,1,7,8) ----------
  else if ((channel == 0) || (channel == 1) || (channel == 7) || (channel == 8)) {

    voltage /= 1000.0;
    float Rsense = ((3.3 / voltage) - 1.0) * 10000.0;
    Rsense /= 1000.0;   // convert to kΩ

    float Temp = NAN;

    if (Rsense >= 53.41 && Rsense <= 329.5)
      Temp = log(Rsense / 23.869) / (-0.052);
    else if (Rsense >= 10 && Rsense < 53.41)
      Temp = log(Rsense / 27.52) / (-0.041);
    else if (Rsense >= 2.588 && Rsense < 10)
      Temp = log(Rsense / 22.238) / (-0.033);
    else if (Rsense >= 0.7576 && Rsense < 2.588)
      Temp = log(Rsense / 14.481) / (-0.027);

    return Temp;
  }

  // ---------- BOARD TEMPERATURE (ch6) ----------
  else if (channel == 6) {

    voltage /= 1000.0;
    float Rsense = ((3.3 / voltage) - 1.0) * 10000.0;
    Rsense /= 10000.0; // convert to tens of kΩ

    float Temp = NAN;

    if (Rsense >= 2.764 && Rsense < 20.52)
      Temp = log(Rsense / 2.6602) / (-0.05);
    else if (Rsense >= 0.5828 && Rsense < 2.764)
      Temp = log(Rsense / 2.725) / (-0.039);
    else if (Rsense >= 0.1672 && Rsense < 0.5828)
      Temp = log(Rsense / 1.9928) / (-0.031);
    else if (Rsense >= 0.04986 && Rsense < 0.1672)
      Temp = log(Rsense / 1.4248) / (-0.027);

    return Temp;
  }

  return NAN;
}

