import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../config/db';
import { generateToken } from '../utils/jwt';
import { CustomError } from '../middlewares/errorHandler';

// Login Validation Schema
const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' })
});

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      const error: CustomError = new Error('Validation failed');
      error.statusCode = 400;
      error.errors = validation.error.format();
      throw error;
    }

    const { email, password } = validation.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      const error: CustomError = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error: CustomError = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Generate JWT
    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    next(err);
  }
};
