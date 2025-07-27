import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import AuthServices from "../../classes/Auth";
import AdminService from "../../classes/AdminService";
import InstructorService from "../../classes/InstructorService";

function Tasks() {
  const { slug, slugLecture } = useParams();
  const [tasksState, setTasksState] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const authServices = new AuthServices();
  const token = authServices.getToken();
  const adminServices = new AdminService(token);
  const instructorService = new InstructorService(token);

  useEffect(() => {
    if (window.location.pathname.includes("/admin")) {
      if (!token) {
        toast.error("Unauthorized. Please log in.");
        return;
      }
    }
  }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let response;
        if (window.location.pathname.includes("/admin")) {
          response = await adminServices.getTasks(slug);
        } else {
          response = await instructorService.getTasks(slug);
        }

        if (response && response.tasks) {
          setTasksState(response.tasks);
        } else {
          setTasksState([]);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast.error("Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, token]);

  return (
    <>
      <Helmet>
        <title>Code Eagle - Tasks</title>
      </Helmet>
      <Toaster position="top-center" />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Lecture
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Submissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Due Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {tasksState.length > 0 ? (
                tasksState.map((task) => (
                  <tr
                    key={task.slugTask}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {task.lectureTitle || "Untitled Lecture"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {task.taskDescription || "No description"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/${
                          window.location.pathname.includes("/admin")
                            ? "dashboard/admin"
                            : "instructor"
                        }/group/${slug}/lecture/${task.lectureSlug}/tasks/${
                          task.slugTask
                        }/submissions`}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
                      >
                        {task.submissions?.length || 0} submissions
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm ${
                          new Date(task.endDate) < new Date()
                            ? "text-red-600 dark:text-red-400"
                            : "text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        {task.endDate
                          ? new Date(task.endDate).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "No due date"}
                        {new Date(task.endDate) < new Date() && (
                          <span className="ml-1 text-xs text-red-500">
                            (Overdue)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/${
                          window.location.pathname.includes("/admin")
                            ? "dashboard/admin"
                            : "instructor"
                        }/group/${slug}/lecture/${task.lectureSlug}/tasks/updateTask/${task.slugTask}`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3 transition-colors"
                      >
                        View Details
                      </Link>
                      {/* <button
                        onClick={() => handleDeleteTask(task.slugTask)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      >
                        Delete
                      </button> */}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg
                        className="w-16 h-16 text-gray-400 dark:text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        ></path>
                      </svg>
                      <p className="mt-4 text-gray-500 dark:text-gray-400">
                        No tasks available
                      </p>
                  
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default Tasks;
