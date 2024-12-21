import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useContext } from "react";
import { DataContext } from "../Users/Context/Context";

function GetAllFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const { URLAPI, getTokenAdmin } = useContext(DataContext);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get(
          `${URLAPI}/api/users/get-all-feedback`,
          {
            headers: {
              Authorization: `${getTokenAdmin}`,
            },
          }
        );

        // تحقق من الحالة
        if (response.status === 200) {
          const feedbacks = response.data.feedbacks;

          if (feedbacks && feedbacks.length > 0) {
            setFeedbacks(feedbacks);
          } else {
            toast.info("No feedbacks available.");
          }
        } else {
          toast.error("Failed to load feedbacks.");
        }
      } catch (error) {
        // إذا كان هناك خطأ 404 أو أي خطأ آخر
        if (error.response && error.response.status === 404) {
          toast.info("No feedbacks found.");
        } else {
          toast.error("An error occurred while fetching feedbacks.");
        }
      }
    };

    fetchFeedbacks();
  }, []);

  // حذف فيدباك معين
  const handleDeleteFeedback = async (feedbackId) => {
    // console.log(feedbackId)
    try {
      await axios.delete(`${URLAPI}/api/users/${feedbackId}/feedback`, {
        headers: {
          Authorization: `${getTokenAdmin}`,
        },
      });
      toast.success("Feedback deleted successfully.");
      // تحديث القائمة بعد الحذف
      setFeedbacks((prevFeedbacks) =>
        prevFeedbacks.filter((feedback) => feedback.userId !== feedbackId)
      );
    } catch (error) {
      toast.error("Failed to delete feedback.");
    }
  };

  return (
    <div className="container mt-4">
      <ToastContainer />
      <h1 className="text-center">All Feedback</h1>
      {feedbacks.length === 0 ? (
        <p className="text-center">No feedback available.</p>
      ) : (
        <table className="table table-bordered mt-3">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Feedback</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(feedbacks) &&
              feedbacks.map((feedback, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{feedback.name}</td>
                  <td>{feedback.email}</td>
                  <td>{feedback.feedback}</td>
                  <td>
                    <span
                      className="text-danger"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleDeleteFeedback(feedback.userId)}
                    >
                      Delete
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default GetAllFeedback;
