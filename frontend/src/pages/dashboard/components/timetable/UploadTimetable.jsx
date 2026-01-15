import React, { useState } from "react";
import api from "../../../../api/axios";

const UploadTimetable = () => {
    const [file, setFile] = useState(null);

    const upload = async () => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            await api.post("/api/admin/timetable/excel", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            alert("Timetable uploaded successfully");
        } catch (error) {
            alert(error.response?.data?.msg || "Failed to upload timetable");
        }
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow">
            <h4 className="font-bold mb-2">
                Upload Timetable (Excel)
            </h4>

            <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="mb-2"
            />

            <button
                onClick={upload}
                className="bg-green-600 text-white px-4 py-2 rounded"
            >
                Upload
            </button>
        </div>
    );
};

export default UploadTimetable;
