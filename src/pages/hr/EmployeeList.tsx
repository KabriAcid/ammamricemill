import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/fetcher";
import {
  Plus,
  Trash2,
  Printer,
  User,
  Users,
  Wallet,
  BadgeCheck,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { FilterBar } from "../../components/ui/FilterBar";
import { Modal } from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";
import { Employee } from "../../types";
import { SkeletonCard } from "../../components/ui/Skeleton";

const EmployeeList: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const { showToast } = useToast();
  const [initialLoading, setInitialLoading] = useState(true);
  const [designations, setDesignations] = useState<string[]>([]);

  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [designationFilter, setDesignationFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setInitialLoading(true);
      await fetchEmployeeData();
      await fetchDesignations();
      setInitialLoading(false);
    };
    loadData();
  }, []);

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

  const fetchDesignations = async () => {
    try {
      const response = await api.get<{ success: boolean; data: any[] }>(
        "/hr/designation"
      );

      if (response.success && response.data) {
        setDesignations(response.data.map((d: any) => d.name));
      }
    } catch (error) {
      console.error("Error fetching designations:", error);
      // Use existing designations from employees if API fails
      const uniqueDesignations = Array.from(
        new Set(employees.map((emp) => emp.designation))
      );
      setDesignations(uniqueDesignations);
    }
  };

  const fetchEmployeeData = async () => {
    setLoading(true);
    try {
      const response = await api.get<{ success: boolean; data: Employee[] }>(
        "/hr/employee"
      );

      if (response.success) {
        setEmployees(response.data);
      }
    } catch (error) {
      console.error("Error fetching employee data:", error);
      showToast("Failed to load employee data", "error");
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    mobile: "",
    email: "",
    salary: 0,
    joiningDate: "",
    isActive: true,
  });

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.mobile.includes(searchQuery);
    const matchesDesignation =
      !designationFilter || employee.designation === designationFilter;
    return matchesSearch && matchesDesignation;
  });

  const totalPages = Math.ceil(filteredEmployees.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedEmployees = filteredEmployees.slice(
    startIndex,
    startIndex + pageSize
  );

  const columns = [
    {
      key: "id",
      label: "S/N",
      width: "80px",
      render: (_value: any, _row: any, index?: number) =>
        startIndex + (typeof index === "number" ? index : 0) + 1,
    },
    { key: "name", label: "Employee Name", sortable: true },
    { key: "empId", label: "Employee ID", sortable: true },
    { key: "designation", label: "Designation" },
    { key: "mobile", label: "Mobile" },
    {
      key: "salary",
      label: "Salary",
      render: (value: number) => <span>₦{value.toLocaleString()}</span>,
    },
    {
      key: "isActive",
      label: "Status",
      render: (value: boolean) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {value ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      designation: employee.designation,
      mobile: employee.mobile,
      email: employee.email || "",
      salary: employee.salary,
      joiningDate: employee.joiningDate,
      isActive: employee.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (employeeIds: string[]) => {
    setLoading(true);
    try {
      console.log("Sending delete request with IDs:", employeeIds);
      const response = await api.delete<{
        success: boolean;
        message: string;
      }>("/hr/employee", { ids: employeeIds });

      console.log("Delete response:", response);
      if (response.success) {
        showToast(response.message, "success");
        await fetchEmployeeData();
        setSelectedEmployees([]);
      }
    } catch (error: any) {
      console.error("Error deleting employees:", error);
      console.error("Error details:", {
        message: error?.message,
        status: error?.status,
      });
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete employees";
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      showToast("Employee name is required", "error");
      return;
    }
    if (!formData.designation.trim()) {
      showToast("Designation is required", "error");
      return;
    }
    if (!formData.mobile.trim()) {
      showToast("Mobile number is required", "error");
      return;
    }
    if (!/^\d{10,15}$/.test(formData.mobile.replace(/[\s-]/g, ""))) {
      showToast("Please enter a valid mobile number (10-15 digits)", "error");
      return;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showToast("Please enter a valid email address", "error");
      return;
    }
    if (!formData.salary || formData.salary <= 0) {
      showToast("Salary must be greater than 0", "error");
      return;
    }
    if (!formData.joiningDate) {
      showToast("Joining date is required", "error");
      return;
    }

    setLoading(true);
    try {
      const response = editingEmployee
        ? await api.put<{ success: boolean; data: Employee; message: string }>(
            `/hr/employee/${editingEmployee.id}`,
            formData
          )
        : await api.post<{ success: boolean; data: Employee; message: string }>(
            "/hr/employee",
            formData
          );

      if (response.success) {
        showToast(response.message, "success");
        await fetchEmployeeData();
        setShowModal(false);
        setEditingEmployee(null);
        resetForm();
      }
    } catch (error) {
      console.error("Error saving employee:", error);
      showToast("Failed to save employee", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      designation: "",
      mobile: "",
      email: "",
      salary: 0,
      joiningDate: "",
      isActive: true,
    });
  };

  const handleNew = () => {
    setEditingEmployee(null);
    resetForm();
    setShowModal(true);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Employee Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage employee information and records.
          </p>
        </div>
        <button
          onClick={() => fetchEmployeeData()}
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
        {initialLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <Card icon={<Users size={32} />} hover>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  {employees.length}
                </p>
                <p className="text-sm text-gray-500">Total Employees</p>
              </div>
            </Card>
            <Card icon={<User size={32} />} hover>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  {employees.filter((emp) => emp.isActive).length}
                </p>
                <p className="text-sm text-gray-500">Active Employees</p>
              </div>
            </Card>
            <Card icon={<Wallet size={32} />} hover>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  ₦
                  {employees
                    .filter((emp) => emp.isActive)
                    .reduce(
                      (sum, emp) =>
                        sum + (parseInt(emp.salary?.toString() || "0") || 0),
                      0
                    )
                    .toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Total Monthly Salary</p>
              </div>
            </Card>
            <Card icon={<BadgeCheck size={32} />} hover>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  {
                    Array.from(new Set(employees.map((emp) => emp.designation)))
                      .length
                  }
                </p>
                <p className="text-sm text-gray-500">Designations</p>
              </div>
            </Card>
          </>
        )}
      </div>

      <FilterBar
        onSearch={setSearchQuery}
        placeholder="Search by name, ID, or mobile... (Ctrl+K)"
        value={searchQuery}
      >
        <div className="flex items-center space-x-2">
          <select
            value={designationFilter}
            onChange={(e) => setDesignationFilter(e.target.value)}
            className="input-base"
          >
            <option value="">All Designations</option>
            {designations.map((designation) => (
              <option key={designation} value={designation}>
                {designation}
              </option>
            ))}
          </select>
          <Button onClick={handleNew} icon={Plus} size="sm">
            New Employee
          </Button>
          {selectedEmployees.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() => handleDelete(selectedEmployees)}
              loading={loading}
            >
              Delete ({selectedEmployees.length})
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
        data={paginatedEmployees}
        columns={columns}
        loading={loading}
        pagination={{
          currentPage,
          totalPages,
          pageSize,
          totalItems: filteredEmployees.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
        }}
        selection={{
          selectedItems: selectedEmployees,
          onSelectionChange: setSelectedEmployees,
        }}
        actions={{
          onEdit: handleEdit,
          onView: (employee) => navigate(`/hr/employee/${employee.id}`),
        }}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingEmployee ? "Edit Employee" : "New Employee"}
        size="xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="input-base"
                placeholder="Enter employee name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Designation *
              </label>
              <select
                value={formData.designation}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    designation: e.target.value,
                  }))
                }
                className="input-base"
                required
              >
                <option value="">Select Designation</option>
                {designations.map((designation) => (
                  <option key={designation} value={designation}>
                    {designation}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile *
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, mobile: e.target.value }))
                }
                className="input-base"
                placeholder="+234 xxx xxx xxxx"
                maxLength={11}
                required
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="input-base"
                placeholder="employee@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Joining Date *
              </label>
              <input
                type="date"
                value={formData.joiningDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    joiningDate: e.target.value,
                  }))
                }
                className="input-base"
                max={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Salary *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  ₦
                </span>
                <input
                  type="number"
                  value={formData.salary}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      salary: Number(e.target.value),
                    }))
                  }
                  className="input-base pl-8"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.isActive ? "active" : "inactive"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: e.target.value === "active",
                  }))
                }
                className="input-base"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 mt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              setShowModal(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} loading={loading}>
            {editingEmployee ? "Update Employee" : "Save Employee"}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeeList;
