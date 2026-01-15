import React, { useState } from "react";
import api from "../../../../api/axios";

const EditSlotModal = ({ slot, onClose, onSaved }) => {
    const [subjectCode, setSubjectCode] = useState(slot.subjectCode || "");
    const [roomNumber, setRoomNumber] = useState(slot.roomNumber || "");
    const [academicBlock, setAcademicBlock] = useState(
        slot.academicBlock || ""
    );

    const save = async () => {
        try {
            await api.patch(`/admin/timetable/${slot.section}`, {
                day: slot.day,
                time: slot.time,
                subjectCode,
                roomNumber,
                academicBlock,
            });
            onSaved();
            onClose();
        } catch (error) {
            alert(error.response?.data?.msg || "Failed to save slot");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl w-96">
                <h3 className="font-bold mb-4">
                    Edit Slot – {slot.day}
                </h3>

                <input
                    className="border p-2 w-full mb-2"
                    placeholder="Subject Code"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                />

                <input
                    className="border p-2 w-full mb-2"
                    placeholder="Room Number"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                />

                <input
                    className="border p-2 w-full mb-4"
                    placeholder="Academic Block"
                    value={academicBlock}
                    onChange={(e) => setAcademicBlock(e.target.value)}
                />

                <div className="flex justify-end gap-2">
                    <button onClick={onClose}>Cancel</button>
                    <button
                        onClick={save}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditSlotModal;
