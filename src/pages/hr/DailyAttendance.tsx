import React, { useState, useEffect } from "react";
import { Calendar, BarChart3, CheckCircle, XCircle } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/ui/Toast";
import { api } from "../../utils/fetcher";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface Employee {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  designation: string;
  designation_id: number;
  salary: number;
  joining_date: string;
  status: string;
  empId: string;
}

interface AttendanceRecord {
  employeeId: string;
  status: "present" | "absent" | "leave";
  inTime?: string;
  outTime?: string;
  notes?: string;
}

interface Attendance {
  date: string;
  employees: AttendanceRecord[];
}

interface EmployeeAttendance {
  id: string;
  designation: string;
  empId: string;
  name: string;
  attendance: "Present" | "Absent" | "Leave";
  inTime: string;
  outTime: string;
  note: string;
}

const DailyAttendance: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [employees, setEmployees] = useState<EmployeeAttendance[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    fetchEmployees();
  }, [dateFilter]);

  const fetchEmployees = async () => {
    setInitialLoading(true);
    try {
      // First get employees list
      const response = await api.get<ApiResponse<Employee[]>>("/hr/employee");

      if (response.success && response.data) {
        // Then get today's attendance if exists
        const today = dateFilter;
        const attendanceResponse = await api.get<
          ApiResponse<{ attendances: Attendance[] }>
        >(`/hr/attendance?date=${today}`);

        const todayAttendance =
          attendanceResponse.success &&
          attendanceResponse.data?.attendances?.find(
            (a: Attendance) => a.date === today
          );

        // Map employees with their attendance status
        setEmployees(
          response.data.map((emp: Employee) => {
            const attendanceRecord =
              todayAttendance &&
              todayAttendance.employees.find(
                (a: AttendanceRecord) => a.employeeId === emp.empId
              );

            return {
              id: emp.id,
              empId: emp.empId,
              name: emp.name,
              designation: emp.designation,
              attendance: (attendanceRecord &&
              attendanceRecord.status === "present"
                ? "Present"
                : attendanceRecord && attendanceRecord.status === "absent"
                ? "Absent"
                : attendanceRecord && attendanceRecord.status === "leave"
                ? "Leave"
                : "Present") as "Present" | "Absent" | "Leave",
              inTime: attendanceRecord ? attendanceRecord.inTime || "" : "",
              outTime: attendanceRecord ? attendanceRecord.outTime || "" : "",
              note: attendanceRecord ? attendanceRecord.notes || "" : "",
            };
          })
        );
      } else {
        showToast("Failed to load employees data", "error");
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      showToast("Failed to load employees", "error");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleAttendanceChange = (
    idx: number,
    value: "Present" | "Absent" | "Leave"
  ) => {
    setEmployees((prev) =>
      prev.map((emp, i) => (i === idx ? { ...emp, attendance: value } : emp))
    );
  };

  const handleInputChange = (
    idx: number,
    field: "inTime" | "outTime" | "note",
    value: string
  ) => {
    setEmployees((prev) =>
      prev.map((emp, i) => (i === idx ? { ...emp, [field]: value } : emp))
    );
  };

  const handleSaveAttendance = async () => {
    if (employees.length === 0) {
      showToast("No employees to record attendance for", "error");
      return;
    }

    setLoading(true);
    try {
      const attendanceData = {
        date: dateFilter,
        totalEmployee: employees.length,
        totalPresent: employees.filter((e) => e.attendance === "Present")
          .length,
        totalAbsent: employees.filter((e) => e.attendance === "Absent").length,
        totalLeave: employees.filter((e) => e.attendance === "Leave").length,
        description: "",
        employees: employees.map((emp) => ({
          employeeId: emp.empId,
          employeeName: emp.name,
          status: emp.attendance.toLowerCase() as
            | "present"
            | "absent"
            | "leave",
          inTime: emp.inTime || null,
          outTime: emp.outTime || null,
          notes: emp.note || null,
        })),
      };

      const response = await api.post<ApiResponse<void>>(
        "/hr/attendance",
        attendanceData
      );

      if (response.success) {
        showToast("Attendance recorded successfully", "success");
        fetchEmployees(); // Refresh data
      } else {
        throw new Error(response.message || "Failed to save attendance");
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to save attendance",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daily Attendance</h1>
          <p className="mt-1 text-sm text-gray-500">
            Record today's attendance
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {initialLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <Card icon={<Calendar size={32} />} hover>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  {employees.length}
                </p>
                <p className="text-sm text-gray-500">Total Employees</p>
              </div>
            </Card>

            <Card icon={<CheckCircle size={32} />} hover>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  {employees.filter((e) => e.attendance === "Present").length}
                </p>
                <p className="text-sm text-gray-500">Present Today</p>
              </div>
            </Card>

            <Card icon={<XCircle size={32} />} hover>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  {employees.filter((e) => e.attendance === "Absent").length}
                </p>
                <p className="text-sm text-gray-500">Absent Today</p>
              </div>
            </Card>

            <Card icon={<BarChart3 size={32} />} hover>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  {employees.filter((e) => e.attendance === "Leave").length}
                </p>
                <p className="text-sm text-gray-500">On Leave</p>
              </div>
            </Card>
          </>
        )}
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input-base"
            />
          </div>
        </div>
      </div>

      {/* Today's Attendance Recording */}
      <div className="bg-white border rounded-lg shadow-sm mb-6">
        <div className="border-b px-6 py-3 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Today's Attendance
          </h3>
          {!initialLoading && employees.length > 0 && (
            <Button onClick={handleSaveAttendance} loading={loading} size="sm">
              Save Attendance
            </Button>
          )}
        </div>
        <div className="p-4">
          {initialLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-500">No employees found</p>
            </div>
          ) : (
            <Table
              data={employees}
              columns={[
                {
                  key: "id",
                  label: "#",
                  width: "60px",
                  render: (_, row) =>
                    employees.findIndex((e) => e.id === row.id) + 1,
                },
                { key: "designation", label: "Designation" },
                { key: "empId", label: "ID", width: "100px" },
                { key: "name", label: "Name" },
                {
                  key: "attendance",
                  label: "Attendance Type",
                  render: (value, row) => {
                    const index = employees.findIndex((e) => e.id === row.id);
                    return (
                      <div className="flex gap-4">
                        <label className="flex items-center gap-1">
                          <input
                            type="radio"
                            name={`attend-${row.id}`}
                            checked={value === "Present"}
                            onChange={() =>
                              handleAttendanceChange(index, "Present")
                            }
                          />
                          <span>Present</span>
                        </label>
                        <label className="flex items-center gap-1">
                          <input
                            type="radio"
                            name={`attend-${row.id}`}
                            checked={value === "Absent"}
                            onChange={() =>
                              handleAttendanceChange(index, "Absent")
                            }
                          />
                          <span>Absent</span>
                        </label>
                        <label className="flex items-center gap-1">
                          <input
                            type="radio"
                            name={`attend-${row.id}`}
                            checked={value === "Leave"}
                            onChange={() =>
                              handleAttendanceChange(index, "Leave")
                            }
                          />
                          <span>Leave</span>
                        </label>
                      </div>
                    );
                  },
                },
                {
                  key: "inTime",
                  label: "In Time",
                  width: "120px",
                  render: (value, row) => {
                    const index = employees.findIndex((e) => e.id === row.id);
                    return (
                      <input
                        type="time"
                        className="input-base w-full"
                        value={value}
                        onChange={(e) =>
                          handleInputChange(index, "inTime", e.target.value)
                        }
                      />
                    );
                  },
                },
                {
                  key: "outTime",
                  label: "Out Time",
                  width: "120px",
                  render: (value, row) => {
                    const index = employees.findIndex((e) => e.id === row.id);
                    return (
                      <input
                        type="time"
                        className="input-base w-full"
                        value={value}
                        onChange={(e) =>
                          handleInputChange(index, "outTime", e.target.value)
                        }
                      />
                    );
                  },
                },
                {
                  key: "note",
                  label: "Note",
                  render: (value, row) => {
                    const index = employees.findIndex((e) => e.id === row.id);
                    return (
                      <input
                        type="text"
                        className="input-base w-full"
                        value={value}
                        onChange={(e) =>
                          handleInputChange(index, "note", e.target.value)
                        }
                      />
                    );
                  },
                },
              ]}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyAttendance;
