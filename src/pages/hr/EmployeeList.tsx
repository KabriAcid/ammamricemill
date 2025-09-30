import React, { useState } from 'react';
import { Plus, CreditCard as Edit, Trash2, Printer, User, Upload } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { FilterBar } from '../../components/ui/FilterBar';
import { Modal } from '../../components/ui/Modal';
import { Employee } from '../../types';

const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      name: 'John Doe',
      empId: 'EMP001',
      designation: 'Mill Manager',
      mobile: '+1234567890',
      email: 'john@ricemill.com',
      salary: 50000,
      salaryType: 'monthly',
      joiningDate: '2024-01-01',
      grossAmount: 50000,
      bonus: 5000,
      loan: 0,
      tax: 2500,
      netSalary: 52500,
      absence: 0,
      bankName: 'ABC Bank',
      accountName: 'John Doe',
      accountNo: '1234567890',
      address: '123 Main St, City',
      nationalId: 'ID123456789',
      fatherName: 'Robert Doe',
      motherName: 'Jane Doe',
      bloodGroup: 'O+',
      others: '',
      photoUrl: undefined,
      isActive: true,
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z'
    }
  ]);

  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [designationFilter, setDesignationFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    empId: '',
    designation: '',
    mobile: '',
    email: '',
    salary: 0,
    salaryType: 'monthly' as 'monthly' | 'daily',
    joiningDate: '',
    grossAmount: 0,
    bonus: 0,
    loan: 0,
    tax: 0,
    netSalary: 0,
    absence: 0,
    bankName: '',
    accountName: '',
    accountNo: '',
    address: '',
    nationalId: '',
    fatherName: '',
    motherName: '',
    bloodGroup: '',
    others: '',
    photoUrl: '',
    isActive: true
  });

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         employee.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         employee.mobile.includes(searchQuery);
    const matchesDesignation = !designationFilter || employee.designation === designationFilter;
    return matchesSearch && matchesDesignation;
  });

  const totalPages = Math.ceil(filteredEmployees.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + pageSize);

  const columns = [
    { key: 'id', label: '#', width: '80px' },
    { 
      key: 'photoUrl', 
      label: 'Photo', 
      width: '80px',
      render: (value: string) => (
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          {value ? (
            <img src={value} alt="Employee" className="w-full h-full object-cover" />
          ) : (
            <User className="w-5 h-5 text-gray-400" />
          )}
        </div>
      )
    },
    { key: 'name', label: 'Employee Name', sortable: true },
    { key: 'empId', label: 'Employee ID', sortable: true },
    { key: 'designation', label: 'Designation' },
    { key: 'mobile', label: 'Mobile' },
    { 
      key: 'salary', 
      label: 'Salary', 
      render: (value: number, item: Employee) => (
        <span>₹{value.toLocaleString()} <small className="text-gray-500">/{item.salaryType}</small></span>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  const designations = Array.from(new Set(employees.map(emp => emp.designation)));

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      empId: employee.empId,
      designation: employee.designation,
      mobile: employee.mobile,
      email: employee.email || '',
      salary: employee.salary,
      salaryType: employee.salaryType,
      joiningDate: employee.joiningDate,
      grossAmount: employee.grossAmount,
      bonus: employee.bonus,
      loan: employee.loan,
      tax: employee.tax,
      netSalary: employee.netSalary,
      absence: employee.absence,
      bankName: employee.bankName || '',
      accountName: employee.accountName || '',
      accountNo: employee.accountNo || '',
      address: employee.address || '',
      nationalId: employee.nationalId || '',
      fatherName: employee.fatherName || '',
      motherName: employee.motherName || '',
      bloodGroup: employee.bloodGroup || '',
      others: employee.others || '',
      photoUrl: employee.photoUrl || '',
      isActive: employee.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (employeeIds: string[]) => {
    if (confirm(`Are you sure you want to delete ${employeeIds.length} employee(s)?`)) {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setEmployees(prev => prev.filter(employee => !employeeIds.includes(employee.id)));
        setSelectedEmployees([]);
      } catch (error) {
        console.error('Error deleting employees:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingEmployee) {
        setEmployees(prev => prev.map(employee => 
          employee.id === editingEmployee.id 
            ? { ...employee, ...formData, updatedAt: new Date().toISOString() }
            : employee
        ));
      } else {
        const newEmployee: Employee = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setEmployees(prev => [...prev, newEmployee]);
      }
      
      setShowModal(false);
      setEditingEmployee(null);
      resetForm();
    } catch (error) {
      console.error('Error saving employee:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      empId: '',
      designation: '',
      mobile: '',
      email: '',
      salary: 0,
      salaryType: 'monthly',
      joiningDate: '',
      grossAmount: 0,
      bonus: 0,
      loan: 0,
      tax: 0,
      netSalary: 0,
      absence: 0,
      bankName: '',
      accountName: '',
      accountNo: '',
      address: '',
      nationalId: '',
      fatherName: '',
      motherName: '',
      bloodGroup: '',
      others: '',
      photoUrl: '',
      isActive: true
    });
  };

  const handleNew = () => {
    setEditingEmployee(null);
    resetForm();
    setShowModal(true);
  };

  const handlePhotoUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFormData(prev => ({ ...prev, photoUrl: e.target?.result as string }));
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const activeEmployees = employees.filter(emp => emp.isActive).length;
  const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage employee information and records.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card hover>
          <div className="text-center">
            <p className="text-3xl font-bold text-primary-600">{employees.length}</p>
            <p className="text-sm text-gray-500">Total Employees</p>
          </div>
        </Card>
        <Card hover>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{activeEmployees}</p>
            <p className="text-sm text-gray-500">Active Employees</p>
          </div>
        </Card>
        <Card hover>
          <div className="text-center">
            <p className="text-3xl font-bold text-secondary-600">₹{totalSalary.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Monthly Salary</p>
          </div>
        </Card>
        <Card hover>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{designations.length}</p>
            <p className="text-sm text-gray-500">Designations</p>
          </div>
        </Card>
      </div>

      <FilterBar
        onSearch={setSearchQuery}
        placeholder="Search by name, ID, or mobile..."
      >
        <div className="flex items-center space-x-2">
          <select
            value={designationFilter}
            onChange={(e) => setDesignationFilter(e.target.value)}
            className="input-base"
          >
            <option value="">All Designations</option>
            {designations.map(designation => (
              <option key={designation} value={designation}>{designation}</option>
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
          <Button variant="outline" size="sm" icon={Printer} onClick={() => window.print()}>
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
          }
        }}
        selection={{
          selectedItems: selectedEmployees,
          onSelectionChange: setSelectedEmployees
        }}
        actions={{
          onEdit: handleEdit
        }}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingEmployee ? 'Edit Employee' : 'New Employee'}
        size="xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <div className="text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-4">
                {formData.photoUrl ? (
                  <img src={formData.photoUrl} alt="Employee" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <Button variant="outline" size="sm" icon={Upload} onClick={handlePhotoUpload}>
                Upload Photo
              </Button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="input-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID *</label>
              <input
                type="text"
                value={formData.empId}
                onChange={(e) => setFormData(prev => ({ ...prev, empId: e.target.value }))}
                className="input-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Designation *</label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                className="input-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mobile *</label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                className="input-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="input-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Joining Date *</label>
              <input
                type="date"
                value={formData.joiningDate}
                onChange={(e) => setFormData(prev => ({ ...prev, joiningDate: e.target.value }))}
                className="input-base"
                required
              />
            </div>
          </div>

          {/* Salary & Financial Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Salary Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Salary *</label>
                <input
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData(prev => ({ ...prev, salary: Number(e.target.value) }))}
                  className="input-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Salary Type *</label>
                <select
                  value={formData.salaryType}
                  onChange={(e) => setFormData(prev => ({ ...prev, salaryType: e.target.value as 'monthly' | 'daily' }))}
                  className="input-base"
                >
                  <option value="monthly">Monthly</option>
                  <option value="daily">Daily</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gross Amount</label>
                <input
                  type="number"
                  value={formData.grossAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, grossAmount: Number(e.target.value) }))}
                  className="input-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bonus</label>
                <input
                  type="number"
                  value={formData.bonus}
                  onChange={(e) => setFormData(prev => ({ ...prev, bonus: Number(e.target.value) }))}
                  className="input-base"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loan</label>
                <input
                  type="number"
                  value={formData.loan}
                  onChange={(e) => setFormData(prev => ({ ...prev, loan: Number(e.target.value) }))}
                  className="input-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tax</label>
                <input
                  type="number"
                  value={formData.tax}
                  onChange={(e) => setFormData(prev => ({ ...prev, tax: Number(e.target.value) }))}
                  className="input-base"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Net Salary</label>
                <input
                  type="number"
                  value={formData.netSalary}
                  onChange={(e) => setFormData(prev => ({ ...prev, netSalary: Number(e.target.value) }))}
                  className="input-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Absence Days</label>
                <input
                  type="number"
                  value={formData.absence}
                  onChange={(e) => setFormData(prev => ({ ...prev, absence: Number(e.target.value) }))}
                  className="input-base"
                />
              </div>
            </div>

            <h3 className="text-lg font-medium text-gray-900 pt-4">Bank Information</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                className="input-base"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
                <input
                  type="text"
                  value={formData.accountName}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                  className="input-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account No</label>
                <input
                  type="text"
                  value={formData.accountNo}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountNo: e.target.value }))}
                  className="input-base"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Additional Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="input-base"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">National ID</label>
              <input
                type="text"
                value={formData.nationalId}
                onChange={(e) => setFormData(prev => ({ ...prev, nationalId: e.target.value }))}
                className="input-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Father's Name</label>
              <input
                type="text"
                value={formData.fatherName}
                onChange={(e) => setFormData(prev => ({ ...prev, fatherName: e.target.value }))}
                className="input-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mother's Name</label>
              <input
                type="text"
                value={formData.motherName}
                onChange={(e) => setFormData(prev => ({ ...prev, motherName: e.target.value }))}
                className="input-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData(prev => ({ ...prev, bloodGroup: e.target.value }))}
                className="input-base"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'active' }))}
                className="input-base"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Others</label>
            <textarea
              value={formData.others}
              onChange={(e) => setFormData(prev => ({ ...prev, others: e.target.value }))}
              className="input-base"
              rows={2}
              placeholder="Additional notes or information"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button variant="outline" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={loading}>
            {editingEmployee ? 'Update' : 'Save'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeeList;