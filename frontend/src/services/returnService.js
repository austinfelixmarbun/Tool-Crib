import { API_ROUTES } from "../constants/routes";
import { api } from "../lib/api";

export const returnService = {
  /**
    @param {string} nik 
     */
  getActiveBorrows: (nik) => api.get(API_ROUTES.RETURN.ACTIVE_BY_NIK(nik)),

  /**
    @param {Array<string>} logIds
     */
  processReturn: (logIds) => api.post(API_ROUTES.RETURN.PROCESS, { logIds }),

  /**
    @param {Array<string>} jids 
     */
  getActiveBorrowsByJids: (jids) =>
    api.post(API_ROUTES.RETURN.ACTIVE_JIDS, { jids }),

  /**
    @param {Array<string>} jids 
    @param {Date|string} newDueDate 
     */
  bulkUpdateDueDate: (jids, newDueDate) =>
    api.post(API_ROUTES.RETURN.BULK_UPDATE_DUE_DATE, { jids, newDueDate }),
};

export default returnService;
