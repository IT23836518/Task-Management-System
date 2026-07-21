import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { CustomError } from '../middlewares/errorHandler';

// Priority and Status Enums matching Prisma schema
const PriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH']);
const StatusEnum = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']);

// Task validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }).max(255),
  description: z.string().optional().nullable(),
  priority: PriorityEnum,
  status: StatusEnum,
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid due date format'
  })
});

const updateTaskSchema = createTaskSchema.partial();

// 1. Create a Task
export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      const error: CustomError = new Error('User context missing');
      error.statusCode = 401;
      throw error;
    }

    const validation = createTaskSchema.safeParse(req.body);
    if (!validation.success) {
      const error: CustomError = new Error('Validation failed');
      error.statusCode = 400;
      error.errors = validation.error.format();
      throw error;
    }

    const { title, description, priority, status, dueDate } = validation.data;

    // Validate due date is not in the past (date only, ignoring time)
    const inputDate = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (inputDate < today) {
      const error: CustomError = new Error('Due date cannot be earlier than today');
      error.statusCode = 400;
      throw error;
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        priority,
        status,
        dueDate: inputDate,
        userId
      }
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (err) {
    next(err);
  }
};

// 2. Get All Tasks (Basic, before advanced filter/sort in Step 5)
export const getTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      const error: CustomError = new Error('User context missing');
      error.statusCode = 401;
      throw error;
    }

    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: tasks
    });
  } catch (err) {
    next(err);
  }
};

// 3. Get Task by ID
export const getTaskById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      const error: CustomError = new Error('User context missing');
      error.statusCode = 401;
      throw error;
    }

    const task = await prisma.task.findUnique({
      where: { id }
    });

    if (!task) {
      const error: CustomError = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    if (task.userId !== userId) {
      const error: CustomError = new Error('Forbidden: You do not own this task');
      error.statusCode = 403;
      throw error;
    }

    res.json({
      success: true,
      data: task
    });
  } catch (err) {
    next(err);
  }
};

// 4. Update a Task
export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      const error: CustomError = new Error('User context missing');
      error.statusCode = 401;
      throw error;
    }

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findUnique({
      where: { id }
    });

    if (!existingTask) {
      const error: CustomError = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    if (existingTask.userId !== userId) {
      const error: CustomError = new Error('Forbidden: You do not own this task');
      error.statusCode = 403;
      throw error;
    }

    const validation = updateTaskSchema.safeParse(req.body);
    if (!validation.success) {
      const error: CustomError = new Error('Validation failed');
      error.statusCode = 400;
      error.errors = validation.error.format();
      throw error;
    }

    const { title, description, priority, status, dueDate } = validation.data;

    let updatedDueDate: Date | undefined;
    if (dueDate) {
      // Validate due date is not in the past
      updatedDueDate = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (updatedDueDate < today) {
        const error: CustomError = new Error('Due date cannot be earlier than today');
        error.statusCode = 400;
        throw error;
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title,
        description: description === undefined ? undefined : description,
        priority,
        status,
        dueDate: updatedDueDate
      }
    });

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (err) {
    next(err);
  }
};

// 5. Delete a Task
export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      const error: CustomError = new Error('User context missing');
      error.statusCode = 401;
      throw error;
    }

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findUnique({
      where: { id }
    });

    if (!existingTask) {
      const error: CustomError = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    if (existingTask.userId !== userId) {
      const error: CustomError = new Error('Forbidden: You do not own this task');
      error.statusCode = 403;
      throw error;
    }

    await prisma.task.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
