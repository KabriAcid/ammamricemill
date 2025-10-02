import React, { useState } from "react";
import {
  Plus,
  CreditCard as Edit,
  Trash2,
  Printer,
  Eye,
  DollarSign,
  Users,
  Calendar,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { FilterBar } from "../../components/ui/FilterBar";
import { Modal } from "../../components/ui/Modal";
import { MonthlySalary, EmployeeSalaryRecord } from "../../types";

const MonthlySalarySheet: React.FC = () => {
  const [salarySheets, setSalarySheets] = useState<MonthlySalary[]>([
    {
      id: "1",
      date: "2024-01-31",
      year: 2024,
      month: 1,
      description: "January 2024 Salary",
      paymentHead: "Monthly Salary Payment",
      totalEmployee: 45,
      totalSalary: 2250000,
      employeeSalaries: [
        {
          employeeId: "1",
          designation: "Mill Manager",
          empId: "EMP001",
          name: "John Doe",
          salary: 50000,
          bonusOT: 5000,
          absentFine: 0,
          deduction: 2500,
          payment: 52500,
          note: "Regular payment",
          signature: "",
        },
      ],
      createdAt: "2024-01-31T10:00:00Z",
      updatedAt: "2024-01-31T10:00:00Z",
    },
  ]);

  const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("2024");
  const [monthFilter, setMonthFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSheet, setEditingSheet] = useState<MonthlySalary | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    date: "",
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    description: "",
    paymentHead: "",
    totalEmployee: 0,
    totalSalary: 0,
    employeeSalaries: [] as EmployeeSalaryRecord[],
  });

  const filteredSheets = salarySheets.filter((sheet) => {
    const matchesSearch =
      sheet.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sheet.paymentHead.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = !yearFilter || sheet.year.toString() === yearFilter;
    const matchesMonth = !monthFilter || sheet.month.toString() === monthFilter;

    return matchesSearch && matchesYear && matchesMonth;
  });

  const totalPages = Math.ceil(filteredSheets.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedSheets = filteredSheets.slice(
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
    { key: "year", label: "Year", sortable: true },
    {
      key: "month",
      label: "Month",
      render: (value: number) => {
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
        return months[value - 1];
      },
    },
    { key: "description", label: "Description" },
    { key: "totalEmployee", label: "Total Employee" },
    {
      key: "totalSalary",
      label: "Total Salary",
      render: (value: number) => (
        <span className="font-medium text-green-600">
          ₦{value.toLocaleString()}
        </span>
      ),
    },
  ];

  const handleEdit = (sheet: MonthlySalary) => {
    setEditingSheet(sheet);
    setFormData({
      date: sheet.date,
      year: sheet.year,
      month: sheet.month,
      description: sheet.description || "",
      paymentHead: sheet.paymentHead,
      totalEmployee: sheet.totalEmployee,
      totalSalary: sheet.totalSalary,
      employeeSalaries: sheet.employeeSalaries,
    });
    setShowModal(true);
  };

  const handleDelete = async (sheetIds: string[]) => {
    if (
      confirm(
        `Are you sure you want to delete ${sheetIds.length} salary sheet(s)?`
      )
    ) {
      setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setSalarySheets((prev) =>
          prev.filter((sheet) => !sheetIds.includes(sheet.id))
        );
        setSelectedSheets([]);
      } catch (error) {
        console.error("Error deleting salary sheets:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingSheet) {
        setSalarySheets((prev) =>
          prev.map((sheet) =>
            sheet.id === editingSheet.id
              ? { ...sheet, ...formData, updatedAt: new Date().toISOString() }
              : sheet
          )
        );
      } else {
        const newSheet: MonthlySalary = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setSalarySheets((prev) => [...prev, newSheet]);
      }

      setShowModal(false);
      setEditingSheet(null);
      resetForm();
    } catch (error) {
      console.error("Error saving salary sheet:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      date: "",
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      description: "",
      paymentHead: "",
      totalEmployee: 0,
      totalSalary: 0,
      employeeSalaries: [],
    });
  };

  const handleNew = () => {
    setEditingSheet(null);
    resetForm();
    setShowModal(true);
  };

  const years = ["2024", "2023", "2022"];
  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // Calculate summary stats
  const totalSheets = filteredSheets.length;
  const totalSalaryPaid = filteredSheets.reduce(
    (sum, sheet) => sum + sheet.totalSalary,
    0
  );
  const avgSalaryPerSheet = totalSheets > 0 ? totalSalaryPaid / totalSheets : 0;
  const totalEmployeesPaid = filteredSheets.reduce(
    (sum, sheet) => sum + sheet.totalEmployee,
    0
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Monthly Salary Sheet
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage monthly salary payments and employee compensation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card hover>
          <div className="text-center">
            <p className="text-3xl font-bold text-primary-600">{totalSheets}</p>
            <p className="text-sm text-gray-500">Salary Sheets</p>
          </div>
        </Card>
        <Card hover>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              ₦{totalSalaryPaid.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Total Paid</p>
          </div>
        </Card>
        <Card hover>
          <div className="text-center">
            <p className="text-3xl font-bold text-secondary-600">
              ₦{Math.round(avgSalaryPerSheet).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Avg Per Sheet</p>
          </div>
        </Card>
        <Card hover>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">
              {totalEmployeesPaid}
            </p>
            <p className="text-sm text-gray-500">Employees Paid</p>
          </div>
        </Card>
      </div>

      <FilterBar
        onSearch={setSearchQuery}
        placeholder="Search by description or payment head..."
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
            New Salary Sheet
          </Button>
          {selectedSheets.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() => handleDelete(selectedSheets)}
              loading={loading}
            >
              Delete ({selectedSheets.length})
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
        data={paginatedSheets}
        columns={columns}
        loading={loading}
        pagination={{
          currentPage,
          totalPages,
          pageSize,
          totalItems: filteredSheets.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
        }}
        selection={{
          selectedItems: selectedSheets,
          onSelectionChange: setSelectedSheets,
        }}
        actions={{
          onEdit: handleEdit,
          custom: [
            {
              label: "View",
              icon: <Eye className="w-4 h-4" />,
              onClick: (sheet) => console.log("View sheet:", sheet),
              variant: "secondary" as const,
            },
          ],
        }}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingSheet ? "Edit Salary Sheet" : "New Salary Sheet"}
        size="xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                Year *
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    year: Number(e.target.value),
                  }))
                }
                className="input-base"
                min="2020"
                max="2030"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month *
              </label>
              <select
                value={formData.month}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    month: Number(e.target.value),
                  }))
                }
                className="input-base"
                required
              >
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
            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="input-base"
              placeholder="Enter description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Head *
            </label>
            <input
              type="text"
              value={formData.paymentHead}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  paymentHead: e.target.value,
                }))
              }
              className="input-base"
              placeholder="Enter payment head"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Salary *
              </label>
              <input
                type="number"
                value={formData.totalSalary}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    totalSalary: Number(e.target.value),
                  }))
                }
                className="input-base"
                min="0"
                required
              />
            </div>
          </div>

          {/* Employee Salary Table */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Employee Salary Details
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                Employee salary details table would be implemented here with
                columns: Designation, ID, Name, Salary, Bonus/OT, Absent/Fine,
                Deduction, Payment, Note, Signature
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={loading}>
              {editingSheet ? "Update" : "Save"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MonthlySalarySheet;
