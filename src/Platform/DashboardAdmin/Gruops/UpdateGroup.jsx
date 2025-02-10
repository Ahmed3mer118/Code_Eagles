import axios from "axios";
import React, { useContext, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { DataContext } from "../../Users/Context/Context";
import { FaRegWindowClose } from "react-icons/fa";

function UpdateGroup() {
  const { groupId } = useParams();
  const { URLAPI, getTokenAdmin } = useContext(DataContext);
  const [updateDataGroup, setUpdateDataGroup] = useState({
    title: "",
    type_course: "online",
    location: "",
    start_date: "",
    end_date: "",
    price: "",
    course_details: [],
    about_course: [],
    instructorName: "",
    imageCourse: "",
  });
  const [offline, setOffline] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch group data on component mount
  useEffect(() => {
    axios
      .get(`${URLAPI}/api/groups/${groupId}`, {
        headers: {
          Authorization: `${getTokenAdmin}`,
        },
      })
      .then((res) => {
        const data = res.data;
        setUpdateDataGroup({
          title: data.title,
          type_course: data.type_course,
          location: data.location || "",
          start_date: data.start_date ? data.start_date.split("T")[0] : "",
          end_date: data.end_date ? data.end_date.split("T")[0] : "",
          price: data.price || 0,
          course_details: data.course_details || [],
          about_course: data.about_course || [],
          instructorName: data.instructorName || [],
          imageCourse: data.imageCourse || [],
        });
        setOffline(data.type_course === "offline");
      })
      .catch((error) => {
        console.error("Error fetching group data:", error);
        toast.error("Failed to fetch group data. Please try again.");
      });
  }, [groupId, URLAPI, getTokenAdmin]);

  // Handle offline/online selection
  const handleOffline = (e) => {
    const selectedValue = e.target.value;
    setUpdateDataGroup({ ...updateDataGroup, type_course: selectedValue });
    setOffline(selectedValue === "offline");
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateDataGroup({
      ...updateDataGroup,
      [name]: name === "price" ? Number(value) : value,
    });
  };

  // Handle course details changes
  const handleCourseDetailsChange = (index, field, value) => {
    const updatedCourseDetails = [...updateDataGroup.course_details];
    updatedCourseDetails[index][field] = value;
    setUpdateDataGroup({
      ...updateDataGroup,
      course_details: updatedCourseDetails,
    });
  };

  // Handle about course changes
  const handleAboutCourseChange = (index, value) => {
    const updatedAboutCourse = [...updateDataGroup.about_course];
    updatedAboutCourse[index] = value;
    setUpdateDataGroup({
      ...updateDataGroup,
      about_course: updatedAboutCourse,
    });
  };

  // Add new course detail
  const addCourseDetail = () => {
    setUpdateDataGroup({
      ...updateDataGroup,
      course_details: [
        ...updateDataGroup.course_details,
        { title: "", short_description: "", description: "", image: "" },
      ],
    });
  };

  // Remove course detail
  const handleRemoveCourseDetail = (index) => {
    setUpdateDataGroup({
      ...updateDataGroup,
      course_details: updateDataGroup.course_details.filter(
        (_, i) => i !== index
      ),
    });
  };

  // Add new about course point
  const addAboutCourse = () => {
    setUpdateDataGroup({
      ...updateDataGroup,
      about_course: [...updateDataGroup.about_course, ""],
    });
  };

  // Remove about course point
  const handleRemoveAboutCourse = (index) => {
    setUpdateDataGroup({
      ...updateDataGroup,
      about_course: updateDataGroup.about_course.filter((_, i) => i !== index),
    });
  };

  // Handle update group
  const handleUpdateGroup = async (e) => {
    e.preventDefault();

    if (!getTokenAdmin) {
      toast.error("Unauthorized. Please log in.");
      return;
    }
    const updateGroup = {
      title: updateDataGroup.title,
      type_course: updateDataGroup.type_course,
      location: updateDataGroup.location,
      start_date: updateDataGroup.start_date,
      end_date: updateDataGroup.end_date,
      price: updateDataGroup.price,
      course_details: updateDataGroup.course_details,
      about_course: updateDataGroup.about_course,
      instructorName: updateDataGroup.instructorName,
    };

    setLoading(true);
    console.log(updateGroup);
    try {
      await axios.put(`${URLAPI}/api/groups/${groupId}`, updateGroup, {
        headers: {
          Authorization: `${getTokenAdmin}`,
        },
      });
      toast.success("Group updated successfully!");
      setTimeout(() => {
        navigate("/admin/allGroups");
      }, 3500);
    } catch (error) {
      console.error("Error updating group:", error);
      toast.error("Failed to update group. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete group
  const handleDeleteGroup = async () => {
    if (!getTokenAdmin) {
      toast.error("Unauthorized. Please log in.");
      return;
    }

    try {
      await axios.delete(`${URLAPI}/api/groups/${groupId}`, {
        headers: {
          Authorization: `${getTokenAdmin}`,
        },
      });
      toast.success("Group deleted successfully!");
      setTimeout(() => {
        navigate("/admin/allGroups");
      }, 3500);
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error("Failed to delete group. Please try again.");
    }
  };

  return (
    <div className="container">
      <ToastContainer />
      <h1 className="text-center mb-4 mt-3">Update Group</h1>
      <form
        onSubmit={handleUpdateGroup}
        style={{ width: "80%", margin: "auto" }}
      >
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
              value={updateDataGroup.title}
              onChange={handleInputChange}
              required
              id="GroupTitle"
            />
          </div>

          {/* Course Type */}
          <div className="col-md-6">
            <label className="text-muted mb-2">Course Type</label>
            <select
              className="form-control mb-3"
              name="type_course"
              onChange={handleOffline}
              value={updateDataGroup.type_course}
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>

        {/* Location (for Offline) */}
        {offline && (
          <input
            type="text"
            name="location"
            placeholder="Location"
            className="form-control mb-3"
            value={updateDataGroup.location}
            onChange={handleInputChange}
            required
          />
        )}

        <div className="row">
          {/* Start Date */}
          <div className="col-md-6">
            <label className="text-muted mb-2">Start Date</label>
            <input
              type="date"
              name="start_date"
              className="form-control mb-3"
              value={updateDataGroup.start_date}
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
              value={updateDataGroup.end_date}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        {/* Price */}
        <div className="row">
          <div className="col-md-6">
            <label className="text-muted mb-2">Instructor</label>
            <input
              type="text"
              name="instructorName"
              placeholder="Instructor Name"
              className="form-control mb-3"
              value={updateDataGroup.instructorName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="text-muted mb-2">Price</label>
            <input
              type="number"
              name="price"
              placeholder="Price"
              className="form-control mb-3"
              value={updateDataGroup.price}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        <label className="text-muted mb-2">Image Course</label>
        <input
          type="url"
          name="imageCourse"
          placeholder="imageCourse"
          className="form-control mb-3"
          value={updateDataGroup.imageCourse}
          onChange={handleInputChange}
          required
        />

        {/* Course Details */}
        {updateDataGroup.course_details.map((detail, index) => (
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
        {updateDataGroup.about_course.map((about, index) => (
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

        {/* Buttons */}
        <div className="d-flex flex-wrap">
          <button
            className="btn btn-success col-lg-2 col-md-4 col-sm-10 col m-2"
            type="submit"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update"}
          </button>
          <button
            className="btn btn-danger col-lg-2 col-md-4 col-sm-10 col m-2"
            onClick={(e) => {
              e.preventDefault();
              handleDeleteGroup();
            }}
          >
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}

export default UpdateGroup;
