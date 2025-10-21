const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { createTicket, getTickets, getTicketsById, updateTicket, deleteTicket, getTicketStats} = require('../controllers/ticketController');
const { addMessage, getMessages } = require('../controllers/messageControllers');
const {protect, authorize} = require('../middleware/authMiddleware');

const CreateTicketValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
    body('category')
        .notEmpty().withMessage('Category is required')
        .isIn(['IT Support', 'Facilities', 'Academic', 'Library', 'Finance', 'Admissions', 'Student Services', 'Other']).withMessage('Invalid category'),
    body('priority')
        .optional()
        .isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Invalid priority'),
    body('department')
        .optional()
        .trim(),
    body('location')
        .optional()
        .trim(),
    body('dueDate')
        .optional()
        .isISO8601().withMessage('Ivalid date Format'),
    body('tags')
        .optional()
        .isArray().withMessage('Tags must be an array of strings')
];

const UpdateTicketValidation = [
    body('status')
        .optional()
        .isIn(['Open', 'In Progress', 'Resolved', 'Closed', 'On Hold']).withMessage('Invalid status'),
    body('priority')
        .optional()
        .isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Invalid priority'),
    body('assignedTo')
        .optional(),
    body('resolution')
        .optional()
        .trim()
        .isLength({ min: 10, max: 2000 }).withMessage('Resolution must be between 10 and 2000 characters'),
    body('category')
        .optional()
        .isIn(['IT Support', 'Facilities', 'Academic', 'Library', 'Finance', 'Admissions', 'Student Services', 'Other']).withMessage('Invalid category'),
];

const AddMessageValidation = [
    body('message')
        .trim()
        .notEmpty().withMessage('Message is required')
        .isLength({ min: 1, max: 2000 }).withMessage('Message must be between 1 and 2000 characters'),
    body('isInternal')
        .optional()
        .isBoolean().withMessage('isInternal must be a boolean'),
];
// Ticket Routes
router.post('/', protect, CreateTicketValidation, createTicket);
router.get('/', protect, getTickets);
router.get('/stats/overview', protect, authorize('admin', 'staff'), getTicketStats);
router.get('/:id', protect, getTicketsById);
router.put('/:id', protect, UpdateTicketValidation, updateTicket);
router.delete('/:id', protect, authorize('admin'), deleteTicket);
router.post('/:id/messages', protect, AddMessageValidation, addMessage);
router.get('/:id/messages', protect, getMessages);
module.exports = router;
