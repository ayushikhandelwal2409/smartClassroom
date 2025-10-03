import { useState } from "react";
import React from "react";
import { useNavigate, Link } from "react-router-dom";

const LoginCard = ({ role, demoEmail }) => {
  // for new user
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role}),
      });

      const data = await response.json();

      if (response.ok) {
        // Store the token for future authenticated requests
        localStorage.setItem('token', data.token);
        
        // Navigate to the correct dashboard based on the role
        if (role === "Student") {
          navigate("/student/dashboard");
        } else if (role === "Teacher") {
          // Assuming you will create a teacher dashboard route
          navigate("/teacher/dashboard"); 
        } else if (role === "Admin") {
          // Assuming you will create an admin dashboard route
          navigate("/admin/dashboard");
        }
      } else {
        alert(data.msg || 'Login failed! Please check your credentials.');
      }
    } catch (error) {
      console.error('Login request failed:', error);
      alert('Could not connect to the server. Please try again later.');
    }
  };


  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 14l9-5-9-5-9 5 9 5z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 14l6.16-3.422A12.083 12.083 0 0118 20.944V21H6v-.056a12.083 12.083 0 01-.16-10.366L12 14z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-2">{role} Portal</h2>
        <p className="text-gray-600 text-center mb-6">
          Sign in to access your dashboard
        </p>

        {/* Form */}
        {/* connect with handlelogin */}
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Sign In
          </button>
        </form>

        {/* Signup Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>

        {/* Forgot password */}
        <p className="mt-4 text-center text-sm text-gray-500 hover:underline cursor-pointer">
          Forgot your password?
        </p>

        {/* Demo Credentials */}
        {/* <div className="mt-6 bg-gray-100 text-gray-700 p-3 rounded-lg text-sm">
          <p className="font-semibold">Demo Credentials:</p>
          <p>Email: {demoEmail}</p>
          <p>Password: password123</p>
        </div> */}
      </div>
    </div>
  );
};

export default LoginCard;
