import React, { useContext, useEffect, useState } from "react";
import { Link, Outlet, useParams } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import AdminService from "../../classes/AdminService";
import InstructorService from "../../classes/InstructorService";
import AuthServices from "../../classes/Auth";
import { FaCheck, FaTrash } from "react-icons/fa";

function Lectures() {
  const authServices = new AuthServices();
  const token = authServices.getToken();
  const adminServices = new AdminService(token);
  const instructorService = new InstructorService(token);
  const { slug } = useParams();
  const [loading, setLoading] = useState(false);
  const [tableLecture, setTableLecture] = useState(false);
  const [lectures, setLectures] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [formData, setFormData] = useState({
    groupSlug: slug,
    title: "",
    description: "",
    article: "",
    resources: "",
  });

  useEffect(() => {
    if (token) {
      fetchLectures();
    } else {
      toast.error("Unauthorized. Please log in.");
    }
  }, [slug, tableLecture]);

  const fetchLectures = async () => {
    setLoading(true);
    try {
      if (window.location.pathname.includes("/dashboard")) {
        const response = await adminServices.getLectures(slug);
        setLectures(response.lectures);
        setLoading(false);
      } else {
        const response = await instructorService.getLectures(slug);
        setLectures(response.lectures);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching lectures:", error);
      // toast.error("Failed to fetch lectures");
      setLoading(false);
    }
  };

  const handleChangeLecture = (e) => {
    e.preventDefault();
    setTableLecture(!tableLecture);
  };

  const handleAddLecture = async (e) => {
    e.preventDefault();
    if (
      !formData.title ||
      !formData.description ||
      !formData.article ||
      !formData.resources
    ) {
      toast.error("Please fill in all required fields!");
      return;
    }

    try {
      let response;
      if (window.location.pathname.includes("/dashboard")) {
        response = await adminServices.createLecture(formData);
      } else {
        response = await instructorService.createLecture(formData);
      }
      if (response) {
        toast.success("Lecture created successfully!");
        setTableLecture(false);
        setFormData({
          groupSlug: "",
          title: "",
          description: "",
          article: "",
          resources: "",
        });
        fetchLectures();
      } else {
        throw new Error(response.message || "Failed to create lecture");
      }
    } catch (error) {
      // console.error("Error creating lecture:", error);
      toast.error(error.response?.data?.message || "Failed to create lecture");
    }
  };

  const handleDeleteLecture = async (slugLec) => {
    const confirmMessage = isActive
      ? "Are you sure you want to deactivate this lecture?"
      : "Are you sure you want to activate this lecture?";
    if (!window.confirm(confirmMessage)) return;

    try {
      if (window.location.pathname.includes("/dashboard")) {
        const response = await adminServices.toggleLectureStatus(slugLec);
        setIsActive((prev) => !prev);
        toast.success(
          `Lecture ${response ? "activated" : "deactivated"} successfully!`
        );
      } else {
        const response = await instructorService.toggleLectureStatus(slugLec);
        setIsActive((prev) => !prev);
        toast.success(
          `Lecture ${response ? "activated" : "deactivated"} successfully!`
        );
      }
      fetchLectures();
    } catch (error) {
      console.error("Error deleting lecture:", error);
      toast.error(error.message || "Failed to delete lecture");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-center" />

      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <>
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Lectures Management
            </h2>
            <div>
              <button
                className={`px-4 py-2 rounded-md mr-2 ${
                  tableLecture
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                } transition-colors`}
                onClick={handleChangeLecture}
              >
                {tableLecture ? "Show Lectures" : "New Lecture"}
              </button>
            </div>
          </div>

          {!tableLecture ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {!lectures || lectures.length === 0 ? (
                <div className="col-span-full">
                  <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-md text-center dark:bg-blue-900 dark:text-blue-200">
                    No lectures available. Create a new lecture to get started.
                  </div>
                </div>
              ) : (
                Array.isArray(lectures) &&
                lectures.map((lecture, index) => (
                
                  <div key={lecture._id} className="flex flex-col h-full">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full dark:bg-gray-800 dark:border-gray-700">
                      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                        <h5 className="font-medium text-gray-800 dark:text-white">
                          Lecture #{index + 1}
                        </h5>
                      </div>
                      <div className="p-4 flex-grow">
                        <h6 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
                          {lecture.title}
                        </h6>
                        <p className="text-gray-600 mb-3 dark:text-gray-400">
                          {lecture.description}
                        </p>

                        <div className="mb-2">
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            Article:
                          </span>
                          <span className="ml-1 text-gray-600 dark:text-gray-400">
                            {lecture.article}
                          </span>
                        </div>

                        {lecture.resources && (
                          <div className="mb-3">
                            <a
                              href={lecture.resources}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline flex items-center dark:text-blue-400"
                            >
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Lecture Resources
                            </a>
                          </div>
                        )}

                        <div className="mb-2">
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            Attendance:
                          </span>{" "}
                          <Link
                            to={`${
                              window.location.pathname.includes("/dashboard")
                                ? "/dashboard/admin"
                                : "/instructor"}/group/${slug}/lectures/${lecture.slugLec}/attendance`}
                            className="text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400"
                          >
                            {lecture.attendanceCount || 0}
                          </Link>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                        <div className="flex justify-between items-center gap-2 flex-wrap">
                          <Link
                            to={`/${
                              window.location.pathname.includes("/dashboard")
                                ? "/dashboard/admin"
                                : "/instructor"
                            }/group/${slug}/lectures/${
                              lecture.slugLec
                            }/newTask`}
                            className="px-3 py-1 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700 transition-colors"
                          >
                            Task
                          </Link>
                          <Link
                            to={`/${
                              window.location.pathname.includes("/dashboard")
                                ? "dashboard/admin"
                                : "instructor"
                            }/group/${slug}/lectures/${lecture.slugLec}/newQuiz`}
                            className="px-3 py-1 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700 transition-colors"
                          >
                            Quiz
                          </Link>
                          <Link
                            to={`/${
                              window.location.pathname.includes("/dashboard")
                                ? "/dashboard/admin"
                                : "/instructor"
                            }/group/${slug}/lectures/update/${lecture.slugLec}`}
                            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                          >
                            Update
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDeleteLecture(lecture.slugLec)}
                            className={`px-3 py-1 rounded-md transition-colors flex items-center 
                              ${
                                lecture.isDeleted
                                  ? "bg-red-600 hover:bg-red-700 text-white"
                                  : "bg-gray-600 hover:bg-gray-700 text-white"
                              }
                            `}
                          >
                            {lecture.isDeleted ? (
                              <FaTrash className="mr-2" />
                            ) : (
                              <FaCheck className="mr-2" />
                            )}
                            {lecture.isDeleted ? "Deactivate " : "Activate "}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* New Lecture Form */
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
              {/* Card Header */}
              <div className="px-4 py-3 bg-blue-600 text-white dark:bg-blue-700">
                <h5 className="font-medium">New Lecture</h5>
              </div>

              {/* Card Body */}
              <div className="p-4">
                <form
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  onSubmit={handleAddLecture}
                >
                  <div className="space-y-1">
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Enter lecture title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="article"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Article
                    </label>
                    <input
                      type="text"
                      id="article"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Enter article"
                      value={formData.article}
                      onChange={(e) =>
                        setFormData({ ...formData, article: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      rows="3"
                      placeholder="Enter lecture description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      required
                    ></textarea>
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label
                      htmlFor="resources"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Resources URL
                    </label>
                    <input
                      type="url"
                      id="resources"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Enter lecture resources URL"
                      value={formData.resources}
                      onChange={(e) =>
                        setFormData({ ...formData, resources: e.target.value })
                      }
                    />
                  </div>

                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Create Lecture
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      <Outlet />
    </div>
  );
}

export default Lectures;
