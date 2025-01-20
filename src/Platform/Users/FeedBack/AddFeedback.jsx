import React, { useContext, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";

import { DataContext } from "../Context/Context";
import axios from "axios";
function AddFeedback() {
  const { URLAPI, getTokenUser } = useContext(DataContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    feedback: "",
  });
  useEffect(()=>{
    window.scrollTo(0,0)
  })

  const handleSubmit = (e) => {
    console.log(formData)
    e.preventDefault();
    if (getTokenUser) {
      axios
        .post(`${URLAPI}/api/users/submit-feedback`, formData)
        .then(() => {
          toast.success("Feedback submitted successfully! Thanks");
          setTimeout(() => {
            setFormData({
              name: "",
              email: "",
              feedback: "",
            });
          }, 2500);
        });
    } else {
      setTimeout(() => {
        toast.error("You must log in to submit feedback.");
      }, 1500);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="container mt-4 mb-4">
        <h2 className="text-center mb-4">Add Feedback</h2>
        <form onSubmit={handleSubmit} className="shadow p-4 rounded m-auto">
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Name
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
              }}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
              }}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="feedback" className="form-label">
              Feedback
            </label>
            <textarea
              className="form-control"
              id="feedback"
              name="feedback"
              rows="4"
              value={formData.feedback}
              onChange={(e) => {
                setFormData({ ...formData, feedback: e.target.value });
              }}
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={!getTokenUser || formData.feedback.trim() === ""}
            // disabled={getTokenUser || formData.feedback.trim() === ""}
              aria-label="Submit Form"
          >
            Submit Feedback
          </button>
          {!getTokenUser && (
            <p className="text-danger mt-2 text-center">
              Please log in to submit feedback.
            </p>
          )}
        </form>
      </div>
    </>
  );
}

export default AddFeedback;
