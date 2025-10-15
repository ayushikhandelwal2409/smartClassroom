// seedSections.js
const mongoose = require('mongoose');
const Section = require('./models/Section');


const sectionA = {
  sectionName: 'A',
  timetable: [
    {
      day: 'Monday',
      slots: [
        { time: '10:00 AM - 11:00 AM', subjectCode: 'BCSE 0105', roomNumber: '101', academicBlock: 'AB1' },
        { time: '11:00 AM - 12:00 PM', subjectCode: 'BCSE 0105', roomNumber: '101', academicBlock: 'AB1' },
        { time: '12:00 PM - 01:00 PM',  subjectCode: 'BCSC 0022', roomNumber: '102', academicBlock: 'AB2' },
        { time: '01:00 PM - 02:00 PM', subjectCode: '', roomNumber: '', academicBlock: '' },
        { time: '02:00 PM - 03:00 PM', subjectCode: 'BCSE 0255', roomNumber: '201', academicBlock: 'AB1' },
        { time: '03:00 PM - 04:00 PM', subjectCode: 'BCSE 0255', roomNumber: '201', academicBlock: 'AB1' },
        { time: '04:00 PM - 05:00 PM', subjectCode: '', roomNumber: '', academicBlock: '' },
        { time: '05:00 PM - 06:00 PM', subjectCode: 'BCSC 0022', roomNumber: '102', academicBlock: 'AB2' }
      ]
    },
    {
      day: 'Tuesday',
      slots: [
        { time: '10:00 AM - 11:00 AM', subjectCode: 'BCSE 0105', roomNumber: '101', academicBlock: 'AB1' },
        { time: '11:00 AM - 12:00 PM', subjectCode: 'BCSE 0105', roomNumber: '101', academicBlock: 'AB1' },
        { time: '12:00 PM - 01:00 PM',  subjectCode: 'BCSC 0022', roomNumber: '102', academicBlock: 'AB2' },
        { time: '01:00 PM - 02:00 PM', subjectCode: '', roomNumber: '', academicBlock: '' },
        { time: '02:00 PM - 03:00 PM', subjectCode: 'BCSE 0255', roomNumber: '201', academicBlock: 'AB1' },
        { time: '03:00 PM - 04:00 PM', subjectCode: 'BCSE 0255', roomNumber: '201', academicBlock: 'AB1' },
        { time: '04:00 PM - 05:00 PM', subjectCode: '', roomNumber: '', academicBlock: '' },
        { time: '05:00 PM - 06:00 PM', subjectCode: 'BCSC 0022', roomNumber: '102', academicBlock: 'AB2' }
      ]
    },
    {
      day: 'Wednesday',
      slots: [
        { time: '10:00 AM - 11:00 AM', subjectCode: 'BCSE 0105', roomNumber: '101', academicBlock: 'AB1' },
        { time: '11:00 AM - 12:00 PM', subjectCode: 'BCSE 0105', roomNumber: '101', academicBlock: 'AB1' },
        { time: '12:00 PM - 01:00 PM',  subjectCode: 'BCSC 0022', roomNumber: '102', academicBlock: 'AB2' },
        { time: '01:00 PM - 02:00 PM', subjectCode: '', roomNumber: '', academicBlock: '' },
        { time: '02:00 PM - 03:00 PM', subjectCode: 'BCSE 0255', roomNumber: '201', academicBlock: 'AB1' },
        { time: '03:00 PM - 04:00 PM', subjectCode: 'BCSE 0255', roomNumber: '201', academicBlock: 'AB1' },
        { time: '04:00 PM - 05:00 PM', subjectCode: '', roomNumber: '', academicBlock: '' },
        { time: '05:00 PM - 06:00 PM', subjectCode: 'BCSC 0022', roomNumber: '102', academicBlock: 'AB2' }
      ]
    },
    {
      day: 'Thursday',
      slots: [
        { time: '10:00 AM - 11:00 AM', subjectCode: 'BCSE 0105', roomNumber: '101', academicBlock: 'AB1' },
        { time: '11:00 AM - 12:00 PM', subjectCode: 'BCSE 0105', roomNumber: '101', academicBlock: 'AB1' },
        { time: '12:00 PM - 01:00 PM',  subjectCode: 'BCSC 0022', roomNumber: '102', academicBlock: 'AB2' },
        { time: '01:00 PM - 02:00 PM', subjectCode: '', roomNumber: '', academicBlock: '' },
        { time: '02:00 PM - 03:00 PM', subjectCode: 'BCSE 0255', roomNumber: '201', academicBlock: 'AB1' },
        { time: '03:00 PM - 04:00 PM', subjectCode: 'BCSE 0255', roomNumber: '201', academicBlock: 'AB1' },
        { time: '04:00 PM - 05:00 PM', subjectCode: '', roomNumber: '', academicBlock: '' },
        { time: '05:00 PM - 06:00 PM', subjectCode: 'BCSC 0022', roomNumber: '102', academicBlock: 'AB2' }
      ]
    },
    {
      day: 'Friday',
      slots: [
        { time: '10:00 AM - 11:00 AM', subjectCode: 'BCSE 0105', roomNumber: '101', academicBlock: 'AB1' },
        { time: '11:00 AM - 12:00 PM', subjectCode: 'BCSE 0105', roomNumber: '101', academicBlock: 'AB1' },
        { time: '12:00 PM - 01:00 PM',  subjectCode: 'BCSC 0022', roomNumber: '102', academicBlock: 'AB2' },
        { time: '01:00 PM - 02:00 PM', subjectCode: '', roomNumber: '', academicBlock: '' },
        { time: '02:00 PM - 03:00 PM', subjectCode: 'BCSE 0255', roomNumber: '201', academicBlock: 'AB1' },
        { time: '03:00 PM - 04:00 PM', subjectCode: 'BCSE 0255', roomNumber: '201', academicBlock: 'AB1' },
        { time: '04:00 PM - 05:00 PM', subjectCode: '', roomNumber: '', academicBlock: '' },
        { time: '05:00 PM - 06:00 PM', subjectCode: 'BCSC 0022', roomNumber: '102', academicBlock: 'AB2' }
      ]
    },
  ]
};


