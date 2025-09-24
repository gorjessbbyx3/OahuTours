import type { Express, Request, Response, NextFunction } from "express";

interface AuthenticatedRequest extends Request {
  user?: {
    claims: {
      sub: string;
      name: string;
      roles?: string[];
    };
  };
}

export async function setupAuth(app: Express): Promise<void> {
  // Replit Auth middleware
  app.use('/api', (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Extract Replit headers
    const userId = req.headers['x-replit-user-id'] as string;
    const userName = req.headers['x-replit-user-name'] as string;
    const userRoles = req.headers['x-replit-user-roles'] as string;

    if (userId && userName) {
      req.user = {
        claims: {
          sub: userId,
          name: userName,
          roles: userRoles ? userRoles.split(',') : []
        }
      };
    }

    next();
  });
}

export function isAuthenticated(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user?.claims?.sub) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}