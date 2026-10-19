import { API_ROUTES } from "../constants/routes";
import { api } from "../lib/api";

export const borrowService = {
  getRequests: () => api.get(API_ROUTES.BORROW.REQUESTS),

  /**
    @param {string} id 
     */
  getRequest: (id) => api.get(API_ROUTES.BORROW.REQUEST_BY_ID(id)),

  /**
    @param {Object} data
     */
  createRequest: (data) => api.post(API_ROUTES.BORROW.REQUESTS, data),

  /**
    @param {string} id 
     */
  verifyRequest: (id) => api.post(API_ROUTES.BORROW.VERIFY_REQUEST(id), {}),

  /**
    @param {string} id 
    @param {string} reason 
     */
  rejectRequest: (id, reason) =>
    api.post(API_ROUTES.BORROW.REJECT_REQUEST(id), { reason }),
};

export default borrowService;
