import React, { useState } from "react";
import { FiArrowLeft, FiCheck } from "react-icons/fi";
import { connectionService } from "../service";

const NewConnection = ({ onCancel, onSave, connection }) => {
  const isEditMode = !!connection;
  const [dbType, setDbType] = useState(connection?.dbType || "postgres");
  const [useWindowsAuth, setUseWindowsAuth] = useState(connection?.authType === "windows" || false);
  const [formData, setFormData] = useState({
    connectionName: connection?.connectionName || "",
    server: connection?.server || "",
    username: connection?.username || "",
    password: connection?.password || "",
    additionalParams: connection?.additionalParams || "",
  });
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const dbTypeConfig = {
    postgres: { label: "PostgreSQL" },
    mssql: { label: "Microsoft SQL Server" },
    oracle: { label: "Oracle DB" },
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDbTypeChange = (e) => {
    const type = e.target.value;
    setDbType(type);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const result = await connectionService.testConnection({
        server: formData.server,
        authType: useWindowsAuth ? "windows" : "no",
        username: formData.username,
        password: formData.password,
      });
      setTestResult({
        success: result.status === "success",
        message: result.message || "Connection successful!",
      });
      // Auto-dismiss after 3 seconds
      setTimeout(() => {
        setTestResult(null);
      }, 3000);
    } catch (error) {
      setTestResult({
        success: false,
        message: error.response?.data?.message || error.message || "Connection failed!",
      });
      setTimeout(() => {
        setTestResult(null);
      }, 3000);
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        ...(isEditMode && { id: connection.id }),
        connectionName: formData.connectionName,
        server: formData.server,
        authType: useWindowsAuth ? "windows" : "no",
        username: useWindowsAuth ? "" : formData.username,
        password: useWindowsAuth ? "" : formData.password,
        additionalParams: formData.additionalParams,
        dbType,
        dbTypeLabel: dbTypeConfig[dbType].label,
      });
    }
  };

  return (
    <div className="w-full h-full bg-white dark:bg-gray-900 overflow-auto transition-colors duration-200">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center gap-3 transition-colors duration-200">
        <button
          onClick={onCancel}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition"
          aria-label="Go back"
        >
          <FiArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
          {isEditMode ? "Edit Connection" : "Add New Connection"}
        </h1>
      </div>

      {/* Form Content */}
      <div className="px-6 py-6 w-full">
        {/* Connection Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">
            Connection Name
          </label>
          <input
            type="text"
            name="connectionName"
            value={formData.connectionName}
            onChange={handleInputChange}
            placeholder="e.g., Production DB"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50"
          />
        </div>

        {/* Database Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">
            Database Type
          </label>
          <select
            value={dbType}
            onChange={handleDbTypeChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50"
          >
            {Object.entries(dbTypeConfig).map(([key, config]) => (
              <option key={key} value={key} className="dark:bg-gray-800">
                {config.label}
              </option>
            ))}
          </select>
        </div>

        {/* Server Details */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">
            Server
          </label>
          <input
            type="text"
            name="server"
            value={formData.server}
            onChange={handleInputChange}
            placeholder="e.g., 13.203.18.7,49986"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Server name or IP with port (optional)
          </p>
        </div>

        {/* Windows Authentication */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">
            Windows Authentication
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="auth"
                checked={useWindowsAuth}
                onChange={() => setUseWindowsAuth(true)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="auth"
                checked={!useWindowsAuth}
                onChange={() => setUseWindowsAuth(false)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">No</span>
            </label>
          </div>
        </div>

        {/* Credentials (only show if Windows Auth is not selected) */}
        {!useWindowsAuth && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Username"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50"
              />
            </div>
          </div>
        )}

        {/* Additional Parameters */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">
            Additional Parameters (Optional)
          </label>
          <textarea
            name="additionalParams"
            value={formData.additionalParams}
            onChange={handleInputChange}
            placeholder="e.g., ?sslmode=require"
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50"
          />
        </div>

        {/* Snackbar Notification */}
        {testResult && (
          <div className="fixed bottom-4 right-4 max-w-xs animate-in fade-in slide-in-from-right">
            <div
              className={`p-4 rounded-lg shadow-lg ${testResult.success ? "bg-green-500 text-white" : "bg-red-500 text-white"
                } text-sm flex items-center gap-2`}
            >
              {testResult.success && <FiCheck className="w-5 h-5 flex-shrink-0" />}
              <span>{testResult.message}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50 text-sm"
          >
            {testing ? "Testing..." : "Test Connection"}
          </button>
          <div className="flex-1" />
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition text-sm"
          >
            {isEditMode ? "Update Connection" : "Save Connection"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewConnection;
