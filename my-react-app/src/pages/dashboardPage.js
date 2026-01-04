import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import axios from "axios";
import PopUp from "../components/popUpComponents";
import { usePopup } from "../hooks/usePopup";
import Webcam from "react-webcam";

function DashboardPage() {
  const navigate = useNavigate();
  const [dataUser, setDataUser] = useState(null);
  const [coords, setCoords] = useState(null);
  const { isSuccess, message, showPopup, showNotification, handleClosePopup } =
    usePopup();
  const token = localStorage.getItem("token");
  const webcamRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [lastPhotoUrl, setLastPhotoUrl] = useState(null);
  const [adminRecords, setAdminRecords] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Open camera modal for check-in
  const handleCheckIn = () => {
    if (!coords) {
      showNotification(
        "Lokasi belum tersedia. Mohon izinkan akses lokasi.",
        false
      );
      return;
    }
    setShowCamera(true);
  };

  const handleCancelCamera = () => {
    setCapturedImage(null);
    setShowCamera(false);
  };

  const handleCapture = () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
  };

  const dataUrlToBlob = (dataUrl) => {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const handleSubmitCaptured = async () => {
    if (!capturedImage) {
      showNotification("Silakan ambil foto terlebih dahulu", false);
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      const blob = dataUrlToBlob(capturedImage);
      formData.append("buktiFoto", blob, `bukti-${Date.now()}.jpg`);
      formData.append("latitude", coords.lat);
      formData.append("longitude", coords.lng);

      const response = await axios.post(
        "http://localhost:8080/api/presensi/checkin",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // If backend returns the stored buktiFoto path, build static URL
      const buktiPath = response?.data?.data?.buktiFoto;
      if (buktiPath) {
        const url = buktiPath.startsWith("/")
          ? `http://localhost:8080${buktiPath}`
          : `http://localhost:8080/${buktiPath}`;
        setLastPhotoUrl(url);
      }

      showNotification("Check-in berhasil!", true);
      setCapturedImage(null);
      setShowCamera(false);
    } catch (error) {
      console.log("Error uploading check-in with photo:", error);
      showNotification(
        "Check-in gagal: " +
          (error.response ? error.response.data.message : error.message),
        false
      );
    } finally {
      setUploading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      await axios.post(
        "http://localhost:8080/api/presensi/checkout",
        {},
        config
      );
      showNotification("Check-out berhasil!", true);
    } catch (error) {
      console.log(error);
      showNotification(
        "Check-out gagal: " +
          (error.response ? error.response.data.message : error.message),
        false
      );
    }
  };

  useEffect(() => {
    // Initialize geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Gagal mendapatkan lokasi: " + error.message);
          showNotification("Gagal mendapatkan lokasi: " + error.message, false);
        }
      );
    } else {
      console.log("Geolocation tidak didukung oleh browser ini.");
      showNotification("Geolocation tidak didukung oleh browser ini.", false);
    }

    // Check authentication
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodeToken = jwtDecode(token);
        setDataUser(decodeToken);
        // If admin, load recent presensi with thumbnails
        if (decodeToken.role === "admin") {
          (async () => {
            setAdminLoading(true);
            try {
              const resp = await axios.get(
                "http://localhost:8080/api/report/daily",
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              setAdminRecords(resp.data.data || []);
            } catch (err) {
              console.log("Error fetching admin presensi:", err);
            } finally {
              setAdminLoading(false);
            }
          })();
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      navigate("/login");
    }
  }, [navigate, showNotification]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header/Navbar */}
      <div className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-indigo-600">Presensi</h1>
            <p className="text-sm text-gray-500">Sistem Manajemen Presensi</p>
          </div>
          <div className="flex gap-4 items-center">
            {dataUser && dataUser.role === "admin" && (
              <button
                onClick={() => navigate("/report")}
                className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 active:scale-95 shadow-lg transition duration-200"
              >
                📊 Laporan
              </button>
            )}
            <button
              onClick={() => navigate("/monitoring")}
              className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 active:scale-95 shadow-lg transition duration-200"
            >
              🌡️ IoT Monitoring
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 active:scale-95 shadow-lg transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-200">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-2">
              {dataUser && dataUser.role === "admin"
                ? "Selamat Datang Admin"
                : "Selamat Datang Mahasiswa"}
            </h2>
            <p className="text-gray-600">
              {dataUser && dataUser.role === "admin"
                ? "Panel manajemen sistem presensi"
                : `Hai ${
                    dataUser?.nama || "Pengguna"
                  }, kelola presensi Anda di sini`}
            </p>
          </div>
        </div>

        {/* Admin View */}
        {dataUser && dataUser.role === "admin" && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Dashboard Admin
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <p className="text-blue-600 font-semibold text-sm mb-2">
                  Total Presensi
                </p>
                <p className="text-3xl font-bold text-blue-900">--</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <p className="text-green-600 font-semibold text-sm mb-2">
                  Hadir
                </p>
                <p className="text-3xl font-bold text-green-900">--</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                <p className="text-orange-600 font-semibold text-sm mb-2">
                  Terlambat
                </p>
                <p className="text-3xl font-bold text-orange-900">--</p>
              </div>
            </div>
            <p className="text-gray-500 text-center mt-8">
              Fitur laporan akan segera tersedia
            </p>
          </div>
        )}

        {/* Mahasiswa View */}
        {dataUser && dataUser.role !== "admin" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Presensi Card */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  Data Presensi
                </h3>

                {/* Map Section */}
                {coords && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-700 mb-3">
                      Lokasi Anda
                    </h4>
                    <div className="rounded-xl overflow-hidden border-2 border-gray-200 shadow-md">
                      <MapContainer
                        center={[coords.lat, coords.lng]}
                        zoom={15}
                        style={{
                          height: "400px",
                          width: "100%",
                          position: "relative",
                          zIndex: 0,
                        }}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <Marker position={[coords.lat, coords.lng]}>
                          <Popup>Lokasi Presensi Anda</Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={handleCheckIn}
                    className="py-3 px-6 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 active:scale-95 shadow-lg hover:shadow-xl transition duration-200"
                  >
                    ✓ Check-In
                  </button>
                  <button
                    onClick={handleCheckOut}
                    className="py-3 px-6 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 active:scale-95 shadow-lg hover:shadow-xl transition duration-200"
                  >
                    ✓ Check-Out
                  </button>
                </div>

                {/* Camera Modal */}
                {showCamera && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
                      <h4 className="text-lg font-semibold mb-4">
                        Ambil Foto untuk Check-In
                      </h4>
                      {!capturedImage ? (
                        <div className="flex flex-col items-center gap-4">
                          <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            className="w-full rounded-lg"
                          />
                          <div className="flex gap-3">
                            <button
                              onClick={handleCapture}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-md"
                            >
                              Ambil Foto
                            </button>
                            <button
                              onClick={() => setShowCamera(false)}
                              className="px-4 py-2 bg-gray-300 rounded-md"
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-4">
                          <img
                            src={capturedImage}
                            alt="preview"
                            className="w-full rounded-lg"
                          />
                          <div className="flex gap-3">
                            <button
                              onClick={() => setCapturedImage(null)}
                              className="px-4 py-2 bg-yellow-400 text-black rounded-md"
                            >
                              Ambil Ulang
                            </button>
                            <button
                              onClick={handleSubmitCaptured}
                              disabled={uploading}
                              className="px-4 py-2 bg-green-600 text-white rounded-md"
                            >
                              {uploading ? "Mengirim..." : "Kirim & Check-In"}
                            </button>
                            <button
                              onClick={handleCancelCamera}
                              className="px-4 py-2 bg-gray-300 rounded-md"
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Info Card */}
            <div>
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl shadow-xl p-6 border border-indigo-200">
                <h4 className="text-lg font-bold text-indigo-900 mb-4">
                  Informasi Anda
                </h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-indigo-600 font-semibold text-xs mb-1">
                      NAMA
                    </p>
                    <p className="text-gray-800 font-bold">
                      {dataUser?.nama || "N/A"}
                    </p>
                  </div>
                  <div className="border-t border-indigo-200 pt-4">
                    <p className="text-indigo-600 font-semibold text-xs mb-1">
                      ROLE
                    </p>
                    <p className="text-gray-800 font-bold capitalize">
                      {dataUser?.role || "N/A"}
                    </p>
                  </div>
                  <div className="border-t border-indigo-200 pt-4">
                    <p className="text-indigo-600 font-semibold text-xs mb-1">
                      STATUS
                    </p>
                    <p className="text-green-600 font-bold">Online</p>
                  </div>
                  {lastPhotoUrl && (
                    <div className="border-t border-indigo-200 pt-4">
                      <p className="text-indigo-600 font-semibold text-xs mb-1">
                        Bukti Check-In Terakhir
                      </p>
                      <a href={lastPhotoUrl} target="_blank" rel="noreferrer">
                        <img
                          src={lastPhotoUrl}
                          alt="bukti-checkin"
                          className="w-32 h-32 object-cover rounded-lg border"
                        />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <PopUp
        isOpen={showPopup}
        isSuccess={isSuccess}
        message={message}
        onClose={handleClosePopup}
      />
    </div>
  );
}

export default DashboardPage;
