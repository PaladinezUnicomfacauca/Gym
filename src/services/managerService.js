import api from "./api";

export const managerService = {
  getLoginList: async () => {
    try {
      const response = await api.get("/managers/login-list", { skipAuth: true });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAll: async () => {
    try {
      const response = await api.get("/managers");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/managers/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  create: async (managerData) => {
    try {
      const response = await api.post("/managers", managerData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, managerData) => {
    try {
      const response = await api.put(`/managers/${id}`, managerData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/managers/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Login de manager
  login: async (credentials) => {
    try {
      const response = await api.post("/managers/login", credentials);
      // Guardar el token JWT en localStorage
      if (response.data && response.data.token) {
        localStorage.setItem('managerToken', response.data.token);
        localStorage.setItem('managerData', JSON.stringify(response.data.manager));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
