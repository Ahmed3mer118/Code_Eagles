import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import AuthServices from "../../classes/Auth";
import AdminService from "../../classes/AdminService";
import InstructorService from "../../classes/InstructorService";

function Students() {
  const authServices = new AuthServices();
  const token = authServices.getToken();
  const URLAPI = authServices.URLAPI;
  const adminServices = new AdminService(token);
  const instructorService = new InstructorService(token);
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [statusFilter, setStatusFilter] = useState(""); 

  const navigate = useNavigate();

  const uniqueStatuses = [
    ...new Set(students.users?.map((s) => s.status).filter(Boolean)),
  ];

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await adminServices.getStudentInGroup(slug);
      setStudents(response);
      setLoading(false);
    } catch (error) {
      toast.error(error.message || "Failed to fetch students");
      setLoading(false);
    }
  };

  const handleDetails = (email) => {
    if (window.location.pathname.includes("/admin")) {
      navigate(`/dashboard/admin/allStudent/student/${email}`);
    } else {
      navigate(`/instructor/${slug}/student/${email}`);
    }
  };

  const filteredUsers = students.users?.filter((student) =>
    statusFilter ? student.status === statusFilter : true
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mt-6">
            <div className="flex flex-wrap gap-3 flex-1">
              <div className="bg-blue-50 dark:bg-blue-900/20 px-5 py-3 rounded-lg shadow-xs flex-1 min-w-[180px]">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Total Students
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {students.total || 0}
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 px-5 py-3 rounded-lg shadow-xs flex-1 min-w-[180px]">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Approved
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {students.approvedCount || 0}
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 px-5 py-3 rounded-lg shadow-xs flex-1 min-w-[180px]">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Special
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {students.specialCount || 0}
                </p>
              </div>
            </div>

            <div className="w-full sm:w-auto">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Filter by Status
                </label>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full sm:w-64 px-4 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 appearance-none"
                  >
                    <option value="">All Statuses</option>
                    {uniqueStatuses.map((status) => (
                      <option key={status} value={status} className="py-1">
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 pt-6 text-gray-700 dark:text-gray-300">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table of Students */}
      {filteredUsers?.length === 0 ? (
        <div className="bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200 px-4 py-6 rounded-lg text-center">
          <p className="mt-3 text-lg">No students available in this group</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 ">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {filteredUsers.map((student, index) => (
                  <tr key={student._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={`mailto:${student.email}`}
                        className="text-blue-600 dark:text-blue-400"
                      >
                        {student.email}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.status}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDetails(student.email)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Students;
