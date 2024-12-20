import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DataContext } from "../Context/Context";

function FeedBack() {
  const { URLAPI, getTokenUser } = useContext(DataContext);
  const [feedbackList, setFeedbackList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false); // Assuming you want to show feedback by default

  useEffect(() => {
    axios.get(`${URLAPI}/api/users/get-all-feedback`).then((res) => {
      setFeedbackList(res.data.feedbacks);
      // setShowFeedback(res.data.feedbacks.length)
    });
  }, [URLAPI, getTokenUser]);

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

  return (
    <>
      {feedbackList .length > 0 && (
        <div className="container mt-5 mb-4">
          <h1 className="text-center mb-4">Feedback</h1>

          <div className="row g-4">
            {/* Display 3 feedbacks per row */}
            {feedbackList
              .slice(currentIndex, currentIndex + 3)
              .map((feedback, index) => (
                <div className="col-md-4" key={index}>
                  <div className="card shadow-lg h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3">
                        <span className="badge bg-primary me-2">
                          {currentIndex + index + 1}
                        </span>
                        <strong>Name: {feedback.name}</strong>
                      </div>
                      <strong>Email: {feedback.email}</strong>
                      <p className="mt-3">{feedback.feedback}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className="d-flex justify-content-between mt-3">
            <button
              className="btn btn-secondary"
              onClick={prevFeedback}
              disabled={currentIndex === 0}
            >
              Previous
            </button>
            <button
              className="btn btn-success"
              onClick={nextFeedback}
              disabled={currentIndex + 3 >= feedbackList.length}
            >
              Next
            </button>
          </div>

        
        </div>
      )}
        {/* Link to Add Feedback */}
        <div className="mt-2 text-center">
            <Link to={"/feedback"}>
              <button className="btn btn-success m-2">Add Feedback</button>
            </Link>
          </div>
    </>
  );
}

export default FeedBack;
