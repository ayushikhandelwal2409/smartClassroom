import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const FAQ = () => {
  const [openFAQ, setOpenFAQ] = useState(null);

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-extrabold tracking-tight">
          Frequently Asked Questions
        </h3>
      </div>

      <div className="space-y-3">
        {/* Login */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setOpenFAQ(openFAQ === "general" ? null : "general")}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition"
          >
            <span className="font-semibold text-gray-900">
              How do I log in to the portal?
            </span>
            {openFAQ === "general" ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
          {openFAQ === "general" && (
            <div className="p-4 text-sm text-gray-700">
              Use your Student ID (10 digits) or Teacher ID (6 digits) and your
              password provided by the administration.
            </div>
          )}
        </div>

        {/* Timetable */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() =>
              setOpenFAQ(openFAQ === "timetable" ? null : "timetable")
            }
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition"
          >
            <span className="font-semibold text-gray-900">
              Where can I see my timetable?
            </span>
            {openFAQ === "timetable" ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
          {openFAQ === "timetable" && (
            <div className="p-4 text-sm text-gray-700">
              Open the <b>Timetable</b> section from the left menu.
            </div>
          )}
        </div>

        {/* Attendance */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() =>
              setOpenFAQ(openFAQ === "attendance" ? null : "attendance")
            }
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition"
          >
            <span className="font-semibold text-gray-900">
              How is attendance calculated?
            </span>
            {openFAQ === "attendance" ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
          {openFAQ === "attendance" && (
            <div className="p-4 text-sm text-gray-700">
              Attendance is calculated as percentage of classes attended out of
              total classes conducted.
            </div>
          )}
        </div>

        {/* Rooms */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setOpenFAQ(openFAQ === "rooms" ? null : "rooms")}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 transition"
          >
            <span className="font-semibold text-gray-900">
              How do I check room availability?
            </span>
            {openFAQ === "rooms" ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
          {openFAQ === "rooms" && (
            <div className="p-4 text-sm text-gray-700">
              Use the <b>Room Occupancy</b> section to view live availability.
            </div>
          )}
        </div>

        {/* Technical */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() =>
              setOpenFAQ(openFAQ === "technical" ? null : "technical")
            }
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 transition"
          >
            <span className="font-semibold text-gray-900">
              The portal is not loading—what should I do?
            </span>
            {openFAQ === "technical" ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
          {openFAQ === "technical" && (
            <div className="p-4 text-sm text-gray-700">
              Refresh the page, clear cache, or try another browser. If the issue
              persists, report it to support.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
