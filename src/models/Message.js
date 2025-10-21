const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
    ticket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    message: {
        type: String,
        required: [true, 'Please provide a message'],
        trim: true,
        maxlength: [2000, 'Message cannot be more than 2000 characters'],
    },
    attachments: [
        {
            filename: String,
            url: String,
            uploadedAt: {
                type: Date,
                default: Date.now,
            },
        }],
        isInternal: {
            type: Boolean,
            default: false,
        },
        isSystemMessage: {
            type: Boolean,
            default: false,
        }
    },
    { timestamps: true }
);
messageSchema.index({ ticket: 1, createdAt: -1 });
module.exports = mongoose.model('Message', messageSchema);