const sectionB = {
  sectionName: 'B',
  timetable: [
    {
      day: 'Monday',
      slots: [
        { time: '10:00 AM - 11:00 AM', subjectCode: 'BCSC 0022', roomNumber: '104', academicBlock: 'AB1' },
        { time: '11:00 AM - 12:00 PM', subjectCode: 'BCSC 0022', roomNumber: '104', academicBlock: 'AB1' },
        { time: '12:00 PM - 01:00 PM', subjectCode: '', roomNumber: '', academicBlock: '' },
        { time: '01:00 PM - 02:00 PM', subjectCode: '', roomNumber: '', academicBlock: '' },
        { time: '02:00 PM - 03:00 PM', subjectCode: 'BCSE 0105', roomNumber: '203', academicBlock: 'AB1' },
        { time: '03:00 PM - 04:00 PM', subjectCode: 'BCSE 0105', roomNumber: '203', academicBlock: 'AB1' },
        { time: '04:00 PM - 05:00 PM', subjectCode: 'BCSE 0255', roomNumber: '205', academicBlock: 'AB2' },
        { time: '05:00 PM - 06:00 PM', subjectCode: 'BCSE 0255', roomNumber: '205', academicBlock: 'AB2'}
      ]
    },
    {
      day: 'Tuesday',
      slots: [
        { time: '10:00 AM - 11:00 AM', subjectCode: 'BCSC 0022', roomNumber: '104', academicBlock: 'AB1' },
        { time: '11:00 AM - 12:00 PM', subjectCode: 'BCSC 0022', roomNumber: '104', academicBlock: 'AB1' },
        { time: '12:00 PM - 01:00 PM', subjectCode: '', roomNumber: '', academicBlock: '' },
        { time: '01:00 PM - 02:00 PM', subjectCode: '', roomNumber: '', academicBlock: '' },
        { time: '02:00 PM - 03:00 PM', subjectCode: 'BCSE 0105', roomNumber: '203', academicBlock: 'AB1' },
        { time: '03:00 PM - 04:00 PM', subjectCode: 'BCSE 0105', roomNumber: '203', academicBlock: 'AB1' },
        { time: '04:00 PM - 05:00 PM', subjectCode: 'BCSE 0255', roomNumber: '205', academicBlock: 'AB2' },
        { time: '05:00 PM - 06:00 PM', subjectCode: 'BCSE 0255', roomNumber: '205', academicBlock: 'AB2'}
      ]
    },
    {
      day: 'Wednesday',
      slots: [
        { time: '10:00 AM - 11:00 AM', subjectCode: 'BCSC 0022', roomNumber: '104', academicBlock: 'AB1' },
        { time: '11:00 AM - 12:00 PM', subjectCode: 'BCSC 0022', roomNumber: '104', academicBlock: 'AB1' },
        { time: '12:00 PM - 01:00 PM', subjectCode: '', roomNumber: '', academicBlock: '' },
        { time: '01:00 PM - 02:00 PM', subjectCode: '', roomNumber: '', academicBlock: '' },
        { time: '02:00 PM - 03:00 PM', subjectCode: 'BCSE 0105', roomNumber: '203', academicBlock: 'AB1' },
        { time: '03:00 PM - 04:00 PM', subjectCode: 'BCSE 0105', roomNumber: '203', academicBlock: 'AB1' },
        { time: '04:00 PM - 05:00 PM', subjectCode: 'BCSE 0255', roomNumber: '205', academicBlock: 'AB2' },
        { time: '05:00 PM - 06:00 PM', subjectCode: 'BCSE 0255', roomNumber: '205', academicBlock: 'AB2'}
      ]
    },
    {
      day: 'Thursday',
      slots: [
        { time: '10:00 AM - 11:00 AM', subjectCode: 'BCSC 0022', roomNumber: '104', academicBlock: 'AB1' },
        { time: '11:00 AM - 12:00 PM', subjectCode: 'BCSC 0022', roomNumber: '104', academicBlock: 'AB1' },
        { time: '12:00 PM - 01:00 PM', subjectCode: '', roomNumber: '', academicBlock: '' },
        { time: '01:00 PM - 02:00 PM', subjectCode: '', roomNumber: '', academicBlock: '' },
        { time: '02:00 PM - 03:00 PM', subjectCode: 'BCSE 0105', roomNumber: '203', academicBlock: 'AB1' },
        { time: '03:00 PM - 04:00 PM', subjectCode: 'BCSE 0105', roomNumber: '203', academicBlock: 'AB1' },
        { time: '04:00 PM - 05:00 PM', subjectCode: 'BCSE 0255', roomNumber: '205', academicBlock: 'AB2' },
        { time: '05:00 PM - 06:00 PM', subjectCode: 'BCSE 0255', roomNumber: '205', academicBlock: 'AB2'}
      ]
    },
    {
      day: 'Friday',
      slots: [
        { time: '10:00 AM - 11:00 AM', subjectCode: 'BCSC 0022', roomNumber: '104', academicBlock: 'AB1' },
        { time: '11:00 AM - 12:00 PM', subjectCode: 'BCSC 0022', roomNumber: '104', academicBlock: 'AB1' },
        { time: '12:00 PM - 01:00 PM', subjectCode: '', roomNumber: '', academicBlock: '' },
        { time: '01:00 PM - 02:00 PM', subjectCode: '', roomNumber: '', academicBlock: '' },
        { time: '02:00 PM - 03:00 PM', subjectCode: 'BCSE 0105', roomNumber: '203', academicBlock: 'AB1' },
        { time: '03:00 PM - 04:00 PM', subjectCode: 'BCSE 0105', roomNumber: '203', academicBlock: 'AB1' },
        { time: '04:00 PM - 05:00 PM', subjectCode: 'BCSE 0255', roomNumber: '205', academicBlock: 'AB2' },
        { time: '05:00 PM - 06:00 PM', subjectCode: 'BCSE 0255', roomNumber: '205', academicBlock: 'AB2'}
      ]
    }
  ]
};



