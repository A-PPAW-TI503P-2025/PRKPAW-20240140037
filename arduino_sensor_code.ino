/*
 * ============================================
 * ESP32 IoT Sensor - DHT11 + LDR
 * ============================================
 * Program ini membaca data dari sensor DHT11 (suhu/kelembaban)
 * dan sensor LDR (cahaya), lalu mengirimkannya ke server
 * dalam format JSON.
 * 
 * Tugas: Menambahkan logika alert "PANAS" jika suhu > 32°C
 * 
 * Koneksi Hardware:
 * - DHT11 Data  -> GPIO 15 (D15)
 * - DHT11 VCC   -> 3V3
 * - DHT11 GND   -> GND
 * - LDR         -> GPIO 34 (Analog)
 * 
 * ============================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

// ==========================================
// 1. KONFIGURASI WIFI & SERVER
// ==========================================
// Ganti dengan kredensial WiFi Anda
const char* ssid = "NAMA_WIFI_ANDA";        // <-- GANTI INI
const char* password = "PASSWORD_WIFI";      // <-- GANTI INI

// Ganti dengan IP Laptop Anda yang menjalankan server
// Contoh: "http://192.168.1.100:8080/api/iot/data"
String serverName = "http://192.168.1.X:8080/api/iot/data";  // <-- GANTI IP

// ==========================================
// 2. KONFIGURASI SENSOR
// ==========================================
// Sensor DHT11 (Suhu & Kelembaban)
#define DHTPIN 15       // Pin data DHT11 terhubung ke GPIO 15
#define DHTTYPE DHT11   // Tipe sensor: DHT11
DHT dht(DHTPIN, DHTTYPE);

// Sensor LDR (Cahaya)
// Gunakan GPIO 34 (ADC1) agar tidak konflik dengan WiFi
const int LDRPIN = 34;

// ==========================================
// 3. VARIABEL GLOBAL
// ==========================================
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 5000; // Kirim setiap 5 detik

// ==========================================
// 4. SETUP
// ==========================================
void setup() {
  // Inisialisasi Serial Monitor
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("==============================");
  Serial.println("  ESP32 IoT Sensor Started");
  Serial.println("==============================");
  
  // Inisialisasi Sensor
  dht.begin();
  pinMode(LDRPIN, INPUT);
  Serial.println("[OK] Sensor DHT11 & LDR initialized");

  // Koneksi ke WiFi
  Serial.print("[..] Connecting to WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while(WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if(WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[OK] WiFi Connected!");
    Serial.print("    IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[ERROR] WiFi Connection Failed!");
    Serial.println("        Please check SSID and Password");
  }
  
  Serial.println("==============================\n");
}

// ==========================================
// 5. LOOP UTAMA
// ==========================================
void loop() {
  // Cek koneksi WiFi
  if(WiFi.status() == WL_CONNECTED) {
    
    // Cek interval waktu (kirim setiap 5 detik)
    if(millis() - lastSendTime >= sendInterval) {
      lastSendTime = millis();
      
      // --- BACA DATA SENSOR ---
      
      // 1. Baca DHT11
      float h = dht.readHumidity();
      float t = dht.readTemperature();

      // 2. Baca LDR (Nilai 0 - 4095 pada ESP32 12-bit ADC)
      int cahaya = analogRead(LDRPIN);

      // 3. Cek Error DHT
      if (isnan(h) || isnan(t)) {
        Serial.println("[ERROR] Gagal membaca sensor DHT!");
        Serial.println("        Periksa koneksi kabel DHT11");
        return;
      }

      // --- LOGIKA ALERT (TUGAS MODUL 12) ---
      // Jika suhu di atas 32°C, alert = "PANAS"
      // Jika di bawah, alert = "NORMAL"
      String alertStatus;
      if (t > 32.0) {
        alertStatus = "PANAS";
      } else {
        alertStatus = "NORMAL";
      }

      // --- TAMPILKAN DI SERIAL MONITOR ---
      Serial.println("------ Sensor Reading ------");
      Serial.print("Suhu     : "); Serial.print(t); Serial.println(" °C");
      Serial.print("Lembab   : "); Serial.print(h); Serial.println(" %");
      Serial.print("Cahaya   : "); Serial.println(cahaya);
      Serial.print("Alert    : "); Serial.println(alertStatus);
      Serial.println("----------------------------");

      // --- KIRIM KE SERVER ---

      // 4. Format JSON String
      // Contoh: {"suhu": 30.5, "kelembaban": 60, "cahaya": 2048, "alert": "NORMAL"}
      String jsonPayload = "{\"suhu\":" + String(t) + 
                           ", \"kelembaban\":" + String(h) + 
                           ", \"cahaya\":" + String(cahaya) + 
                           ", \"alert\":\"" + alertStatus + "\"}";

      Serial.print("[SENDING] ");
      Serial.println(jsonPayload);

      // 5. Kirim HTTP POST Request
      HTTPClient http;
      http.begin(serverName);
      http.addHeader("Content-Type", "application/json");
      
      int httpResponseCode = http.POST(jsonPayload);
      
      if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.print("[OK] Server Response (");
        Serial.print(httpResponseCode);
        Serial.print("): ");
        Serial.println(response);
      } else {
        Serial.print("[ERROR] HTTP Error: ");
        Serial.println(httpResponseCode);
        Serial.println("        Periksa koneksi ke server");
      }
      
      http.end();
      Serial.println();
    }
    
  } else {
    // WiFi terputus, coba reconnect
    Serial.println("[WARNING] WiFi Terputus, mencoba reconnect...");
    WiFi.begin(ssid, password);
    delay(5000);
  }
}

/*
 * ============================================
 * CATATAN PENTING:
 * ============================================
 * 
 * 1. WIRING DHT11:
 *    - VCC (+) -> 3V3 ESP32
 *    - GND (-) -> GND ESP32
 *    - DATA    -> D15 (GPIO 15) ESP32
 *    
 * 2. WIRING LDR:
 *    - Satu kaki LDR -> 3V3
 *    - Satu kaki LDR -> GPIO 34 + Resistor 10K ke GND
 *    (Rangkaian Voltage Divider)
 *    
 * 3. LIBRARY YANG DIBUTUHKAN:
 *    - DHT sensor library by Adafruit
 *    - Adafruit Unified Sensor
 *    (Install via Arduino Library Manager)
 *    
 * 4. BOARD SETTINGS:
 *    - Board: ESP32 Dev Module
 *    - Upload Speed: 115200
 *    - Flash Frequency: 80MHz
 *    
 * 5. TROUBLESHOOTING:
 *    - Jika DHT gagal: Periksa kabel, coba ganti pin
 *    - Jika WiFi gagal: Pastikan SSID & password benar
 *    - Jika server error: Pastikan IP laptop benar
 *      (jalankan: ipconfig/ifconfig untuk cek IP)
 *    
 * ============================================
 */
