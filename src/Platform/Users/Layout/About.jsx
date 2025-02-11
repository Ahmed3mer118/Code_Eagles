import React, { useContext, useState } from "react";
import { DataContext } from "../Context/Context";
import { toast } from "react-toastify";


function About({ group, about, courses, loading }) {
  const { URLAPI, getTokenUser, handleJoinGroup } = useContext(DataContext);
  const [showForm, setShowForm] = useState(false); // حالة لإظهار/إخفاء الفورم
  const [requestType, setRequestType] = useState("Full Course"); // حالة لتحديد نوع الطلب
  const [note, setNote] = useState(""); // حالة لملاحظات المستخدم

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!getTokenUser) {
      toast.error("Please login to join the group.");
      return;
    }

    try {
      await handleJoinGroup(group._id, requestType, note);
      setShowForm(false); // إخفاء الفورم بعد الإرسال
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("Failed to submit request. Please try again.");
    }
  };

  return (
    <div
      className="container m-auto p-3 mt-4"
      style={{ width: "80%", lineHeight: "25px" }}
    >
      <h2 className="text-center">About the Course</h2>
      <section className="course-info mt-4">
        {about.map((item, index) => (
          <p key={index} className="mt-3 mb-3">
            🔹 {item}
          </p>
        ))}
        <button
          className="btn btn-success d-block m-auto mt-3 mb-3"
          onClick={() => setShowForm(!showForm)} // إظهار/إخفاء الفورم
          disabled={!loading}
          aria-label="Submit Form"
        >
          {!loading ? "Loading" : "Buy Now"}
        </button>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mt-4 mb-4  formBuy"
          >
            <h3 className="text-center mb-4">Join Group Request</h3>
            <div className="form-group">
              <label htmlFor="requestType " className="mb-2 mt-2">Request Type:</label>
              <select
                id="requestType"
                className="form-control"
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
              >
                <option value="Full Course">Full Course</option>
                <option value="Part Course">Part Course</option>
              </select>
            </div>
            {requestType !== "Full Course" && (
              <div className="form-group">
                <label htmlFor="note" className="mb-2 mt-2">Note:</label>
                <textarea
                  id="note"
                  className="form-control"
                  placeholder="Enter your note What do you want learn?"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows="4"
                ></textarea>
              </div>
            )}

            <button type="submit" className="btn btn-primary mt-3">
              Submit Request
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

export default About;
