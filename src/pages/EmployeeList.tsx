import React, { useState, useEffect } from "react";
import { Edit, Eye, BookOpen } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Spinner } from "../ui/Spinner";
import { EmptyState } from "../components/EmptyState";

interface Employee {
  id: number;
  name: string;
  empId: string;
  designation: string;
  mobile: string;
  salary: number;
}

const mockEmployees: Employee[] = [
  {
    id: 1,
    name: "MUSA ABUBAKAR SALISU",
    empId: "250043",
    designation: "Accountant",
    mobile: "08030408098",
    salary: 200000,
  },
  {
    id: 2,
    name: "ABUBAKAR ADAM",
    empId: "250050",
    designation: "Accountant",
    mobile: "09017997743",
    salary: 100000,
  },
  {
    id: 3,
    name: "MUSTAPHA ABDULLATEEF",
    empId: "250001",
    designation: "GENERAL MANAGER",
    mobile: "07039269151",
    salary: 400000,
  },
  {
    id: 4,
    name: "SHEHU NASIDI LABARAN",
    empId: "250003",
    designation: "MILLING OPERATOR",
    mobile: "12345678900",
    salary: 140000,
  },
  {
    id: 5,
    name: "ABUBAKAR HAKILU",
    empId: "250009",
    designation: "MILLING OPERATOR",
    mobile: "08030082313",
    salary: 150000,
  },
  {
    id: 6,
    name: "RAYYAN YUSUF",
    empId: "250021",
    designation: "MILLING OPERATOR",
    mobile: "07036917880",
    salary: 150000,
  },
  {
    id: 7,
    name: "IMRANA ABUBAKAR",
    empId: "250054",
    designation: "MILLING OPERATOR",
    mobile: "08137983366",
    salary: 150000,
  },
  {
    id: 8,
    name: "ISMAILA JIBRIN MUSA",
    empId: "250004",
    designation: "MAINTENANCE MANAGER",
    mobile: "08104139985",
    salary: 350000,
  },
  {
    id: 9,
    name: "SHEIDU ABDULGAFAR",
    empId: "250020",
    designation: "MECHANICAL ENGINEER",
    mobile: "01234567890",
    salary: 170000,
  },
  {
    id: 10,
    name: "SHUAIBU ABDU",
    empId: "250007",
    designation: "SECURITY OFFICER",
    mobile: "07038179072",
    salary: 120000,
  },
];

const mockDesignations = [
  "Accountant",
  "ADMIN OFFICER",
  "BAGGING OPERATOR",
  "BOILER OPERATOR",
  "CHECKER",
  "CHIEF SECURITY OFFICER",
  "CLEANER",
  "Computer Operator",
  "GENERAL MANAGER",
  "MAINTENANCE MANAGER",
  "MILLING OPERATOR",
  "MECHANICAL ENGINEER",
  "SECURITY OFFICER",
];

