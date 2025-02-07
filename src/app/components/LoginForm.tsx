"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const LoginPage = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    if (loggedIn === "true") {
      router.push("/admin");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    await new Promise(resolve => setTimeout(resolve, 1000));

    const adminEmail = process.env.NEXT_PUBLIC_EMAIL_ADDRESS;
    const adminPassword = process.env.NEXT_PUBLIC_USER_PASSWORD;

    if (email === adminEmail && password === adminPassword) {
      setMessage("Login successful");
      localStorage.setItem("isLoggedIn", "true");
      setIsLoggedIn(true);
      router.push("/admin/dashboard");
    } else {
      if (email !== adminEmail) {
        setMessage("Invalid email address");
      } else if (password !== adminPassword) {
        setMessage("Invalid password");
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#1E3A8A] to-[#4A5568] flex justify-center items-center">
      <motion.form
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onSubmit={handleLogin}
        className="bg-white shadow-xl rounded-xl p-8 w-full sm:w-96 relative overflow-hidden"
      >
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          Admin Login
        </h2>

        <AnimatePresence>
          {message && (
            <motion.div
              key="message"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-4 p-2 text-center rounded-md ${
                message.includes("Invalid")
                  ? "bg-red-400 text-red-900"
                  : "bg-green-400 text-green-900"
              }`}
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Email
          </label>
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.03 }}
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 pl-12 bg-gray-100 rounded-lg border-2 border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            />
            <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </motion.div>
        </div>

        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Password
          </label>
          <motion.div
            className="relative"
            whileHover={{ scale: 1.03 }}
          >
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 pl-12 bg-gray-100 rounded-lg border-2 border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            />
            <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <button
              type="button"
              onClick={() => setPasswordVisible(!passwordVisible)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              {passwordVisible ? <FaEyeSlash /> : <FaEye />}
            </button>
          </motion.div>
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-[#2C5282] to-[#2D3748] text-white rounded-lg font-semibold hover:from-[#2B6CB0] hover:to-[#4A5568] transition-all relative overflow-hidden"
        >
          {isLoading ? "Logging in..." : "Login"}
        </motion.button>
      </motion.form>
    </div>
  );
};

export default LoginPage;
