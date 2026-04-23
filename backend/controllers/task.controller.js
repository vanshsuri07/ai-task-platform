import Task from '../models/task.model.js';
import { pushToQueue } from '../services/taskQueue.js';

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res) => {
  try {
    const { title, input, operation } = req.body;

    if (!title || !input || !operation) {
      return res.status(400).json({ message: 'Please provide title, input, and operation types' });
    }

    const task = await Task.create({
      title,
      input,
      operation,
      status: 'pending',
      userId: req.user.id,
      logs: [{ message: 'Task created' }],
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error creating task' });
  }
};

// @desc    Get all tasks for user
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching tasks' });
  }
};

// @desc    Get single task by id
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Make sure the logged in user is the owner
    if (task.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to view this task' });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching task' });
  }
};

// @desc    Run task
// @route   POST /api/tasks/:id/run
// @access  Private
export const runTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to run this task' });
    }

    // Only allow pending, failed, or stuck in-progress tasks to run
    if (task.status === 'completed') {
       return res.status(400).json({ message: 'Task is already completed' });
    }

    // Update status to in-progress
    task.status = 'in-progress';
    task.logs.push({ message: 'Task submitted to queue' });
    await task.save();

    // Push jobId to Redis jobs queue
    await pushToQueue('jobs', task._id);

    res.status(200).json({ message: 'Task execution started', task });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error running task' });
  }
};
