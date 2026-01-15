import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react'; // Icon for the header
import api from '../api/axios';

const SignupPage = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'student',
        studentId: '',
        department: '',
        year: '',
        section: '',
        teacherId: '',
        title: '',
    });
    const [profileImage, setProfileImage] = useState(null);
    const navigate = useNavigate();

    const { role } = formData;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setProfileImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const submissionData = new FormData();
        for (const key in formData) {
            submissionData.append(key, formData[key]);
        }
        submissionData.append('profileImage', profileImage);

        try {
            const res = await api.post('/api/auth/register', submissionData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            localStorage.setItem('token', res.data.token);
            navigate(formData.role === 'student' ? '/student/dashboard' : '/teacher/dashboard');
        } catch (error) {
            console.error('Signup error:', error);
            alert(error.response?.data?.msg || 'An error occurred during signup.');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 py-12">
            <div className="w-full max-w-xl bg-white shadow-lg rounded-2xl p-8 space-y-6">
                {/* Icon and Title */}
                <div className="flex flex-col items-center">
                    <div className="bg-blue-100 p-3 rounded-full mb-4">
                        <UserPlus className="h-8 w-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-center">Create Your Account</h2>
                    <p className="text-gray-600 text-center">Join the Smart Classroom Portal</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Role Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">I am a...</label>
                        <select
                            name="role"
                            value={role}
                            onChange={handleChange}
                            className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                        </select>
                    </div>

                    {/* Common Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <input type="text" name="firstName" placeholder="" onChange={handleChange} required className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <input type="text" name="lastName" placeholder="" onChange={handleChange} required className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input type="email" name="email" placeholder="" onChange={handleChange} required className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" name="password" placeholder="" onChange={handleChange} required className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>

                    {/* Profile Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Profile Picture </label>
                        <input type="file" name="profileImage" onChange={handleFileChange} required className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    </div>

                    <hr className="my-4" />

                    {/* Conditional Fields */}
                    {role === 'student' ? (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-center text-gray-800">Student Details</h3>
                            <input type="text" name="studentId" placeholder="Student ID" onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                            <input type="text" name="department" placeholder="Department (e.g., Computer Science)" onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                            <input type="number" name="year" placeholder="Year of Study" onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                            <input type="text" name="section" placeholder="Section (e.g., A, B)" onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />

                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-center text-gray-800">Teacher Details</h3>
                            <input type="text" name="teacherId" placeholder="Teacher ID" onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                            <input type="text" name="department" placeholder="Department" onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                            <input type="text" name="title" placeholder="Title (e.g., Professor)" onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                        </div>
                    )}

                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition">
                        Create Account
                    </button>
                </form>

                {/* --- NEW: Link to Sign In Page --- */}
                <p className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/student" className="font-medium text-blue-600 hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;