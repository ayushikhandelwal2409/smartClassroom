import React, { useState } from "react";
import bgVideo from "../assets/Untitled design (online-video-cutter.com).mp4";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "./components/ui/card.jsx";
import { Button } from "./components/ui/button.jsx";
import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState("Student");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password, role })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        if (role === 'Student') {
          navigate('/student/dashboard');
        } else if (role === 'Teacher') {
          navigate('/teacher/dashboard');
        } else {
          navigate('/');
        }
      } else {
        alert(data.msg || 'Invalid credentials');
      }
    } catch (err) {
      console.error(err);
      alert('Could not connect to the server. Please try again later.');
    }
  };
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="w-full bg-blue-700 text-white shadow-md fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-4">
        <div className="flex items-center space-x-2">
          <GraduationCap className="w-7 h-7" />
          <h1 className="text-2xl font-bold">Smart Classroom</h1>
        </div>
        <nav className="space-x-6 hidden md:flex items-center">
          <a href="#features" className="hover:underline">Features</a>
          <a href="#about" className="hover:underline">About</a>
          <a href="#contact" className="hover:underline">Contact</a>
          <a href="#login" className="ml-6 inline-block bg-white text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition">Login</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-24 md:py-28 bg-gradient-to-r from-blue-100 via-white to-blue-100 relative overflow-hidden mt-16">
        {/* Background Video (between navbar and login) */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={bgVideo}
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-white/40" />
        {/* Decorative academic illustration */}
        <div className="pointer-events-none absolute -top-10 -right-10 w-72 h-72 bg-blue-200 rounded-full opacity-30 blur-3xl"></div>
        <div className="pointer-events-none absolute -bottom-10 -left-10 w-72 h-72 bg-purple-200 rounded-full opacity-30 blur-3xl"></div>
        <div className="relative z-10 w-full flex flex-col items-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1}}
          className="text-4xl md:text-5xl font-bold text-blue-700 mb-6"
        >
          Welcome to Smart Classroom Portal
        </motion.h2>
        <p className="text-gray-600 max-w-2xl mb-10 bg-white">
          {/* A modern digital platform for students, teachers, and admins to connect, learn, and manage academic resources efficiently. */}
        </p>

        {/* Centered Login Box */}
        <div id="login" className="w-full max-w-md">
          <Card className="shadow-xl rounded-2xl p-8 bg-white/90 backdrop-blur">
            <form className="space-y-4 text-left" onSubmit={handleLogin}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  value={role}
                  onChange={(e) => {
                    const newRole = e.target.value;
                    setRole(newRole);
                    setUserId("");
                  }}
                  className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option>Student</option>
                  <option>Teacher</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">User ID</label>
                <input
                  type="text"
                  placeholder={role === 'Teacher' ? '6-digit ID' : '10-digit ID'}
                  value={userId}
                  onChange={(e) => {
                    const maxLen = role === 'Teacher' ? 6 : 10;
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, maxLen);
                    setUserId(value);
                  }}
                  inputMode="numeric"
                  pattern={role === 'Teacher' ? "\\d{6}" : "\\d{10}"}
                  required
                  className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-1 block w-full px-4 py-2 pr-10 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                  >
                    {/* Eye icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {showPassword ? (
                        <>
                          <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-8 1.02-2.79 2.98-5.1 5.39-6.59" />
                          <path d="M1 1l22 22" />
                          <path d="M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-.88" />
                        </>
                      ) : (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Login</Button>
            </form>
          </Card>
        </div>
        </div>
      </section>



      {/* Features */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-2 text-blue-600">Smart Timetables</h3>
            <p className="text-gray-600">Dynamic scheduling system with real-time updates and personalized class schedules.</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-2 text-green-600">Attendance Tracking</h3>
            <p className="text-gray-600">Advanced attendance management with biometric integration and detailed analytics.</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-2 text-purple-600">Campus Resources</h3>
            <p className="text-gray-600">Room booking, lost & found, and facility management all in one place.</p>
          </Card>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-red-800 text-white py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 text-center gap-6">
          <div>
            <h2 className="text-3xl font-bold">10,000+</h2>
            <p>Active Students</p>
          </div>
          <div>
            <h2 className="text-3xl font-bold">500+</h2>
            <p>Faculty Members</p>
          </div>
          <div>
            <h2 className="text-3xl font-bold">50+</h2>
            <p>Departments</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Smart Classroom</h3>
            <p>Transforming education through technology and innovation.</p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:underline">Academic Calendar</a></li>
              <li><a href="#" className="hover:underline">Campus Map</a></li>
              <li><a href="#" className="hover:underline">Library</a></li>
              <li><a href="#" className="hover:underline">Support</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Contact</h3>
            <p>123 University Ave<br/>Education City, EC 12345</p>
            <p>Phone: (555) 123-4567</p>
            <p>Email: info@college.edu</p>
          </div>
        </div>
        <div className="text-center text-gray-500 mt-8 text-sm">
          © 2025 Smart Classroom Portal. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
