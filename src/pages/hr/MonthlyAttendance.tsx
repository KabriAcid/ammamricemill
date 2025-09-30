import React, { useState } from "react";
import {
  Printer,
  TrendingUp,
  BarChart3,
  CheckCircle,
  XCircle,
  Percent,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { FilterBar } from "../../components/ui/FilterBar";
import { Attendance } from "../../types";

const MonthlyAttendance: React.FC = () => {
  const [attendances] = useState<Attendance[]>([
    {
      id: "1",
      date: "2024-01-31",
      totalEmployee: 45,
      totalPresent: 1260, // 42 avg * 30 days
      totalAbsent: 90,
      totalLeave: 30,
      description: "January 2024 Summary",
      employees: [],
      createdAt: "2024-01-31T10:00:00Z",
      updatedAt: "2024-01-31T10:00:00Z",
    },
    {
      id: "2",
      date: "2023-12-31",
      totalEmployee: 43,
      totalPresent: 1204,
      totalAbsent: 86,
      totalLeave: 43,
      description: "December 2023 Summary",
      employees: [],
      createdAt: "2023-12-31T10:00:00Z",
      updatedAt: "2023-12-31T10:00:00Z",
    },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("2024");
  const [monthFilter, setMonthFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");

  const filteredAttendances = attendances.filter((attendance) => {
    const date = new Date(attendance.date);
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");

    const matchesSearch = attendance.description
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesYear = !yearFilter || year === yearFilter;
    const matchesMonth = !monthFilter || month === monthFilter;

    return matchesSearch && matchesYear && matchesMonth;
  });

  const totalPages = Math.ceil(filteredAttendances.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedAttendances = filteredAttendances.slice(
    startIndex,
    startIndex + pageSize
  );

  const columns = [
    { key: "id", label: "#", width: "80px" },
    {
      key: "date",
      label: "Month/Year",
      sortable: true,
      render: (value: string) => {
        const date = new Date(value);
        return date.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });
      },
    },
    { key: "totalEmployee", label: "Total Employee", sortable: true },
    {
      key: "totalPresent",
      label: "Total Present",
      render: (value: number) => (
        <span className="text-green-600 font-medium">{value}</span>
      ),
    },
    {
      key: "totalAbsent",
      label: "Total Absent",
      render: (value: number) => (
        <span className="text-red-600 font-medium">{value}</span>
      ),
    },
    {
      key: "totalLeave",
      label: "Total Leave",
      render: (value: number) => (
        <span className="text-yellow-600 font-medium">{value}</span>
      ),
    },
    { key: "description", label: "Description" },
  ];

  const years = ["2024", "2023", "2022"];
  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // Calculate summary stats
  const totalMonths = attendances.length;
  const totalPresent = attendances.reduce(
    (sum, att) => sum + att.totalPresent,
    0
  );
  const totalAbsent = attendances.reduce(
    (sum, att) => sum + att.totalAbsent,
    0
  );
  const attendanceRate =
    totalPresent + totalAbsent > 0
      ? (totalPresent / (totalPresent + totalAbsent)) * 100
      : 0;
  const loadingCards = false; // set to true to show skeleton

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Monthly Attendance</h1>
        <p className="mt-1 text-sm text-gray-500">
          View monthly attendance summaries and trends.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card icon={<BarChart3 size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">{totalMonths}</p>
            <p className="text-sm text-gray-500">Months Recorded</p>
          </div>
        </Card>
        <Card icon={<CheckCircle size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              {totalPresent.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Total Present Days</p>
          </div>
        </Card>
        <Card icon={<XCircle size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              {totalAbsent.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Total Absent Days</p>
          </div>
        </Card>
        <Card icon={<Percent size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              {Math.round(attendanceRate)}%
            </p>
            <p className="text-sm text-gray-500">Attendance Rate</p>
          </div>
        </Card>
      </div>

      <FilterBar
        onSearch={setSearchQuery}
        placeholder="Search by description..."
      >
        <div className="flex items-center space-x-2">
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="input-base"
          >
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="input-base"
          >
            <option value="">All Months</option>
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          <select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className="input-base"
          >
            <option value="">All Employees</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={() => window.print()}
          >
            Print
          </Button>
        </div>
      </FilterBar>

      <Table
        data={paginatedAttendances}
        columns={columns}
        pagination={{
          currentPage,
          totalPages,
          pageSize,
          totalItems: filteredAttendances.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
        }}
      />

      {/* Monthly Trend Chart Placeholder */}
      <Card className="mt-6">
        <div className="px-6 pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Monthly Attendance Trend
          </h2>
        </div>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              Monthly attendance trend chart would be displayed here
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MonthlyAttendance;
