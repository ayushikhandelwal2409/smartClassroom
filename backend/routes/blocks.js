const express = require('express');
const router = express.Router();
const Section = require('../models/Section');
const Student = require('../models/Student');
const Block = require('../models/Block');

// Helper function to get current day name
const getCurrentDay = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
};

// Helper function to parse time string (e.g., "10:00 AM - 11:00 AM")
const parseTimeRange = (timeString) => {
  if (!timeString || !timeString.includes('-')) return null;
  
  const parts = timeString.split('-');
  if (parts.length !== 2) return null;
  
  const startStr = parts[0].trim();
  const endStr = parts[1].trim();
  
  const parseTime = (timeStr) => {
    // Remove any extra spaces and split by space to get time and period
    const trimmed = timeStr.trim();
    const periodMatch = trimmed.match(/\s*(AM|PM)\s*/i);
    if (!periodMatch) return null;
    
    const period = periodMatch[1].toUpperCase();
    const timePart = trimmed.replace(/\s*(AM|PM)\s*/i, '').trim();
    const [hoursStr, minutesStr] = timePart.split(':');
    
    if (!hoursStr || !minutesStr) return null;
    
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    
    if (isNaN(hours) || isNaN(minutes)) return null;
    
    let hour24 = hours;
    if (period === 'PM' && hours !== 12) {
      hour24 = hours + 12;
    } else if (period === 'AM' && hours === 12) {
      hour24 = 0;
    }
    
    return hour24 * 60 + minutes; // Convert to minutes from midnight
  };

  try {
    const start = parseTime(startStr);
    const end = parseTime(endStr);
    
    if (start === null || end === null) return null;
    
    return { start, end };
  } catch (error) {
    console.error('Error parsing time:', error);
    return null;
  }
};

// Helper function to check if current time is within a time slot
const isCurrentTimeInSlot = (timeString) => {
  const timeRange = parseTimeRange(timeString);
  if (!timeRange) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  return currentMinutes >= timeRange.start && currentMinutes < timeRange.end;
};

// GET /api/blocks/occupancy - Get real-time room occupancy
router.get('/occupancy', async (req, res) => {
  try {
    const currentDay = getCurrentDay();
    const sections = await Section.find({});
    const students = await Student.find({});
    
    // Count students per section
    const studentCountBySection = {};
    students.forEach(student => {
      const section = student.section;
      studentCountBySection[section] = (studentCountBySection[section] || 0) + 1;
    });

    const occupancyData = [];
    const occupiedRoomKeys = new Set();

    // Process each section
    for (const section of sections) {
      const sectionName = section.sectionName;
      const dayEntry = section.timetable.find(d => d.day === currentDay);
      
      if (!dayEntry) {
        // No classes today for this section
        continue;
      }

      // Find current active slot
      let currentSlot = null;
      for (const slot of dayEntry.slots) {
        if (slot.subjectCode && slot.subjectCode.trim() !== '' && isCurrentTimeInSlot(slot.time)) {
          currentSlot = slot;
          break;
        }
      }

      const studentCount = studentCountBySection[sectionName] || 0;
      const capacity = section.capacity || 50; // Use section capacity or default
      const occupancyPercentage = capacity > 0 ? Math.round((studentCount / capacity) * 100) : 0;

      if (currentSlot && currentSlot.roomNumber && currentSlot.roomNumber.trim() !== '') {
        // Section has an active class - room is occupied
        const roomNumber = currentSlot.roomNumber.trim();
        const blockName = currentSlot.academicBlock.trim();
        const roomKey = `${blockName}-${roomNumber}`;
        occupiedRoomKeys.add(roomKey);

        occupancyData.push({
          blockName: blockName,
          roomName: roomNumber,
          sectionName: sectionName,
          currentClass: currentSlot.subjectCode || '—',
          occupancyPercentage: Math.min(occupancyPercentage, 100), // Cap at 100%
          status: 'Occupied',
          studentCount: studentCount,
          capacity: capacity,
          timeSlot: currentSlot.time
        });
      } else {
        // Section has no current class - can show as available or skip
        // For now, we'll skip sections with no current class to avoid clutter
        // You can uncomment below to show all sections as "Available" when not in class
        /*
        occupancyData.push({
          blockName: '—',
          roomName: '—',
          sectionName: sectionName,
          currentClass: '—',
          occupancyPercentage: 0,
          status: 'Available',
          studentCount: studentCount,
          capacity: capacity,
          timeSlot: '—'
        });
        */
      }
    }

    // Also include available rooms (rooms not currently occupied)
    // Get all blocks and check which ones are not in occupancyData
    const blocks = await Block.find({});
    
    blocks.forEach(block => {
      const roomKey = `${block.name}-${block.room}`;
      if (!occupiedRoomKeys.has(roomKey)) {
        occupancyData.push({
          blockName: block.name,
          roomName: block.room.toString(),
          sectionName: '—',
          currentClass: '—',
          occupancyPercentage: 0,
          status: 'Available',
          studentCount: 0,
          capacity: 50, // Default capacity
          timeSlot: '—'
        });
      }
    });

    // Sort by block name and room number
    occupancyData.sort((a, b) => {
      if (a.blockName !== b.blockName) {
        return a.blockName.localeCompare(b.blockName);
      }
      return parseInt(a.roomName) - parseInt(b.roomName);
    });

    res.json({ occupancy: occupancyData });
  } catch (error) {
    console.error('Error fetching occupancy:', error);
    res.status(500).json({ msg: 'Server Error', error: error.message });
  }
});

module.exports = router;

