import serial
import time
import re
from datetime import datetime
from pymongo import MongoClient
import copy

# ================= SERIAL CONFIG =================
PORT = "COM12"
BAUDRATE = 115200

# ================= MONGODB CONFIG =================
MONGO_URI = "mongodb+srv://si31siyam_db_user:OFmyOZfOO842xsgl@cluster0.84rtvtv.mongodb.net/?appName=Cluster0"
DB_NAME = "arduino_logger"
COLLECTION_NAME = "sensor_readings"

# ================= CONNECT MONGODB =================
mongo_client = MongoClient(MONGO_URI)
db = mongo_client[DB_NAME]
collection = db[COLLECTION_NAME]
print("✅ Connected to MongoDB")

# ================= CONNECT SERIAL =================
ser = serial.Serial(PORT, BAUDRATE, timeout=1)
time.sleep(2)
print(f"✅ Connected to Arduino on {PORT}")

# ================= SNAPSHOT TEMPLATE =================
def new_snapshot():
    return {
        "timestamp": None,
        "battery": {
            "voltage_V": None,
            "soc_percent": None
        },
        "adc": {},
        "solar_charger": {
            "solar_supply_ok": None,
            "solar_power_path": None,
            "solar_mode": None,
            "input_power_ok": None,
            "charger_enabled": None,
            "source_mode": None,
            "charging_status": None,
            "stat1": None,
            "stat2": None
        }
    }

snapshot = new_snapshot()
last_insert_time = time.time()

# ================= HELPERS =================
def extract_float(text):
    m = re.search(r"[-+]?\d*\.\d+|\d+", text)
    return float(m.group()) if m else None

def extract_charging_status(line):
    m = re.search(r"Charging Status:\s*([^|]+)", line)
    return m.group(1).strip() if m else None

# ================= MAIN LOOP =================
while True:
    try:
        line = ser.readline().decode("utf-8", errors="ignore").strip()
        if not line:
            continue

        print(line)

        # ---------- Battery ----------
        if line.startswith("Battery Voltage"):
            snapshot["battery"]["voltage_V"] = extract_float(line)

        elif line.startswith("State of Charge"):
            snapshot["battery"]["soc_percent"] = extract_float(line)

        # ---------- ADC ----------
        elif line.startswith("Channel #") and "NOT CONNECTED" not in line:
            ch_match = re.search(r"Channel #(\d+)", line)
            val = extract_float(line)
            if ch_match and val is not None:
                snapshot["adc"][f"ch_{int(ch_match.group(1))}"] = val

        # ---------- Solar ----------
        elif line.startswith("Solar Supply Status"):
            snapshot["solar_charger"] = {
                "solar_supply_ok": "Solar Supply Status: OK" in line,
                "solar_power_path": "Solar Power Path: ON" in line,
                "solar_mode": "Solar Mode: AUTO" in line,
                "input_power_ok": "Input Power Status: OK" in line,
                "charger_enabled": "Charger Enable: ON" in line,
                "source_mode": "ADAPTER" if "ADAPTER" in line else "USB",
                "charging_status": extract_charging_status(line),
                "stat1": "STAT1:ON" in line,
                "stat2": "STAT2:ON" in line
            }

        # ---------- TIMED INSERT (NO RESET) ----------
        if time.time() - last_insert_time >= 1:
            doc = copy.deepcopy(snapshot)
            doc["timestamp"] = datetime.utcnow()

            collection.insert_one(doc)
            print("⏱️ Inserted (1 sec snapshot)\n")

            last_insert_time = time.time()

        # ---------- END OF CYCLE (RESET HERE ONLY) ----------
        if "==============================" in line:
            snapshot = new_snapshot()

    except KeyboardInterrupt:
        print("\n🛑 Stopped by user")
        break
