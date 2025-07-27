import React, { useContext, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import AuthServices from "../../../classes/Auth";
import { useNavigate, useParams } from "react-router-dom";
import UserService from "../../../classes/UserService";

function About({ about }) {
  const authServices = new AuthServices();
  const token = authServices.getToken();
  const userService = new UserService(token);
  const [showForm, setShowForm] = useState(false);
  const [requestType, setRequestType] = useState("Full Course");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const { slug } = useParams();
  // const [groupId , setGroupId ] = useState('')
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Please login to join the group.");
      setTimeout(() => {
        if (window.confirm("If you want to go to login page, click ok.")) {
          sessionStorage.setItem("redirectLocation", window.location.href);
          navigate("/auth/login");
        }
      }, 2500);
      return;
    }

    try {

      setLoading(true);
      try {
        const user = await userService.getUserById();
        const response = await userService.getGroupById(slug);

        const userGroups = user.groups;

        const FilterMember = userGroups.filter(
          (element) => element.slug === slug
        );

        for (let i = 0; i < FilterMember.length; i++) {
          const element = FilterMember[i];

          if (element.status === "approved") {
            toast.promise("You are already a member of this group.");
            return;
          } else {
            toast.success(
              "You have already sent a request. Please wait for approval."
            );
            return;
          }
        }

        // Send the join request
        const joinRes = {
          groupSlug: response.slug,
          requestType: requestType === "Full Course" ? "join" : "invite",
          note,
        };
        await userService.joinGroupRequest(joinRes);

        toast.success(
          "Your request to join has been sent successfully. Please wait for the request to be accepted."
        );
        setShowForm(false);
        return;
      } catch (err) {
        toast.error(err.message);
        return;
      } finally {
        setLoading(false);
      }

    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("Failed to submit request. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" />

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 sm:p-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
            About the Course
          </h2>

          <div className="space-y-4">
            {about.map((item, index) => (
              <div key={index} className="flex items-start">
                <span className="text-emerald-500 mr-2 mt-1">•</span>
                <p className="text-gray-700 text-lg">{item}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => setShowForm(!showForm)}
              disabled={loading}
              className={`px-6 py-3 rounded-lg font-medium text-white ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 transition-colors duration-200"
              }`}
              aria-label="Enroll in course"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  Loading...
                </span>
              ) : (
                "Enroll Now"
              )}
            </button>

            {/* Popup Form */}
            {showForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                  <form onSubmit={handleSubmit} className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-2xl font-semibold text-gray-800">
                        Enrollment Request
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="text-gray-500 hover:text-gray-700"
                        aria-label="Close enrollment form"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="mb-6">
                      <label
                        htmlFor="requestType"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Enrollment Option
                      </label>
                      <select
                        id="requestType"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        value={requestType}
                        onChange={(e) => setRequestType(e.target.value)}
                      >
                        <option value="Full Course">Full Course</option>
                        <option value="Part Course">Partial Course</option>
                      </select>
                    </div>

                    {requestType !== "Full Course" && (
                      <div className="mb-6">
                        <label
                          htmlFor="note"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Specific Requests
                        </label>
                        <textarea
                          id="note"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="Please specify which parts of the course you're interested in..."
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          rows="4"
                        />
                      </div>
                    )}

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                      >
                        Submit Request
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
