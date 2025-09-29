import React, { useState, useEffect } from "react";
import { Calendar, Download } from "lucide-react";
import { Breadcrumb } from "../components/Breadcrumb";
import { mockEmployees } from "../mock.ts";

interface MonthlyAttendanceRecord {
  employeeId: number;
  employeeName: string;
  designation: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  halfDays: number;
  workingHours: number;
  attendancePercentage: number;
}

export const MonthlyAttendance: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<
    MonthlyAttendanceRecord[]
  >([]);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMonthlyAttendance();
  }, [selectedMonth]);

  const fetchMonthlyAttendance = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/attendance/monthly?month=${selectedMonth}`
      );
      const data = await response.json();
      setAttendanceData(data);
    } catch (error) {
      // Generate mock monthly data
      const monthlyData: MonthlyAttendanceRecord[] = mockEmployees.map(
        (employee) => {
          const totalDays = 30;
          const presentDays = Math.floor(Math.random() * 5) + 25;
          const absentDays = Math.floor(Math.random() * 3);
          const lateDays = Math.floor(Math.random() * 4);
          const halfDays = Math.floor(Math.random() * 2);
          const workingHours = presentDays * 8 + halfDays * 4;
          const attendancePercentage =
            ((presentDays + halfDays * 0.5) / totalDays) * 100;

          return {
            employeeId: employee.id,
            employeeName: employee.name,
            designation: employee.designation,
            totalDays,
            presentDays,
            absentDays,
            lateDays,
            halfDays,
            workingHours,
            attendancePercentage,
          };
        }
      );
      setAttendanceData(monthlyData);
    }
    setLoading(false);
  };

  const handleExport = () => {
    // Create CSV content
    const headers = [
      "Employee Name",
      "Designation",
      "Total Days",
      "Present Days",
      "Absent Days",
      "Late Days",
      "Half Days",
      "Working Hours",
      "Attendance %",
    ];

    const csvContent = [
      headers.join(","),
      ...attendanceData.map((record) =>
        [
          record.employeeName,
          record.designation,
          record.totalDays,
          record.presentDays,
          record.absentDays,
          record.lateDays,
          record.halfDays,
          record.workingHours,
          record.attendancePercentage.toFixed(1),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `monthly-attendance-${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <Breadcrumb
        items={[{ label: "Human Resource" }, { label: "Monthly Attendance" }]}
      />

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-6 h-6 text-[#AF792F]" />
          <h1 className="text-2xl font-bold text-gray-900">
            Monthly Attendance
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-gray-600">View monthly attendance summary</p>
          <div className="flex items-center gap-3">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
            />
            <button
              onClick={handleExport}
              className="bg-[#AF792F] hover:bg-[#9A6B28] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Days
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Present
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Absent
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Late
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Half Days
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Working Hours
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendance %
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceData.map((record) => (
                  <tr key={record.employeeId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.employeeName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.designation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {record.totalDays}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {record.presentDays}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {record.absentDays}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {record.lateDays}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {record.halfDays}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {record.workingHours}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center">
                        <div className="flex flex-col items-center">
                          <span
                            className={`text-sm font-medium ${
                              record.attendancePercentage >= 90
                                ? "text-green-600"
                                : record.attendancePercentage >= 75
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {record.attendancePercentage.toFixed(1)}%
                          </span>
                          <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
                            <div
                              className={`h-1.5 rounded-full ${
                                record.attendancePercentage >= 90
                                  ? "bg-green-600"
                                  : record.attendancePercentage >= 75
                                  ? "bg-yellow-600"
                                  : "bg-red-600"
                              }`}
                              style={{
                                width: `${Math.min(
                                  record.attendancePercentage,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Employees</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {attendanceData.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">
            Average Attendance
          </h3>
          <p className="text-2xl font-bold text-green-600 mt-2">
            {attendanceData.length > 0
              ? (
                  attendanceData.reduce(
                    (acc, curr) => acc + curr.attendancePercentage,
                    0
                  ) / attendanceData.length
                ).toFixed(1)
              : 0}
            %
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">
            Total Working Hours
          </h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            {attendanceData
              .reduce((acc, curr) => acc + curr.workingHours, 0)
              .toLocaleString()}
            h
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">
            Perfect Attendance
          </h3>
          <p className="text-2xl font-bold text-[#AF792F] mt-2">
            {
              attendanceData.filter(
                (record) => record.attendancePercentage === 100
              ).length
            }
          </p>
        </div>
      </div>
    </div>
  );
};
