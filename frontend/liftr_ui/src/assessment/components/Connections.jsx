import React, { useState, useEffect } from "react";
import { FiPlus, FiCheck } from "react-icons/fi";
import NewConnection from "./NewConnection";
import ConnectionCard from "./ConnectionCard";
import { useConnections } from "../../context/ConnectionContext";
import { connectionService } from "../service";

const Connections = () => {
  const { connections, setConnections } = useConnections();
  const [showNewConnectionForm, setShowNewConnectionForm] = useState(false);
  const [editingConnection, setEditingConnection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch connections on component mount
  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await connectionService.getConnections();
      if (response.status === "success" && response.connections) {
        // Map backend connections to frontend format
        const formattedConnections = response.connections.map((conn) => ({
          id: conn.id,
          connectionName: conn.id,
          dbType: "mssql",
          dbTypeLabel: "Microsoft SQL Server",
          server: "Connected Server",
          authType: "no",
          status: conn.active ? "Connected" : "Disconnected",
        }));
        setConnections(formattedConnections);
      }
    } catch (err) {
      console.error("Error fetching connections:", err);
      setError("Failed to fetch connections");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewConnection = () => {
    setEditingConnection(null);
    setShowNewConnectionForm(true);
  };

  const handleSaveConnection = async (connectionData) => {
    try {
      if (editingConnection) {
        // Update existing connection
        await connectionService.updateConnection(editingConnection.id, {
          server: connectionData.server,
          auth_type: connectionData.authType,
          username: connectionData.username,
          password: connectionData.password,
        });

        // Update local state
        setConnections((prev) =>
          prev.map((conn) =>
            conn.id === editingConnection.id
              ? { ...conn, ...connectionData }
              : conn
          )
        );
      } else {
        // Create new connection
        const newConnection = {
          id: Date.now().toString(),
          ...connectionData,
          status: "Disconnected",
        };
        setConnections((prev) => [...prev, newConnection]);
      }
      setShowNewConnectionForm(false);
      setEditingConnection(null);
    } catch (err) {
      console.error("Error saving connection:", err);
      alert("Failed to save connection: " + (err.response?.data?.message || err.message));
    }
  };

  const handleCancelNewConnection = () => {
    setShowNewConnectionForm(false);
    setEditingConnection(null);
  };

  const handleViewDetails = (connection) => {
    setEditingConnection(connection);
    setShowNewConnectionForm(true);
  };

  const handleTestConnection = async (connection) => {
    try {
      const result = await connectionService.testConnection({
        server: connection.server,
        authType: connection.authType,
        username: connection.username,
        password: connection.password,
      });

      if (result.status === "success") {
        // Update connection status to Connected
        setConnections((prev) =>
          prev.map((conn) =>
            conn.id === connection.id ? { ...conn, status: "Connected" } : conn
          )
        );
        alert("Connection successful!");
      } else {
        alert("Connection failed: " + result.message);
      }
    } catch (err) {
      console.error("Error testing connection:", err);
      alert("Connection failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteConnection = async (connectionId) => {
    try {
      await connectionService.deleteConnection(connectionId);
      setConnections((prev) => prev.filter((conn) => conn.id !== connectionId));
    } catch (err) {
      console.error("Error deleting connection:", err);
      alert("Failed to delete connection: " + (err.response?.data?.message || err.message));
    }
  };

  if (showNewConnectionForm) {
    return (
      <NewConnection
        connection={editingConnection}
        onSave={handleSaveConnection}
        onCancel={handleCancelNewConnection}
      />
    );
  }

  if (loading) {
    return (
      <div className="w-full h-full bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white dark:bg-gray-950 overflow-auto transition-colors duration-200">
      {error && (
        <div className="mx-6 mt-6 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}
      {connections.length === 0 ? (
        // Empty state
        <div className="h-full flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="mb-3">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                <FiPlus className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-1">
              No Connections
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              You haven't added any connections yet. Create one to get started.
            </p>
            <button
              onClick={handleAddNewConnection}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-1 px-4 text-sm rounded-lg transition"
            >
              New Connection
            </button>
          </div>
        </div>
      ) : (
        // Connections grid
        <div className="p-6">
          {/* Status Summary Card - Connected Count */}
          <div className="mb-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-lg p-2 border border-green-200 dark:border-green-700 w-full">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-200 dark:bg-green-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiCheck className="w-4 h-4 text-green-600 dark:text-green-300" />
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-200">
                    {connections.filter((c) => c.status === "Connected").length} out of{" "}
                    {connections.length} connection{connections.length !== 1 ? "s" : ""} online
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Connections</h2>
            <button
              onClick={handleAddNewConnection}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium py-1 px-4 text-sm rounded-lg transition"
            >
              <FiPlus className="w-4 h-4" />
              New Connection
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connections.map((connection) => (
              <ConnectionCard
                key={connection.id}
                connection={connection}
                onViewDetails={handleViewDetails}
                onTestConnection={handleTestConnection}
                onDelete={handleDeleteConnection}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Connections;
