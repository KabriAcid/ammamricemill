import React, { useState, useEffect } from 'react';
import { DollarSign, Download, Eye, FileText } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { FormModal } from '../components/FormModal';
import { mockEmployees } from '../mock';

interface SalaryRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  designation: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  month: string;
  status: 'paid' | 'pending' | 'draft';
  paidDate?: string;
}

export const Salary: React.FC = () => {
  const [salaryData, setSalaryData] = useState<SalaryRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SalaryRecord | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSalaryData();
  }, [selectedMonth]);

  const fetchSalaryData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/salary?month=${selectedMonth}`);
      const data = await response.json();
      setSalaryData(data);
    } catch (error) {
      // Generate mock salary data
      const salaryRecords: SalaryRecord[] = mockEmployees.map((employee, index) => {
        const basicSalary = employee.salary;
        const allowances = Math.floor(basicSalary * 0.1); // 10% allowances
        const deductions = Math.floor(basicSalary * 0.05); // 5% deductions
        const netSalary = basicSalary + allowances - deductions;
        
        return {
          id: index + 1,
          employeeId: employee.id,
          employeeName: employee.name,
          designation: employee.designation,
          basicSalary,
          allowances,
          deductions,
          netSalary,
          month: selectedMonth,
          status: Math.random() > 0.3 ? 'paid' : 'pending',
          paidDate: Math.random() > 0.3 ? '2025-01-01' : undefined
        };
      });
      setSalaryData(salaryRecords);
    }
    setLoading(false);
  };

  const handleViewDetails = (record: SalaryRecord) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handlePaySalary = async (record: SalaryRecord) => {
    try {
      await fetch(`/api/salary/${record.id}/pay`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paidDate: new Date().toISOString().split('T')[0] })
      });
      fetchSalaryData();
    } catch (error) {
      console.error('Failed to pay salary');
    }
  };

  const handleGeneratePayslip = (record: SalaryRecord) => {
    // Generate and download payslip
    const payslipContent = `
AMMAM Rice Mill
Salary Slip - ${selectedMonth}

Employee: ${record.employeeName}
Designation: ${record.designation}
Employee ID: ${record.employeeId}

Basic Salary: ৳${record.basicSalary.toLocaleString()}
Allowances: ৳${record.allowances.toLocaleString()}
Deductions: ৳${record.deductions.toLocaleString()}
Net Salary: ৳${record.netSalary.toLocaleString()}

Status: ${record.status}
${record.paidDate ? `Paid Date: ${record.paidDate}` : ''}
    `;

    const blob = new Blob([payslipContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payslip-${record.employeeName}-${selectedMonth}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportSalarySheet = () => {
    const headers = [
      'Employee Name',
      'Designation',
      'Basic Salary',
      'Allowances',
      'Deductions',
      'Net Salary',
      'Status',
      'Paid Date'
    ];

    const csvContent = [
      headers.join(','),
      ...salaryData.map(record => [
        record.employeeName,
        record.designation,
        record.basicSalary,
        record.allowances,
        record.deductions,
        record.netSalary,
        record.status,
        record.paidDate || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salary-sheet-${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <Breadcrumb items={[
        { label: 'Human Resource' },
        { label: 'Salary Sheet' }
      ]} />

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <DollarSign className="w-6 h-6 text-[#AF792F]" />
          <h1 className="text-2xl font-bold text-gray-900">Salary Sheet</h1>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-gray-600">Manage employee salary and payroll</p>
          <div className="flex items-center gap-3">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AF792F] focus:border-transparent"
            />
            <button
              onClick={handleExportSalarySheet}
              className="bg-[#AF792F] hover:bg-[#9A6B28] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Employees</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">{salaryData.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Salary</h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            ৳{salaryData.reduce((acc, curr) => acc + curr.netSalary, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Paid</h3>
          <p className="text-2xl font-bold text-green-600 mt-2">
            {salaryData.filter(record => record.status === 'paid').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Pending</h3>
          <p className="text-2xl font-bold text-yellow-600 mt-2">
            {salaryData.filter(record => record.status === 'pending').length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Basic Salary
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Allowances
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deductions
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Salary
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salaryData.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.employeeName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.designation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      ৳{record.basicSalary.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right">
                      ৳{record.allowances.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right">
                      ৳{record.deductions.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      ৳{record.netSalary.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.status === 'paid' 
                          ? 'bg-green-100 text-green-800'
                          : record.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetails(record)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleGeneratePayslip(record)}
                          className="text-[#AF792F] hover:text-[#9A6B28] p-1"
                          title="Generate Payslip"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        {record.status === 'pending' && (
                          <button
                            onClick={() => handlePaySalary(record)}
                            className="bg-green-100 text-green-800 hover:bg-green-200 px-2 py-1 rounded text-xs font-medium transition-colors"
                          >
                            Pay
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Salary Details Modal */}
      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Salary Details"
      >
        {selectedRecord && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Employee Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Name:</span>
                  <span className="ml-2 font-medium">{selectedRecord.employeeName}</span>
                </div>
                <div>
                  <span className="text-gray-500">ID:</span>
                  <span className="ml-2 font-medium">{selectedRecord.employeeId}</span>
                </div>
                <div>
                  <span className="text-gray-500">Designation:</span>
                  <span className="ml-2 font-medium">{selectedRecord.designation}</span>
                </div>
                <div>
                  <span className="text-gray-500">Month:</span>
                  <span className="ml-2 font-medium">{selectedRecord.month}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Salary Breakdown</h3>
              
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Basic Salary</span>
                <span className="font-medium">৳{selectedRecord.basicSalary.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b text-green-600">
                <span>Allowances</span>
                <span className="font-medium">৳{selectedRecord.allowances.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b text-red-600">
                <span>Deductions</span>
                <span className="font-medium">৳{selectedRecord.deductions.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between py-3 border-t-2 text-lg font-bold">
                <span>Net Salary</span>
                <span className="text-[#AF792F]">৳{selectedRecord.netSalary.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-600">Status: </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedRecord.status === 'paid' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedRecord.status.charAt(0).toUpperCase() + selectedRecord.status.slice(1)}
                  </span>
                </div>
                {selectedRecord.paidDate && (
                  <div className="text-sm text-gray-600">
                    Paid on: {selectedRecord.paidDate}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => handleGeneratePayslip(selectedRecord)}
                className="bg-[#AF792F] hover:bg-[#9A6B28] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Download Payslip
              </button>
            </div>
          </div>
        )}
      </FormModal>
    </div>
  );
};