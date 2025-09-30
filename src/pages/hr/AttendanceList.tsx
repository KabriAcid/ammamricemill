import React, { useState } from "react";
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
import { Attendance, AttendanceRecord } from "../../types";

const AttendanceList: React.FC = () => {
  const [attendances, setAttendances] = useState<Attendance[]>([
    {
      id: "1",
      date: "2024-01-15",
      totalEmployee: 45,
      totalPresent: 42,
      totalAbsent: 2,
      totalLeave: 1,
      description: "Regular working day",
      employees: [
        {
          employeeId: "1",
          employeeName: "John Doe",
          status: "present",
          overtime: 2,
        },
        {
          employeeId: "2",
          employeeName: "Jane Smith",
          status: "present",
          overtime: 0,
        },
        {
          employeeId: "3",
          employeeName: "Bob Wilson",
          status: "absent",
          notes: "Sick leave",
        },
      ],
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
    },
    {
      id: "2",
      date: "2024-01-14",
      totalEmployee: 45,
      totalPresent: 44,
      totalAbsent: 1,
      totalLeave: 0,
      description: "Production peak day",
      employees: [],
      createdAt: "2024-01-14T10:00:00Z",
      updatedAt: "2024-01-14T10:00:00Z",
    },
  ]);

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

  const handleDelete = async (attendanceIds: string[]) => {
    if (
      confirm(
        `Are you sure you want to delete ${attendanceIds.length} attendance record(s)?`
      )
    ) {
      setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setAttendances((prev) =>
          prev.filter((attendance) => !attendanceIds.includes(attendance.id))
        );
        setSelectedAttendances([]);
      } catch (error) {
        console.error("Error deleting attendances:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingAttendance) {
        setAttendances((prev) =>
          prev.map((attendance) =>
            attendance.id === editingAttendance.id
              ? {
                  ...attendance,
                  ...formData,
                  updatedAt: new Date().toISOString(),
                }
              : attendance
          )
        );
      } else {
        const newAttendance: Attendance = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setAttendances((prev) => [...prev, newAttendance]);
      }

      setShowModal(false);
      setEditingAttendance(null);
      resetForm();
    } catch (error) {
      console.error("Error saving attendance:", error);
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Attendance Management
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Track daily employee attendance records.
        </p>
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
