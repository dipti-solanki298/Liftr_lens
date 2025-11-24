import React, { createContext, useContext, useState } from "react";
import { connectionService } from "../assessment/service";

const ConnectionContext = createContext();

export const ConnectionProvider = ({ children }) => {
  const [connections, setConnections] = useState([
    {
      id: "1",
      connectionName: "Production Database",
      dbType: "postgres",
      dbTypeLabel: "PostgreSQL",
      server: "13.203.18.7,5432",
      authType: "no",
      username: "postgres",
      status: "Connected",
    },
  ]);

  const addConnection = async (connectionData) => {
    try {
      // Note: Backend doesn't have a create endpoint yet, so we'll just add locally
      const newConnection = {
        id: Date.now().toString(),
        ...connectionData,
        status: "Disconnected",
      };
      setConnections((prev) => [...prev, newConnection]);
      return newConnection;
    } catch (error) {
      console.error("Error adding connection:", error);
      throw error;
    }
  };

  const updateConnection = async (id, connectionData) => {
    try {
      await connectionService.updateConnection(id, {
        server: connectionData.server,
        auth_type: connectionData.authType,
        username: connectionData.username,
        password: connectionData.password,
      });

      setConnections((prev) =>
        prev.map((conn) => (conn.id === id ? { ...conn, ...connectionData } : conn))
      );
    } catch (error) {
      console.error("Error updating connection:", error);
      throw error;
    }
  };

  const deleteConnection = async (id) => {
    try {
      await connectionService.deleteConnection(id);
      setConnections((prev) => prev.filter((conn) => conn.id !== id));
    } catch (error) {
      console.error("Error deleting connection:", error);
      throw error;
    }
  };

  const getConnectedCount = () => {
    return connections.filter((c) => c.status === "Connected").length;
  };

  return (
    <ConnectionContext.Provider
      value={{
        connections,
        setConnections,
        addConnection,
        updateConnection,
        deleteConnection,
        getConnectedCount,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnections = () => {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error("useConnections must be used within ConnectionProvider");
  }
  return context;
};
