import React, { useState, useEffect } from "react";
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
import { api } from "../../utils/fetcher";
import { useToast } from "../../components/ui/Toast";

const MonthlyAttendance: React.FC = () => {
  const { showToast } = useToast();
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("2024");
  const [monthFilter, setMonthFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");

  const [trendData, setTrendData] = useState<any[]>([]);
  const [trendLoading, setTrendLoading] = useState(true);

  // Fetch monthly attendance data
  const fetchMonthlyData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (yearFilter) queryParams.append("year", yearFilter);
      if (monthFilter) queryParams.append("month", monthFilter);

      const response = await api.get<{
        success: boolean;
        data: Attendance[];
      }>(`/hr/monthly-attendance?${queryParams}`);

      if (response.success) {
        setAttendances(response.data);
      } else {
        console.error("Failed to fetch attendance data");
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch trend data
  const fetchTrendData = async () => {
    try {
      setTrendLoading(true);
      const response = await api.get<{
        success: boolean;
        data: any[];
      }>(
        `/hr/monthly-attendance/trend?year=${
          yearFilter || new Date().getFullYear()
        }`
      );

      if (response.success) {
        setTrendData(response.data);
      }
    } catch (err) {
      console.error("Error fetching trend data:", err);
    } finally {
      setTrendLoading(false);
    }
  };

  // Fetch data when filters change
  useEffect(() => {
    fetchMonthlyData();
    fetchTrendData();
  }, [yearFilter, monthFilter]);

  // ✅ Filtering logic
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

  // ✅ Pagination
  const totalPages = Math.ceil(filteredAttendances.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedAttendances = filteredAttendances.slice(
    startIndex,
    startIndex + pageSize
  );

  // ✅ Table Columns
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

  // Filter options
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

  // ✅ Summary stats
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

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Monthly Attendance</h1>
        <p className="mt-1 text-sm text-gray-500">
          View monthly attendance summaries and trends.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card icon={<BarChart3 size={32} />} loading={loading} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">{totalMonths}</p>
            <p className="text-sm text-gray-500">Months Recorded</p>
          </div>
        </Card>
        <Card icon={<CheckCircle size={32} />} loading={loading} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              {totalPresent.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Total Present Days</p>
          </div>
        </Card>
        <Card icon={<XCircle size={32} />} loading={loading} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              {totalAbsent.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Total Absent Days</p>
          </div>
        </Card>
        <Card icon={<Percent size={32} />} loading={loading} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              {Math.round(attendanceRate)}%
            </p>
            <p className="text-sm text-gray-500">Attendance Rate</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
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

      {/* Attendance Table */}
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

      {/* Trend Section */}
      <Card className="mt-6">
        <div className="px-6 pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Monthly Attendance Trend
          </h2>
        </div>
        <div className="p-6">
          {trendLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : trendData.length === 0 ? (
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  No trend data available for the selected year
                </p>
              </div>
            </div>
          ) : (
            <div className="h-64">
              <table className="min-w-full">
                <thead>
                  <tr className="text-sm text-gray-600">
                    <th className="py-2">Month</th>
                    <th className="py-2 text-right">Attendance Rate</th>
                    <th className="py-2 text-right">Present</th>
                    <th className="py-2 text-right">Absent</th>
                    <th className="py-2 text-right">Leave</th>
                  </tr>
                </thead>
                <tbody>
                  {trendData.map((item) => (
                    <tr key={item.month} className="border-t">
                      <td className="py-2">
                        {new Date(item.month + "-01").toLocaleDateString(
                          "en-US",
                          { month: "long" }
                        )}
                      </td>
                      <td className="py-2 text-right">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.attendanceRate >= 90
                              ? "bg-green-100 text-green-800"
                              : item.attendanceRate >= 75
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.attendanceRate}%
                        </span>
                      </td>
                      <td className="py-2 text-right text-green-600">
                        {item.totalPresent}
                      </td>
                      <td className="py-2 text-right text-red-600">
                        {item.totalAbsent}
                      </td>
                      <td className="py-2 text-right text-yellow-600">
                        {item.totalLeave}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MonthlyAttendance;
