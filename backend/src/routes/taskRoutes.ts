import { Router } from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskMetrics
} from '../controllers/taskController';
import { protect } from '../middlewares/auth';

const router = Router();

// Protect all routes under this router
router.use(protect);

router.post('/', createTask);
router.get('/', getTasks);
router.get('/metrics', getTaskMetrics);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);


export default router;
