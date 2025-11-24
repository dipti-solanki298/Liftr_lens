import React, { useState } from "react";
import { FiUser, FiSun, FiMoon, FiBell } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

const Topbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    { id: 1, message: "Connection test successful", time: "5 min ago" },
    { id: 2, message: "New assessment report available", time: "1 hour ago" },
  ]);

  return (
    <header className="row-span-1 col-span-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 h-full bg-white dark:bg-gray-900 transition-colors duration-200">
      <h1 className="text-sm font-semibold">
        <span className="text-orange-500">Liftr Lens</span> • Database
      </h1>
      <div className="flex flex-row justify-center items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 transition-colors duration-200">
        <button className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm transition text-sm font-medium border-r border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-50">
          Assessment
        </button>
        <button className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm font-medium text-gray-400 dark:text-gray-500">
          Migration
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition text-gray-600 dark:text-gray-300"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
        </button>
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition text-gray-600 dark:text-gray-300 relative"
            aria-label="Notifications"
          >
            <FiBell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                  Notifications
                </h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer last:border-b-0"
                    >
                      <p className="text-xs text-gray-900 dark:text-gray-50">{notif.message}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notif.time}</p>
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-4 text-center text-xs text-gray-500 dark:text-gray-400">
                    No notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition text-gray-600 dark:text-gray-300">
          <FiUser className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
