import React, { useState, useEffect } from "react";
import { Clock, Calendar } from "lucide-react";
import { Breadcrumb } from "../components/Breadcrumb";
import { DataTable } from "../components/DataTable";
import { FormModal } from "../components/FormModal";
import { mockAttendance, mockEmployees } from '../mock.ts';

interface AttendanceRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: "present" | "absent" | "late" | "half-day";
  workingHours: string;
}

export const Attendance: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState(mockEmployees);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [formData, setFormData] = useState({
    employeeId: 0,
    date: "",
    checkIn: "",
    checkOut: "",
    status: "present" as "present" | "absent" | "late" | "half-day",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const fetchAttendance = async () => {
    try {
      const response = await fetch(`/api/attendance?date=${selectedDate}`);
      const data = await response.json();
      setAttendance(data);
    } catch (error) {
      // Filter mock data by selected date
      const filteredAttendance = mockAttendance.filter(
        (record) => record.date === selectedDate
      );
      setAttendance(filteredAttendance);
    }
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setFormData({
      employeeId: 0,
      date: selectedDate,
      checkIn: "",
      checkOut: "",
      status: "present",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setFormData({
      employeeId: record.employeeId,
      date: record.date,
      checkIn: record.checkIn,
      checkOut: record.checkOut,
      status: record.status,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingRecord
        ? `/api/attendance/${editingRecord.id}`
        : "/api/attendance";
      const method = editingRecord ? "PUT" : "POST";

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      await fetchAttendance();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save attendance");
    }
    setLoading(false);
  };

  const calculateWorkingHours = (checkIn: string, checkOut: string): string => {
    if (!checkIn || !checkOut) return "0";

    const inTime = new Date(`2000-01-01 ${checkIn}`);
    const outTime = new Date(`2000-01-01 ${checkOut}`);
    const diffMs = outTime.getTime() - inTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    return diffHours.toFixed(1);
  };

  const columns = [
    { key: "employeeName", label: "Employee Name", sortable: true },
    { key: "date", label: "Date", sortable: true },
    { key: "checkIn", label: "Check In", sortable: true },
    { key: "checkOut", label: "Check Out", sortable: true },
    { key: "workingHours", label: "Working Hours", sortable: true },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === "present"
              ? "bg-green-100 text-green-800"
              : value === "late"
              ? "bg-yellow-100 text-yellow-800"
              : value === "half-day"
              ? "bg-blue-100 text-blue-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {value.charAt(0).toUpperCase() + value.slice(1).replace("-", " ")}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Breadcrumb
        items={[{ label: "Human Resource" }, { label: "Daily Attendance" }]}
      />

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-6 h-6 text-[#AF792F]" />
          <h1 className="text-2xl font-bold text-gray-900">Daily Attendance</h1>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-gray-600">Track daily employee attendance</p>
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <DataTable
        data={attendance}
        columns={columns}
        title={`Attendance for ${selectedDate}`}
        onAdd={handleAdd}
        onEdit={handleEdit}
        searchPlaceholder="Search attendance..."
        addButtonLabel="Mark Attendance"
      />

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRecord ? "Edit Attendance" : "Mark Attendance"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employee
            </label>
            <select
              value={formData.employeeId}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  employeeId: parseInt(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
              required
            >
              <option value={0}>Select Employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, date: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check In Time
              </label>
              <input
                type="time"
                value={formData.checkIn}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, checkIn: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check Out Time
              </label>
              <input
                type="time"
                value={formData.checkOut}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, checkOut: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  status: e.target.value as any,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
              required
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half-day">Half Day</option>
            </select>
          </div>

          {formData.checkIn && formData.checkOut && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                Working Hours:{" "}
                <strong>
                  {calculateWorkingHours(formData.checkIn, formData.checkOut)}{" "}
                  hours
                </strong>
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#AF792F] hover:bg-[#9A6B28] text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : editingRecord
                ? "Update Attendance"
                : "Mark Attendance"}
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};
