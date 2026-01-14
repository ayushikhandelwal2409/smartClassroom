const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const auth = require('../middleware/auth');

/**
 * POST /api/attendance/mark-bulk
 * Mark attendance for multiple students
 */
router.post('/mark-bulk', auth, async (req, res) => {
  try {
    const { attendanceList } = req.body;

    if (!attendanceList || !Array.isArray(attendanceList) || attendanceList.length === 0) {
      return res.status(400).json({ msg: 'attendanceList is required and must be a non-empty array' });
    }

    // Validate each attendance record
    for (const record of attendanceList) {
      const { studentId, studentName, section, subjectCode, teacherId, teacherName, date, period, status, markedBy } = record;

      if (!studentId || !studentName || !section || !subjectCode || !teacherId || !teacherName || !date || !period) {
        return res.status(400).json({ 
          msg: 'Missing required fields. Required: studentId, studentName, section, subjectCode, teacherId, teacherName, date, period' 
        });
      }

      if (!['present', 'absent'].includes(status)) {
        return res.status(400).json({ msg: 'status must be "present" or "absent"' });
      }

      if (markedBy && !['manual', 'face-recognition'].includes(markedBy)) {
        return res.status(400).json({ msg: 'markedBy must be "manual" or "face-recognition"' });
      }
    }

    // Check for duplicates and insert new records
    const results = [];
    const errors = [];

    for (const record of attendanceList) {
      try {
        // Check if attendance already exists for this student, subject, date, and period
        const existing = await Attendance.findOne({
          studentId: record.studentId,
          subjectCode: record.subjectCode,
          date: record.date,
          period: record.period
        });

        if (existing) {
          // Update existing record
          existing.status = record.status;
          existing.markedBy = record.markedBy || 'manual';
          existing.timestamp = new Date();
          await existing.save();
          results.push({ studentId: record.studentId, action: 'updated' });
        } else {
          // Create new record
          const attendance = new Attendance({
            studentId: record.studentId,
            studentName: record.studentName,
            section: record.section,
            subjectCode: record.subjectCode,
            teacherId: record.teacherId,
            teacherName: record.teacherName,
            date: record.date,
            period: record.period,
            status: record.status || 'present',
            markedBy: record.markedBy || 'manual'
          });
          await attendance.save();
          results.push({ studentId: record.studentId, action: 'created' });
        }
      } catch (error) {
        console.error(`Error processing attendance for student ${record.studentId}:`, error);
        errors.push({ studentId: record.studentId, error: error.message });
      }
    }

    if (errors.length > 0 && results.length === 0) {
      return res.status(500).json({ 
        msg: 'Failed to mark attendance', 
        errors 
      });
    }

    res.json({
      msg: 'Attendance marked successfully',
      created: results.filter(r => r.action === 'created').length,
      updated: results.filter(r => r.action === 'updated').length,
      results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error marking bulk attendance:', error);
    res.status(500).json({ msg: 'Server Error', error: error.message });
  }
});

/**
 * POST /api/attendance/mark
 * Mark attendance for a single student
 */
router.post('/mark', auth, async (req, res) => {
  try {
    const { studentId, studentName, section, subjectCode, teacherId, teacherName, date, period, status, markedBy } = req.body;

    if (!studentId || !studentName || !section || !subjectCode || !teacherId || !teacherName || !date || !period) {
      return res.status(400).json({ 
        msg: 'Missing required fields. Required: studentId, studentName, section, subjectCode, teacherId, teacherName, date, period' 
      });
    }

    // Check if attendance already exists
    const existing = await Attendance.findOne({
      studentId,
      subjectCode,
      date,
      period
    });

    if (existing) {
      // Update existing
      existing.status = status || 'present';
      existing.markedBy = markedBy || 'manual';
      existing.timestamp = new Date();
      await existing.save();
      return res.json({ msg: 'Attendance updated', attendance: existing });
    }

    // Create new
    const attendance = new Attendance({
      studentId,
      studentName,
      section,
      subjectCode,
      teacherId,
      teacherName,
      date,
      period,
      status: status || 'present',
      markedBy: markedBy || 'manual'
    });

    await attendance.save();
    res.json({ msg: 'Attendance marked successfully', attendance });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ msg: 'Server Error', error: error.message });
  }
});

