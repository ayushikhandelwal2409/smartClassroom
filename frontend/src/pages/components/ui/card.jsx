import React from "react";

export function Card({ className = "", children }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-2xl shadow ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ className = "", children }) {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
}
