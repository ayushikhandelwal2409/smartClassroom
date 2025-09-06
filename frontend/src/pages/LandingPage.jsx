import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="w-full bg-blue-700 text-white py-4 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6">
          <h1 className="text-2xl font-bold">Smart Classroom</h1>
          <nav className="space-x-6 hidden md:block">
            <a href="#features" className="hover:underline">Features</a>
            <a href="#about" className="hover:underline">About</a>
            <a href="#contact" className="hover:underline">Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 bg-gradient-to-r from-blue-100 via-white to-blue-100">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-bold text-blue-700 mb-6"
        >
          Welcome to Smart Classroom Portal
        </motion.h2>
        <p className="text-gray-600 max-w-2xl mb-10">
          A modern digital platform for students, teachers, and admins to connect, learn, and manage academic resources efficiently.
        </p>

        {/* Login Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          <Card className="shadow-lg rounded-2xl">
            <CardContent className="flex flex-col items-center p-6">
              <h2 className="text-2xl font-semibold text-blue-600 mb-4">Student</h2>
              <p className="text-gray-600 text-center mb-6">
                Access your classes, notes, and assignments.
              </p>
              <Link to="/student">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                  Student Login
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-2xl">
            <CardContent className="flex flex-col items-center p-6">
              <h2 className="text-2xl font-semibold text-green-600 mb-4">Teacher</h2>
              <p className="text-gray-600 text-center mb-6">
                Manage classes, upload materials, and track student progress.
              </p>
              <Link to="/teacher">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl">
                  Teacher Login
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-2xl">
            <CardContent className="flex flex-col items-center p-6">
              <h2 className="text-2xl font-semibold text-red-600 mb-4">Admin</h2>
              <p className="text-gray-600 text-center mb-6">
                Control users, settings, and overall management.
              </p>
              <Link to="/admin">
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl">
                  Admin Login
                </Button>
              </Link>
            </CardContent>
          </Card>
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
