import { API_ROUTES } from "../constants/routes";
import { api } from "../lib/api";

export const authService = {
  /**
   * @param {string} employeeId
   * @param {string} password
   */
  login: (employeeId, password) =>
    api.post(API_ROUTES.AUTH.LOGIN, { employeeId, password }),

  logout: () => api.post(API_ROUTES.AUTH.LOGOUT, {}),

  me: () => api.get(API_ROUTES.AUTH.ME),
};

export default authService;
