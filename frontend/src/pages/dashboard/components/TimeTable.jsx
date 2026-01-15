import React, { useEffect, useMemo, useState } from "react";
import api from "../../../api/axios";

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

const Cell = ({ slot, isCurrentDay }) => {
  const hasData = slot && (slot.subjectCode || slot.roomNumber || slot.academicBlock);
  if (!hasData) return <td className={`border p-3 align-top text-sm text-gray-500 ${isCurrentDay ? 'bg-green-100' : ''}`} />;
  return (
    <td className={`border p-3 align-top ${isCurrentDay ? 'bg-green-100' : ''}`}>
      <div className="text-sm font-semibold text-gray-800">{slot.subjectCode}</div>
      <div className="text-xs text-gray-600">Room: {slot.roomNumber}</div>
      <div className="text-xs text-gray-600">Block: {slot.academicBlock}</div>
    </td>
  );
};

const TimeTable = ({ section }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timetable, setTimetable] = useState([]);

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
        const res = await api.get(`/timetable/${section}`, {
          signal: controller.signal,
        });
        setTimetable(res.data.timetable || []);
      } catch (e) {
        if (e.name !== "AbortError") {
          setError(e.response?.data?.msg || e.message || "Error fetching timetable");
        }
      } finally {
        setLoading(false);
      }
    }
    if (section) fetchData();
    return () => controller.abort();
  }, [section]);

  const { timeOrder, dayToTimeMap } = useMemo(() => buildMatrix(timetable), [timetable]);

  if (!section) {
    return (
      <div className="p-6 text-sm text-gray-600">No section found on your profile.</div>
    );
  }

  if (loading) {
    return <div className="p-6">Loading timetable...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <div className="mb-4">
        <h4 className="text-lg font-bold">Timetable - Section {section}</h4>
        <p className="text-xs text-gray-500">Shows Monday to Friday schedule.</p>
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
                  <Cell 
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

export default TimeTable;


