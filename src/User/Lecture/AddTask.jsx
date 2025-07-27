import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import UserService from "../../classes/UserService";
import AuthServices from "../../classes/Auth";
function AddTask() {
  const authServices = new AuthServices()
  const token = authServices.getToken()
  const [userService] = useState(new UserService(token));
  const [taskData, setTaskData] = useState({
    submissionLink: "",
  });
  const [loading, setLoading] = useState(false);
  const { slugLec, slugTask } = useParams();
  const navigate = useNavigate();

  // send task by user
  const handleTaskSubmit = async () => {
    try {

      if (!taskData.submissionLink.trim()) {
        toast.error("Please enter a valid submission link.");
        return;
      }
      setLoading(true);
      const response = await userService.submitTask(slugLec, slugTask, taskData);
      console.log(response)
      if (response) {
        toast.success("Task submitted successfully!");
        setTaskData({ submissionLink: "" });
        setTimeout(() => {
          window.history.back();
        }, 2500);
      }
    } catch (err) {
      console.log(err.message)
      toast.error(err?.error || err?.message);
      setLoading(false);
    }
  }

  return (
    <>
      <Toaster position="top-center" />
      <Helmet>
        <title>Add Task</title>
      </Helmet>
      <div className="max-w-2xl mx-auto my-8 px-4">
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Add a Task Link</h1>
            <p className="text-gray-600 mt-2">Submit your completed task for review</p>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="submissionLink" className="block text-sm font-medium text-gray-700 mb-2">
                Submission Link
              </label>
              <input
                type="url"
                id="submissionLink"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                value={taskData.submissionLink}
                onChange={(e) =>
                  setTaskData({ ...taskData, submissionLink: e.target.value })
                }
                placeholder="https://drive.google.com/... or https://github.com/..."
                pattern="https://.*"
              />
            </div>

            <div className="text-center">
              <button
                onClick={handleTaskSubmit}
                disabled={loading}
                className={`w-full sm:w-1/2 px-6 py-3 rounded-lg font-medium text-white transition-colors duration-200 ${loading
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
                aria-label="Submit task"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit Task'
                )}
              </button>
            </div>

            <div className="text-center text-sm text-gray-500 mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Note: Please enter a Google Drive or GitHub link
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AddTask;
