import NewProject from '../models/NewProject.js';
import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

const uploadToCloudinary = (buffer, folder, resourceType = 'image') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: resourceType,
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );

        const readableStream = new Readable();
        readableStream.push(buffer);
        readableStream.push(null);
        readableStream.pipe(uploadStream);
    });
};

const normalizeNewProjectPayload = (payload) => {
    const normalized = { ...payload };

    if (payload.priceRangeMin || payload.priceRangeMax) {
        normalized.priceRange = {
            min: payload.priceRangeMin,
            max: payload.priceRangeMax
        };
        delete normalized.priceRangeMin;
        delete normalized.priceRangeMax;
    }

    if (payload.amenities && typeof payload.amenities === 'string') {
        normalized.amenities = payload.amenities.split(',').map(s => s.trim());
    }

    ['towers', 'totalUnits', 'featured'].forEach(field => {
        if (normalized[field] !== undefined && normalized[field] !== '') {
            normalized[field] = field === 'featured' ? normalized[field] === 'true' : Number(normalized[field]);
        }
    });

    return normalized;
};

// @desc    Get all new projects
// @route   GET /api/new-projects
// @access  Public
export const getNewProjects = async (req, res, next) => {
    try {
        console.log(`Fetching new projects: limit=${req.query.limit}, featured=${req.query.featured}`);

        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const skip = Math.max(parseInt(req.query.skip) || 0, 0);

        const queryInfo = {};
        if (req.query.featured === 'true') {
            queryInfo.featured = true;
        }

        const projects = await NewProject.find(queryInfo)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await NewProject.countDocuments(queryInfo);

        console.log(`Successfully fetched ${projects.length} projects`);

        res.status(200).json({
            success: true,
            count: projects.length,
            total,
            projects,
        });
    } catch (err) {
        console.error('Error in getNewProjects:', err);
        next(err);
    }
};

// @desc    Get single new project
// @route   GET /api/new-projects/:id
// @access  Public
export const getNewProjectById = async (req, res, next) => {
    try {
        const project = await NewProject.findById(req.params.id);

        if (!project) {
            const error = new Error(`New Project not found with id of ${req.params.id}`);
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            success: true,
            project,
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create new project
// @route   POST /api/new-projects
// @access  Private/Admin
export const createNewProject = async (req, res, next) => {
    try {
        const projectData = normalizeNewProjectPayload(req.body);

        // Handle image uploads
        if (req.files && req.files.images) {
            const imagePromises = req.files.images.map((file) =>
                uploadToCloudinary(file.buffer, 'kuldevta/new-projects', 'image')
            );
            const imageResults = await Promise.all(imagePromises);
            projectData.images = imageResults.map((result) => ({
                url: result.secure_url,
                publicId: result.public_id,
            }));
        }

        const project = await NewProject.create(projectData);

        res.status(201).json({
            success: true,
            project,
        });
    } catch (err) {
        console.error('Create new project error:', err);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            const error = new Error(`Validation Error: ${messages.join(', ')}`);
            error.statusCode = 400;
            return next(error);
        }
        next(err);
    }
};

// @desc    Update new project
// @route   PUT /api/new-projects/:id
// @access  Private/Admin
export const updateNewProject = async (req, res, next) => {
    try {
        let project = await NewProject.findById(req.params.id);

        if (!project) {
            const error = new Error(`New Project not found with id of ${req.params.id}`);
            error.statusCode = 404;
            throw error;
        }

        const projectData = normalizeNewProjectPayload(req.body);

        // Handle new image uploads
        if (req.files && req.files.images) {
            const imagePromises = req.files.images.map((file) =>
                uploadToCloudinary(file.buffer, 'kuldevta/new-projects', 'image')
            );
            const imageResults = await Promise.all(imagePromises);
            const newImages = imageResults.map((result) => ({
                url: result.secure_url,
                publicId: result.public_id,
            }));

            projectData.images = [...(project.images || []), ...newImages];
        }

        project = await NewProject.findByIdAndUpdate(req.params.id, projectData, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            project,
        });
    } catch (err) {
        console.error('Update new project error:', err);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            const error = new Error(`Validation Error: ${messages.join(', ')}`);
            error.statusCode = 400;
            return next(error);
        }
        next(err);
    }
};

// @desc    Delete new project
// @route   DELETE /api/new-projects/:id
// @access  Private/Admin
export const deleteNewProject = async (req, res, next) => {
    try {
        const project = await NewProject.findById(req.params.id);

        if (!project) {
            const error = new Error(`New Project not found with id of ${req.params.id}`);
            error.statusCode = 404;
            throw error;
        }

        await project.deleteOne();

        res.status(200).json({
            success: true,
            data: {},
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Increment views
// @route   PUT /api/new-projects/:id/views
// @access  Public
export const incrementViews = async (req, res, next) => {
    try {
        const project = await NewProject.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true, runValidators: false }
        );

        if (!project) {
            const error = new Error(`New Project not found with id of ${req.params.id}`);
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            success: true,
            views: project.views,
        });
    } catch (err) {
        next(err);
    }
};
