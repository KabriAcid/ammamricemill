import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";

// Mock employee data for attendance sheet
const mockEmployees = [
  {
    id: 1,
    designation: "Accountant",
    empId: "250043",
    name: "MUSA ABUBAKAR SALISU",
  },
  { id: 2, designation: "Accountant", empId: "250050", name: "ABUBAKAR ADAM" },
  {
    id: 3,
    designation: "GENERAL MANAGER",
    empId: "250001",
    name: "MUSTAPHA ABDULLATEEF",
  },
  {
    id: 4,
    designation: "MILLING OPERATOR",
    empId: "250003",
    name: "SHEHU NASIDI LABARAN",
  },
  {
    id: 5,
    designation: "MILLING OPERATOR",
    empId: "250009",
    name: "ABUBAKAR HAKILU",
  },
];

export const AttendanceSheet: React.FC = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [rows, setRows] = useState(
    mockEmployees.map((emp) => ({
      ...emp,
      attendance: "Present",
      inTime: "",
      outTime: "",
      note: "",
    }))
  );

  const handleAttendanceChange = (idx: number, value: string) => {
    setRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, attendance: value } : row))
    );
  };
  const handleInputChange = (idx: number, field: string, value: string) => {
    setRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
    );
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full flex flex-col flex-1">
      {/* Breadcrumb and header */}
      <div className="flex items-center text-sm text-gray-500 mb-2">
        <span>Dashboard</span>
        <span className="mx-2">/</span>
        <span>Attendance</span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Attendance Sheet</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </div>
      </div>
      {/* Attendance Info */}
      <div className="bg-white border rounded-lg mb-6">
        <div className="bg-[#AF792F] rounded-t-lg px-6 py-3 text-white font-semibold text-lg tracking-wide">
          Attendance Information
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs text-gray-500 font-medium mb-1">
              Date:
            </label>
            <input
              type="date"
              className="border rounded px-2 py-1 w-full"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 font-medium mb-1">
              Description:
            </label>
            <textarea
              className="border rounded px-2 py-1 w-full min-h-[36px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
      </div>
      {/* Employee Info Table */}
      <div className="bg-white border rounded-lg">
        <div className="bg-[#AF792F] rounded-t-lg px-6 py-2 text-white font-semibold text-base tracking-wide border-b">
          Employee Information
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="border px-2 py-2">#SL</th>
                <th className="border px-2 py-2">Designation</th>
                <th className="border px-2 py-2">ID</th>
                <th className="border px-2 py-2">Name</th>
                <th className="border px-2 py-2">Attendance Type</th>
                <th className="border px-2 py-2">In Time</th>
                <th className="border px-2 py-2">Out Time</th>
                <th className="border px-2 py-2">Note</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.id}>
                  <td className="border px-2 py-2">{idx + 1}</td>
                  <td className="border px-2 py-2">{row.designation}</td>
                  <td className="border px-2 py-2">{row.empId}</td>
                  <td className="border px-2 py-2">{row.name}</td>
                  <td className="border px-2 py-2">
                    <label className="mr-2 flex items-center gap-1">
                      <input
                        type="radio"
                        name={`attend-${idx}`}
                        checked={row.attendance === "Present"}
                        onChange={() => handleAttendanceChange(idx, "Present")}
                        className="accent-[#AF792F]"
                      />
                      <span>Present</span>
                    </label>
                    <label className="mr-2 flex items-center gap-1">
                      <input
                        type="radio"
                        name={`attend-${idx}`}
                        checked={row.attendance === "Absent"}
                        onChange={() => handleAttendanceChange(idx, "Absent")}
                        className="accent-[#AF792F]"
                      />
                      <span>Absent</span>
                    </label>
                    <label className="flex items-center gap-1">
                      <input
                        type="radio"
                        name={`attend-${idx}`}
                        checked={row.attendance === "Leave"}
                        onChange={() => handleAttendanceChange(idx, "Leave")}
                        className="accent-[#AF792F]"
                      />
                      <span>Leave</span>
                    </label>
                  </td>
                  <td className="border px-2 py-2">
                    <input
                      type="time"
                      className="border rounded px-1 py-0.5 w-24"
                      value={row.inTime}
                      onChange={(e) =>
                        handleInputChange(idx, "inTime", e.target.value)
                      }
                    />
                  </td>
                  <td className="border px-2 py-2">
                    <input
                      type="time"
                      className="border rounded px-1 py-0.5 w-24"
                      value={row.outTime}
                      onChange={(e) =>
                        handleInputChange(idx, "outTime", e.target.value)
                      }
                    />
                  </td>
                  <td className="border px-2 py-2">
                    <input
                      type="text"
                      className="border rounded px-1 py-0.5 w-32"
                      value={row.note}
                      onChange={(e) =>
                        handleInputChange(idx, "note", e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex justify-end gap-4 py-6">
        <Button variant="primary" className="min-w-[100px]">
          Save
        </Button>
        <Button
          variant="outline"
          className="min-w-[100px] border-primary-500 text-primary-500 hover:bg-primary-50"
          onClick={() => navigate(-1)}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
