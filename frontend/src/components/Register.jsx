import React, { useState } from "react"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/register`, formData)
      alert("User created successfully")
      navigate("/login")
    } catch (error) {
      setError(error.response?.data || "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-indigo-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-8 shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Create Account</h1>
        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md border border-gray-300 
                                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 
                                     outline-none transition-colors"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md border border-gray-300 
                                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 
                                     outline-none transition-colors"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md border border-gray-300 
                                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 
                                     outline-none transition-colors"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-md
                                 hover:bg-indigo-700 focus:outline-none focus:ring-2 
                                 focus:ring-indigo-500 focus:ring-offset-2 transition-colors
                                 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register

