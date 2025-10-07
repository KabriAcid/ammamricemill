import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer, Download, RefreshCcw } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../components/ui/Toast";
import { api } from "../../utils/fetcher";
import { ApiResponse } from "../../types";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { formatCurrency } from "../../utils/formatters";

interface EmployeeSalary {
  employeeId: string;
  empId: string;
  employeeName: string;
  designation: string;
  salary: number;
  bonus: number;
  deduction: number;
  payment: number;
  note?: string;
  signature?: string;
}

interface SalarySheetDetail {
  id: string;
  date: string;
  year: number;
  month: string;
  description: string;
  totalEmployees: number;
  totalSalary: number;
  employeeSalaries: EmployeeSalary[];
}

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

const SalarySheetDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SalarySheetDetail | null>(null);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse<SalarySheetDetail>>(
        `/hr/salary/${id}`
      );

      if (response.success && response.data) {
        setData(response.data);
      } else {
        throw new Error("Failed to fetch salary sheet details");
      }
    } catch (error) {
      console.error("Error fetching salary sheet details:", error);
      showToast("Failed to load salary sheet details", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDetails();
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = async () => {
    try {
      showToast("Exporting to Excel...", "info");
      await api.download(`/hr/salary/${id}/export`);
      showToast("Export successful", "success");
    } catch (error) {
      console.error("Export error:", error);
      showToast("Failed to export salary sheet", "error");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Salary sheet not found</p>
        <Button
          onClick={() => navigate("/hr/salary")}
          variant="outline"
          className="mt-4"
        >
          Back to Salary Sheets
        </Button>
      </div>
    );
  }

  const monthName = months[parseInt(data.month) - 1] || data.month;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/hr/salary")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Salary Sheet Information
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Detailed breakdown of {monthName} {data.year} salary payments
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchDetails}
            className={`p-2 text-gray-500 hover:text-gray-700 transition-colors ${
              loading ? "animate-spin" : ""
            }`}
            title="Refresh"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={handlePrint}
          >
            Print
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <Card>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Date</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(data.date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Month</p>
            <p className="text-lg font-semibold text-gray-900">{monthName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Year</p>
            <p className="text-lg font-semibold text-gray-900">{data.year}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Employees</p>
            <p className="text-lg font-semibold text-gray-900">
              {data.totalEmployees}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Salary</p>
            <p className="text-lg font-semibold text-gray-900">
              ₦{formatCurrency(data.totalSalary || 0)}
            </p>
          </div>
        </div>
        {data.description && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Description</p>
            <p className="text-gray-900">{data.description}</p>
          </div>
        )}
      </Card>

      {/* Salary Sheet Details Table */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Salary Sheet Details
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Designation
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salary
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bonus
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deduction
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Note
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Signature
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.employeeSalaries.map((emp, index) => (
                <tr key={emp.employeeId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {emp.designation}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {emp.empId}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {emp.employeeName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                    ₦{formatCurrency(emp.salary || 0)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                    {emp.bonus > 0 ? `₦${formatCurrency(emp.bonus)}` : "0"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                    {emp.deduction > 0
                      ? `₦${formatCurrency(emp.deduction)}`
                      : "0"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                    ₦{formatCurrency(emp.payment || 0)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {emp.note || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {emp.signature || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 font-semibold">
              <tr>
                <td colSpan={4} className="px-4 py-3 text-right text-sm">
                  Total:
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  ₦
                  {formatCurrency(
                    data.employeeSalaries.reduce(
                      (sum, emp) => sum + emp.salary,
                      0
                    )
                  )}
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  ₦
                  {formatCurrency(
                    data.employeeSalaries.reduce(
                      (sum, emp) => sum + emp.bonus,
                      0
                    )
                  )}
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  ₦
                  {formatCurrency(
                    data.employeeSalaries.reduce(
                      (sum, emp) => sum + emp.deduction,
                      0
                    )
                  )}
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  ₦{formatCurrency(data.totalSalary || 0)}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default SalarySheetDetails;
