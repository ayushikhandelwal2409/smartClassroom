import React, { useState } from "react";

const UploadTimetable = () => {
    const [file, setFile] = useState(null);

    const upload = async () => {
        const formData = new FormData();
        formData.append("file", file);

        await fetch(
            "http://localhost:5000/api/admin/timetable/excel",
            {
                method: "POST",
                headers: {
                    "x-auth-token": localStorage.getItem("token"),
                },
                body: formData,
            }
        );

        alert("Timetable uploaded successfully");
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
