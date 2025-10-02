import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../components/ui/Toast";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!email.trim() || !password.trim()) {
      showToast(
        "Please fill in both your email and password to sign in.",
        "info"
      );
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast(
        "Please enter a valid email address like example@ammamricemill.com",
        "info"
      );
      return;
    }

    try {
      await login(email, password);
      showToast("Welcome back! You've successfully signed in.", "success");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (err instanceof Error) {
        switch (err.message) {
          case "401":
            showToast(
              "Oops! The email or password doesn't match our records. Please try again.",
              "error"
            );
            break;
          case "403":
            showToast(
              "Hi there! Your account is currently inactive. Please contact your administrator to activate it.",
              "error"
            );
            break;
          case "429":
            showToast(
              "For security reasons, please wait a moment before trying again.",
              "error"
            );
            break;
          case "500":
            showToast(
              "We're experiencing some technical difficulties. Please try again in a moment.",
              "error"
            );
            break;
          case "404":
            showToast(
              "Oops! Something went wrong. Please try again in a moment.",
              "error"
            );
            break;
          default:
            showToast(
              err.message || "Something went wrong. Please try again.",
              "error"
            );
        }
      } else {
        showToast(
          "We're having trouble connecting. Please check your internet connection and try again.",
          "error"
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-card-lg p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <img
                src="/favicon.png"
                alt="AMMAM RICE MILL LTD."
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              AMMAM RICE MILL LTD.
            </h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                placeholder="admin@ammamricemill.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  placeholder="admin123"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              className="w-full"
            >
              Sign In
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              Developed and Maintained by{" "}
              <a
                href="https://aacinnovation-2335f.web.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-500 hover:text-primary-600 font-medium"
              >
                AAC Innovation
              </a>{" "}
              © 2025
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
