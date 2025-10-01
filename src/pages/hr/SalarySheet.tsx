import {
  Plus,
  Trash2,
  Printer,
  Calendar,
  Users,
  TrendingUp,
} from "lucide-react";
import React, { useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { FilterBar } from "../../components/ui/FilterBar";
import { Modal } from "../../components/ui/Modal";

interface SalaryRecord {
  id: string;
  date: string;
  year: number;
  month: string;
  description: string;
  totalEmployees: number;
  totalSalary: number;
}

const mockSalaryData: SalaryRecord[] = [
  {
    id: "1",
    date: "2025-09-29",
    year: 2025,
    month: "September",
    description: "Salary Payment for the Month of September",
    totalEmployees: 56,
    totalSalary: 5466900,
  },
  {
    id: "2",
    date: "2025-08-29",
    year: 2025,
    month: "August",
    description: "Salary Payment for the Month of August",
    totalEmployees: 57,
    totalSalary: 5255329,
  },
];

const years = [2025, 2024, 2023];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const SalarySheet: React.FC = () => {
  const [salaryData, setSalaryData] = useState<SalaryRecord[]>(mockSalaryData);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState<string>("");
  const [monthFilter, setMonthFilter] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SalaryRecord | null>(null);
  const [loading, setLoading] = useState(false);

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
      render: (value: string) => (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
          {value}
        </span>
      ),
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
    setShowModal(true);
  };

  const handleDelete = async (ids: string[]) => {
    if (window.confirm(`Delete ${ids.length} record(s)?`)) {
      setLoading(true);
      setTimeout(() => {
        setSalaryData((prev) => prev.filter((r) => !ids.includes(r.id)));
        setSelectedRecords([]);
        setLoading(false);
      }, 500);
    }
  };

  const handleNew = () => {
    setEditingRecord(null);
    setShowModal(true);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Monthly Salary Sheet
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage and track monthly salary payments for all employees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
            <p className="text-3xl font-bold text-gray-700">{totalEmployees}</p>
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
      </div>

      <Card>
        <FilterBar
          onSearch={setSearchQuery}
          placeholder="Search by description or month..."
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
                <option key={month} value={month}>
                  {month}
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
              <input type="date" className="input-base" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year *
              </label>
              <select className="input-base" required>
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
              <select className="input-base" required>
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea className="input-base" rows={2} />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowModal(false)} loading={loading}>
              {editingRecord ? "Update" : "Save"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SalarySheet;
