const Message = require('../models/Message');
const Ticket = require('../models/Ticket');
const { validationResult } = require('express-validator');
// @desc Send a message in a ticket
// @route POST /api/tickets/:id/messages
const addMessage = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        const {message, isInternal} = req.body;
        const ticketId=req.params.id;
        const ticket=await Ticket.findOne({_id:ticketId,isDeleted:false});
        if(!ticket){
            return res.status(404).json({success:false,message:'Ticket not found'});
        }
        // Ensure that students can only add messages to their own tickets
        const isCreator = ticket.createdBy.toString() === req.user._id.toString();
        const isAssigned = ticket.assignedTo?.toString() == req.user.id;
        const isStafforAdmin= ['staff','admin'].includes(req.user.role);
        if(!isCreator && !isAssigned && !isStafforAdmin){
            return res.status(403).json({success:false,message:'Access denied'});
        }
        if (isInternal && req.user.role === 'student') {
            return res.status(403).json({ success: false, message: 'Students cannot send internal messages' });
        }
        const newMessage = await Message.create({
            ticket: ticket._id,
            sender: req.user._id,
            message,
            isInternal: isInternal || false,
        });
        await newMessage.populate('sender', 'name email role department');
        ticket.updatedAt=Date.now();
        await ticket.save();
        res.status(201).json({ success: true, message: 'Message added successfully', data: newMessage });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error adding message', error: error.message });
    }
};
const getMessages=async(req,res)=>{
    try{
        const ticketId=req.params.id;
        const ticket=await Ticket.findOne({_id:ticketId,isDeleted:false});
        if(!ticket){
            return res.status(404).json({success:false,message:'Ticket not found'});
        }
        const isCreator = ticket.createdBy.toString() === req.user._id.toString();
        const isAssigned = ticket.assignedTo?.toString() == req.user.id;
        const isStafforAdmin= ['staff','admin'].includes(req.user.role);
        if(!isCreator && !isAssigned && !isStafforAdmin){
            return res.status(403).json({success:false,message:'Access denied'});
        }
        const query={ticket:ticket._id};
        if(req.user.role==='student'){
            query.isInternal=false;
        }
        const messages=await Message.find(query)
        .populate('sender','name email role department')
        .sort({createdAt:1});
        res.status(200).json({success:true,data:messages,count:messages.length});
    }catch(error){
        console.error(error);
        res.status(500).json({success:false,message:'Server Error fetching messages',error:error.message});
    }
};
const updateMessage=async(req,res)=>{
      try {
        const{ message } = req.body;
        const existingMessage = await Message.findById(req.params.id);
        if (!existingMessage) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }
        if (existingMessage.isSystemMessage) {
            return res.status(403).json({ success: false, message: 'System messages cannot be edited' });
        }
        existingMessage.message = message;
        await existingMessage.save();
        await existingMessage.populate('sender', 'name email role department');
        res.status(200).json({ success: true, message: 'Message updated successfully', data: existingMessage });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error updating message', error: error.message });
    }
};
const deleteMessage=async(req,res)=>{
    try {
        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }
        const isSender = message.sender.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';
        if (!isSender && !isAdmin) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        if (message.isSystemMessage) {
            return res.status(403).json({ success: false, message: 'System messages cannot be deleted' });
        }
        await message.deleteOne();
        res.status(200).json({ success: true, message: 'Message deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error deleting message', error: error.message });
    }
};
module.exports={addMessage,getMessages,updateMessage,deleteMessage};