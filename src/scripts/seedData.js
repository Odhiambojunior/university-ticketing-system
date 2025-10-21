require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Message = require('../models/Message');
const connectDB = require('../config/db');

const seedDatabase = async () => {

    
    try {
        console.log('Starting database seed...\n')
        await connectDB();
        // Clear existing data
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Ticket.deleteMany({});
        await Message.deleteMany({});

        console.log('seed script starting...');
        console.log('Connected to mongoDB...\n');
        console.log('Creating users...');
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@university.edu',
            password: 'password123',
            role: 'admin',
            department: 'Administration',
            staffId: 'ADMIN001',
        });
        const staff1 = await User.create({
            name: 'Sarah Tech',
            email: 'sarah.tech@university.edu',
            password: 'staff123',
            role: 'staff',
            department: 'IT Support',
            staffId: 'IT001',
            phoneNumber: '+254722111111',
        });
        const staff2 = await User.create({
            name: 'John Maintenance',
            email: 'john.maint@university.edu',
            password: 'staff123',
            role: 'staff',
            department: 'Facilities',
            staffId: 'FAC001',
            phoneNumber: '+254722222222',
        });
        const student1 = await User.create({
            name: 'Alice Johnson',
            email: 'alice@university.edu',
            password: 'student123',
            role: 'student',
            department: 'Computer Science',
            studentId: 'CS2024001',
            phoneNumber: '+254733111111',
        });
        const student2 = await User.create({
            name: 'Bob Smith',
            email: 'bob@university.edu',
            password: 'student123',
            role: 'student',
            department: 'Engineering',
            studentId: 'ENG2024001',
            phoneNumber: '+254733222222',
        });
        console.log('Users created successfully!');

        console.log('Creating tickets...');
        const ticket1 = await Ticket.create({
            title: 'Computer lab Projector Not Working',
            description: 'The projector in computer Lab 3 is not displaying anything. Tried different cables but still not working.',
            category: 'IT Support',
            priority: 'High',
            status: 'In Progress',
            createdBy: student1._id,
            assignedTo: staff1._id,
            department: 'Computer Science',
            location: 'Computer Lab 3, Building A',
            tags: ['hardware','urgent'],
        });
        const ticket2 = await Ticket.create({
            title: 'Broken Window in Lecture Hall',
            description: 'One of the windows in Lecture Hall B is brocken and needs immediate reapair.',
            category: 'Facilities',
            priority: 'High',
            status: 'Open',
            createdBy: student1._id,
            department: 'Facilities',
            location: 'Lecture Hall B',
            tags: ['safety','urgent'],
        });
        const ticket3 = await Ticket.create({
            title: 'Library Wi-Fi Connectivity Issues',
            description:'Cannot connect to Wi-Fi in the library. Network Keeps dropping.',
            category: 'IT Support',
            priority: 'Medium',
            status: 'Open',
            createdBy: student2._id,
            department: 'IT Support',
            location: 'Main Library',
            tags: ['network','wifi'],
        });
        const ticket4 = await Ticket.create({
            title: 'Request for Grade Review',
            description: 'I would like to request a review of my grade for the Data Structures course. I believe there was an error in the calculation.',
            category: 'Academic',
            priority: 'Medium',
            status: 'Resolved',
            createdBy: student2._id,
            department: 'Mathematics',
            resolution: 'Grade reviewed and confirmed. No changes needed.',
            resolvedAt: new Date(),
        });
        const ticket5 = await Ticket.create({
            title: 'Air Conditioning Not Working in Dormitory',
            description: 'The air conditioning unit in my dorm room is not functioning properly. It is very hot and uncomfortable.',
            category: 'Facilities',
            priority: 'Low',
            status: 'In Progress',
            createdBy: student1._id,
            assignedTo: staff2._id,
            location: 'Dormitory Room 204',
            tags: ['hvac','comfort'],
        });
        console.log('Tickets created successfully!');
        console.log('Creating messages...');
        await Message.create({
            ticket: ticket1._id,
            sender: student1._id,
            message: 'Ticket created',
            isSystemMessage: true,
        },
        {
            ticket: ticket1._id,
            sender: staff1._id,
            message: 'Status changed from Open to In-Progress. Assigned to Sarah Tech',
            isSystemMessage: true,
        },
        {
            ticket: ticket1._id,
            sender: student1._id,
            message: 'I have also noticed that the HDMI port seems loose. might be realated to that.',
        },
        {
            ticket: ticket1._id,
            sender: staff1._id,
            message: 'Thank you for the update. I will check the HDMI port as well. A technician will be sent to visit the lab tommorow.',
        },
        {
            ticket: ticket1._id,
            sender: staff1._id,
            message:'Ordered repalacement projector. Will arrive in 3 days.',
            isInternal: true,
        },
        {
            ticket: ticket2._id,
            sender: student1._id,
            message: 'Ticket created',
            isSystemMessage: true,
        },
        {
            ticket: ticket3._id,
            sender: student2._id,
            message: 'Ticket created',
            isSystemMessage: true,
        },
        {
            ticket: ticket4._id,
            sender: student2._id,
            message: 'Ticket created',
            isSystemMessage: true,
        },
        {
            ticket: ticket4._id,
            sender: staff2._id,
            message: 'Status changed from Open to Resolved.',
            isSystemMessage: true,
        },
        {
            ticket: ticket5._id,
            sender: student1._id,
            message: 'Ticket created',
            isSystemMessage: true,
        },
        {
            ticket: ticket5._id,
            sender: staff2._id,
            message: 'Status changed from Open to In-Progress. Assigned to John Maintenance',
            isSystemMessage: true,
        });
        console.log('Messages created successfully!');
        console.log('\n========== SEED DATA SUMMARY ==========');
        console.log('Admin User:');
        console.log(`  Email: admin@university.edu | Password: admin123`);
        console.log('\n Staff Users:');
        console.log(`  Email:sarah.tech@university.edu | Password: staff123`);
        console.log(`  Email:john.maint@university.edu | Password: staff123`);
        console.log('\n Student Users:');
        console.log(`  Email:alice@university.edu | Password: student123`);
        console.log(`  Email:bob@university.edu | Password: student123`);
        console.log('\n Created 5 tickets with various statuses.');
        console.log('Created multiple messages for tickets including system and internal messages.');
        console.log('======================================\n');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();


