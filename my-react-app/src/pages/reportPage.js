import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { usePopup } from "../hooks/usePopup";
import PopUp from "../components/popUpComponents";

function ReportPage() {
  const navigate = useNavigate();
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    nama: "",
    startDate: "",
    endDate: "",
  });
  const { isSuccess, message, showPopup, showNotification, handleClosePopup } =
    usePopup();
  const token = localStorage.getItem("token");

  // Check authentication & role
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodeToken = jwtDecode(token);

        // Redirect if not admin
        if (decodeToken.role !== "admin") {
          navigate("/dashboard");
        } else {
          // Auto-load all records on mount for admin
          (async () => {
            setLoading(true);
            try {
              const response = await axios.get(
                "http://localhost:8080/api/report/daily",
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              console.log("API Response:", response.data);
              setFilteredRecords(response.data.data || []);
            } catch (error) {
              console.log("Error fetching reports:", error);
              showNotification(
                error.response?.data?.message || "Gagal mengambil laporan",
                false
              );
            } finally {
              setLoading(false);
            }
          })();
        }
      } catch (error) {
        console.log(error);
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, []);

  // Fetch reports
  const fetchReports = async () => {
    setLoading(true);
    try {
      let url = "http://localhost:8080/api/report/daily";
      const params = new URLSearchParams();

      if (filters.nama) params.append("nama", filters.nama);
      if (filters.startDate) params.append("start", filters.startDate);
      if (filters.endDate) params.append("end", filters.endDate);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFilteredRecords(response.data.data || []);
      showNotification("Data laporan berhasil dimuat", true);
    } catch (error) {
      console.log(error);
      showNotification(
        error.response
          ? error.response.data.message
          : "Gagal mengambil laporan",
        false
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle search/filter
  const handleSearch = (e) => {
    e.preventDefault();
    fetchReports();
  };

  // Reset filters
  const handleReset = () => {
    setFilters({
      nama: "",
      startDate: "",
      endDate: "",
    });
    setFilteredRecords([]);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      showNotification("Tidak ada data untuk diexport", false);
      return;
    }

    const headers = [
      "No",
      "ID User",
      "Nama",
      "Check-In",
      "Check-Out",
      "Latitude",
      "Longitude",
    ];
    const rows = filteredRecords.map((record, index) => [
      index + 1,
      record.userId,
      record.User?.nama || "N/A",
      new Date(record.checkIn).toLocaleString("id-ID"),
      record.checkOut ? new Date(record.checkOut).toLocaleString("id-ID") : "-",
      record.latitude ? parseFloat(record.latitude).toFixed(4) : "-",
      record.longitude ? parseFloat(record.longitude).toFixed(4) : "-",
    ]);

    let csv = headers.join(",") + "\n";
    rows.forEach((row) => {
      csv += row.map((cell) => `"${cell}"`).join(",") + "\n";
    });

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/csv;charset=utf-8," + encodeURIComponent(csv)
    );
    element.setAttribute(
      "download",
      `laporan_presensi_${new Date().toISOString().split("T")[0]}.csv`
    );
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    showNotification("Data berhasil diexport", true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header/Navbar */}
      <div className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-indigo-600">Presensi</h1>
            <p className="text-sm text-gray-500">Laporan Presensi Admin</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
            className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 active:scale-95 shadow-lg transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Filter Laporan
          </h2>

          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Nama Filter */}
              <div>
                <label
                  htmlFor="nama"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Nama Mahasiswa
                </label>
                <input
                  id="nama"
                  type="text"
                  name="nama"
                  value={filters.nama}
                  onChange={handleFilterChange}
                  placeholder="Cari nama..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200"
                />
              </div>

              {/* Start Date Filter */}
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Tanggal Mulai
                </label>
                <input
                  id="startDate"
                  type="datetime-local"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200"
                />
              </div>

              {/* End Date Filter */}
              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Tanggal Akhir
                </label>
                <input
                  id="endDate"
                  type="datetime-local"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                {loading ? "Mencari..." : "Cari"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 bg-gray-400 text-white font-bold rounded-lg hover:bg-gray-500 active:scale-95 shadow-lg transition duration-200"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleExportCSV}
                disabled={filteredRecords.length === 0}
                className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                📥 Export CSV
              </button>
            </div>
          </form>
        </div>

        {/* Data Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Data Presensi ({filteredRecords.length} records)
            </h2>

            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full"></div>
                </div>
              </div>
            )}

            {!loading && filteredRecords.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  Tidak ada data presensi. Silahkan gunakan filter untuk mencari
                  data.
                </p>
              </div>
            )}

            {!loading && filteredRecords.length > 0 && (
              <>
                {/* Table - Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-300 bg-gray-50">
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">
                          No
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">
                          ID User
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">
                          Nama
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">
                          Foto
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">
                          Check-In
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">
                          Check-Out
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">
                          Lokasi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.map((record, index) => (
                        <tr
                          key={record.id}
                          className="border-b border-gray-200 hover:bg-gray-50 transition duration-200"
                        >
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {record.userId}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            {record.User?.nama || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {new Date(record.checkIn).toLocaleString("id-ID")}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {record.checkOut
                              ? new Date(record.checkOut).toLocaleString(
                                  "id-ID"
                                )
                              : "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {record.latitude && record.longitude
                              ? `${parseFloat(record.latitude).toFixed(
                                  4
                                )}, ${parseFloat(record.longitude).toFixed(4)}`
                              : "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {(() => {
                              const buktiPath =
                                record.buktiFoto ||
                                record.bukti_foto ||
                                record.bukti ||
                                null;
                              if (!buktiPath) return "-";
                              const imgUrl = buktiPath.startsWith("/")
                                ? `http://localhost:8080${buktiPath}`
                                : `http://localhost:8080/${buktiPath}`;
                              return (
                                <a
                                  href={imgUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <img
                                    src={imgUrl}
                                    alt={`bukti-${record.id}`}
                                    className="w-16 h-12 object-cover rounded"
                                  />
                                </a>
                              );
                            })()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Cards - Mobile View */}
                <div className="md:hidden space-y-4">
                  {filteredRecords.map((record, index) => (
                    <div
                      key={record.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded">
                          #{index + 1}
                        </span>
                        <span className="text-xs font-semibold text-indigo-600">
                          ID: {record.userId}
                        </span>
                      </div>
                      <p className="font-bold text-gray-900 mb-3">
                        {record.User?.nama || "N/A"}
                      </p>
                      <div className="space-y-2 text-sm text-gray-700">
                        {(() => {
                          const buktiPath =
                            record.buktiFoto ||
                            record.bukti_foto ||
                            record.bukti ||
                            null;
                          if (buktiPath) {
                            const imgUrl = buktiPath.startsWith("/")
                              ? `http://localhost:8080${buktiPath}`
                              : `http://localhost:8080/${buktiPath}`;
                            return (
                              <div className="mb-3">
                                <a
                                  href={imgUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <img
                                    src={imgUrl}
                                    alt={`bukti-${record.id}`}
                                    className="w-full h-40 object-cover rounded-md mb-2"
                                  />
                                </a>
                              </div>
                            );
                          }
                          return null;
                        })()}
                        <p>
                          <span className="font-semibold">Check-In:</span>{" "}
                          {new Date(record.checkIn).toLocaleString("id-ID")}
                        </p>
                        <p>
                          <span className="font-semibold">Check-Out:</span>{" "}
                          {record.checkOut
                            ? new Date(record.checkOut).toLocaleString("id-ID")
                            : "-"}
                        </p>
                        {record.latitude && record.longitude && (
                          <p>
                            <span className="font-semibold">Lokasi:</span>{" "}
                            {parseFloat(record.latitude).toFixed(4)},{" "}
                            {parseFloat(record.longitude).toFixed(4)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
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

export default ReportPage;
