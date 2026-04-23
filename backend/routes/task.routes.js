import express from 'express';
import { createTask, getTasks, getTaskById, runTask } from '../controllers/task.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createTask)
  .get(protect, getTasks);

router.route('/:id')
  .get(protect, getTaskById);

router.route('/:id/run')
  .post(protect, runTask);

export default router;
