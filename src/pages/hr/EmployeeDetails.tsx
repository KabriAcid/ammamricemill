import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Printer,
  User,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  Wallet,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { useToast } from "../../components/ui/Toast";
import { format, differenceInMonths } from "date-fns";
import { api } from "../../utils/fetcher";
import { ApiResponse } from "../../types";

interface EmployeeDetail {
  id: string;
  name: string;
  empId: string;
  designation: string;
  mobile: string;
  email: string;
  salary: number;
  joiningDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SalaryRecord {
  id: string;
  month: string;
  year: number;
  salary: number;
  bonusOT: number;
  absentFine: number;
  deduction: number;
  payment: number;
  date: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: "present" | "absent" | "leave" | "half-day";
  checkIn: string;
  checkOut: string;
  workHours: number;
}

const EmployeeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [salaryHistory, setSalaryHistory] = useState<SalaryRecord[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch employee details
  const fetchEmployeeDetails = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await api.get<ApiResponse<EmployeeDetail>>(
        `/hr/employee/${id}`
      );

      if (response.success && response.data) {
        setEmployee(response.data);
      } else {
        showToast("Employee not found", "error");
      }
    } catch (error) {
      console.error("Error fetching employee details:", error);
      showToast("Failed to load employee details", "error");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Fetch salary history
  const fetchSalaryHistory = async () => {
    if (!id) return;

    try {
      const response = await api.get<ApiResponse<{ salaries: SalaryRecord[] }>>(
        `/hr/salary?employeeId=${id}`
      );

      if (response.success && response.data?.salaries) {
        setSalaryHistory(response.data.salaries);
      }
    } catch (error) {
      console.error("Error fetching salary history:", error);
    }
  };

  // Fetch attendance records
  const fetchAttendanceRecords = async () => {
    if (!id) return;

    try {
      const response = await api.get<ApiResponse<AttendanceRecord[]>>(
        `/hr/attendance?employeeId=${id}&limit=10`
      );

      if (response.success && response.data) {
        setAttendanceRecords(response.data);
      }
    } catch (error) {
      console.error("Error fetching attendance records:", error);
    }
  };

  useEffect(() => {
    fetchEmployeeDetails();
    fetchSalaryHistory();
    fetchAttendanceRecords();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = () => {
    navigate(`/hr/employee`);
  };

  // Loading State
  if (initialLoading) {
    return (
      <div className="animate-fade-in">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-10 w-48 bg-gray-200 animate-pulse rounded" />
          <div className="h-10 w-32 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-gray-200 animate-pulse rounded" />
          <div className="h-64 bg-gray-200 animate-pulse rounded" />
          <div className="h-64 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="animate-fade-in">
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">Employee not found</p>
            <Button onClick={() => navigate("/hr/employee")} className="mt-4">
              Back to Employees
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const tenureMonths = employee.joiningDate
    ? differenceInMonths(new Date(), new Date(employee.joiningDate))
    : 0;
  const tenureYears = Math.floor(tenureMonths / 12);
  const remainingMonths = tenureMonths % 12;

  const totalPaid =
    salaryHistory.reduce((sum, record) => sum + record.payment, 0) || 0;
  const totalDeductions =
    salaryHistory.reduce((sum, record) => sum + record.deduction, 0) || 0;
  const totalBonus =
    salaryHistory.reduce((sum, record) => sum + record.bonusOT, 0) || 0;

  const presentDays =
    attendanceRecords.filter((r) => r.status === "present").length || 0;
  const absentDays =
    attendanceRecords.filter((r) => r.status === "absent").length || 0;
  const attendanceRate =
    attendanceRecords.length > 0
      ? ((presentDays / attendanceRecords.length) * 100).toFixed(1)
      : 0;

  // Salary history columns
  const salaryColumns = [
    {
      key: "date",
      label: "Date",
      render: (value: string) => {
        if (!value) return "-";
        try {
          return format(new Date(value), "dd MMM yyyy");
        } catch {
          return "-";
        }
      },
    },
    {
      key: "month",
      label: "Month",
      render: (value: string, row: SalaryRecord) => {
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const monthIndex = parseInt(value) - 1;
        return `${months[monthIndex] || value} ${row.year}`;
      },
    },
    {
      key: "salary",
      label: "Base Salary",
      render: (value: number) => `₦${(value || 0).toLocaleString()}`,
    },
    {
      key: "bonusOT",
      label: "Bonus/OT",
      render: (value: number) => (
        <span className="text-green-600">
          +₦{(value || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "deduction",
      label: "Deductions",
      render: (value: number) => (
        <span className="text-red-600">-₦{(value || 0).toLocaleString()}</span>
      ),
    },
    {
      key: "payment",
      label: "Net Payment",
      render: (value: number) => (
        <span className="font-semibold">₦{(value || 0).toLocaleString()}</span>
      ),
    },
  ];

  // Attendance columns
  const attendanceColumns = [
    {
      key: "date",
      label: "Date",
      render: (value: string) => {
        if (!value) return "-";
        try {
          return format(new Date(value), "dd MMM yyyy");
        } catch {
          return "-";
        }
      },
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => {
        const statusColors = {
          present: "bg-green-100 text-green-800",
          absent: "bg-red-100 text-red-800",
          leave: "bg-yellow-100 text-yellow-800",
          "half-day": "bg-blue-100 text-blue-800",
        };
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              statusColors[value as keyof typeof statusColors] ||
              "bg-gray-100 text-gray-800"
            }`}
          >
            {value ? value.toUpperCase() : "N/A"}
          </span>
        );
      },
    },
    {
      key: "checkIn",
      label: "Check In",
      render: (value: string) => {
        if (!value) return "-";
        try {
          return format(new Date(value), "hh:mm a");
        } catch {
          return "-";
        }
      },
    },
    {
      key: "checkOut",
      label: "Check Out",
      render: (value: string) => {
        if (!value) return "-";
        try {
          return format(new Date(value), "hh:mm a");
        } catch {
          return "-";
        }
      },
    },
    {
      key: "workHours",
      label: "Work Hours",
      render: (value: number) => {
        if (!value || typeof value !== "number") return "-";
        return `${value.toFixed(1)} hrs`;
      },
    },
  ];

  return (
    <div className="animate-fade-in print:bg-white">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate("/hr/employee")}
          >
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Employee Details
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              ID: {employee.empId} | {employee.designation}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" icon={Edit} onClick={handleEdit}>
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={handlePrint}
          >
            Print
          </Button>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block mb-8 text-center border-b pb-4">
        <h1 className="text-2xl font-bold">Employee Information</h1>
        <p className="text-sm text-gray-600">
          {employee.name} - {employee.empId}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Monthly Salary</p>
              <p className="text-2xl font-bold text-gray-900">
                ₦{employee.salary.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Wallet className="text-green-600" size={24} />
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Paid</p>
              <p className="text-2xl font-bold text-gray-900">
                ₦{totalPaid.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <DollarSign className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Attendance</p>
              <p className="text-2xl font-bold text-gray-900">
                {attendanceRate}%
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tenure</p>
              <p className="text-2xl font-bold text-gray-900">
                {tenureYears}y {remainingMonths}m
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Clock className="text-orange-600" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Personal Information */}
        <Card className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Personal Information
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                employee.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {employee.isActive ? (
                <>
                  <CheckCircle className="inline w-4 h-4 mr-1" />
                  Active
                </>
              ) : (
                <>
                  <XCircle className="inline w-4 h-4 mr-1" />
                  Inactive
                </>
              )}
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <User className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium text-gray-900">{employee.name}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Briefcase className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Designation</p>
                <p className="font-medium text-gray-900">
                  {employee.designation}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Phone className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Mobile</p>
                <p className="font-medium text-gray-900">{employee.mobile}</p>
              </div>
            </div>

            {employee.email && (
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Mail className="text-orange-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{employee.email}</p>
                </div>
              </div>
            )}

            <div className="flex items-start space-x-3">
              <div className="p-2 bg-teal-50 rounded-lg">
                <Calendar className="text-teal-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Joining Date</p>
                <p className="font-medium text-gray-900">
                  {employee.joiningDate
                    ? format(new Date(employee.joiningDate), "dd MMMM yyyy")
                    : "-"}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Wallet className="text-indigo-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Monthly Salary</p>
                <p className="font-medium text-gray-900 text-lg">
                  ₦{employee.salary.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Financial Summary */}
        <Card className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Financial Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">
                Total Payments
              </p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                ₦{totalPaid.toLocaleString()}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {salaryHistory.length} payment(s)
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Total Bonus</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                ₦{totalBonus.toLocaleString()}
              </p>
              <p className="text-xs text-blue-600 mt-1">Bonus & Overtime</p>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-600 font-medium">
                Total Deductions
              </p>
              <p className="text-2xl font-bold text-red-900 mt-1">
                ₦{totalDeductions.toLocaleString()}
              </p>
              <p className="text-xs text-red-600 mt-1">Fines & Deductions</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Salary History
            </h3>
            {salaryHistory.length > 0 ? (
              <Table
                data={salaryHistory.slice(0, 5)}
                columns={salaryColumns}
                loading={loading}
              />
            ) : (
              <p className="text-center text-gray-500 py-8">
                No salary records found
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Attendance Records */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Attendance
          </h2>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              <span className="text-gray-600">Present: {presentDays} days</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
              <span className="text-gray-600">Absent: {absentDays} days</span>
            </div>
          </div>
        </div>
        {attendanceRecords.length > 0 ? (
          <Table
            data={attendanceRecords}
            columns={attendanceColumns}
            loading={loading}
          />
        ) : (
          <p className="text-center text-gray-500 py-8">
            No attendance records found
          </p>
        )}
      </Card>

      {/* System Information */}
      <Card className="mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          System Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Employee ID</p>
            <p className="font-medium text-gray-900">{employee.empId}</p>
          </div>
          <div>
            <p className="text-gray-500">Created At</p>
            <p className="font-medium text-gray-900">
              {employee.createdAt
                ? format(new Date(employee.createdAt), "dd MMM yyyy, hh:mm a")
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Last Updated</p>
            <p className="font-medium text-gray-900">
              {employee.updatedAt
                ? format(new Date(employee.updatedAt), "dd MMM yyyy, hh:mm a")
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Record ID</p>
            <p className="font-medium text-gray-900">{employee.id}</p>
          </div>
        </div>
      </Card>

      {/* Print Footer */}
      <div className="hidden print:block mt-12 pt-8 border-t">
        <div className="flex justify-between text-sm text-gray-600">
          <div>
            <p>Authorized Signature: _________________</p>
          </div>
          <div>
            <p>Date: {format(new Date(), "dd/MM/yyyy")}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;
