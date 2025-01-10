import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DataContext } from "../Context/Context";
import { useNavigate, useParams } from "react-router-dom";

function AddTask() {
  const { URLAPI, getTokenUser } = useContext(DataContext);

  const [taskData, setTaskData] = useState({
    submissionLink: "",
  });
  const [loading, setLoading] = useState(false);
  const { lecCourse, taskId } = useParams();
  const navigate = useNavigate();

  // send task by user
  const handleTaskSubmit = () => {
    if (!taskData.submissionLink.trim()) {
      toast.error("Please enter a valid submission link.");
      return;
    }

    setLoading(true); 
    axios
      .post(`${URLAPI}/api/lectures/${lecCourse}/submit-task/${taskId}`, taskData, {
        headers: { Authorization: `${getTokenUser}` },
      })
      .then(() => {
        toast.success("Task submitted successfully!");
        setTaskData({ submissionLink: "" });
        setTimeout(() => {
          window.history.back();
        }, 2500);
      })
      .catch((err) => {
        toast.error(
          "Error submitting task: " + err.response?.data?.message || err.message
        );
      })
      .finally(() => setLoading(false));
  };

  return (
    <>
      <ToastContainer />
      <div className="container mt-5 m-5">
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
            >
              {loading ? "Submitting..." : "Submit Task"}
            </button>
          </div>
          <span className="text-muted mt-3">Note : Please Enter Link Google Drive</span>
        </div>
      </div>
    </>
  );
}

export default AddTask;
