import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import { FaRegWindowClose } from "react-icons/fa";
import AuthServices from "../../classes/Auth";
import AdminService from "../../classes/AdminService";
function NewGroup() {
  const authServices = new AuthServices();
  const token = authServices.getToken();
  const URLAPI = authServices.URLAPI;
  const adminServices = new AdminService(token);
  const [newGroup, setNewGroup] = useState({
    title: "",
    type_course: "online",
    location: "",
    start_date: "",
    end_date: "",
    price: "",
    course_details: [
      { title: "", short_description: "", description: "", image: "" },
    ],
    about_course: [],
    instructorName: "",
    instructorImage: "",
    instructor_id: "",
    imageCourse: "",
  });
  const [offline, setOffline] = useState(false);
  const navigate = useNavigate();
  const [previewImage, setPreviewImage] = useState(null);
  const [instructors, setInstructors] = useState([]);
  // Handle Get All Instructor
  useEffect(() => {
    const savedGroup = sessionStorage.getItem("newGroupData");
    if (savedGroup) {
      const parsedGroup = JSON.parse(savedGroup);
      setNewGroup(parsedGroup);
      setOffline(parsedGroup.type_course === "offline");
    }
  }, []);
  useEffect(() => {
    const fetchInstructor = async () => {
      try {
        const res = await adminServices.getAllInstrcutor();
        setInstructors(res);
      } catch (error) {
        toast.error("Failed to get instructors. Please try again.");
      }
    };
    fetchInstructor();
  }, []);
  const saveToSessionStorage = (data) => {
    sessionStorage.setItem("newGroupData", JSON.stringify(data));
  };

  // Handle Add New Group
  const handleNewGroup = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Unauthorized. Please log in.");
      return;
    }

    try {
      // await axios.post(`${URLAPI}/api/groups`, newGroup, {
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: ` ${token}`,
      //   },
      // });
      const res = await adminServices.createGroup(newGroup);
      if (res) {
        toast.success("Group created successfully!");
        setTimeout(() => navigate("/dashboard/admin/allGroups"), 3000);
      }
      sessionStorage.removeItem("newGroupData");
    } catch (error) {
      toast.error("Failed to create group. Please try again.");
      console.error("Error creating group:", error);
    }
  };

  const handleOffline = (e) => {
    const selectedValue = e.target.value;
    setNewGroup({ ...newGroup, type_course: selectedValue });
    setOffline(selectedValue === "offline");
    saveToSessionStorage({ ...newGroup, type_course: selectedValue });
  };

  // Handle Value in Input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedGroup = {
      ...newGroup,
      [name]: name === "price" ? Number(value) : value,
    };
    setNewGroup(updatedGroup);
    saveToSessionStorage({ ...newGroup, [name]: value });
  };

  // Handle Image Change
  const handleImageChange = (e, type) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    let file;
    for (let index = 0; index < e.target.files.length; index++) {
      file = e.target.files[index];
    }

    if (file) {
      const imageUrl = URL.createObjectURL(file);

      if (type === "instructor") {
        setNewGroup({ ...newGroup, instructorImage: imageUrl });
      } else if (type === "course") {
        setNewGroup({ ...newGroup, imageCourse: imageUrl });
      }
      setPreviewImage(imageUrl);
      saveToSessionStorage({ ...newGroup, [type]: imageUrl });
    }
  };
  // Handle Course Details Change
  const handleCourseDetailsChange = (index, field, value) => {
    const updatedCourseDetails = [...newGroup.course_details];
    updatedCourseDetails[index][field] = value;
    setNewGroup({ ...newGroup, course_details: updatedCourseDetails });
    saveToSessionStorage({ ...newGroup, course_details: updatedCourseDetails });
  };
  // Handle About Course Change
  const handleAboutCourseChange = (index, value) => {
    const updatedAboutCourse = [...newGroup.about_course];
    updatedAboutCourse[index] = value;
    setNewGroup({ ...newGroup, about_course: updatedAboutCourse });
    saveToSessionStorage({ ...newGroup, about_course: updatedAboutCourse });
  };

  // Add New Course Detail
  const addCourseDetail = () => {
    const updatedCourseDetails = [...newGroup.course_details];
    updatedCourseDetails.push({
      title: "",
      short_description: "",
      description: "",
      image: "",
    });
    setNewGroup({ ...newGroup, course_details: updatedCourseDetails });
    saveToSessionStorage({ ...newGroup, course_details: updatedCourseDetails });
  };

  // Add New About Course Point
  const addAboutCourse = () => {
    const updatedAboutCourse = [...newGroup.about_course];
    updatedAboutCourse.push("");
    setNewGroup({ ...newGroup, about_course: updatedAboutCourse });
    saveToSessionStorage({ ...newGroup, about_course: updatedAboutCourse });
  };

  // Remove Course Detail
  const handleRemoveCourseDetail = (index) => {
    const updatedCourseDetails = [...newGroup.course_details];
    updatedCourseDetails.splice(index, 1);
    setNewGroup({ ...newGroup, course_details: updatedCourseDetails });
    saveToSessionStorage({ ...newGroup, course_details: updatedCourseDetails });
  };

  // Remove About Course Point
  const handleRemoveAboutCourse = (index) => {
    const updatedAboutCourse = [...newGroup.about_course];
    updatedAboutCourse.splice(index, 1);
    setNewGroup({ ...newGroup, about_course: updatedAboutCourse });
    saveToSessionStorage({ ...newGroup, about_course: updatedAboutCourse });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Code Eagles | New Group</title>
      </Helmet>
      <Toaster position="top-center" />

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Create New Course
        </h1>

        <form
          onSubmit={handleNewGroup}
          className="bg-white shadow-md rounded-lg p-6 sm:p-8"
        >
          {/* Title and Course Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label
                htmlFor="GroupTitle"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Course Title
              </label>
              <input
                type="text"
                name="title"
                placeholder="Enter course title"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={newGroup.title}
                onChange={handleInputChange}
                required
                id="GroupTitle"
              />
            </div>

            <div>
              <label
                htmlFor="courseType"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Course Type
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                name="type_course"
                onChange={handleOffline}
                value={newGroup.type_course}
                id="courseType"
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>

          {/* Location (for Offline) */}
          {offline && (
            <div className="mb-6">
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Location
              </label>
              <input
                type="text"
                name="location"
                placeholder="Enter location"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={newGroup.location}
                onChange={handleInputChange}
                required
                id="location"
              />
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={newGroup.start_date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                name="end_date"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={newGroup.end_date}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Price and Instructor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="number"
                name="price"
                placeholder="Enter price"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={newGroup.price}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Instructor
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                name="instructor_id"
                value={newGroup.instructor_id}
                onChange={handleInputChange}
              >
                {instructors.map((instructor) => (
                  <option key={instructor._id} value={instructor._id}>
                    {instructor.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Instructor Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label
                htmlFor="instructorName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Instructor Name
              </label>
              <input
                type="text"
                name="instructorName"
                placeholder="Enter instructor name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={newGroup.instructorName}
                onChange={handleInputChange}
                required
                id="instructorName"
              />
            </div>

            <div>
              <label
                htmlFor="fileImage"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Instructor Image
              </label>
              <input
                type="file"
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                onChange={(e) => handleImageChange(e, "instructor")}
                id="fileImage"
              />
            </div>
          </div>

          {/* Course Image */}
          <div className="mb-6">
            <label
              htmlFor="courseImage"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Course Image URL
            </label>
            <input
              type="url"
              placeholder="Enter course image URL"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => handleImageChange(e, "course")}
              id="courseImage"
            />
          </div>

          {/* Image Previews */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {newGroup.instructorImage && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Instructor Preview
                </h3>
                <img
                  src={newGroup.instructorImage}
                  alt="Instructor preview"
                  className="rounded-md border border-gray-200 max-w-full h-auto max-h-48"
                />
              </div>
            )}
            {newGroup.imageCourse && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Course Preview
                </h3>
                <img
                  src={newGroup.imageCourse}
                  alt="Course preview"
                  className="rounded-md border border-gray-200 max-w-full h-auto max-h-48"
                />
              </div>
            )}
          </div>

          {/* Course Details */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Course Details
            </h2>
            {newGroup.course_details.map((detail, index) => (
              <div
                key={index}
                className="mb-4 p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-gray-800">
                    Detail {index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleRemoveCourseDetail(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md mb-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={detail.title}
                  onChange={(e) =>
                    handleCourseDetailsChange(index, "title", e.target.value)
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Short Description"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md mb-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={detail.short_description}
                  onChange={(e) =>
                    handleCourseDetailsChange(
                      index,
                      "short_description",
                      e.target.value
                    )
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Image URL"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md mb-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={detail.image}
                  onChange={(e) =>
                    handleCourseDetailsChange(index, "image", e.target.value)
                  }
                  required
                />
                <textarea
                  placeholder="Description"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={detail.description}
                  onChange={(e) =>
                    handleCourseDetailsChange(
                      index,
                      "description",
                      e.target.value
                    )
                  }
                  rows="3"
                  required
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addCourseDetail}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
            >
              Add Course Detail
            </button>
          </div>

          {/* About Course */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              About Course
            </h2>
            {newGroup.about_course.map((about, index) => (
              <div
                key={index}
                className="mb-4 p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-gray-800">
                    Point {index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleRemoveAboutCourse(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                <textarea
                  placeholder={`About course point ${index + 1}`}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={about}
                  onChange={(e) =>
                    handleAboutCourseChange(index, e.target.value)
                  }
                  rows="2"
                  required
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addAboutCourse}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
            >
              Add About Course
            </button>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-colors"
            >
              Create Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewGroup;
