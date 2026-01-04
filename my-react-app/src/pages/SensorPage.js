// src/pages/SensorPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Registrasi komponen Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function SensorPage() {
  const navigate = useNavigate();
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [cahayaChartData, setCahayaChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [latestData, setLatestData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fungsi ambil data
  const fetchData = async () => {
    try {
      // Panggil API Backend
      const response = await axios.get('http://localhost:8080/api/iot/history');
      const dataSensor = response.data.data;

      if (!dataSensor || dataSensor.length === 0) {
        setLoading(false);
        return;
      }

      // Siapkan sumbu X (Waktu) dan sumbu Y (Nilai)
      const labels = dataSensor.map(item => 
        new Date(item.createdAt).toLocaleTimeString('id-ID', { 
          hour: '2-digit', 
          minute: '2-digit', 
          second:'2-digit' 
        })
      );
      
      const dataSuhu = dataSensor.map(item => item.suhu);
      const dataLembab = dataSensor.map(item => item.kelembaban);
      const dataCahaya = dataSensor.map(item => item.cahaya);

      // Set data terakhir untuk kartu indikator
      setLatestData(dataSensor[dataSensor.length - 1]);

      // Chart data untuk Suhu & Kelembaban
      setChartData({
        labels: labels,
        datasets: [
          {
            label: 'Suhu (°C)',
            data: dataSuhu,
            borderColor: 'rgb(239, 68, 68)', // Merah
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.3,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: 'Kelembaban (%)',
            data: dataLembab,
            borderColor: 'rgb(59, 130, 246)', // Biru
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.3,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      });

      // Chart data terpisah untuk Cahaya (LDR)
      setCahayaChartData({
        labels: labels,
        datasets: [
          {
            label: 'Cahaya (LDR)',
            data: dataCahaya,
            borderColor: 'rgb(245, 158, 11)', // Kuning/Oranye
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.3,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      });

      setLoading(false);
    } catch (err) {
      console.error("Gagal ambil data sensor:", err);
      setLoading(false);
    }
  };

  // Panggil data pertama kali & set Auto Refresh tiap 5 detik
  useEffect(() => {
    fetchData();
    
    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Opsi tampilan grafik Suhu & Kelembaban
  const suhuLembabOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          font: { size: 14, weight: 'bold' },
          color: '#374151'
        }
      },
      title: { 
        display: true, 
        text: 'Monitoring Suhu & Kelembaban Real-time',
        font: { size: 18, weight: 'bold' },
        color: '#1f2937'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: 'rgba(0,0,0,0.1)' },
        ticks: { font: { size: 12 } }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } }
      }
    }
  };

  // Opsi tampilan grafik Cahaya
  const cahayaOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          font: { size: 14, weight: 'bold' },
          color: '#374151'
        }
      },
      title: { 
        display: true, 
        text: 'Monitoring Cahaya (LDR) Real-time',
        font: { size: 18, weight: 'bold' },
        color: '#1f2937'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 4095,
        grid: { color: 'rgba(0,0,0,0.1)' },
        ticks: { font: { size: 12 } }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-indigo-600">🌡️ IoT Monitoring</h1>
            <p className="text-sm text-gray-500">Sistem Monitoring Sensor Real-time</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 active:scale-95 shadow-lg transition duration-200"
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                navigate('/login');
              }}
              className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 active:scale-95 shadow-lg transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Kartu Indikator */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Suhu */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 font-semibold text-sm mb-1">SUHU</p>
                <p className="text-4xl font-bold">
                  {latestData ? `${latestData.suhu.toFixed(1)}°C` : '--'}
                </p>
              </div>
              <div className="text-5xl opacity-70">🌡️</div>
            </div>
          </div>

          {/* Kelembaban */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 font-semibold text-sm mb-1">KELEMBABAN</p>
                <p className="text-4xl font-bold">
                  {latestData ? `${latestData.kelembaban.toFixed(1)}%` : '--'}
                </p>
              </div>
              <div className="text-5xl opacity-70">💧</div>
            </div>
          </div>

          {/* Cahaya */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 font-semibold text-sm mb-1">CAHAYA (LDR)</p>
                <p className="text-4xl font-bold">
                  {latestData ? latestData.cahaya : '--'}
                </p>
              </div>
              <div className="text-5xl opacity-70">☀️</div>
            </div>
          </div>

          {/* Status Alert */}
          <div className={`rounded-2xl shadow-xl p-6 text-white ${
            latestData?.alert === 'PANAS' 
              ? 'bg-gradient-to-br from-orange-500 to-red-600' 
              : 'bg-gradient-to-br from-green-500 to-green-600'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 font-semibold text-sm mb-1">STATUS</p>
                <p className="text-4xl font-bold">
                  {latestData?.alert || '--'}
                </p>
              </div>
              <div className="text-5xl opacity-70">
                {latestData?.alert === 'PANAS' ? '🔥' : '✅'}
              </div>
            </div>
          </div>
        </div>

        {/* Grafik Suhu & Kelembaban */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-200">
          <div style={{ height: '400px' }}>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Memuat data...</p>
                </div>
              </div>
            ) : chartData.datasets.length > 0 ? (
              <Line options={suhuLembabOptions} data={chartData} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Belum ada data sensor</p>
              </div>
            )}
          </div>
        </div>

        {/* Grafik Cahaya (Terpisah) */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
          <div style={{ height: '300px' }}>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
              </div>
            ) : cahayaChartData.datasets.length > 0 ? (
              <Line options={cahayaOptions} data={cahayaChartData} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Belum ada data cahaya</p>
              </div>
            )}
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>📡 Data diperbarui otomatis setiap 5 detik</p>
          <p className="mt-1">Terakhir diperbarui: {latestData ? new Date(latestData.createdAt).toLocaleString('id-ID') : '-'}</p>
        </div>
      </div>
    </div>
  );
}

export default SensorPage;