/**
 * GET /api/attendance/student/:studentId
 * Get attendance records for a student
 */
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { subjectCode } = req.query;

    const query = { studentId: Number(studentId) };
    if (subjectCode) {
      query.subjectCode = subjectCode;
    }

    const attendance = await Attendance.find(query).sort({ date: -1, period: 1 });

    if (subjectCode) {
      // Calculate statistics for the subject
      const totalClasses = attendance.length;
      const totalPresent = attendance.filter(a => a.status === 'present').length;
      const percentage = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;

      return res.json({
        attendance,
        totalClasses,
        totalPresent,
        totalAbsent: totalClasses - totalPresent,
        percentage
      });
    }

    res.json({ attendance });
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    res.status(500).json({ msg: 'Server Error', error: error.message });
  }
});

/**
 * GET /api/attendance/check
 * Check if attendance is already marked for a period
 */
router.get('/check', auth, async (req, res) => {
  try {
    const { section, subjectCode, date, period } = req.query;

    if (!section || !subjectCode || !date || !period) {
      return res.status(400).json({ 
        msg: 'Missing required query parameters: section, subjectCode, date, period' 
      });
    }

    const count = await Attendance.countDocuments({
      section,
      subjectCode,
      date,
      period: Number(period)
    });

    res.json({ marked: count > 0, count });
  } catch (error) {
    console.error('Error checking attendance:', error);
    res.status(500).json({ msg: 'Server Error', error: error.message });
  }
});

/**
 * GET /api/attendance/report/monthly
 * Get monthly attendance report for a student
 */
router.get('/report/monthly', auth, async (req, res) => {
  try {
    const { studentId, month, year } = req.query;

    if (!studentId || !month || !year) {
      return res.status(400).json({ 
        msg: 'Missing required query parameters: studentId, month, year' 
      });
    }

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    const attendance = await Attendance.find({
      studentId: Number(studentId),
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1, period: 1 });

    // Group by subject
    const subjectMap = {};
    attendance.forEach(record => {
      if (!subjectMap[record.subjectCode]) {
        subjectMap[record.subjectCode] = {
          subjectCode: record.subjectCode,
          records: [],
          totalPresent: 0,
          totalAbsent: 0
        };
      }
      subjectMap[record.subjectCode].records.push(record);
      if (record.status === 'present') {
        subjectMap[record.subjectCode].totalPresent++;
      } else {
        subjectMap[record.subjectCode].totalAbsent++;
      }
    });

    const summary = Object.values(subjectMap).map(subject => ({
      ...subject,
      totalClasses: subject.records.length,
      percentage: subject.records.length > 0 
        ? Math.round((subject.totalPresent / subject.records.length) * 100) 
        : 0
    }));

    res.json({
      studentId: Number(studentId),
      month: Number(month),
      year: Number(year),
      attendance,
      summary
    });
  } catch (error) {
    console.error('Error fetching monthly report:', error);
    res.status(500).json({ msg: 'Server Error', error: error.message });
  }
});

/**
 * GET /api/attendance/student/:studentId/overall
 * Get total present/absent count for a student across all subjects
 */
router.get('/student/:studentId/overall', auth, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Find all attendance records for the student
    const records = await Attendance.find({ studentId: Number(studentId) });

    // Calculate total present and absent
    const totalClasses = records.length;
    const totalPresent =( records.filter(r => r.status === 'present').length/totalClasses )*100;
    const totalAbsent =( 100- totalPresent);
    

    res.json({ totalPresent, totalAbsent });
  } catch (error) {
    console.error('Error fetching overall attendance:', error);
    res.status(500).json({ msg: 'Server Error', error: error.message });
  }
});


module.exports = router;

