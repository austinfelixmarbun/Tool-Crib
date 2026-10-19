// src/types/express.d.ts
// Extend Express Request with typed user session payload

export type UserRole = "SUPER ADMIN" | "ADMIN" | "QUALITY CONTROL" | "USER";

export interface UserSession {
  id: string;
  employeeId: number;
  name: string;
  email: string;
  role: UserRole;
  workCenterId: number;
  workAreaId: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserSession;
    }
  }
}
