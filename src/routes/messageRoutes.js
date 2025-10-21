const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {updateMessage, deleteMessage} = require('../controllers/messageControllers');
const {protect} = require('../middleware/authMiddleware');
const UpdateMessageValidation = [
    body('message')
        .trim()
        .notEmpty().withMessage('Message is required')
        .isLength({ min: 1, max: 2000 }).withMessage('Message must be between 1 and 2000 characters')
];
router.put('/:id', protect, UpdateMessageValidation, updateMessage);
router.delete('/:id', protect, deleteMessage);
module.exports = router;