import React, { useState, useEffect } from "react";
import { api } from "../../utils/fetcher";
import {
  Plus,
  CreditCard as Edit,
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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const { showToast } = useToast();
  const [initialLoading, setInitialLoading] = useState(true);

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
    empId: "",
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
    { key: "id", label: "#", width: "80px" },
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

  const designations = Array.from(
    new Set(employees.map((emp) => emp.designation))
  );

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      empId: employee.empId,
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
      const response = await api.delete<{
        success: boolean;
        message: string;
      }>(`/hr/employee?ids=${employeeIds.join(",")}`);

      if (response.success) {
        showToast(response.message, "success");
        await fetchEmployeeData();
        setSelectedEmployees([]);
      }
    } catch (error) {
      console.error("Error deleting employees:", error);
      showToast("Failed to delete employees", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (
      !formData.name ||
      !formData.mobile ||
      !formData.salary ||
      !formData.joiningDate
    ) {
      showToast("Please fill in all required fields", "error");
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
      empId: "",
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

  const activeEmployees = employees.filter((emp) => emp.isActive).length;
  const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0);
  const loadingCards = false; // set to true to show skeleton

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
                    .reduce((sum, emp) => sum + emp.salary, 0)
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
        }}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingEmployee ? "Edit Employee" : "New Employee"}
        size="xl"
      >
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="input-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee ID *
              </label>
              <input
                type="text"
                value={formData.empId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, empId: e.target.value }))
                }
                className="input-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Designation *
              </label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    designation: e.target.value,
                  }))
                }
                className="input-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile *
              </label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, mobile: e.target.value }))
                }
                className="input-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="input-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                required
              />
            </div>
          </div>

          {/* Salary & Financial Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Salary Information
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salary *
              </label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    salary: Number(e.target.value),
                  }))
                }
                className="input-base"
                required
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button variant="outline" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={loading}>
            {editingEmployee ? "Update" : "Save"}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeeList;
