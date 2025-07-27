import axios from "axios";
import React, { useContext, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import UserService from "../../classes/UserService";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const userService = new UserService();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await userService.contactUs(formData);
      toast.success("Thank you for contacting us! We'll get back to you soon.");
      setTimeout(() => {
        setFormData({ name: "", email: "", message: "" });
        setLoading(false);
      }, 2000);
    } catch (error) {
      toast.error("Failed to send your message. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-white  py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Contact Us
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Have questions or feedback? We'd love to hear from you.
            </p>
          </div>

          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6 sm:p-8">
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Full Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      className="py-3 px-4 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your name"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                      className="py-3 px-4 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700"
                  >
                    How can we help you?
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      required
                      className="py-3 px-4 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your message..."
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading || formData.message.trim() === ""}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      loading || formData.message.trim() === ""
                        ? "opacity-70 cursor-not-allowed"
                        : ""
                    }`}
                    aria-label="Submit Form"
                  >
                    {loading ? (
                      <>
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
                        Sending...
                      </>
                    ) : (
                      "Submit Message"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Contact;