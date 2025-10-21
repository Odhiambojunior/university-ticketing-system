const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title for the ticket'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    description: {
        type: String,
        required: [true, 'Please provide a description for the ticket'],
        trim: true,
        maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    category: {
        type: String,
        required: [true, 'Please provide a category for the ticket'],
        enum: ['IT Support', 'Facilities', 'Academic','Library','Finance','Admissions','Student Services', 'Other']
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High','critical'],
        default: 'Medium',
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Resolved', 'Closed','on Hold'],
        default: 'Open',
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    department: {
        type: String,
        trim: true,
    },
    location: {
        type: String,
        trim: true,
        maxlength: [100, 'Location cannot be more than 100 characters'],
    },
    attachments: [
        {
            filename: String,
            url: String,
            uploadedAt: {
                type: Date,
                default: Date.now,
            },
        }
    ],
    resolution: {
        type: String,
        trim: true,
        maxlength: [2000, 'Resolution cannot be more than 2000 characters'],
        default: '',
    },
    resolvedAt: {
        type: Date,
        default: null,
    },
    closedAt: {
        type: Date,
        default: null,
    },
    dueDate: {
        type: Date,
        default: null,
    },
    tags: [
        {
            type: String,
            trim: true,
        }
    ],
    isDeleted: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });
ticketSchema.index({ createdBy: 1, status: 1 });
ticketSchema.index({ assignedTo: 1, status: 1 });
ticketSchema.index({ category: 1, priority: 1 });
ticketSchema.index({ createdAt: -1 });

ticketSchema.virtual('ageInDays').get(function() {
    return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});
ticketSchema.pre('save', function(next) {
    if (this.isModified('status') && this.status === 'Resolved' && !this.resolvedAt) {
        this.resolvedAt = Date.now();
    }
    if (this.isModified('status') && this.status === 'Closed' && !this.closedAt) {
        this.closedAt = Date.now();
    }
    next();
});

module.exports = mongoose.model('Ticket', ticketSchema);


