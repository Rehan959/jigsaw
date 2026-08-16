import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  cause?: string;
  fix?: string;
  docs?: string;
}

export function errorHandler(err: AppError, _req: Request, res: Response, _next: NextFunction) {
  const statusCode = err.statusCode || 500;
  const code = err.code || "INTERNAL_ERROR";

  res.status(statusCode).json({
    error: {
      code,
      message: err.message || "Internal server error",
      cause: err.cause || undefined,
      fix: err.fix || undefined,
      docs: err.docs || undefined,
    },
  });
}
