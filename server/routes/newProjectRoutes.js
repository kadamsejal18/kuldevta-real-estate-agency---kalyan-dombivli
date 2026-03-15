import express from 'express';
import {
    getNewProjects,
    getNewProjectById,
    createNewProject,
    updateNewProject,
    deleteNewProject,
    incrementViews
} from '../controllers/newProjectController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router
    .route('/')
    .get(getNewProjects)
    .post(protect, upload.fields([{ name: 'images', maxCount: 20 }]), createNewProject);

router
    .route('/:id')
    .get(getNewProjectById)
    .put(protect, upload.fields([{ name: 'images', maxCount: 20 }]), updateNewProject)
    .delete(protect, deleteNewProject);

router.route('/:id/views').put(incrementViews);

export default router;
