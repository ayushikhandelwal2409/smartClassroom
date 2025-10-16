import React, { useEffect, useMemo, useState } from "react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function buildMatrix(timetable) {
  // Collect all unique time slots across days in order of first appearance
  const timeOrder = [];
  const seen = new Set();
  for (const day of timetable || []) {
    for (const slot of day.slots || []) {
      if (!seen.has(slot.time)) {
        seen.add(slot.time);
        timeOrder.push(slot.time);
      }
    }
  }

  // Map day->time->slot for quick lookup
  const dayToTimeMap = {};
  for (const day of timetable || []) {
    const map = {};
    for (const slot of day.slots || []) {
      map[slot.time] = slot;
    }
    dayToTimeMap[day.day] = map;
  }

  return { timeOrder, dayToTimeMap };
}

const TeacherCell = ({ slot, isCurrentDay }) => {
  const hasData = slot && (slot.subjectCode || slot.roomNumber || slot.academicBlock);
  if (!hasData) return <td className={`border p-3 align-top text-sm text-gray-500 ${isCurrentDay ? 'bg-green-100' : ''}`} />;
  return (
    <td className={`border p-3 align-top ${isCurrentDay ? 'bg-green-100' : ''}`}>
      <div className="text-sm font-semibold text-gray-800">{slot.subjectCode}</div>
      <div className="text-xs text-gray-600">Room: {slot.roomNumber}</div>
      <div className="text-xs text-gray-600">Block: {slot.academicBlock}</div>
      <div className="text-xs text-blue-600 font-medium">Section: {slot.sectionName}</div>
    </td>
  );
};

const TeacherTimeTable = ({ teacherId, sectionsToTeach, subjectTaught }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [teacherTimetable, setTeacherTimetable] = useState([]);

  // Get current day
  const getCurrentDay = () => {
    const today = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayNames[today.getDay()];
  };

  const currentDay = getCurrentDay();

  useEffect(() => {
    const controller = new AbortController();
    async function fetchData() {
      try {
        setLoading(true);
        setError("");
        
        // Fetch all sections that the teacher teaches
        const sectionPromises = sectionsToTeach.map(sectionName => 
          fetch(`http://localhost:5000/api/timetable/${sectionName}`, {
            signal: controller.signal,
          })
        );
        
        const responses = await Promise.all(sectionPromises);
        const sectionData = await Promise.all(
          responses.map(res => {
            if (!res.ok) {
              throw new Error(`Failed to load timetable for section`);
            }
            return res.json();
          })
        );

        // Process the data to create teacher's timetable
        const processedTimetable = processTeacherTimetable(sectionData, sectionsToTeach, subjectTaught);
        setTeacherTimetable(processedTimetable);
      } catch (e) {
        if (e.name !== "AbortError") setError(e.message || "Error fetching timetable");
      } finally {
        setLoading(false);
      }
    }
    
    if (sectionsToTeach && sectionsToTeach.length > 0 && subjectTaught && subjectTaught.length > 0) {
      fetchData();
    }
    
    return () => controller.abort();
  }, [sectionsToTeach, subjectTaught]);

  const processTeacherTimetable = (sectionData, sectionsToTeach, subjectTaught) => {
    const teacherSchedule = [];
    
    // Create a map of all time slots across all days
    const allTimeSlots = new Set();
    sectionData.forEach(section => {
      section.timetable?.forEach(day => {
        day.slots?.forEach(slot => {
          allTimeSlots.add(slot.time);
        });
      });
    });

    // For each day, create a combined schedule
    DAYS.forEach(dayName => {
      const daySchedule = { day: dayName, slots: [] };
      
      // For each time slot, check if teacher has a class
      allTimeSlots.forEach(timeSlot => {
        let teacherSlot = null;
        
        // Check each section the teacher teaches
        sectionData.forEach((section, sectionIndex) => {
          const dayData = section.timetable?.find(d => d.day === dayName);
          if (dayData) {
            const slot = dayData.slots?.find(s => s.time === timeSlot);
            if (slot && slot.subjectCode && subjectTaught.includes(slot.subjectCode)) {
              // Teacher has a class at this time
              teacherSlot = {
                time: timeSlot,
                subjectCode: slot.subjectCode,
                roomNumber: slot.roomNumber,
                academicBlock: slot.academicBlock,
                sectionName: sectionsToTeach[sectionIndex]
              };
            }
          }
        });
        
        daySchedule.slots.push(teacherSlot || { time: timeSlot, subjectCode: '', roomNumber: '', academicBlock: '', sectionName: '' });
      });
      
      teacherSchedule.push(daySchedule);
    });

    return teacherSchedule;
  };

  const { timeOrder, dayToTimeMap } = useMemo(() => buildMatrix(teacherTimetable), [teacherTimetable]);

  if (!sectionsToTeach || sectionsToTeach.length === 0) {
    return (
      <div className="p-6 text-sm text-gray-600">No sections assigned to this teacher.</div>
    );
  }

  if (!subjectTaught || subjectTaught.length === 0) {
    return (
      <div className="p-6 text-sm text-gray-600">No subjects assigned to this teacher.</div>
    );
  }

  if (loading) {
    return <div className="p-6">Loading teacher timetable...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <div className="mb-4">
        <h4 className="text-lg font-bold">Teacher Timetable</h4>
        <p className="text-xs text-gray-500">Shows Monday to Friday schedule for assigned subjects.</p>
        <p className="text-xs text-gray-500">Subjects: {subjectTaught.join(', ')}</p>
        <p className="text-xs text-gray-500">Sections: {sectionsToTeach.join(', ')}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed border-collapse">
          <thead>
            <tr>
              <th className="border p-3 w-48 text-left bg-gray-50">Time</th>
              {DAYS.map((d) => (
                <th 
                  key={d} 
                  className={`border p-3 text-left ${
                    d === currentDay 
                      ? 'bg-green-600 text-white font-bold' 
                      : 'bg-gray-50'
                  }`}
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeOrder.map((time) => (
              <tr key={time}>
                <td className="border p-3 font-medium text-sm bg-gray-50">{time}</td>
                {DAYS.map((day) => (
                  <TeacherCell 
                    key={day} 
                    slot={(dayToTimeMap[day] || {})[time]} 
                    isCurrentDay={day === currentDay}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherTimeTable;
