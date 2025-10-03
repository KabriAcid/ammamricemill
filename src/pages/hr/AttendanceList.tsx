import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Printer,
  Calendar,
  BarChart3,
  CheckCircle,
  XCircle,
  Percent,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { FilterBar } from "../../components/ui/FilterBar";
import { Modal } from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";
import { api } from "../../utils/fetcher";
import { Attendance, AttendanceRecord } from "../../types";
import type { ApiResponse } from "../../types";

const AttendanceList: React.FC = () => {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const [selectedAttendances, setSelectedAttendances] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    date: "",
    totalEmployee: 0,
    totalPresent: 0,
    totalAbsent: 0,
    totalLeave: 0,
    description: "",
    employees: [] as AttendanceRecord[],
  });

  const filteredAttendances = attendances.filter((attendance) => {
    const matchesSearch =
      attendance.description
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      attendance.date.includes(searchQuery);
    const matchesDate = !dateFilter || attendance.date === dateFilter;
    return matchesSearch && matchesDate;
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
      label: "Date",
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
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

  const handleEdit = (attendance: Attendance) => {
    setEditingAttendance(attendance);
    setFormData({
      date: attendance.date,
      totalEmployee: attendance.totalEmployee,
      totalPresent: attendance.totalPresent,
      totalAbsent: attendance.totalAbsent,
      totalLeave: attendance.totalLeave,
      description: attendance.description || "",
      employees: attendance.employees,
    });
    setShowModal(true);
  };

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
        search: searchQuery,
        date: dateFilter,
      }).toString();

      const response = await api.get<
        ApiResponse<{ attendances: Attendance[]; pagination: any }>
      >(`/hr/attendance?${queryParams}`);

      if (response.success && response.data?.attendances) {
        setAttendances(response.data.attendances);
      } else {
        throw new Error("Failed to fetch attendance data");
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      showToast("Failed to load attendance data", "error");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchAttendanceData();
  }, [currentPage, pageSize, searchQuery, dateFilter]);

  // Add keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="search"]');
        if (searchInput instanceof HTMLInputElement) {
          searchInput.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleDelete = async (attendanceIds: string[]) => {
    setLoading(true);
    try {
      const response = await api.delete<ApiResponse<void>>("/hr/attendance", {
        dates: attendanceIds,
      });

      if (response.success) {
        showToast(
          response.message || "Records deleted successfully",
          "success"
        );
        await fetchAttendanceData();
        setSelectedAttendances([]);
      }
    } catch (error) {
      console.error("Error deleting attendances:", error);
      showToast("Failed to delete attendance records", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.date || formData.totalEmployee <= 0) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setLoading(true);
    try {
      const response = editingAttendance
        ? await api.put<ApiResponse<Attendance>>(
            `/hr/attendance/${formData.date}`,
            formData
          )
        : await api.post<ApiResponse<Attendance>>("/hr/attendance", formData);

      if (response.success) {
        showToast(response.message || "Record saved successfully", "success");
        await fetchAttendanceData();
        setShowModal(false);
        setEditingAttendance(null);
        resetForm();
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
      showToast("Failed to save attendance record", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      date: "",
      totalEmployee: 0,
      totalPresent: 0,
      totalAbsent: 0,
      totalLeave: 0,
      description: "",
      employees: [],
    });
  };

  const handleNew = () => {
    setEditingAttendance(null);
    resetForm();
    setShowModal(true);
  };

  // Calculate summary stats
  const totalDays = attendances.length;
  const avgPresent =
    totalDays > 0
      ? attendances.reduce((sum, att) => sum + att.totalPresent, 0) / totalDays
      : 0;
  const avgAbsent =
    totalDays > 0
      ? attendances.reduce((sum, att) => sum + att.totalAbsent, 0) / totalDays
      : 0;
  const loadingCards = false; // set to true to show skeleton

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Attendance Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track daily employee attendance records.
          </p>
        </div>
        <button
          onClick={() => fetchAttendanceData()}
          className={`p-2 text-gray-500 hover:text-gray-700 transition-colors ${
            loading ? "animate-spin" : ""
          }`}
          disabled={loading}
          title="Refresh data"
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card icon={<BarChart3 size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">{totalDays}</p>
            <p className="text-sm text-gray-500">Total Records</p>
          </div>
        </Card>
        <Card icon={<CheckCircle size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              {Math.round(avgPresent)}
            </p>
            <p className="text-sm text-gray-500">Avg Present</p>
          </div>
        </Card>
        <Card icon={<XCircle size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              {Math.round(avgAbsent)}
            </p>
            <p className="text-sm text-gray-500">Avg Absent</p>
          </div>
        </Card>
        <Card icon={<Percent size={32} />} loading={loadingCards} hover>
          <div>
            <p className="text-3xl font-bold text-gray-700">
              {totalDays > 0
                ? Math.round((avgPresent / (avgPresent + avgAbsent)) * 100)
                : 0}
              %
            </p>
            <p className="text-sm text-gray-500">Attendance Rate</p>
          </div>
        </Card>
      </div>

      <FilterBar
        onSearch={setSearchQuery}
        placeholder="Search by date or description..."
      >
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="input-base"
          />
          <Button onClick={handleNew} icon={Plus} size="sm">
            New
          </Button>
          {selectedAttendances.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() => handleDelete(selectedAttendances)}
              loading={loading}
            >
              Delete ({selectedAttendances.length})
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
        data={paginatedAttendances}
        columns={columns}
        loading={loading}
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
        selection={{
          selectedItems: selectedAttendances,
          onSelectionChange: setSelectedAttendances,
        }}
        actions={{
          onEdit: handleEdit,
        }}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingAttendance ? "Edit Attendance" : "New Attendance"}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                className="input-base"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Employee *
              </label>
              <input
                type="number"
                value={formData.totalEmployee}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    totalEmployee: Number(e.target.value),
                  }))
                }
                className="input-base"
                min="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Present *
              </label>
              <input
                type="number"
                value={formData.totalPresent}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    totalPresent: Number(e.target.value),
                  }))
                }
                className="input-base"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Absent *
              </label>
              <input
                type="number"
                value={formData.totalAbsent}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    totalAbsent: Number(e.target.value),
                  }))
                }
                className="input-base"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Leave *
              </label>
              <input
                type="number"
                value={formData.totalLeave}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    totalLeave: Number(e.target.value),
                  }))
                }
                className="input-base"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="input-base"
              rows={3}
              placeholder="Enter description (optional)"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={loading}>
              {editingAttendance ? "Update" : "Save"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AttendanceList;
