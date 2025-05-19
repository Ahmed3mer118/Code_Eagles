import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { DataContext } from "../../Users/Context/Context";
import { Helmet } from "react-helmet-async";
import { FaRegWindowClose } from "react-icons/fa";

function NewGroup() {
  const { URLAPI, getTokenAdmin } = useContext(DataContext);
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
  useEffect(()=>{
    try {
         axios.get(`${URLAPI}/api/users/all-instructors`, {
        headers: {
          Authorization: ` ${getTokenAdmin}`,
        },
      }).then((res)=>{
        setInstructors(res.data);
      })
    } catch (error) {
      toast.error("Failed to get instructors. Please try again.");
    }
  }, []);
  const saveToSessionStorage = (data) => {
    sessionStorage.setItem("newGroupData", JSON.stringify(data));
  };

  // Handle Add New Group
  const handleNewGroup = async (e) => {
    e.preventDefault();
    if (!getTokenAdmin) {
      toast.error("Unauthorized. Please log in.");
      return;
    } 

    try {
      await axios.post(`${URLAPI}/api/groups`, newGroup, {
        headers: {
          "Content-Type": "application/json",
          Authorization: ` ${getTokenAdmin}`,
        },
      });
      toast.success("Group created successfully!");
      setTimeout(() => navigate("/admin/allGroups"), 3000);
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
    updatedCourseDetails.push({ title: "", short_description: "", description: "", image: "" });
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
    <div className="container">
      <Helmet>
        <title>Code Eagles | New Group</title>
      </Helmet>
      <Toaster />
      <h1 className="text-center mb-4 mt-3">Create New Course</h1>
      <form onSubmit={handleNewGroup} style={{ width: "80%", margin: "auto" }}>
        <div className="row">
          {/* Title */}
          <div className="col-md-6">
            <label className="text-muted mb-2" htmlFor="GroupTitle">
              Group Title
            </label>
            <input
              type="text"
              name="title"
              placeholder="Group Title"
              className="form-control mb-3"
              value={newGroup.title}
              onChange={handleInputChange}
              required
              id="GroupTitle"
            />
          </div>

          {/* Course Type */}
          <div className="col-md-6">
            <label className="text-muted mb-2" htmlFor="courseType">
              Course Type
            </label>
            <select
              className="form-control mb-3"
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
          <>
            <label htmlFor="location" className="text-muted">
              Location
            </label>
            <input
              type="text"
              name="location"
              placeholder="Location"
              className="form-control mb-3"
              value={newGroup.location}
              onChange={handleInputChange}
              required
              id="location"
            />
          </>
        )}

        <div className="row">
          {/* Start Date */}
          <div className="col-md-6">
            <label className="text-muted mb-2">Start Date</label>
            <input
              type="date"
              name="start_date"
              className="form-control mb-3"
              value={newGroup.start_date}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* End Date */}
          <div className="col-md-6">
            <label className="text-muted mb-2">End Date</label>
            <input
              type="date"
              name="end_date"
              className="form-control mb-3"
              value={newGroup.end_date}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        <div className="row">   
          {/* Price */}
          <div className="col-md-6">
            <label className="text-muted mb-2">Price</label>
            <input
          type="number"
          name="price"
          placeholder="Price"
          className="form-control mb-3"
          value={newGroup.price}
          onChange={handleInputChange}
          required
        />
        </div>
        <div className="col-md-6">  

        <label className="text-muted mb-2">Select Instructor By ID</label>
        <select
          className="form-control mb-3"
          name="instructor_id"
          value={newGroup.instructor_id}
          onChange={handleInputChange}
        >
          {instructors.map((instructor, index) => (
            <option key={index} value={instructor._id}>{instructor.name}</option>
          ))}
        </select>
        </div>
        </div>


        {/* Instructor  */}
        <div className="row">
          <div className="col-md-6">
            <label className="text-muted mb-2" htmlFor="instructorName">
              Instructor Name
            </label>
            <input
              type="text"
              name="instructorName"
              placeholder="Instructor Name"
              className="form-control mb-3"
              value={newGroup.instructorName}
              onChange={handleInputChange}
              required
              id="instructorName"
            />
          </div>
          <div className="col-md-6">
            <label className="text-muted mb-2" htmlFor="fileImage">
              Instructor Image
            </label>
            <input
              type="file"
              className="form-control mb-3"
              onChange={(e) => handleImageChange(e, "instructor")}
              id="fileImage"
            />
          </div>
        </div>
        <div className="col-md-6">
          <label className="text-muted mb-2" htmlFor="courseImage">
            Course Image
          </label>
          <input
            type="url"
            className="form-control mb-3"
            onChange={(e) => handleImageChange(e, "course")}
            id="courseImage"
          />
        </div>
        <div className="row">
          <div className="col-md-6 col">
            {newGroup.instructorImage && (
              <img
                src={newGroup.instructorImage}
                alt="Preview"
                className="img-thumbnail mb-3 w-100"
                style={{ maxWidth: "200px" }}
              />
            )}
          </div>
          <div className="col-md-6 col">
            {newGroup.imageCourse && (
              <img
                src={newGroup.imageCourse}
                alt="Preview"
                className="img-thumbnail mb-3 w-100"
                style={{ maxWidth: "200px" }}
              />
            )}
          </div>
        </div>

        {/* Course Details */}
        {newGroup.course_details.map((detail, index) => (
          <div key={index} className="mb-4 p-3 border rounded">
            <div className="d-flex justify-content-between align-items-center">
              <h5>Course Detail {index + 1}</h5>
              <FaRegWindowClose
                onClick={() => handleRemoveCourseDetail(index)}
                style={{ cursor: "pointer", color: "red", fontSize: "20px" }}
              />
            </div>
            <input
              type="text"
              placeholder="Title"
              className="form-control mb-3"
              value={detail.title}
              onChange={(e) =>
                handleCourseDetailsChange(index, "title", e.target.value)
              }
              required
            />
            <input
              type="text"
              placeholder="Short Description"
              className="form-control mb-3"
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
              className="form-control mb-3"
              value={detail.image}
              onChange={(e) =>
                handleCourseDetailsChange(index, "image", e.target.value)
              }
              required
            />
            <textarea
              placeholder="Description"
              className="form-control mb-3"
              value={detail.description}
              onChange={(e) =>
                handleCourseDetailsChange(index, "description", e.target.value)
              }
              required
            />
          </div>
        ))}
        <button
          type="button"
          className="btn btn-secondary m-3"
          onClick={addCourseDetail}
        >
          Add Course Detail
        </button>

        {/* About Course */}
        {newGroup.about_course.map((about, index) => (
          <div key={index} className="mb-4 p-3 border rounded">
            <div className="d-flex justify-content-between align-items-center">
              <h4>About Course {index + 1}</h4>
              <span className="text-danger">
                <FaRegWindowClose
                  onClick={() => handleRemoveAboutCourse(index)}
                  style={{ cursor: "pointer", fontSize: "20px" }}
                />
              </span>
            </div>
            <textarea
              placeholder={`About Course Point ${index + 1}`}
              className="form-control"
              value={about}
              onChange={(e) => handleAboutCourseChange(index, e.target.value)}
              rows="2"
              required
            />
          </div>
        ))}
        <button
          type="button"
          className="btn btn-secondary m-3"
          onClick={addAboutCourse}
        >
          Add About Course
        </button>

        {/* Submit Button */}
        <div>
          <button type="submit" className="btn btn-primary m-3">
            Create Group
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewGroup;