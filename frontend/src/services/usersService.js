import { API_ROUTES } from "../constants/routes";
import { api } from "../lib/api";

export const usersService = {
  /**
    @param {Object} params
     */
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`${API_ROUTES.USERS.BASE}${query ? `?${query}` : ""}`);
  },

  /**
    @param {string} id 
     */
  getById: (id) => api.get(API_ROUTES.USERS.BY_ID(id)),

  /**
    @param {string} nik 
     */
  getByNik: (nik) => api.get(API_ROUTES.USERS.BY_NIK(nik)),

  /**
    @param {Object} data 
     */
  create: (data) => api.post(API_ROUTES.USERS.BASE, data),

  /**
    @param {string} id 
    @param {Object} data 
     */
  update: (id, data) => api.patch(API_ROUTES.USERS.BY_ID(id), data),

  /**
    @param {string} id
    @param {string} newPassword
     */
  resetPassword: (id, newPassword) =>
    api.post(API_ROUTES.USERS.RESET_PASSWORD(id), { newPassword }),

  /**
    @param {string} id 
     */
  delete: (id) => api.delete(API_ROUTES.USERS.BY_ID(id)),
};

export default usersService;
