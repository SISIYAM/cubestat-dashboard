import random
import time
from datetime import datetime
from pymongo import MongoClient

# ================= MONGODB CONFIG =================
MONGO_URI = "mongodb+srv://si31siyam_db_user:OFmyOZfOO842xsgl@cluster0.84rtvtv.mongodb.net/?appName=Cluster0"
DB_NAME = "arduino_logger"
COLLECTION_NAME = "sensor_readings"

# ================= CONNECT MONGODB =================
try:
    mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = mongo_client[DB_NAME]
    collection = db[COLLECTION_NAME]
    mongo_client.admin.command("ping")
    print("✅ Connected to MongoDB")
except Exception as e:
    print("❌ MongoDB connection failed:", e)
    exit(1)


# ================= DATA GENERATOR =================
def generate_random_data():
    """
    Generate random EPS data matching the real Arduino schema
    """
    return {
        "timestamp": datetime.utcnow(),

        "battery": {
            "voltage_V": round(random.uniform(3.4, 4.15), 3),
            "soc_percent": round(random.uniform(0, 100), 2)
        },

        "adc": {
            "ch_0": round(random.uniform(20, 30), 2),      # Battery Cell 1 Temp (°C)
            "ch_1": round(random.uniform(20, 30), 2),      # Battery Cell 2 Temp (°C)
            "ch_2": round(random.uniform(0.05, 0.5), 3),   # Solar X+ Current (mA)
            "ch_3": round(random.uniform(0.05, 0.5), 3),   # Solar X- Current (mA)
            "ch_4": round(random.uniform(0.05, 0.5), 3),   # Solar Y+ Current (mA)
            "ch_5": round(random.uniform(0.05, 0.5), 3),   # Solar Y- Current (mA)
            "ch_6": round(random.uniform(22, 35), 2),      # EPS Board Temp (°C)
            "ch_7": round(random.uniform(20, 30), 2),      # Battery Cell 3 Temp (°C)
            "ch_8": round(random.uniform(18, 28), 2),      # Battery Cell 4 Temp (°C)
            "ch_13": round(random.uniform(8, 18), 3),      # System Load Current (mA)
            "ch_14": round(random.uniform(3, 8), 3),       # Battery Charging Current (mA)
            "ch_15": round(random.uniform(20, 35), 3)      # Comm Subsystem Current (mA)
        },

        "solar_charger": {
            "solar_supply_ok": random.random() > 0.25,
            "solar_power_path": random.random() > 0.5,
            "solar_mode": random.random() > 0.5,
            "input_power_ok": random.random() > 0.25,
            "charger_enabled": random.random() > 0.3,
            "source_mode": random.choice(["ADAPTER", "USB", "BATTERY"]),
            "charging_status": random.choice([
                "Adapter-powered fast charging",
                "Solar-powered charging",
                "Charge done",
                "Not charging"
            ]),
            "stat1": random.random() > 0.5,
            "stat2": random.random() > 0.5
        }
    }


# ================= MAIN LOOP =================
def main():
    print("\n🚀 Random EPS data generator started")
    print("📦 Inserting one document every 1 second")
    print("⛔ Press Ctrl+C to stop\n")

    count = 0

    try:
        while True:
            data = generate_random_data()
            collection.insert_one(data)
            count += 1

            print(
                f"[{count}] {data['timestamp']} | "
                f"V={data['battery']['voltage_V']}V | "
                f"SOC={data['battery']['soc_percent']}% | "
                f"BoardTemp={data['adc']['ch_6']}°C | "
                f"Charge={data['solar_charger']['charging_status']}"
            )

            time.sleep(1)

    except KeyboardInterrupt:
        print(f"\n🛑 Stopped. Total records inserted: {count}")
        mongo_client.close()


# ================= ENTRY =================
if __name__ == "__main__":
    main()
