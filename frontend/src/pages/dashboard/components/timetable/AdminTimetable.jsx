import React, { use, useEffect, useMemo, useState } from "react";
import EditSlotModal from "./EditSlotModal";
import { useNavigate } from "react-router-dom";
import UploadTimetable from "./UploadTimetable";
import api from "../../../../api/axios";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function buildMatrix(timetable) {
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

const AdminCell = ({ slot, day, time, section, onEdit }) => {
    const hasData =
        slot && (slot.subjectCode || slot.roomNumber || slot.academicBlock);

    return (
        <td
            onClick={() =>
                onEdit({
                    ...slot,
                    day,
                    time,
                    section,
                })
            }
            className={`border p-3 align-top cursor-pointer hover:bg-blue-50`}
        >
            {hasData ? (
                <>
                    <div className="text-sm font-semibold text-gray-800">
                        {slot.subjectCode}
                    </div>
                    <div className="text-xs text-gray-600">
                        Room: {slot.roomNumber}
                    </div>
                    <div className="text-xs text-gray-600">
                        Block: {slot.academicBlock}
                    </div>
                </>
            ) : (
                <span className="text-sm text-gray-400"> </span>
            )}
        </td>
    );
};

const AdminTimetable = () => {
    const [section, setSection] = useState("A");
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editSlot, setEditSlot] = useState(null);


    useEffect(() => {
        fetchTimetable();
    }, [section]);

    const fetchTimetable = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/timetable/${section}`);
            setTimetable(res.data.timetable || []);
        } catch (error) {
            setError(error.response?.data?.msg || "Failed to load timetable");
        } finally {
            setLoading(false);
        }
    };


    const { timeOrder, dayToTimeMap } = useMemo(
        () => buildMatrix(timetable),
        [timetable]
    );

    if (loading) return <div className="p-6">Loading timetable...</div>;
    if (error) return <div className="p-6 text-red-600">{error}</div>;


return (
    <div className="space-y-6">
        <div className="bg-white p-4 rounded-xl shadow">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h4 className="text-lg font-bold">
                        Timetable – Section {section}
                    </h4>
                    <p className="text-xs text-gray-500">
                        Click any cell to edit
                    </p>
                </div>

                <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="border px-3 py-1 rounded"
                >
                    <option>A</option>
                    <option>B</option>
                    <option>C</option>
                </select>
            </div>

            {/* table */}
            <div className="overflow-x-auto">
                <table className="min-w-full table-fixed border-collapse">
                    <thead>
                        <tr>
                            <th className="border p-3 w-48 text-left bg-gray-50">
                                Time
                            </th>
                            {DAYS.map((d) => (
                                <th
                                    key={d}
                                    className="border p-3 text-left bg-gray-50"
                                >
                                    {d}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {timeOrder.map((time) => (
                            <tr key={time}>
                                <td className="border p-3 font-medium text-sm bg-gray-50">
                                    {time}
                                </td>

                                {DAYS.map((day) => (
                                    <AdminCell
                                        key={day}
                                        day={day}
                                        time={time}
                                        section={section}
                                        slot={(dayToTimeMap[day] || {})[time]}
                                        onEdit={setEditSlot}
                                    />
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        <UploadTimetable />

        {editSlot && (
            <EditSlotModal
                slot={editSlot}
                onClose={() => setEditSlot(null)}
                onSaved={fetchTimetable}
            />
        )}
    </div>
);
};

export default AdminTimetable;