const sectionC = {
  sectionName: 'C',
  timetable: [
    {
      day: 'Monday',
      slots: [
        { time: '10:00 AM - 11:00 AM', subjectCode: 'BCSE 0255', roomNumber: '202', academicBlock: 'AB1' },
        { time: '11:00 AM - 12:00 PM', subjectCode: 'BCSE 0255', roomNumber: '202', academicBlock: 'AB1' },
        { time: '12:00 PM - 01:00 PM', subjectCode: 'BCSC 0022', roomNumber: '205', academicBlock: 'AB2' },
        { time: '01:00 PM - 02:00 PM', subjectCode: '', roomNumber: '', academicBlock: '' },
        { time: '02:00 PM - 03:00 PM', subjectCode: 'BCSC 0022', roomNumber: '205', academicBlock: 'AB2' },
        { time: '03:00 PM - 04:00 PM', subjectCode: '', roomNumber: '', academicBlock: '' },
        { time: '04:00 PM - 05:00 PM', subjectCode: 'BCSE 0105', roomNumber: '103', academicBlock: 'AB2' },
        { time: '05:00 PM - 06:00 PM', subjectCode: 'BCSE 0105', roomNumber: '103', academicBlock: 'AB2' }
      ]
    },
    {
      day: 'Tuesday',
      slots: [
        { time: '10:00 AM - 11:00 AM', subjectCode: 'BCSE 0255', roomNumber: '202', academicBlock: 'AB1' },
        { time: '11:00 AM - 12:00 PM', subjectCode: 'BCSE 0255', roomNumber: '202', academicBlock: 'AB1' },
        { time: '12:00 PM - 01:00 PM', subjectCode: 'BCSC 0022', roomNumber: '205', academicBlock: 'AB2' },
        { time: '01:00 PM - 02:00 PM', subjectCode: '', roomNumber: '', academicBlock: '' },
        { time: '02:00 PM - 03:00 PM', subjectCode: 'BCSC 0022', roomNumber: '205', academicBlock: 'AB2' },
        { time: '03:00 PM - 04:00 PM', subjectCode: '', roomNumber: '', academicBlock: '' },
        { time: '04:00 PM - 05:00 PM', subjectCode: 'BCSE 0105', roomNumber: '103', academicBlock: 'AB2' },
        { time: '05:00 PM - 06:00 PM', subjectCode: 'BCSE 0105', roomNumber: '103', academicBlock: 'AB2' }
      ]
    },
    {
      day: 'Wednesday',
      slots: [
        { time: '10:00 AM - 11:00 AM', subjectCode: 'BCSE 0255', roomNumber: '202', academicBlock: 'AB1' },
        { time: '11:00 AM - 12:00 PM', subjectCode: 'BCSE 0255', roomNumber: '202', academicBlock: 'AB1' },
        { time: '12:00 PM - 01:00 PM', subjectCode: 'BCSC 0022', roomNumber: '205', academicBlock: 'AB2' },
        { time: '01:00 PM - 02:00 PM', subjectCode: '', roomNumber: '', academicBlock: '' },
        { time: '02:00 PM - 03:00 PM', subjectCode: 'BCSC 0022', roomNumber: '205', academicBlock: 'AB2' },
        { time: '03:00 PM - 04:00 PM', subjectCode: '', roomNumber: '', academicBlock: '' },
        { time: '04:00 PM - 05:00 PM', subjectCode: 'BCSE 0105', roomNumber: '103', academicBlock: 'AB2' },
        { time: '05:00 PM - 06:00 PM', subjectCode: 'BCSE 0105', roomNumber: '103', academicBlock: 'AB2' }
      ]
    },
    {
      day: 'Thursday',
      slots: [
        { time: '10:00 AM - 11:00 AM', subjectCode: 'BCSE 0255', roomNumber: '202', academicBlock: 'AB1' },
        { time: '11:00 AM - 12:00 PM', subjectCode: 'BCSE 0255', roomNumber: '202', academicBlock: 'AB1' },
        { time: '12:00 PM - 01:00 PM', subjectCode: 'BCSC 0022', roomNumber: '205', academicBlock: 'AB2' },
        { time: '01:00 PM - 02:00 PM', subjectCode: '', roomNumber: '', academicBlock: '' },
        { time: '02:00 PM - 03:00 PM', subjectCode: 'BCSC 0022', roomNumber: '205', academicBlock: 'AB2' },
        { time: '03:00 PM - 04:00 PM', subjectCode: '', roomNumber: '', academicBlock: '' },
        { time: '04:00 PM - 05:00 PM', subjectCode: 'BCSE 0105', roomNumber: '103', academicBlock: 'AB2' },
        { time: '05:00 PM - 06:00 PM', subjectCode: 'BCSE 0105', roomNumber: '103', academicBlock: 'AB2' }
      ]
    },
    {
      day: 'Friday',
      slots: [
        { time: '10:00 AM - 11:00 AM', subjectCode: 'BCSE 0255', roomNumber: '202', academicBlock: 'AB1' },
        { time: '11:00 AM - 12:00 PM', subjectCode: 'BCSE 0255', roomNumber: '202', academicBlock: 'AB1' },
        { time: '12:00 PM - 01:00 PM', subjectCode: 'BCSC 0022', roomNumber: '205', academicBlock: 'AB2' },
        { time: '01:00 PM - 02:00 PM', subjectCode: '', roomNumber: '', academicBlock: '' },
        { time: '02:00 PM - 03:00 PM', subjectCode: 'BCSC 0022', roomNumber: '205', academicBlock: 'AB2' },
        { time: '03:00 PM - 04:00 PM', subjectCode: '', roomNumber: '', academicBlock: '' },
        { time: '04:00 PM - 05:00 PM', subjectCode: 'BCSE 0105', roomNumber: '103', academicBlock: 'AB2' },
        { time: '05:00 PM - 06:00 PM', subjectCode: 'BCSE 0105', roomNumber: '103', academicBlock: 'AB2' }
      ]
    }
  ]
};

async function seed() {
  try {
    await Section.deleteMany(); // clear existing data (optional)
    await Section.insertMany([sectionA, sectionB, sectionC]);

    console.log('Timetables for all sections added successfully!');
  } catch (error) {
    console.error('Error inserting timetables:', error);
  } finally {
    mongoose.connection.close();
  }
}

module.exports = seed;

// seed();
