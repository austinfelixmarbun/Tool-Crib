import { API_ROUTES } from "../constants/routes";
import { api } from "../lib/api";

export const programsService = {
  getAll: () => api.get(API_ROUTES.PROGRAMS.BASE),

  /**
   @param {Object} data - { name, category }
   */
  create: (data) => api.post(API_ROUTES.PROGRAMS.BASE, data),

  /**
   * @param {string} id
   */
  delete: (id) => api.delete(API_ROUTES.PROGRAMS.BY_ID(id)),
};

export default programsService;
