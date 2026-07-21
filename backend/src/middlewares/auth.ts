import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { CustomError } from './errorHandler';

export const protect = (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      const error: CustomError = new Error('Not authorized, no token provided');
      error.statusCode = 401;
      throw error;
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === 'JsonWebTokenError') {
      const error: CustomError = new Error('Not authorized, invalid token');
      error.statusCode = 401;
      return next(error);
    }
    if (err.name === 'TokenExpiredError') {
      const error: CustomError = new Error('Not authorized, token expired');
      error.statusCode = 401;
      return next(error);
    }
    next(err);
  }
};
