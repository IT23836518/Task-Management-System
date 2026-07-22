import request from 'supertest';
import app from '../index';
import prisma from '../config/db';
import bcrypt from 'bcryptjs';

// Mock the Prisma client
jest.mock('../config/db', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn()
    }
  }
}));

// Mock bcryptjs comparison helper
jest.mock('bcryptjs', () => ({
  compare: jest.fn()
}));

describe('Auth Controller - POST /api/auth/login', () => {
  const mockUser = {
    id: 'user-123',
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'hashed-password-123'
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should authenticate successfully with correct credentials', async () => {
    // Mock database response
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    
    // Mock successful password validation
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe('admin@test.com');
  });

  it('should return 401 for incorrect password', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false); // wrong password

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'wrongpassword' });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Invalid email or password');
  });

  it('should return 400 for missing email parameter', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ password: 'password123' }); // missing email

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
