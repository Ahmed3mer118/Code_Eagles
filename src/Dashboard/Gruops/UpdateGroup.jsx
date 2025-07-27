import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import {
  FaRegWindowClose,
  FaPlus,
  FaTrash,
  FaSave,
  FaCheck,
} from "react-icons/fa";
import AuthServices from "../../classes/Auth";
import AdminService from "../../classes/AdminService";

function UpdateGroup() {
  const authServices = new AuthServices();
  const token = authServices.getToken();
  const adminServices = new AdminService(token);
  const { slug } = useParams();
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type_course: "online",
    location: "",
    start_date: "",
    end_date: "",
    price: 0,
    course_details: [],
    about_course: [],
    instructorName: "",
    instructor_id: "",
    imageCourse: "",
  });

  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(false);
  const isOffline = formData.type_course === "offline";

  // Fetch group and instructors data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const groupResponse = await adminServices.getGroupDetails(slug);
        const data = groupResponse;
        setFormData({
          title: data.title,
          type_course: data.type_course,
          location: data.location || "",
          start_date: data.start_date?.split("T")[0] || "",
          end_date: data.end_date?.split("T")[0] || "",
          price: data.price || 0,
          course_details: data.course_details || [],
          about_course: data.about_course || [],
          instructorName: data.instructorName || "",
          instructor_id: data.instructor_id || "",
          imageCourse: data.imageCourse || "",
        });

        const instructorsResponse = await adminServices.getAllInstrcutor();
        setInstructors(instructorsResponse);
      } catch (error) {
        toast.error("Failed to fetch data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, token]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value,
    }));
  };

  // Handle course type change
  const handleCourseTypeChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      type_course: value,
      location: value === "online" ? "" : prev.location,
    }));
  };

  // Handle course detail changes
  const handleCourseDetailChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedDetails = [...prev.course_details];
      updatedDetails[index] = { ...updatedDetails[index], [field]: value };
      return { ...prev, course_details: updatedDetails };
    });
  };

  // Handle about course changes
  const handleAboutCourseChange = (index, value) => {
    setFormData((prev) => {
      const updatedAbout = [...prev.about_course];
      updatedAbout[index] = value;
      return { ...prev, about_course: updatedAbout };
    });
  };

  // Add new course detail
  const addCourseDetail = () => {
    setFormData((prev) => ({
      ...prev,
      course_details: [
        ...prev.course_details,
        { title: "", short_description: "", description: "", image: "" },
      ],
    }));
  };

  // Remove course detail
  const removeCourseDetail = (index) => {
    setFormData((prev) => ({
      ...prev,
      course_details: prev.course_details.filter((_, i) => i !== index),
    }));
  };

  // Add new about course point
  const addAboutCourse = () => {
    setFormData((prev) => ({
      ...prev,
      about_course: [...prev.about_course, ""],
    }));
  };

  // Remove about course point
  const removeAboutCourse = (index) => {
    setFormData((prev) => ({
      ...prev,
      about_course: prev.about_course.filter((_, i) => i !== index),
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Unauthorized. Please log in.");
      return;
    }

    setLoading(true);

    try {
      await adminServices.updateGroup(slug, formData);
      toast.success("Group updated successfully!");
      setTimeout(() => navigate("/dashboard/admin/allGroups"), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update group");
    } finally {
      setLoading(false);
    }
  };

  // Delete group
  const handleToggleStatus = async () => {
    const confirmMessage = isActive
      ? "Are you sure you want to deactivate this group?"
      : "Are you sure you want to activate this group?";

    if (!window.confirm(confirmMessage)) return;

    try {
      const response = await adminServices.toggleGroupStatus(slug);
      const newStatus = response;
      setIsActive((prev) => !prev);
      // setIsActive(newStatus);
      toast.success(
        `Group ${newStatus ? "activated" : "deactivated"} successfully!`
      );
    } catch (error) {
      console.error("Error toggling group status:", error);
      toast.error("Failed to update group status");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Toaster position="top-center" />

      <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">
        Update Group
      </h1>

      {loading && !formData.title ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6"
        >
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Group Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            {/* Course Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Course Type
              </label>
              <select
                name="type_course"
                value={formData.type_course}
                onChange={handleCourseTypeChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            {/* Location (conditional) */}
            {isOffline && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required={isOffline}
                />
              </div>
            )}

            {/* Dates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            {/* Instructor and Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Instructor Name
              </label>
              <input
                type="text"
                name="instructorName"
                value={formData.instructorName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
                min="0"
              />
            </div>

            {/* Instructor Select */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Instructor
              </label>
              <select
                name="instructor_id"
                value={formData.instructor_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select an instructor</option>
                {instructors.map((instructor) => (
                  <option key={instructor._id} value={instructor._id}>
                    {instructor.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Image URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Course Image URL
              </label>
              <input
                type="url"
                name="imageCourse"
                value={formData.imageCourse}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Course Details */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center justify-between">
              Course Details
            </h3>

            {formData.course_details.map((detail, index) => (
              <div
                key={index}
                className="mb-6 p-4 border border-gray-200 rounded-lg dark:border-gray-700"
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-medium text-gray-800 dark:text-white">
                    Course Detail {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeCourseDetail(index)}
                    className="text-red-600 hover:text-red-800 dark:hover:text-red-400"
                  >
                    <FaTrash />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={detail.title}
                      onChange={(e) =>
                        handleCourseDetailChange(index, "title", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Short Description
                    </label>
                    <input
                      type="text"
                      value={detail.short_description}
                      onChange={(e) =>
                        handleCourseDetailChange(
                          index,
                          "short_description",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={detail.image}
                      onChange={(e) =>
                        handleCourseDetailChange(index, "image", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={detail.description}
                      onChange={(e) =>
                        handleCourseDetailChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      rows="3"
                      required
                    ></textarea>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addCourseDetail}
              className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              <FaPlus className="mr-1" /> Add Detail
            </button>
          </div>

          {/* About Course */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center justify-between">
              About Course
            </h3>

            {formData.about_course.map((about, index) => (
              <div
                key={index}
                className="mb-4 p-4 border border-gray-200 rounded-lg dark:border-gray-700"
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-medium text-gray-800 dark:text-white">
                    About Course Point {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeAboutCourse(index)}
                    className="text-red-600 hover:text-red-800 dark:hover:text-red-400"
                  >
                    <FaTrash />
                  </button>
                </div>
                <textarea
                  value={about}
                  onChange={(e) =>
                    handleAboutCourseChange(index, e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows="2"
                  required
                ></textarea>
              </div>
            ))}
            <button
              type="button"
              onClick={addAboutCourse}
              className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              <FaPlus className="mr-1" /> Add Point
            </button>
          </div>

          {/* Form Actions */}
          <div className="flex flex-wrap justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={handleToggleStatus}
              className={`px-6 py-2 rounded-md transition-colors flex items-center 
    ${
      isActive
        ? "bg-red-600 hover:bg-red-700 text-white"
        : "bg-green-600 hover:bg-green-700 text-white"
    }
  `}
            >
              {isActive ? (
                <FaTrash className="mr-2" />
              ) : (
                <FaCheck className="mr-2" />
              )}
              {isActive ? "Deactivate Group" : "Activate Group"}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Updating...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" /> Update Group
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default UpdateGroup;
