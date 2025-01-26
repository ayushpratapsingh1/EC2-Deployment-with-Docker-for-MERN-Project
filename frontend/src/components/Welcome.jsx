import React, { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"

function Welcome() {
  const location = useLocation()
  const navigate = useNavigate()
  const username = location.state?.name || "User"
  const [lastActive, setLastActive] = useState(new Date())
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [activities] = useState([
    "Logged in successfully",
    "Profile viewed",
    "Settings updated"
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setLastActive(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      navigate("/login", { replace: true })
    }
  }

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-600 to-green-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-8 shadow-lg w-full max-w-2xl">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Welcome, {username}!</h1>
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700 transition-colors"
            >
              {username.charAt(0).toUpperCase()}
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                    Profile Settings
                  </button>
                  <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                    Preferences
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Last Active</h3>
            <p className="mt-1 text-lg font-semibold">{formatTime(lastActive)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Session Status</h3>
            <p className="mt-1 text-lg font-semibold text-green-600">Active</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Role</h3>
            <p className="mt-1 text-lg font-semibold">User</p>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white rounded-md shadow-sm"
              >
                <span className="text-gray-600">{activity}</span>
                <span className="text-sm text-gray-400">{formatTime(new Date())}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-md
                       hover:bg-green-700 focus:outline-none focus:ring-2 
                       focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            View Profile
          </button>
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
    </div>
  )
}

export default Welcome

