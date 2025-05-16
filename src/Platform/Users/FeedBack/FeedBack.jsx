import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DataContext } from "../Context/Context";
import { Helmet } from "react-helmet-async";
import { toast } from "react-hot-toast";
import UserService from "../../classes/UserService";


    function FeedBack() {
  const { getTokenUser } = useContext(DataContext);
  const [userService] = useState(new UserService(getTokenUser));
  const [feedbackList, setFeedbackList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await userService.getFeedback();
        setFeedbackList(response.feedbacks);
      } catch (err) {
        console.error("Error fetching feedback:", err);
        toast.error("Failed to load feedback");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [getTokenUser]);

  const nextFeedback = () => {
    if (currentIndex + 3 < feedbackList.length) {
      setCurrentIndex(currentIndex + 3);
    }
  };

  const prevFeedback = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 3);
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
    <>
      <Helmet>
        <title>Code Eagles </title>
      </Helmet>

      <div className="container-fluid py-5 ">
        <div className="container">
          <div className="row mb-5">
            <div className="col-12 text-center">
              <h1 className="display-4 fw-bold text-primary mb-3">Student Feedback</h1>
              <p className="lead text-muted">
                See what our students have to say about their learning experience
              </p>
            </div>
          </div>

          {feedbackList?.length > 0 ? (
            <>
              <div className="row g-4">
                {feedbackList
                  .slice(currentIndex, currentIndex + 3)
                  .map((feedback, index) => (
                    <div className="col-12 col-md-6 col-lg-4" key={index}>
                      <div className="card h-100 border-0 shadow-sm hover-shadow transition">
                        <div className="card-body p-4">
                          <div className="d-flex align-items-center mb-3">
                            <span className="badge bg-primary rounded-pill me-2 p-2">
                              {currentIndex + index + 1}
                            </span>
                            <h5 className="card-title mb-0 fw-bold">{feedback.name}</h5>
                          </div>
                          <p className="text-muted small mb-3">{feedback.email}</p>
                          <p className="card-text">{feedback.feedback}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="d-flex justify-content-between mt-5">
                <button
                  className="btn btn-outline-primary px-4 py-2"
                  onClick={prevFeedback}
                  disabled={currentIndex === 0}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Previous
                </button>
                <button
                  className="btn btn-primary px-4 py-2"
                  onClick={nextFeedback}
                  disabled={currentIndex + 3 >= feedbackList.length}
                >
                  Next
                  <i className="bi bi-arrow-right ms-2"></i>
                </button>
              </div>
            </>
          ) : (
            <div className="row mt-5">
              <div className="col-12 text-center">
                <div className="alert alert-info" role="alert">
                  <h4 className="alert-heading">No Feedback Available</h4>
                  <p className="mb-0">Be the first to share your experience!</p>
                </div>
              </div>
            </div>
          )}

          <div className="text-center mt-5">
            <Link to="/feedback" className="btn btn-success btn-lg px-3 py-2 fw-semibold">
              Add Your Feedback
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default FeedBack;
