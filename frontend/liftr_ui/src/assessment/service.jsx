import axios from "axios";

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: "http://localhost:5000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

// Connection API calls
export const connectionService = {
  // Get all connections
  getConnections: async () => {
    try {
      const response = await apiClient.get("/connections");
      return response.data;
    } catch (error) {
      console.error("Error fetching connections:", error);
      throw error;
    }
  },

  // Get connection by ID
  getConnectionById: async (id) => {
    try {
      const response = await apiClient.get(`/connections/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching connection:", error);
      throw error;
    }
  },

  // Create new connection
  createConnection: async (connectionData) => {
    try {
      const response = await apiClient.post("/api/connections", connectionData);
      return response.data;
    } catch (error) {
      console.error("Error creating connection:", error);
      throw error;
    }
  },

  // Update connection
  updateConnection: async (id, connectionData) => {
    try {
      const response = await apiClient.put(`/connections/${id}`, connectionData);
      return response.data;
    } catch (error) {
      console.error("Error updating connection:", error);
      throw error;
    }
  },

  // Delete connection
  deleteConnection: async (id) => {
    try {
      const response = await apiClient.delete(`/connections/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting connection:", error);
      throw error;
    }
  },

  // Test connection
  testConnection: async (connectionData) => {
    try {
      const payload = {
        server: connectionData.server,
        auth_type: connectionData.authType || "no",
        username: connectionData.username || "",
        password: connectionData.password || "",
      };
      const response = await apiClient.post("/connect_sql_server", payload);
      return response.data;
    } catch (error) {
      console.error("Error testing connection:", error);
      throw error;
    }
  },
};

// Assessment/Reports API calls
export const reportService = {
  // Get all reports
  getReports: async () => {
    try {
      const response = await apiClient.get("/api/reports");
      return response.data;
    } catch (error) {
      console.error("Error fetching reports:", error);
      throw error;
    }
  },

  // Get report by ID
  getReportById: async (id) => {
    try {
      const response = await apiClient.get(`/api/reports/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching report:", error);
      throw error;
    }
  },

  // Create new assessment report
  createReport: async (reportData) => {
    try {
      const response = await apiClient.post("/api/reports", reportData);
      return response.data;
    } catch (error) {
      console.error("Error creating report:", error);
      throw error;
    }
  },

  // Update report
  updateReport: async (id, reportData) => {
    try {
      const response = await apiClient.put(`/api/reports/${id}`, reportData);
      return response.data;
    } catch (error) {
      console.error("Error updating report:", error);
      throw error;
    }
  },

  // Delete report
  deleteReport: async (id) => {
    try {
      const response = await apiClient.delete(`/api/reports/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting report:", error);
      throw error;
    }
  },

  // Start assessment for a connection
  startAssessment: async (connectionId) => {
    try {
      const response = await apiClient.post(`/api/reports/assessment/start/${connectionId}`, {});
      return response.data;
    } catch (error) {
      console.error("Error starting assessment:", error);
      throw error;
    }
  },

  // Get assessment status
  getAssessmentStatus: async (reportId) => {
    try {
      const response = await apiClient.get(`/api/reports/assessment/status/${reportId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching assessment status:", error);
      throw error;
    }
  },

  // Fetch SQL Server metadata
  fetchSqlServerMetadata: async () => {
    try {
      const response = await apiClient.get("/fetch_sql_server_metadata");
      return response.data;
    } catch (error) {
      console.error("Error fetching SQL Server metadata:", error);
      throw error;
    }
  },
};

export default apiClient;
