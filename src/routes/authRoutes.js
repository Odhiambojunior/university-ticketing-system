const express = require('express');
const {body}=require('express-validator');
const {register,login,getMe}=require('../controllers/authController');
const router=express.Router();
const {protect}=require('../middleware/authMiddleware');

const registerValidation=[
    body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({min:2,max:50}).withMessage('Name must be between 2 and 50 characters'),
    body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
    body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({min:6}).withMessage('Password must be at least 6 characters'),
    body('role')
    .optional()
    .isIn(['student','staff','admin']).withMessage('invalid role'),
    body('department')
    .optional()
    .trim(),
    body('studentId')
    .optional()
    .trim(),
    body('staffId')
    .optional()
    .trim(),
    body('phoneNumber')
    .optional()
    .trim()
];
const loginValidation=[
    body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
    body('password')
    .notEmpty().withMessage('Password is required')
];
router.post('/register',registerValidation,register);
router.post('/login',loginValidation,login);
router.get('/me',protect,getMe);
module.exports=router;