import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import Loading from "../shared/Loading";
import UserService from "../../classes/UserService"


function FeedBack() {
  const userService = new UserService()

  const [feedbackList, setFeedbackList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {

      setLoading(true)
      try {
        const res = await userService.getFeedback()
        setFeedbackList(res)
        setLoading(false)
      } catch (err) {
        console.log(err)
        setLoading(false)
      }
    }
    fetchFeedback()
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {feedbackList.slice(currentIndex, currentIndex + 3).map((feedback, index) => (
                  <div
                    key={feedback._id}
                    className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-5">
                      {/* Header with avatar and user info */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex-shrink-0">
                          <span className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-50 text-blue-600 font-semibold">
                            {feedback.name?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{feedback.name}</h3>
                          <p className="text-sm text-gray-500 truncate">{feedback.email}</p>
                        </div>
                      </div>

                      {/* Course information */}
                      <div className="mb-4">
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                          </svg>
                          <span className="font-medium">{feedback.groupSlug?.replace(/-/g, ' ')}</span>
                        </div>
                      </div>

                      {/* Feedback content */}
                      <div className="mb-4">
                        <p className="text-gray-700 mb-2">"{feedback.userFeedback}"</p>
                      </div>

                      {/* Rating and approval status */}
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                            </svg>
                          ))}
                          <span className="ml-1 text-gray-600">{feedback.rating}/5</span>
                        </div>
                        {/* <span className={`px-2 py-1 rounded-full text-xs font-medium ${feedback.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {feedback.isApproved ? 'Approved' : 'Pending'}
                        </span> */}
                      </div>

                      {/* Timestamp */}
                      <div className="mt-3 text-xs text-gray-400">
                        Posted: {new Date(feedback.createdAt).toLocaleDateString()}
                      </div>
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