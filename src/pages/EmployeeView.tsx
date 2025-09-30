import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Spinner } from "../ui/Spinner";

// Mock employee data (should be replaced with real API call)
const mockEmployees = [
  {
    id: 1,
    name: "MUSA ABUBAKAR SALISU",
    empId: "250043",
    designation: "Accountant",
    mobile: "08030408098",
    salary: 200000,
    email: "musa@email.com",
    joiningDate: "2022-01-01",
    nationalId: "1234567890",
    fatherName: "ABUBAKAR SALISU",
    motherName: "AISHA SALISU",
    bloodGroup: "O+",
    salaryType: "Monthly",
    grossAmount: 200000,
    bonus: 0,
    loan: 0,
    tax: 0,
    netSalary: 200000,
    bankName: "UBA",
    accountName: "MUSA ABUBAKAR SALISU",
    accountNo: "1234567890",
    address: "Kano, Nigeria",
    others: "",
    photo: "",
  },
  // ...add more mock employees as needed
];

export const EmployeeView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Simulate API fetch
    setTimeout(() => {
      const found = mockEmployees.find((e) => String(e.id) === String(id));
      if (found) {
        setEmployee(found);
        setLoading(false);
      } else {
        setEmployee(null);
        setError("Employee not found");
        setLoading(false);
      }
    }, 500);
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size={32} />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600">
        <div className="mb-2 font-semibold">{error}</div>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }
  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <div className="mb-2 font-semibold">No employee data</div>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      {/* Breadcrumb and header */}
      <div className="flex items-center text-sm text-gray-500 mb-2">
        <span>Dashboard</span>
        <span className="mx-2">/</span>
        <span>Employee</span>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-semibold">View</span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
        <h1 className="text-2xl font-bold text-gray-900">
          Employee Details Information
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Card: Employee Information */}
      <div className="bg-white rounded-lg shadow-card-hover border border-gray-200">
        <div className="bg-[#2563eb] rounded-t-lg px-6 py-3 text-white font-semibold text-lg tracking-wide">
          Employee Information
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Personal & Contact */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <div className="text-xs text-gray-500 font-medium">
                  Employee ID
                </div>
                <div className="font-semibold text-gray-900">
                  {employee.empId}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">
                  Designation
                </div>
                <div className="font-semibold text-gray-900">
                  {employee.designation}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">
                  Joining Date
                </div>
                <div className="font-semibold text-gray-900">
                  {employee.joiningDate || (
                    <span className="text-gray-400">N/A</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">
                  Full Name
                </div>
                <div className="font-semibold text-gray-900">
                  {employee.name}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">
                  Father's Name
                </div>
                <div className="font-semibold text-gray-900">
                  {employee.fatherName || (
                    <span className="text-gray-400">N/A</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">
                  Mother's Name
                </div>
                <div className="font-semibold text-gray-900">
                  {employee.motherName || (
                    <span className="text-gray-400">N/A</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">
                  Email Address
                </div>
                <div className="font-semibold text-gray-900">
                  {employee.email || <span className="text-gray-400">N/A</span>}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">
                  Mobile Number
                </div>
                <div className="font-semibold text-gray-900">
                  {employee.mobile}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">
                  National ID No
                </div>
                <div className="font-semibold text-gray-900">
                  {employee.nationalId || (
                    <span className="text-gray-400">N/A</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">
                  Blood Group
                </div>
                <div className="font-semibold text-gray-900">
                  {employee.bloodGroup || (
                    <span className="text-gray-400">N/A</span>
                  )}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-xs text-gray-500 font-medium">Address</div>
                <div className="font-semibold text-gray-900">
                  {employee.address || (
                    <span className="text-gray-400">N/A</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Photo and Salary */}
          <div className="flex flex-col gap-4 items-center justify-between">
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-500 font-medium mb-1">
                Employee Photo
              </div>
              <img
                src={employee.photo ? employee.photo : "/uploads/default.png"}
                alt={employee.name}
                className="h-28 w-28 rounded border object-cover bg-gray-50"
                onError={(e) => (e.currentTarget.src = "/uploads/default.png")}
              />
            </div>
            <div className="w-full mt-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <div className="text-xs text-gray-500 font-medium">
                    Salary Type
                  </div>
                  <div className="font-semibold text-gray-900">
                    {employee.salaryType || (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">
                    Salary
                  </div>
                  <div className="font-semibold text-gray-900">
                    {employee.salary?.toLocaleString() || (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Salary/Bank/Other Details Card */}
        <div className="border-t px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-xs text-gray-500 font-medium mb-1">
              Bank Name
            </div>
            <div className="font-semibold text-gray-900">
              {employee.bankName || <span className="text-gray-400">N/A</span>}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium mb-1">
              Account Name
            </div>
            <div className="font-semibold text-gray-900">
              {employee.accountName || (
                <span className="text-gray-400">N/A</span>
              )}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium mb-1">
              Account No
            </div>
            <div className="font-semibold text-gray-900">
              {employee.accountNo || <span className="text-gray-400">N/A</span>}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium mb-1">
              Gross Amount
            </div>
            <div className="font-semibold text-gray-900">
              {employee.grossAmount?.toLocaleString() || (
                <span className="text-gray-400">N/A</span>
              )}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium mb-1">Bonus</div>
            <div className="font-semibold text-gray-900">
              {employee.bonus?.toLocaleString() || (
                <span className="text-gray-400">N/A</span>
              )}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium mb-1">Loan</div>
            <div className="font-semibold text-gray-900">
              {employee.loan?.toLocaleString() || (
                <span className="text-gray-400">N/A</span>
              )}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium mb-1">Tax</div>
            <div className="font-semibold text-gray-900">
              {employee.tax?.toLocaleString() || (
                <span className="text-gray-400">N/A</span>
              )}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium mb-1">
              Net Salary
            </div>
            <div className="font-semibold text-gray-900">
              {employee.netSalary?.toLocaleString() || (
                <span className="text-gray-400">N/A</span>
              )}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium mb-1">Others</div>
            <div className="font-semibold text-gray-900">
              {employee.others || <span className="text-gray-400">N/A</span>}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 py-6 border-t bg-gray-50 rounded-b-lg">
          <Button
            variant="primary"
            onClick={() => navigate(`/hr/employee/edit/${employee.id}`)}
            className="min-w-[100px]"
          >
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="min-w-[100px]"
          >
            Print
          </Button>
        </div>
      </div>
    </div>
  );
};
