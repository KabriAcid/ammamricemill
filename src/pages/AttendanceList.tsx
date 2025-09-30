import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Spinner } from "../ui/Spinner";
import { Eye, Edit, Plus, Trash2, Printer } from "lucide-react";

// Mock data for attendance list
const mockAttendanceList = [
  {
    id: 1,
    date: "2025-09-30",
    totalEmployee: 5,
    totalPresent: 4,
    totalAbsent: 1,
    totalLeave: 0,
    description: "",
  },
  // ...more rows
];

export const AttendanceList: React.FC = () => {
  const navigate = useNavigate();
  const [loading] = useState(false);
  const [attendanceList] = useState(mockAttendanceList);
  const [date, setDate] = useState("");
  const [pageSize, setPageSize] = useState(50);

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full flex flex-col flex-1">
      {/* Breadcrumb and header */}
      <div className="flex items-center text-sm text-gray-500 mb-2">
        <span>Dashboard</span>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-semibold">Attendance</span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <h1 className="text-2xl font-bold text-gray-900">
          Daily Attendance Sheet
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </div>
      </div>
      {/* Filter bar */}
      <div className="bg-gray-50 border rounded-lg p-4 mb-4 flex flex-col md:flex-row md:items-center gap-2">
        <select
          className="border rounded px-2 py-1 text-sm w-20"
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
        >
          {[10, 25, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="border rounded px-2 py-1 text-sm w-48"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Button className="h-8 px-4 text-sm">Search</Button>
        <Button className="h-8 px-4 text-sm" variant="outline">
          Clear
        </Button>
        <div className="flex-1" />
        <Button
          className="h-8 px-4 text-sm"
          variant="primary"
          onClick={() => navigate("/hr/attendance/new")}
          icon={<Plus size={16} />}
        >
          New
        </Button>
        <Button
          className="h-8 px-4 text-sm"
          variant="danger"
          icon={<Trash2 size={16} />}
        >
          Delete
        </Button>
        <Button
          className="h-8 px-4 text-sm"
          variant="outline"
          icon={<Printer size={16} />}
        >
          Print
        </Button>
      </div>
      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-[#AF792F]">
            <tr>
              <th className="border px-2 py-2 text-white">SL#</th>
              <th className="border px-2 py-2 text-white">Date</th>
              <th className="border px-2 py-2 text-white">Total Employee</th>
              <th className="border px-2 py-2 text-white">Total Present</th>
              <th className="border px-2 py-2 text-white">Total Absent</th>
              <th className="border px-2 py-2 text-white">Total Leave</th>
              <th className="border px-2 py-2 text-white">Description</th>
              <th className="border px-2 py-2 text-white">Actions</th>
              <th className="border px-2 py-2 text-white">
                <input type="checkbox" />
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9}>
                  <div className="flex justify-center py-8">
                    <Spinner size={24} />
                  </div>
                </td>
              </tr>
            ) : attendanceList.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="text-center text-gray-400 py-8">
                    No attendance records found.
                  </div>
                </td>
              </tr>
            ) : (
              attendanceList.map((row, idx) => (
                <tr key={row.id}>
                  <td className="border px-2 py-2">{idx + 1}</td>
                  <td className="border px-2 py-2">{row.date}</td>
                  <td className="border px-2 py-2">{row.totalEmployee}</td>
                  <td className="border px-2 py-2">{row.totalPresent}</td>
                  <td className="border px-2 py-2">{row.totalAbsent}</td>
                  <td className="border px-2 py-2">{row.totalLeave}</td>
                  <td className="border px-2 py-2">{row.description}</td>
                  <td className="border px-2 py-2">
                    <Button
                      className="h-7 px-3 text-xs mr-1"
                      variant="secondary"
                      onClick={() => navigate(`/hr/attendance/view/${row.id}`)}
                      icon={<Eye size={16} />}
                      title="View"
                    >
                      <span className="sr-only">View</span>
                    </Button>
                    <Button
                      className="h-7 px-3 text-xs"
                      variant="secondary"
                      onClick={() => navigate(`/hr/attendance/edit/${row.id}`)}
                      icon={<Edit size={16} />}
                      title="Edit"
                    >
                      <span className="sr-only">Edit</span>
                    </Button>
                  </td>
                  <td className="border px-2 py-2">
                    <input type="checkbox" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
