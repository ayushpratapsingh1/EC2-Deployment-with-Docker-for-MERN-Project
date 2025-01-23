import React, { useState } from "react"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"

function Login() {
  const [formData, setFormData] = useState({
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
      const response = await axios.post(`/login`, formData)

      if (response.data === "Successfully logged in") {
        navigate("/welcome", {
          state: { name: formData.email.split("@")[0] },
          replace: true,
        })
      }
    } catch (error) {
      setError(error.response?.data || "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-8 shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Sign In</h1>
        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                                     focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
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
                                     focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                                     outline-none transition-colors"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-md
                                 hover:bg-blue-700 focus:outline-none focus:ring-2 
                                 focus:ring-blue-500 focus:ring-offset-2 transition-colors
                                 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          New user?{" "}
          <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login

