// src/middlewares/role.middleware.ts
// RBAC — guards routes by allowed roles

import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "../types/express.d.ts";
import { forbidden, unauthorized } from "../utils/app-error.ts";

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(unauthorized());
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        forbidden(`Access denied. Allowed roles: ${allowedRoles.join(", ")}`)
      );
    }
    next();
  };
}

// Shorthand guards
export const requireSuperAdmin = requireRole("SUPER ADMIN");
export const requireAdmin = requireRole("SUPER ADMIN", "ADMIN");
export const requireQC = requireRole("SUPER ADMIN", "ADMIN", "QUALITY CONTROL");
export const requireAnyAuth = requireRole(
  "SUPER ADMIN",
  "ADMIN",
  "QUALITY CONTROL",
  "USER"
);
