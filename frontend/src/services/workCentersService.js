import { API_ROUTES } from "../constants/routes";
import { api } from "../lib/api";

export const workCentersService = {
  getAll: () => api.get(API_ROUTES.WORK_CENTERS.BASE),

  /**
  @param {Object} data
   */
  create: (data) => api.post(API_ROUTES.WORK_CENTERS.BASE, data),

  /**
  @param {Array} items
   */
  bulkCreate: (items) => api.post(API_ROUTES.WORK_CENTERS.BULK, { items }),

  /**
  @param {string} id
  @param {Object} data
   */
  update: (id, data) => api.patch(API_ROUTES.WORK_CENTERS.BY_ID(id), data),

  /**
  @param {string} id
   */
  delete: (id) => api.delete(API_ROUTES.WORK_CENTERS.BY_ID(id)),
};

export default workCentersService;
