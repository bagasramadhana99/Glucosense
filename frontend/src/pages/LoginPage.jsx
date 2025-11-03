import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Glucosense.png";
import { FiEye, FiEyeOff } from "react-icons/fi";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      const { token, user } = response.data;
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(user));

      if (user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (user.role === "patient") {
        navigate("/pasien/home", { replace: true });
      } else {
        sessionStorage.clear();
        setError("Role tidak dikenali.");
      }
    } catch {
      setError("Email atau password salah.");
    }
  };

  return (
    <div className="flex min-h-screen bg-neutralBg text-textPrimary">
      {/* ========================== */}
      {/* KIRI: Branding */}
      {/* ========================== */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 relative bg-primaryBlue text-white flex-col justify-center items-center overflow-hidden">
        {/* Gradient lembut */}
        <div className="absolute inset-0 bg-gradient-to-br from-primaryBlue via-softBlue to-[#2B4A72] opacity-95" />

        {/* Elemen dekoratif lembut */}
        <div className="absolute top-[-50px] left-[-60px] w-72 h-72 bg-primaryRed opacity-10 blur-3xl rounded-full" />
        <div className="absolute bottom-[-60px] right-[-50px] w-96 h-96 bg-white opacity-10 blur-2xl rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-primaryRed opacity-5 blur-2xl rounded-full" />

        {/* Konten utama */}
        <div className="relative z-10 text-center px-8">
          <img
            src={logo}
            alt="GlucoSense Logo"
            className="w-28 h-28 mx-auto mb-6 drop-shadow-xl"
          />
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            Gluco<span className="text-primaryRed">sense</span>
          </h1>
          <p className="text-gray-200 max-w-md mx-auto leading-relaxed text-base mb-8">
            Pantau kadar glukosa Anda dengan teknologi cerdas dan desain modern.
          </p>

          {/* Garis dekoratif tipis */}
          <div className="w-24 h-1 bg-primaryRed mx-auto mb-8 rounded-full opacity-70" />

          {/* Tagline tambahan */}
          <p className="text-sm text-gray-300 tracking-wide">
            Inovasi untuk kesehatan Anda, setiap hari.
          </p>
        </div>
      </div>

      {/* ========================== */}
      {/* KANAN: Form Login */}
      {/* ========================== */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-8 sm:p-12 bg-cardWhite shadow-inner">
        <div className="w-full max-w-md">
          {/* Logo kecil mobile */}
          <div className="flex justify-center mb-6 md:hidden">
            <img src={logo} alt="Logo" className="w-20 h-20" />
          </div>

          {/* Judul */}
          <h2 className="text-3xl font-bold text-primaryBlue mb-2 text-center md:text-left">
            Selamat Datang Kembali
          </h2>
          <p className="text-textSecondary mb-8 text-center md:text-left">
            Silakan login untuk mengakses dashboard Glucosense Anda.
          </p>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-textSecondary mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-lineGray rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryBlue focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-textSecondary mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-lineGray rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryBlue focus:border-transparent transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-primaryBlue transition-colors"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-primaryRed text-sm text-center bg-red-50 p-3 rounded-lg">
                {error}
              </p>
            )}

            {/* Tombol Login */}
            <button
              type="submit"
              className="w-full py-3 bg-primaryBlue text-white rounded-lg font-semibold hover:bg-[#2B4A72] focus:ring-2 focus:ring-primaryBlue transition-all duration-200"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
