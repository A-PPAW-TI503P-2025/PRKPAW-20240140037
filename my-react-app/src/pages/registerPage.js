import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PopUp from "../components/popUpComponents";
import { usePopup } from "../hooks/usePopup";

function RegisterPage() {
    const navigate = useNavigate();
    const [nama, setNama] = useState("");
    const [role, setRole] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { isSuccess, message, showPopup, showNotification, handleClosePopup } =
        usePopup();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
        await axios.post(
            "http://localhost:8080/api/auth/register",
            {
            email: email,
            password: password,
            nama: nama,
            role: role,
            },
            { withCredentials: true }
        );

        showNotification("Registrasi berhasil! Silahkan login.", true);
        console.log("Registrasi berhasil:", { email, nama, role });

        // Auto navigate after 2 seconds
        setTimeout(() => {
            navigate("/login");
        }, 2000);
        } catch (err) {
        showNotification(
            err.response ? err.response.data.message : "Register gagal",
            false
        );
        console.error("Register error:", err.response || err.message);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
            {/* Logo/Header Section */}
            <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-purple-600 mb-2">Presensi</h1>
            <p className="text-gray-600">Daftar Akun Baru</p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
                Buat Akun
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nama Field */}
                <div>
                <label
                    htmlFor="nama"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                >
                    Nama Lengkap
                </label>
                <input
                    id="nama"
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    required
                    placeholder="Masukkan nama lengkap"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition duration-200"
                />
                </div>

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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition duration-200"
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition duration-200"
                />
                </div>

                {/* Role Selection */}
                <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Pilih Role
                </label>
                <div className="space-y-3">
                    <div className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition duration-200">
                    <input
                        id="admin"
                        type="radio"
                        name="role"
                        value="admin"
                        checked={role === "admin"}
                        onChange={(e) => setRole(e.target.value)}
                        required
                        className="w-5 h-5 text-purple-600 cursor-pointer"
                    />
                    <label
                        htmlFor="admin"
                        className="ml-3 text-gray-700 font-medium cursor-pointer flex-1"
                    >
                        Admin
                    </label>
                    </div>

                    <div className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition duration-200">
                    <input
                        id="mahasiswa"
                        type="radio"
                        name="role"
                        value="mahasiswa"
                        checked={role === "mahasiswa"}
                        onChange={(e) => setRole(e.target.value)}
                        required
                        className="w-5 h-5 text-purple-600 cursor-pointer"
                    />
                    <label
                        htmlFor="mahasiswa"
                        className="ml-3 text-gray-700 font-medium cursor-pointer flex-1"
                    >
                        Mahasiswa
                    </label>
                    </div>
                </div>
                </div>

                {/* Register Button */}
                <button
                type="submit"
                className="w-full py-3 px-4 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 active:scale-95 shadow-lg hover:shadow-xl transition duration-200"
                >
                Daftar
                </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                Sudah punya akun?{" "}
                <button
                    onClick={() => navigate("/login")}
                    className="text-purple-600 font-semibold hover:text-purple-700 transition duration-200"
                >
                    Masuk di sini
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
            if (isSuccess) navigate("/login");
            }}
        />
        </div>
    );
}

export default RegisterPage;
