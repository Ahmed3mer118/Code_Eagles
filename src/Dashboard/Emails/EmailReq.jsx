import React, { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import AuthServices from "../../classes/Auth";
import AdminService from "../../classes/AdminService";
import InstructorService from "../../classes/InstructorService";

function EmailReq() {
  const authServices = new AuthServices();
  const token = authServices.getToken();
  const isAdmin = window.location.pathname.includes("/admin");

  const service = isAdmin
    ? new AdminService(token)
    : new InstructorService(token);

  const [requests, setRequests] = useState([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [lectures, setLectures] = useState([]);
  const [lecturesSpecial, setSelectedLectures] = useState([]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await service.getPendingUsers();
      setRequests(response || []);
    } catch (error) {
      if (error.response?.status === 404) {
        console.warn(error);
      }
      toast("No Request Emails Found", { icon: "⚠️" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const removeRequest = (emailToRemove) => {
    setRequests((prev) =>
      prev.filter((item) => item.email !== emailToRemove)
    );
  };

  const handleAccept = async (email, slug, requestStatus) => {
    const status =
      requestStatus === "invite"
        ? "accept-special-user"
        : "accept-join-request";

    const payload =
      requestStatus === "invite"
        ? {
            groupSlug: slug,
            userEmail: email,
            lecturesSpecial: lecturesSpecial,
          }
        : {
            groupSlug: slug,
            userEmail: email,
          };

    try {
      const response = await service.acceptRequest(status, payload);
      toast.success(response.message || "Request Accepted");
      removeRequest(email);
    } catch (error) {
      toast.error(
        `Error: ${error.response?.data?.message || error.message}`
      );
    }
  };

  const handleRejected = async (email, groupSlug) => {
    try {
      setLoading(true);
      const response = await service.rejectRequest({ groupSlug, userEmail: email });
      toast.success(response.message || "Request Rejected");
      removeRequest(email);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchLectures = async (groupSlug) => {
    try {
      const response = await service.getLectures(groupSlug);
      setLectures(response.lectures);
    } catch (error) {
      console.error("Error fetching lectures:", error);
    }
  };

  const handleLectureSelection = (lectureId) => {
    setSelectedLectures((prev) =>
      prev.includes(lectureId)
        ? prev.filter((id) => id !== lectureId)
        : [...prev, lectureId]
    );
  };

  if (loading) {
    return (
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>All Request Emails</title>
      </Helmet>
      <Toaster position="top-center" />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">
          All Request Emails
        </h1>

        {requests && requests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                    {item.userName || "No Name"}
                  </h3>

                  <div className="space-y-2 mb-4">
                  <div className="flex items-start">
                      <span className="font-medium text-gray-700 dark:text-gray-300 w-24">
                        Email:
                      </span>
                      <span className="text-gray-800 dark:text-white">
                        {item.email || "No Email Title"}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-medium text-gray-700 dark:text-gray-300 w-24">
                        Group:
                      </span>
                      <span className="text-gray-800 dark:text-white">
                        {item.groupName || "No Group Title"}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-medium text-gray-700 dark:text-gray-300 w-24">
                        Start Date:
                      </span>
                      <span className="text-gray-800 dark:text-white">
                        {item.start_date?.slice(0, 10) || "No Start Date"}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-medium text-gray-700 dark:text-gray-300 w-24">
                        Status:
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.requestType === "invite"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : item.requestType === "join"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {item.requestType}
                      </span>
                    </div>
                    {item.note && (
                      <div className="flex items-start">
                        <span className="font-medium text-gray-700 dark:text-gray-300 w-24">
                          Note:
                        </span>
                        <span className="text-gray-800 dark:text-white">
                          {item.note}
                        </span>
                      </div>
                    )}
                  </div>

                  {item.requestType === "invite" && (
                    <div className="mb-4">
                      <button
                        onClick={() => fetchLectures(item.groupSlug)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm mb-3"
                      >
                        Select Lectures
                      </button>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {lectures.map((lecture) => (
                          <div
                            key={lecture.slugLec}
                            className="flex items-center p-2 border border-gray-200 rounded-lg dark:border-gray-700"
                          >
                            <input
                              type="checkbox"
                              id={lecture.slugLec}
                              checked={lecturesSpecial.includes(lecture.slugLec)}
                              onChange={() =>
                                handleLectureSelection(lecture.slugLec)
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                            />
                            <label
                              htmlFor={lecture.slugLec}
                              className="ml-2 text-sm text-gray-800 dark:text-gray-300"
                            >
                              <span className="font-medium">
                                {lecture.title}
                              </span>{" "}
                              - {lecture.description}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-3 pt-2">
                    <button
                      onClick={() =>
                        handleAccept(
                          item.email,
                          item.groupSlug,
                          item.requestType
                        )
                      }
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex-1"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejected(item.email, item.groupSlug)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex-1"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-md text-center dark:bg-blue-900 dark:text-blue-200">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              ></path>
            </svg>
            <p className="mt-2">No Request Emails Found</p>
          </div>
        )}
      </div>
    </>
  );
}

export default EmailReq;
