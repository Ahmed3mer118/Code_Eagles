import React, { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import UserService from "../../classes/UserService";
import AuthServices from "../../classes/Auth";

function AddFeedback() {
  const authServices = new AuthServices();
  const token = authServices.getToken();
  const [userService] = useState(new UserService(token));
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    feedback: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (token) {
      userService.submitFeedback(formData)
        .then(() => {
          toast.success("Feedback submitted successfully! Thank you.");
          setTimeout(() => {
            setFormData({
              name: "",
              email: "",
              feedback: "",
            });
            navigate("/");
          }, 2500);
        })
        .catch((err) => {
          toast.error(err.message || "Failed to submit feedback");
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    } else {
      toast.error("You must log in to submit feedback.");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Share Your Feedback
            </h2>
            <p className="mt-3 text-xl text-gray-600">
              We value your opinion and would love to hear about your experience
            </p>
          </div>

          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6 sm:p-8">
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Your Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="py-3 px-4 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="py-3 px-4 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">
                    Your Feedback
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="feedback"
                      name="feedback"
                      rows={5}
                      value={formData.feedback}
                      onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                      required
                      className="py-3 px-4 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Share your thoughts about your experience..."
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={!token || formData.feedback.trim() === "" || isSubmitting}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      !token || formData.feedback.trim() === "" || isSubmitting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    }`}
                    aria-label="Submit feedback"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      "Submit Feedback"
                    )}
                  </button>
                </div>

                {!token && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          You must be logged in to submit feedback
                        </h3>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default AddFeedback;