import React, { useState } from 'react';
import { Search, Filter, Plus, Trash2, Printer, CreditCard as Edit3, Eye, Calendar, Users, DollarSign, Download, RefreshCw, ArrowLeft, ChevronDown, MoreHorizontal, TrendingUp, Building2 } from 'lucide-react';

interface SalaryRecord {
  id: number;
  date: string;
  year: number;
  month: string;
  description: string;
  totalEmployees: number;
  totalSalary: number;
}

const mockSalaryData: SalaryRecord[] = [
  {
    id: 1,
    date: '29-09-2025',
    year: 2025,
    month: 'September',
    description: 'Salary Payment for the Month of September',
    totalEmployees: 56,
    totalSalary: 5466900
  },
  {
    id: 2,
    date: '29-08-2025',
    year: 2025,
    month: 'August',
    description: 'Salary Payment for the Month of August',
    totalEmployees: 57,
    totalSalary: 5255329
  }
];

export const SalarySheet: React.FC = () => {
  const [selectedRecords, setSelectedRecords] = useState<number[]>([]);
  const [showEntries, setShowEntries] = useState(50);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState('September');
  const [searchTerm, setSearchTerm] = useState('');

  const totalAmount = mockSalaryData.reduce((sum, record) => sum + record.totalSalary, 0);
  const totalEmployees = mockSalaryData.reduce((sum, record) => sum + record.totalEmployees, 0);

  const handleSelectAll = () => {
    if (selectedRecords.length === mockSalaryData.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(mockSalaryData.map(record => record.id));
    }
  };

  const handleSelectRecord = (id: number) => {
    setSelectedRecords(prev => 
      prev.includes(id) 
        ? prev.filter(recordId => recordId !== id)
        : [...prev, id]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
  <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
  <div className="mb-8">
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm text-gray-500 mb-4">
            <button className="hover:text-primary-700 transition-colors flex items-center gap-1">
              <Building2 className="w-4 h-4 text-primary-500" />
              Dashboard
            </button>
            <span className="mx-2">/</span>
            <span className="text-primary-600 font-medium">Salary</span>
          </nav>

          {/* Title and Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Monthly Salary Sheet
              </h1>
              <p className="text-gray-600">
                Manage and track monthly salary payments for all employees
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-primary-500 text-primary-700 rounded-xl font-medium hover:bg-primary-50 hover:border-primary-600 transition-all duration-200">
                <ArrowLeft className="w-4 h-4 text-primary-500" />
                Back
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-primary-500 text-primary-700 rounded-xl font-medium hover:bg-primary-50 hover:border-primary-600 transition-all duration-200">
                <RefreshCw className="w-4 h-4 text-primary-500" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Records</p>
                <p className="text-3xl font-bold text-gray-900">{mockSalaryData.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Employees</p>
                <p className="text-3xl font-bold text-gray-900">{totalEmployees}</p>
              </div>
              <div className="w-12 h-12 bg-secondary-50 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-secondary-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Amount</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
              </div>
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Filters and Controls */}
          <div className="p-6 border-b border-gray-100 bg-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Left side controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Show</span>
                  <div className="relative">
                    <select 
                      value={showEntries}
                      onChange={(e) => setShowEntries(Number(e.target.value))}
                      className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">entries</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <select 
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    >
                      <option value={2025}>2025</option>
                      <option value={2024}>2024</option>
                      <option value={2023}>2023</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <select 
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    >
                      <option value="September">September</option>
                      <option value="August">August</option>
                      <option value="July">July</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>

                  <button className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-all duration-200 shadow-sm" >
                    <Search className="w-4 h-4" />
                    Search
                  </button>
                  <button className="inline-flex items-center gap-2 border border-primary-500 text-primary-700 px-4 py-2 rounded-lg font-medium hover:bg-primary-50 hover:border-primary-600 transition-all duration-200" >
                    <Filter className="w-4 h-4" />
                    Clear
                  </button>
                </div>
              </div>

              {/* Right side actions */}
              <div className="flex items-center gap-3">
                <button className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-all duration-200 shadow-sm" >
                  <Plus className="w-4 h-4" />
                  New
                </button>
                <button className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 border border-primary-500 px-4 py-2 rounded-lg font-medium hover:bg-primary-200 transition-all duration-200" >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
                <button className="inline-flex items-center gap-2 bg-secondary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-secondary-600 transition-all duration-200 shadow-sm" >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#AF792F] border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-white">
                    <input
                      type="checkbox"
                      checked={selectedRecords.length === mockSalaryData.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    SL#
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Total Employee
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Total Salary
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockSalaryData.map((record, index) => (
                  <tr 
                    key={record.id}
                    className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 transition-all duration-200"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRecords.includes(record.id)}
                        onChange={() => handleSelectRecord(record.id)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                      {record.date}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {record.year}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                        {record.month}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                      {record.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{record.totalEmployees}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {formatCurrency(record.totalSalary)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="inline-flex items-center gap-1 bg-primary-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-primary-600 transition-all duration-200 shadow-sm" >
                          <Edit3 className="w-3 h-3" />
                          Edit
                        </button>
                        <button className="inline-flex items-center gap-1 bg-secondary-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-secondary-600 transition-all duration-200 shadow-sm" >
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#AF792F] border-t-2 border-gray-200">
                  <td colSpan={6} className="px-6 py-4 text-sm font-bold text-white">Total</td>
                  <td className="px-6 py-4 text-sm font-bold text-white">{totalEmployees}</td>
                  <td className="px-6 py-4 text-sm font-bold text-white">{formatCurrency(totalAmount)}</td>
                  <td className="px-6 py-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-100 bg-white">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{mockSalaryData.length}</span> of{' '}
                <span className="font-medium">{mockSalaryData.length}</span> results
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors">
                  Previous
                </button>
                <button className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
                  1
                </button>
                <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};