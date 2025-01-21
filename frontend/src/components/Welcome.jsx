import React from "react"
import { useLocation, useNavigate } from "react-router-dom"

function Welcome() {
  const location = useLocation()
  const navigate = useNavigate()
  const username = location.state?.name || "User"

  const handleLogout = () => {
    navigate("/login", { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-600 to-green-800 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 shadow-lg text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome, {username}!</h1>
        <p className="text-gray-600 mb-6">You've successfully signed in to your account.</p>
        <button
          onClick={handleLogout}
          className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-md
                             hover:bg-red-700 focus:outline-none focus:ring-2 
                             focus:ring-red-500 focus:ring-offset-2 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}

export default Welcome

