import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  CreditCard as Edit3,
  Printer,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Building2,
  Calendar,
  DollarSign,
  Users,
  Heart,
  Hash,
  Briefcase,
  ChevronRight,
} from "lucide-react";

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
];

const InfoField: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
  currency?: boolean;
}> = ({ icon, label, value, currency = false }) => (
  <div className="group flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50/80 transition-all duration-200">
    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center text-amber-600 group-hover:from-amber-200 group-hover:to-amber-100 transition-all duration-200">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="font-semibold text-gray-900 break-words">
        {value ? (
          currency ? (
            `₦${Number(value).toLocaleString()}`
          ) : (
            String(value)
          )
        ) : (
          <span className="text-gray-400 italic">Not provided</span>
        )}
      </div>
    </div>
  </div>
);

const SectionCard: React.FC<{
  title: string;
  children: React.ReactNode;
  className?: string;
  gradient?: string;
}> = ({
  title,
  children,
  className = "",
  gradient = "from-amber-600 to-amber-700",
}) => (
  <div
    className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${className}`}
  >
    <div className={`bg-gradient-to-r ${gradient} px-6 py-4`}>
      <h3 className="text-white font-semibold text-lg tracking-wide">
        {title}
      </h3>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

export const EmployeeView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            Loading employee details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {error || "No employee data"}
          </h3>
          <p className="text-gray-600 mb-6">
            The employee you're looking for could not be found.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white px-6 py-3 rounded-xl font-medium hover:from-amber-700 hover:to-amber-800 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-500 mb-6">
          <span className="hover:text-gray-700 cursor-pointer transition-colors">
            Dashboard
          </span>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="hover:text-gray-700 cursor-pointer transition-colors">
            Employee
          </span>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-amber-600 font-medium">View Details</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Employee Profile
            </h1>
            <p className="text-gray-600">
              Comprehensive view of employee information and details
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Employee Header Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-orange-600 px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 overflow-hidden">
                  <img
                    src={
                      employee.photo ||
                      "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400"
                    }
                    alt={employee.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400";
                    }}
                  />
                </div>
              </div>
              <div className="flex-1 text-white">
                <h2 className="text-2xl font-bold mb-2">{employee.name}</h2>
                <div className="flex flex-wrap items-center gap-4 text-white/90">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    <span className="font-medium">ID: {employee.empId}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    <span className="font-medium">{employee.designation}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">
                      Joined: {employee.joiningDate}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Personal Information */}
          <div className="lg:col-span-4">
            <SectionCard
              title="Personal Information"
              gradient="from-blue-600 to-blue-700"
            >
              <div className="space-y-1">
                <InfoField
                  icon={<User className="w-4 h-4" />}
                  label="Full Name"
                  value={employee.name}
                />
                <InfoField
                  icon={<Users className="w-4 h-4" />}
                  label="Father's Name"
                  value={employee.fatherName}
                />
                <InfoField
                  icon={<Users className="w-4 h-4" />}
                  label="Mother's Name"
                  value={employee.motherName}
                />
                <InfoField
                  icon={<MapPin className="w-4 h-4" />}
                  label="Address"
                  value={employee.address}
                />
                <InfoField
                  icon={<Heart className="w-4 h-4" />}
                  label="Blood Group"
                  value={employee.bloodGroup}
                />
              </div>
            </SectionCard>
          </div>

          {/* Contact Information */}
          <div className="lg:col-span-4">
            <SectionCard
              title="Contact Information"
              gradient="from-green-600 to-green-700"
            >
              <div className="space-y-1">
                <InfoField
                  icon={<Mail className="w-4 h-4" />}
                  label="Email Address"
                  value={employee.email}
                />
                <InfoField
                  icon={<Phone className="w-4 h-4" />}
                  label="Mobile Number"
                  value={employee.mobile}
                />
                <InfoField
                  icon={<CreditCard className="w-4 h-4" />}
                  label="National ID"
                  value={employee.nationalId}
                />
              </div>
            </SectionCard>
          </div>

          {/* Job Information */}
          <div className="lg:col-span-4">
            <SectionCard
              title="Job Information"
              gradient="from-purple-600 to-purple-700"
            >
              <div className="space-y-1">
                <InfoField
                  icon={<Hash className="w-4 h-4" />}
                  label="Employee ID"
                  value={employee.empId}
                />
                <InfoField
                  icon={<Briefcase className="w-4 h-4" />}
                  label="Designation"
                  value={employee.designation}
                />
                <InfoField
                  icon={<Calendar className="w-4 h-4" />}
                  label="Joining Date"
                  value={employee.joiningDate}
                />
                <InfoField
                  icon={<DollarSign className="w-4 h-4" />}
                  label="Salary Type"
                  value={employee.salaryType}
                />
                <InfoField
                  icon={<DollarSign className="w-4 h-4" />}
                  label="Base Salary"
                  value={employee.salary}
                  currency
                />
              </div>
            </SectionCard>
          </div>

          {/* Financial Information */}
          <div className="lg:col-span-8">
            <SectionCard
              title="Financial & Banking Information"
              gradient="from-emerald-600 to-emerald-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <div className="space-y-1">
                  <InfoField
                    icon={<Building2 className="w-4 h-4" />}
                    label="Bank Name"
                    value={employee.bankName}
                  />
                  <InfoField
                    icon={<User className="w-4 h-4" />}
                    label="Account Name"
                    value={employee.accountName}
                  />
                  <InfoField
                    icon={<CreditCard className="w-4 h-4" />}
                    label="Account Number"
                    value={employee.accountNo}
                  />
                  <InfoField
                    icon={<DollarSign className="w-4 h-4" />}
                    label="Gross Amount"
                    value={employee.grossAmount}
                    currency
                  />
                </div>
                <div className="space-y-1">
                  <InfoField
                    icon={<DollarSign className="w-4 h-4" />}
                    label="Bonus"
                    value={employee.bonus}
                    currency
                  />
                  <InfoField
                    icon={<DollarSign className="w-4 h-4" />}
                    label="Loan Deduction"
                    value={employee.loan}
                    currency
                  />
                  <InfoField
                    icon={<DollarSign className="w-4 h-4" />}
                    label="Tax Deduction"
                    value={employee.tax}
                    currency
                  />
                  <InfoField
                    icon={<DollarSign className="w-4 h-4" />}
                    label="Net Salary"
                    value={employee.netSalary}
                    currency
                  />
                </div>
              </div>
              {employee.others && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <InfoField
                    icon={<Hash className="w-4 h-4" />}
                    label="Additional Notes"
                    value={employee.others}
                  />
                </div>
              )}
            </SectionCard>
          </div>

          {/* Employee Photo */}
          <div className="lg:col-span-4">
            <SectionCard
              title="Employee Photo"
              gradient="from-indigo-600 to-indigo-700"
            >
              <div className="text-center">
                <div className="w-48 h-48 mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-inner">
                  <img
                    src={
                      employee.photo ||
                      "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400"
                    }
                    alt={employee.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400";
                    }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-3 font-medium">
                  {employee.name}
                </p>
              </div>
            </SectionCard>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate(`/hr/employee/edit/${employee.id}`)}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-amber-700 hover:to-amber-800 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 min-w-[140px]"
          >
            <Edit3 className="w-5 h-5" />
            Edit Profile
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-3 bg-white border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 min-w-[140px]"
          >
            <Printer className="w-5 h-5" />
            Print Details
          </button>
        </div>
      </div>
    </div>
  );
};
