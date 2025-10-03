import {
  Plus,
  Trash2,
  Printer,
  Calendar,
  Users,
  TrendingUp,
  RefreshCcw,
} from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { FilterBar } from "../../components/ui/FilterBar";
import { Modal } from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";
import { SkeletonCard } from "../../components/ui/Skeleton";

import { ApiResponse } from "../../types";
import { api } from "../../utils/fetcher";

interface SalaryRecord {
  id: string;
  date: string;
  year: number;
  month: string;
  description: string;
  totalEmployees: number;
  totalSalary: number;
  employeeSalaries: EmployeeSalary[];
  createdAt: string;
  updatedAt: string;
}

interface EmployeeSalary {
  employeeId: string;
  empId: string;
  employeeName: string;
  designation: string;
  salary: number;
  bonusOT: number;
  absentFine: number;
  deduction: number;
  payment: number;
  note?: string;
  signature?: string;
}

const years = [2025, 2024, 2023];
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

const SalarySheet: React.FC = () => {
  const [salaryData, setSalaryData] = useState<SalaryRecord[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { showToast } = useToast();
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState<string>("");
  const [monthFilter, setMonthFilter] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SalaryRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  const filteredData = salaryData.filter((record) => {
    const matchesSearch =
      record.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.month.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = !yearFilter || record.year.toString() === yearFilter;
    const matchesMonth = !monthFilter || record.month === monthFilter;
    return matchesSearch && matchesYear && matchesMonth;
  });

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  const totalAmount = filteredData.reduce((sum, r) => sum + r.totalSalary, 0);
  const totalEmployees = filteredData.reduce(
    (sum, r) => sum + r.totalEmployees,
    0
  );

  const columns = [
    {
      key: "id",
      label: "#",
      width: "60px",
      render: (_: any, __: SalaryRecord) => {
        // Find the index of the current record in the filteredData array
        const idx = filteredData.findIndex((r) => r.id === __.id);
        return idx + 1;
      },
    },
    {
      key: "date",
      label: "Date",
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    { key: "year", label: "Year" },
    {
      key: "month",
      label: "Month",
      render: (value: string) => {
        const monthName = months.find((m) => m.value === value)?.label || value;
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
            {monthName}
          </span>
        );
      },
    },
    { key: "description", label: "Description" },
    {
      key: "totalEmployees",
      label: "Total Employee",
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "totalSalary",
      label: "Total Salary",
      render: (value: number) => (
        <span className="font-semibold text-gray-900">
          {value.toLocaleString()}
        </span>
      ),
    },
  ];

  const handleEdit = (record: SalaryRecord) => {
    setEditingRecord(record);
    setFormData({
      date: record.date,
      year: Number(record.year),
      month: record.month,
      description: record.description || "",
      totalEmployees: record.totalEmployees,
      totalSalary: record.totalSalary,
      employeeSalaries: record.employeeSalaries || [],
    });
    setShowModal(true);
  };

  const fetchSalaryData = async () => {
    setLoading(true);
    setConnectionError(false);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
        search: searchQuery,
        year: yearFilter,
        month: monthFilter,
      }).toString();

      const response = await api.get<
        ApiResponse<{ salaries: SalaryRecord[]; pagination: any }>
      >(`/hr/salary?${queryParams}`);

      if (response.success && response.data?.salaries) {
        setSalaryData(response.data.salaries);
      } else {
        throw new Error("Failed to fetch salary data");
      }
    } catch (error) {
      console.error("Error fetching salary data:", error);
      if (error instanceof Error && error.message.includes("Failed to fetch")) {
        setConnectionError(true);
        showToast(
          "Cannot connect to server. Please check if the server is running.",
          "error"
        );
      } else {
        showToast("Failed to load salary data", "error");
      }
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Initial data load
  // Keyboard shortcuts
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Ctrl/Cmd + F for search
    if ((event.ctrlKey || event.metaKey) && event.key === "f") {
      event.preventDefault();
      document.querySelector<HTMLInputElement>('input[type="search"]')?.focus();
    }
    // Ctrl/Cmd + R for refresh
    if ((event.ctrlKey || event.metaKey) && event.key === "r") {
      event.preventDefault();
      fetchSalaryData();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  useEffect(() => {
    fetchSalaryData();
  }, [currentPage, pageSize, searchQuery, yearFilter, monthFilter]);

  const handleDelete = async (ids: string[]) => {
    setLoading(true);
    try {
      const response = await api.delete<ApiResponse<void>>("/hr/salary", {
        ids: ids,
      });

      if (response.success) {
        showToast(
          response.message || "Records deleted successfully",
          "success"
        );
        await fetchSalaryData();
        setSelectedRecords([]);
      }
    } catch (error) {
      console.error("Error deleting salary records:", error);
      showToast("Failed to delete salary records", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleNew = async () => {
    setEditingRecord(null);
    // Reset form data
    setFormData({
      date: "",
      year: new Date().getFullYear(),
      month: "",
      description: "",
      totalEmployees: 0,
      totalSalary: 0,
      employeeSalaries: [],
    });

    // Fetch active employees
    try {
      const response = await api.get<ApiResponse<any>>(
        "/hr/employees?status=active"
      );

      if (response.success && response.data) {
        const employees = response.data.map((emp: any) => ({
          employeeId: emp.id,
          empId: emp.empId,
          employeeName: emp.name,
          designation: emp.designation,
          salary: emp.salary,
          bonusOT: 0,
          absentFine: 0,
          deduction: 0,
          payment: emp.salary,
          note: "",
          signature: "",
        }));

        setFormData((prev) => ({
          ...prev,
          employeeSalaries: employees,
          totalEmployees: employees.length,
          totalSalary: employees.reduce(
            (sum: number, emp: any) => sum + emp.salary,
            0
          ),
        }));
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      showToast("Failed to fetch employees", "error");
    }

    setShowModal(true);
  };

  const [formData, setFormData] = useState({
    date: "",
    year: new Date().getFullYear(),
    month: "",
    description: "",
    totalEmployees: 0,
    totalSalary: 0,
    employeeSalaries: [] as EmployeeSalary[],
  });

  const handleSave = async () => {
    if (!formData.date || !formData.month) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setLoading(true);
    try {
      const response = editingRecord
        ? await api.put<ApiResponse<SalaryRecord>>(
            `/hr/salary/${editingRecord.id}`,
            formData
          )
        : await api.post<ApiResponse<SalaryRecord>>("/hr/salary", formData);

      if (response.success) {
        showToast(response.message || "Record saved successfully", "success");
        await fetchSalaryData();
        setShowModal(false);
        setEditingRecord(null);
        setFormData({
          date: "",
          year: new Date().getFullYear(),
          month: "",
          description: "",
          totalEmployees: 0,
          totalSalary: 0,
          employeeSalaries: [],
        });
      }
    } catch (error) {
      console.error("Error saving salary record:", error);
      showToast("Failed to save salary record", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {connectionError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Connection Error
              </h3>
              <p className="mt-1 text-sm text-red-700">
                Cannot connect to server. Please ensure that:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>The backend server is running</li>
                  <li>You can access http://localhost:5000</li>
                  <li>Your network connection is stable</li>
                </ul>
              </p>
              <button
                onClick={() => fetchSalaryData()}
                className="mt-2 text-sm font-medium text-red-800 hover:text-red-600"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Monthly Salary Sheet
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track monthly salary payments for all employees.
          </p>
        </div>
        <button
          onClick={() => fetchSalaryData()}
          className={`p-2 text-gray-500 hover:text-gray-700 transition-colors ${loading ? "animate-spin" : ""}`}
          disabled={loading}
          title="Refresh data (Ctrl+R)"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <Card icon={<Calendar size={32} />} hover>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  {filteredData.length}
                </p>
                <p className="text-sm text-gray-500">Total Records</p>
              </div>
            </Card>
            <Card icon={<Users size={32} />} hover>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  {totalEmployees}
                </p>
                <p className="text-sm text-gray-500">Total Employees</p>
              </div>
            </Card>
            <Card icon={<TrendingUp size={32} />} hover>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  {totalAmount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Total Amount</p>
              </div>
            </Card>
          </>
        )}
      </div>

      <Card>
        <FilterBar
          onSearch={setSearchQuery}
          placeholder="Search by description or month... (Ctrl+F)"
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
            <Button onClick={handleNew} icon={Plus} size="sm">
              New
            </Button>
            {selectedRecords.length > 0 && (
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => handleDelete(selectedRecords)}
                loading={loading}
              >
                Delete ({selectedRecords.length})
              </Button>
            )}
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
          data={paginatedData}
          columns={columns}
          loading={loading}
          pagination={{
            currentPage,
            totalPages,
            pageSize,
            totalItems: filteredData.length,
            onPageChange: setCurrentPage,
            onPageSizeChange: (size) => {
              setPageSize(size);
              setCurrentPage(1);
            },
          }}
          selection={{
            selectedItems: selectedRecords,
            onSelectionChange: setSelectedRecords,
          }}
          actions={{
            onEdit: handleEdit,
            onView: (record) => alert(`View record ${record.id}`),
          }}
        />
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingRecord ? "Edit Salary Sheet" : "New Salary Sheet"}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                className="input-base"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year *
              </label>
              <select
                className="input-base"
                required
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: parseInt(e.target.value) })
                }
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month *
              </label>
              <select
                className="input-base"
                required
                value={formData.month}
                onChange={(e) =>
                  setFormData({ ...formData, month: e.target.value })
                }
              >
                <option value="">Select Month</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              className="input-base"
              rows={2}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={loading}>
              {editingRecord ? "Update" : "Save"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SalarySheet;
