import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useContext } from "react";
import { DataContext } from "../Users/Context/Context";
import { Helmet } from "react-helmet-async";
import { FaTrash } from "react-icons/fa";

function GetAllFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
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
        if (error.response && error.response.status === 404) {
          toast.info("No feedbacks found.");
        } else {
          toast.error("An error occurred while fetching feedbacks.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [URLAPI, getTokenAdmin]);

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) {
      return;
    }

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

  if (loading) {
    return (
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-12 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <ToastContainer position="top-right" />
      <Helmet>
          <title>Code Eagles |Feedback</title>
      </Helmet>

      <div className="row mb-4">
        <div className="col-12">
          <h1 className="display-4 fw-bold text-primary mb-3">Feedback</h1>
          <p className="lead text-muted">View and manage all feedback from users</p>
        </div>
      </div>

      {feedbacks.length === 0 ? (
        <div className="alert alert-info text-center">
              No feedback available.
        </div>
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover  table-bordered">
                <thead className="table-light">
                  <tr>
                    <th scope="col" className="text-center">#</th>
                    <th scope="col">Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">Feedback</th>
                    <th scope="col" className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(feedbacks) &&
                    feedbacks.map((feedback, index) => (
                      <tr key={index}>
                        <td className="text-center">{index + 1}</td>
                        <td>{feedback.name}</td>
                        <td>{feedback.email}</td>
                        <td>{feedback.feedback}</td>
                        <td className="text-center">
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteFeedback(feedback.userId)}
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GetAllFeedback;
