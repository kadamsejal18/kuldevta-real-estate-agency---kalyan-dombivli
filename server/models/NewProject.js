import mongoose from 'mongoose';

const newProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
    },
    developer: {
        type: String,
        required: [true, 'Please add developer name'],
        trim: true,
    },
    location: {
        type: String,
        required: [true, 'Please add a location'],
    },
    priceRange: {
        min: {
            type: String,
            required: true,
        },
        max: {
            type: String,
            required: true,
        }
    },
    status: {
        type: String,
        required: true,
        enum: ['Ready to Move', 'Under Construction', 'Newly Launched'],
        default: 'Under Construction'
    },
    towers: {
        type: Number,
        required: false,
    },
    totalUnits: {
        type: Number,
        required: false,
    },
    amenities: {
        type: [String],
        default: []
    },
    images: [
        {
            url: { type: String, required: true },
            publicId: { type: String, required: true }
        }
    ],
    brochure: {
        type: String,
        required: false,
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    featured: {
        type: Boolean,
        default: false,
    },
    views: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true,
});

const NewProject = mongoose.model('NewProject', newProjectSchema);

export default NewProject;
