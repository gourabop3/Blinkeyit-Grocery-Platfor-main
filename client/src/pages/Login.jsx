import React, { useState } from "react";
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa6";
import toast from "react-hot-toast";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserDetails } from "../store/userSlice";

const Login = () => {
  const [data, setData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) =>
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const allFilled = Object.values(data).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allFilled) return toast.error("Please fill in both fields.");

    setLoading(true);
    try {
      const res = await Axios({ ...SummaryApi.login, data });
      const { success, message, data: tokens, error } = res.data;

      if (error) return toast.error(message);

      if (success) {
        toast.success(message);

        // Store tokens
        sessionStorage.setItem("accesstoken", tokens.accesstoken);
        sessionStorage.setItem("refreshToken", tokens.refreshToken);

        // (Optional) fetch & cache user details here
        // const user = await fetchUserDetails(tokens.accesstoken);
        // dispatch(setUserDetails(user));

        navigate("/");
      }
    } catch (err) {
      AxiosToastError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex justify-center bg-gradient-to-tr from-green-100 via-white to-green-100 px-4">
      <div className="w-full max-w-md mt-10 bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-green-800">Welcome Back</h2>
          <p className="text-sm text-gray-600">Please log in to your account</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full mt-1 px-4 py-2 border rounded-md bg-blue-50 focus:ring-2 focus:ring-green-400 outline-none"
              value={data.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="flex items-center border rounded-md bg-blue-50 px-4 py-2 focus-within:ring-2 focus-within:ring-green-400">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="flex-1 bg-transparent outline-none"
                value={data.password}
                onChange={handleChange}
                placeholder="Enter your password"
              />
              <span
                className="cursor-pointer text-gray-600"
                onClick={() => setShowPassword((p) => !p)}
              >
                {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </span>
            </div>
            <Link to="/forgot-password" className="block mt-1 text-sm text-green-700 hover:underline text-right">
              Forgot password?
            </Link>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={!allFilled || loading}
            className={`w-full py-2 rounded-md text-white font-semibold tracking-wide transition duration-200 flex items-center justify-center gap-2 ${
              allFilled && !loading ? "bg-green-700 hover:bg-green-800" : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-700">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-semibold text-green-700 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Login;