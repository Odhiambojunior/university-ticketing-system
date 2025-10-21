const Ticket = require('../models/Ticket');
const Message = require('../models/Message');
const { validationResult } = require('express-validator');
// @desc Create a new ticket
// @route POST /api/tickets
const createTicket = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        const { title, description, category, priority, department, location, dueDate,tags } = req.body;
        const ticket = await Ticket.create({
            title,
            description,
            category,
            priority:priority || 'medium',
            department,
            location,
            dueDate,
            tags,
            createdBy: req.user._id,
        });
        await ticket.populate('createdBy', 'name email role department');
        await Message.create({
            ticket: ticket._id,
            sender: req.user._id,
            message: 'Ticket created',
            isSystemMessage: true,
        });
        res.status(201).json({ success: true, message: 'Ticket created successfully', data: ticket });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error during ticket creation', error: error.message });
    }
};
// @desc Get tickets with filtering, sorting, and pagination
// @route GET /api/tickets
const getTicketsById = async (req, res) => {
    try {
        const ticket = await Ticket.findOne({ _id: req.params.id, isDeleted: false })
            .populate('createdBy', 'name email role department studentId staffId phoneNumber')
            .populate('assignedTo', 'name email role department studentId staffId phoneNumber');
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }
        // Ensure that students can only access their own tickets
        if (req.user.role === 'student' && ticket.createdBy._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        const messages = await Message.find({ ticket: ticket._id })
            .populate('sender', 'name email role')
            .sort({ createdAt: 1 });
        res.status(200).json({ success: true, data: { ticket, messages } });
    }catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error fetching ticket', error: error.message });
    }
};
const getTickets = async (req, res) => {
    try {
        const { status, priority, category, department, assignedTo, createdBy, search, sortBy='createdAt', sortOrder='desc', page=1, limit=10} = req.query;
        const query = { isDeleted: false };
        if (req.user.role === 'student') {
            query.createdBy = req.user._id;
        } else if (req.user.role === 'staff') {
            query.$or = [{ assignedTo: req.user._id }, { assignedTo: null }];
        }
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (category) query.category = category;
        if (assignedTo) query.assignedTo = assignedTo;
        if (createdBy) query.createdBy = createdBy;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }
        const skip =(page - 1) * limit;
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
        const ticketsPromise = Ticket.find(query)
            .populate('createdBy', 'name email role department studentId staffId phoneNumber')
            .populate('assignedTo', 'name email role department studentId staffId phoneNumber')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));
        const total = await Ticket.countDocuments(query);
        res.status(200).json({ success: true, count: total, page: parseInt(page), pages: Math.ceil(total / limit), data: await ticketsPromise });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error fetching tickets', error: error.message });
    }
};

// @desc Update a ticket
// @route PUT /api/tickets/:id
const updateTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findOne({ _id: req.params.id, isDeleted: false });
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }
        if (req.user.role === 'student' && ticket.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        const {
            status,
            priority,
            assignedTo,
            resolution,
            category,
            department,
            location,
            dueDate,
            tags
        } = req.body;
        const changes = [];
        if (status && status !== ticket.status) {
            changes.push(`Status changed from ${ticket.status} to ${status}`);
            ticket.status = status;
        }
        if (priority && priority !== ticket.priority) {
            changes.push(`Priority changed from ${ticket.priority} to ${priority}`);
            ticket.priority = priority;
        }
        if (assignedTo !== undefined) {
            if (assignedTo && assignedTo !== ticket.assignedTo?.toString()) {
                changes.push('Ticket Assigned to staff member');
                ticket.assignedTo = assignedTo;
            } else if (assignedTo === null || assignedTo === '') {
                changes.push('Ticket Unassigned from staff member');
                ticket.assignedTo = null;
            }
        }
        if (resolution) ticket.resolution = resolution;
        if (category) ticket.category = category;
        if (department) ticket.department = department;
        if (location) ticket.location = location;
        if (dueDate) ticket.dueDate = dueDate;
        if (tags) ticket.tags = tags;

        await ticket.save();
        if (changes.length > 0) {
            await Message.create({
                ticket: ticket._id,
                sender: req.user._id,
                message: changes.join('. '),
                isSystemMessage: true,
            });
        }
        await ticket.populate('createdBy', 'name email role department');
        await ticket.populate('assignedTo', 'name email role department');
        res.status(200).json({ success: true, message: 'Ticket updated successfully', data: ticket });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error updating ticket', error: error.message });
    }
};
// @desc Delete a ticket (soft delete)
const deleteTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }
            ticket.isDeleted = true;
            await ticket.save();
            res.status(200).json({ success: true, message: 'Ticket deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error deleting ticket', error: error.message });
    }
};
const getTicketStats = async (req, res) => {
    try {
    const query = { isDeleted: false };
    if (req.user.role === 'staff') {
    query.assignedTo = req.user._id;
    }
    const stats = await Ticket.aggregate([
    { $match: query },
    {
     $facet: {
     byStatus: [
    { $group: { _id: '$status', count: { $sum: 1 } } }
    ],
    byPriority: [
    { $group: { _id: '$priority', count: { $sum: 1 } } }
    ],
    byCategory: [
    { $group: { _id: '$category', count: { $sum: 1 } } }
    ],
    total: [
    { $count: 'count' }
    ]
        }
    }
    ]);
    res.status(200).json({
    success: true,
    data: {
    total: stats[0].total[0] ?.count || 0,
    byStatus: stats[0].byStatus,
    byPriority: stats[0].byPriority,
    byCategory: stats[0].byCategory
        }
    });
    } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error fetching ticket stats', error: error.message });
    }
};
module.exports = {
    createTicket,
    getTicketsById,
    getTickets,
    updateTicket,
    deleteTicket,
    getTicketStats
};
