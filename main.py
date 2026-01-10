import serial
import time
import json
from datetime import datetime
from pymongo import MongoClient
from flask import Flask, request, jsonify
from flask_cors import CORS
import threading

# ================= SERIAL CONFIG =================
PORT = "COM12"
BAUDRATE = 115200

# ================= MONGODB CONFIG =================
MONGO_URI = "mongodb+srv://si31siyam_db_user:OFmyOZfOO842xsgl@cluster0.84rtvtv.mongodb.net/?appName=Cluster0"
DB_NAME = "arduino_logger"
COLLECTION_NAME = "sensor_readings"

# ================= FLASK APP =================
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ================= CONNECT MONGODB =================
mongo_client = MongoClient(MONGO_URI)
db = mongo_client[DB_NAME]
collection = db[COLLECTION_NAME]
print("✅ Connected to MongoDB")

# ================= CONNECT SERIAL =================
ser = serial.Serial(PORT, BAUDRATE, timeout=1)
time.sleep(2)
print(f"✅ Connected to Arduino on {PORT}")

# ================= SERIAL READER THREAD =================
def serial_reader():
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
            collection.insert_one(data)

            # ----- CONFIRMATION PRINT -----
            print("✅ Saved to MongoDB:")
            print(json.dumps(data, indent=2))
            print("-" * 50)

        except Exception as e:
            print("❌ Error:", e)
            time.sleep(1)

# ================= FLASK API =================
@app.route("/solar", methods=["POST"])
def control_solar():
    try:
        payload = request.get_json()
        cmd = str(payload.get("command"))

        if cmd not in ["0", "1"]:
            return jsonify({"error": "Invalid command"}), 400

        ser.write(cmd.encode())  # SEND SERIAL COMMAND
        return jsonify({"status": "sent", "command": cmd})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ================= MAIN =================
if __name__ == "__main__":
    serial_thread = threading.Thread(target=serial_reader, daemon=True)
    serial_thread.start()

    app.run(host="0.0.0.0", port=5000)
