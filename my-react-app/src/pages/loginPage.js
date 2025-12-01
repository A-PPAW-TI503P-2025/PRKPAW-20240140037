import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import PopUp from "../components/popUpComponents";
import { usePopup } from "../hooks/usePopup";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { isSuccess, message, showPopup, showNotification, handleClosePopup } =
    usePopup();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        {
          email: email,
          password: password,
        },
        { withCredentials: true }
      );

      console.log("Login successful:", response.data);
      const token = response.data.token;
      localStorage.setItem("token", token);
      showNotification("Login berhasil", true);

      // Auto navigate after 2 seconds
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      // Tangani error dari server
      showNotification(
        err.response ? err.response.data.message : "Login gagal",
        false
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo/Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-600 mb-2">Presensi</h1>
          <p className="text-gray-600">Sistem Manajemen Presensi</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
            Masuk ke Akun
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="nama@email.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200"
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 active:scale-95 shadow-lg hover:shadow-xl transition duration-200"
            >
              Masuk
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Belum punya akun?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-indigo-600 font-semibold hover:text-indigo-700 transition duration-200"
              >
                Daftar di sini
              </button>
            </p>
          </div>
        </div>
      </div>

      <PopUp
        isOpen={showPopup}
        isSuccess={isSuccess}
        message={message}
        onClose={() => {
          handleClosePopup();
          if (isSuccess) navigate("/dashboard");
        }}
      />
    </div>
  );
}
export default LoginPage;