export const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [designationFilter, setDesignationFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setEmployees(mockEmployees);
      setLoading(false);
    }, 500);
  }, []);

  const filtered = employees.filter(
    (e) =>
      (!designationFilter || e.designation === designationFilter) &&
      (e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.empId.includes(search) ||
        e.mobile.includes(search))
  );
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSelectAll = (checked: boolean) => {
    setSelected(checked ? paged.map((e) => e.id) : []);
  };
  const handleSelect = (id: number, checked: boolean) => {
    setSelected((prev) =>
      checked ? [...prev, id] : prev.filter((eid) => eid !== id)
    );
  };
  const handleDelete = () => {
    setEmployees((prev) => prev.filter((e) => !selected.includes(e.id)));
    setSelected([]);
  };
  const openNewModal = () => {
    setEditEmployee(null);
    setModalOpen(true);
  };
  const openEditModal = (employee: Employee) => {
    setEditEmployee(employee);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditEmployee(null);
  };
  const handleSave = (employee: Employee) => {
    if (editEmployee) {
      setEmployees((prev) =>
        prev.map((e) => (e.id === employee.id ? employee : e))
      );
    } else {
      setEmployees((prev) => [
        ...prev,
        {
          ...employee,
          id: prev.length ? Math.max(...prev.map((e) => e.id)) + 1 : 1,
        },
      ]);
    }
    closeModal();
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center text-sm text-gray-500 mb-2">
        <span>Dashboard</span>
        <span className="mx-2">/</span>
        <span>Employee</span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Employees List</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={selected.length === 0}
          >
            Delete
          </Button>
          <Button onClick={openNewModal}>+ New</Button>
          <Button variant="outline" onClick={() => window.print()}>
            Print
          </Button>
        </div>
      </div>
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <select
          value={designationFilter}
          onChange={(e) => setDesignationFilter(e.target.value)}
          className="border border-gray-300 rounded px-2 py-2 w-full sm:w-64 focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
        >
          <option value="">Select Designation</option>
          {mockDesignations.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search employee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
        />
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow-card-hover border border-gray-200 scrollbar-hide">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2 text-left">
                <input
                  type="checkbox"
                  checked={paged.length > 0 && selected.length === paged.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  aria-label="Select all"
                />
              </th>
              <th className="px-2 py-2 text-left">SL#</th>
              <th className="px-2 py-2 text-left">Name</th>
              <th className="px-2 py-2 text-left">ID</th>
              <th className="px-2 py-2 text-left">Designation</th>
              <th className="px-2 py-2 text-left">Mobile</th>
              <th className="px-2 py-2 text-left">Salary</th>
              <th className="px-2 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="py-8">
                  <div className="flex justify-center items-center h-full w-full">
                    <Spinner size={28} />
                  </div>
                </td>
              </tr>
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <EmptyState
                    message="No employees found"
                    imageSrc="/img/empty.jpg"
                  />
                </td>
              </tr>
            ) : (
              paged.map((employee, idx) => (
                <tr key={employee.id} className="border-t">
                  <td className="px-2 py-2">
                    <input
                      type="checkbox"
                      checked={selected.includes(employee.id)}
                      onChange={(e) =>
                        handleSelect(employee.id, e.target.checked)
                      }
                      aria-label="Select row"
                    />
                  </td>
                  <td className="px-2 py-2">
                    {(page - 1) * pageSize + idx + 1}
                  </td>
                  <td className="px-2 py-2">{employee.name}</td>
                  <td className="px-2 py-2">{employee.empId}</td>
                  <td className="px-2 py-2">{employee.designation}</td>
                  <td className="px-2 py-2">{employee.mobile}</td>
                  <td className="px-2 py-2">
                    {employee.salary.toLocaleString()}
                  </td>
                  <td className="px-2 py-2 flex gap-2">
                    <button
                      onClick={() =>
                        (window.location.href = `/hr/employee/view/${employee.id}`)
                      }
                      className="p-1 focus:outline-none text-blue-500 hover:text-blue-700 transition"
                      aria-label="View"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => openEditModal(employee)}
                      className="p-1 focus:outline-none text-[#AF792F] hover:text-[#8c5f22] transition"
                      aria-label="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() =>
                        (window.location.href = `/hr/employee/ledger/${employee.id}`)
                      }
                      className="p-1 focus:outline-none text-green-600 hover:text-green-800 transition"
                      aria-label="Ledger"
                    >
                      <BookOpen size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-2">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </Button>
          <span>
            Page {page} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
          >
            Next
          </Button>
        </div>
      </div>
      {modalOpen && (
        <EmployeeModal
          employee={editEmployee}
          onClose={closeModal}
          onSave={handleSave}
          designations={mockDesignations}
        />
      )}
    </div>
  );
};

// Employee Modal Component
interface EmployeeModalProps {
  employee: Employee | null;
  onClose: () => void;
  onSave: (employee: Employee) => void;
  designations: string[];
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({
  employee,
  onClose,
  onSave,
  designations,
}) => {
  const [form, setForm] = useState<
    Employee & {
      email?: string;
      joiningDate?: string;
      salaryType?: string;
      bankName?: string;
      accountName?: string;
      accountNo?: string;
      grossAmount?: number;
      bonus?: number;
      absence?: string;
      loan?: number;
      tax?: number;
      address?: string;
      photo?: string;
      netSalary?: number;
      nationalId?: string;
      fatherName?: string;
      motherName?: string;
      bloodGroup?: string;
      others?: string;
    }
  >({
    id: employee?.id ?? 0,
    name: employee?.name ?? "",
    empId: employee?.empId ?? "",
    designation: employee?.designation ?? "",
    mobile: employee?.mobile ?? "",
    salary: employee?.salary ?? 0,
    salaryType: (employee as any)?.salaryType ?? "Monthly",
    joiningDate: (employee as any)?.joiningDate ?? "",
    grossAmount: (employee as any)?.grossAmount ?? employee?.salary ?? 0,
    bonus: (employee as any)?.bonus ?? 0,
    loan: (employee as any)?.loan ?? 0,
    tax: (employee as any)?.tax ?? 0,
    netSalary: (employee as any)?.netSalary ?? employee?.salary ?? 0,
    absence: (employee as any)?.absence ?? "",
    email: (employee as any)?.email ?? "",
    bankName: (employee as any)?.bankName ?? "",
    accountName: (employee as any)?.accountName ?? "",
    accountNo: (employee as any)?.accountNo ?? "",
    address: (employee as any)?.address ?? "",
    nationalId: (employee as any)?.nationalId ?? "",
    fatherName: (employee as any)?.fatherName ?? "",
    motherName: (employee as any)?.motherName ?? "",
    bloodGroup: (employee as any)?.bloodGroup ?? "",
    others: (employee as any)?.others ?? "",
    photo: (employee as any)?.photo ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    form.photo || null
  );

  // Calculate net salary
  useEffect(() => {
    const gross = Number(form.grossAmount) || 0;
    const bonus = Number(form.bonus) || 0;
    const loan = Number(form.loan) || 0;
    const tax = Number(form.tax) || 0;
    const net = gross + bonus - loan - tax;
    setForm((prev) => ({ ...prev, netSalary: net }));
  }, [form.grossAmount, form.bonus, form.loan, form.tax]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotoPreview(ev.target?.result as string);
        setForm((prev) => ({ ...prev, photo: ev.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      onSave({
        id: form.id || 0,
        name: form.name,
        empId: form.empId,
        designation: form.designation,
        mobile: form.mobile,
        salary: form.salary,
        // ...other fields as needed
      });
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-2 p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          {form.id ? "Edit Employee" : "Create New Employee"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee ID *
              </label>
              <input
                name="empId"
                value={form.empId || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Designation *
              </label>
              <select
                name="designation"
                value={form.designation || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
                required
              >
                <option value="">Select Designation</option>
                {designations.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Joining Date *
              </label>
              <input
                name="joiningDate"
                type="date"
                value={form.joiningDate || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                name="name"
                value={form.name || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                value={form.email || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number *
              </label>
              <input
                name="mobile"
                value={form.mobile || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                National ID Number
              </label>
              <input
                name="nationalId"
                value={form.nationalId || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Father's Name
              </label>
              <input
                name="fatherName"
                value={form.fatherName || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mother's Name
              </label>
              <input
                name="motherName"
                value={form.motherName || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blood Group
              </label>
              <input
                name="bloodGroup"
                value={form.bloodGroup || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salary Type *
              </label>
              <select
                name="salaryType"
                value={form.salaryType || "Monthly"}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
                required
              >
                <option value="Monthly">Monthly</option>
                <option value="Daily">Daily</option>
                <option value="Contractual">Contractual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salary *
              </label>
              <input
                name="salary"
                type="number"
                min={0}
                value={form.salary || 0}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gross Amount
              </label>
              <input
                name="grossAmount"
                type="number"
                min={0}
                value={form.grossAmount || 0}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bonus
              </label>
              <input
                name="bonus"
                type="number"
                min={0}
                value={form.bonus || 0}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loan
              </label>
              <input
                name="loan"
                type="number"
                min={0}
                value={form.loan || 0}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax
              </label>
              <input
                name="tax"
                type="number"
                min={0}
                value={form.tax || 0}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Net Salary
              </label>
              <input
                name="netSalary"
                type="number"
                value={form.netSalary || 0}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name
              </label>
              <input
                name="bankName"
                value={form.bankName || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Name
              </label>
              <input
                name="accountName"
                value={form.accountName || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account No
              </label>
              <input
                name="accountNo"
                value={form.accountNo || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                name="address"
                value={form.address || ""}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Others
              </label>
              <input
                name="others"
                value={form.others || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#AF792F]/10 file:text-[#AF792F] hover:file:bg-[#AF792F]/20"
              />
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt={form.name}
                  className="mt-2 h-24 rounded border object-cover"
                />
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {form.id ? "Update" : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
// ...existing code...
