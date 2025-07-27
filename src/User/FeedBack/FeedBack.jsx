import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import Loading from "../shared/Loading";

function FeedBack() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setFeedbackList([
        {
          name: "Ahmed Mohamed",
          email: "ahmed@example.com",
          feedback: "The courses are well-structured and the instructors are very knowledgeable. I've improved my skills significantly!"
        },
        {
          name: "Mariam Ali",
          email: "mariam@example.com",
          feedback: "Excellent platform! The hands-on projects helped me gain real-world experience that I could apply immediately at work."
        },
        {
          name: "Omar Hassan",
          email: "omar@example.com",
          feedback: "The support team is very responsive and the community is helpful. Highly recommend Code Eagles to anyone looking to learn coding."
        },
        {
          name: "Omar Hassan",
          email: "omar@example.com",
          feedback: "The support team is very responsive and the community is helpful. Highly recommend Code Eagles to anyone looking to learn coding."
        }
      ]);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

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
      <Loading />
    );
  }

  return (
    <>
      <Helmet>
        <title> Code Eagles</title>
        <meta name="description" content="See what our students say about their learning experience at Code Eagles" />
      </Helmet>

      <div className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600">
                Student Feedback
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what our students have to say about their learning experience
            </p>
          </div>

          {feedbackList?.length > 0 ? (
            <>
              {/* Feedback Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {feedbackList.slice(currentIndex, currentIndex + 3).map((feedback, index) => (
                  <div 
                    key={index} 
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <span className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-600 font-bold mr-3">
                          {currentIndex + index + 1}
                        </span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{feedback.name}</h3>
                          <p className="text-sm text-gray-500">{feedback.email}</p>
                        </div>
                      </div>
                      <p className="text-gray-700 italic">"{feedback.feedback}"</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8">
                <button
                  onClick={prevFeedback}
                  disabled={currentIndex === 0}
                  className={`flex items-center px-4 py-2 rounded-lg ${currentIndex === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
                >
                  <FiArrowLeft className="mr-2" />
                  Previous
                </button>
                
                <div className="text-sm text-gray-500">
                  Showing {Math.min(currentIndex + 1, feedbackList.length)}-{Math.min(currentIndex + 3, feedbackList.length)} of {feedbackList.length}
                </div>
                
                <button
                  onClick={nextFeedback}
                  disabled={currentIndex + 3 >= feedbackList.length}
                  className={`flex items-center px-4 py-2 rounded-lg ${currentIndex + 3 >= feedbackList.length ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
                >
                  Next
                  <FiArrowRight className="ml-2" />
                </button>
              </div>
            </>
          ) : (
            <div className="max-w-2xl mx-auto bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-blue-800">No Feedback Available</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Be the first to share your experience!</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="text-center mt-12">
            <Link 
              to="/add-feedback" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Share Your Feedback
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default FeedBack;