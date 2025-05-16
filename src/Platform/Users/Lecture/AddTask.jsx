import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Toaster , toast } from "react-hot-toast";
import { DataContext } from "../Context/Context";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import UserService from "../../classes/UserService";
function AddTask() {
  const { getTokenUser } = useContext(DataContext);
  const [userService] = useState(new UserService(getTokenUser));
  const [taskData, setTaskData] = useState({
    submissionLink: "",
  });
  const [loading, setLoading] = useState(false);
  const { lecCourse, taskId } = useParams();
  const navigate = useNavigate();

  // send task by user
  const handleTaskSubmit = async () => {
    if (!taskData.submissionLink.trim()) {
      toast.error("Please enter a valid submission link.");
      return;
    }

    setLoading(true); 

    const response = await userService.submitTask(lecCourse, taskId, taskData);
    console.log(response.message)
    if (response) {
      toast.success("Task submitted successfully!");
      setTaskData({ submissionLink: "" });
      setTimeout(() => {
          window.history.back();
        }, 2500);
    } else {
      toast.error(response.message);
    }
  }

  return (
    <>
      <Toaster position="top-center" />
      <Helmet>
        <title>Add Task</title>
      </Helmet>
      <div className="container mt-5 mb-5">
        <div className="card shadow-sm p-4">
          <h1 className="text-center mb-4">Add a Task Link </h1>
          <div className="mb-3">
            <label htmlFor="submissionLink" className="form-label">
              Submission Link:
            </label>
            <input
              type="text"
              id="submissionLink"
              className="form-control"
              value={taskData.submissionLink}
              onChange={(e) =>
                setTaskData({ ...taskData, submissionLink: e.target.value })
              }
              placeholder="Enter submission link"
            />
          </div>
          <div className="text-center">
            <button
              onClick={handleTaskSubmit}
              className="btn btn-primary w-50"
              disabled={loading}
                aria-label="Submit Form"
            >
              {loading ? "Submitting..." : "Submit Task"}
            </button>
          </div>
          <span className="text-muted mt-3">Note : Please Enter Link Google Drive or Link GitHub</span>
        </div>
      </div>
    </>
  );
}

export default AddTask;
