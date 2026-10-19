import { API_ROUTES } from "../constants/routes";
import { api } from "../lib/api";

export const inventoryService = {
  /**
    @param {Object} params
     */
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`${API_ROUTES.INVENTORY.BASE}${query ? `?${query}` : ""}`);
  },

  /**
    @param {number} id 
     */
  getById: (id) => api.get(API_ROUTES.INVENTORY.BY_ID(id)),

  /**
   @param {Object} data
   */
  create: (data) => api.post(API_ROUTES.INVENTORY.BASE, data),

  /**
   @param {Array} items
   */
  bulkCreate: (items) => api.post(API_ROUTES.INVENTORY.BULK, { items }),

  /**
   @param {number} id
   @param {Object} data
   */
  update: (id, data) => api.patch(API_ROUTES.INVENTORY.BY_ID(id), data),

  /**
   @param {number} id
   @param {Object} data
   */
  updateQC: (id, data) => api.patch(API_ROUTES.INVENTORY.QC(id), data),

  /**
   @param {number} id
   */
  delete: (id) => api.delete(API_ROUTES.INVENTORY.BY_ID(id)),
};

export default inventoryService;
