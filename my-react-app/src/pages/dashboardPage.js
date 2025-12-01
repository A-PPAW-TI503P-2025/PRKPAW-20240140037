import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import axios from "axios";
import PopUp from "../components/popUpComponents";
import { usePopup } from "../hooks/usePopup";

function DashboardPage() {
  const navigate = useNavigate();
  const [dataUser, setDataUser] = useState(null);
  const [coords, setCoords] = useState(null);
  const { isSuccess, message, showPopup, showNotification, handleClosePopup } =
    usePopup();
  const token = localStorage.getItem("token");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleCheckIn = async () => {
    try {
      if (!coords) {
        showNotification(
          "Lokasi belum tersedia. Mohon izinkan akses lokasi.",
          false
        );
        return;
      }

      await axios.post(
        "http://localhost:8080/api/presensi/checkin",
        { latitude: coords.lat, longitude: coords.lng },
        config
      );
      showNotification("Check-in berhasil!", true);
    } catch (error) {
      console.log(error);
      showNotification(
        "Check-in gagal: " +
          (error.response ? error.response.data.message : error.message),
        false
      );
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
