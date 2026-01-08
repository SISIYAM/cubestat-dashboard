import serial
import time
import json
from datetime import datetime
from pymongo import MongoClient

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

# ================= MAIN LOOP =================
while True:
    try:
        line = ser.readline().decode("utf-8", errors="ignore").strip()
        if not line:
            continue

        # ----- DEBUG: RAW SERIAL -----
        print("📥 RAW:", line)

        # ----- PARSE JSON -----
        try:
            data = json.loads(line)
        except json.JSONDecodeError:
            print("⚠️ Invalid JSON (skipped)")
            continue

        # ----- ADD TIMESTAMP -----
        data["timestamp"] = datetime.utcnow()

        # ----- INSERT INTO MONGODB -----
        result = collection.insert_one(data)

        # ----- CONFIRMATION PRINT -----
        print("✅ Saved to MongoDB:")
        print(json.dumps(data, indent=2))
        print("-" * 50)

    except KeyboardInterrupt:
        print("\n🛑 Stopped by user")
        break

    except Exception as e:
        print("❌ Error:", e)
        time.sleep(1)
