import axios from "axios";
import React, { useContext, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { DataContext } from "../../Users/Context/Context";
function Contact() {
  const { URLAPI } = useContext(DataContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${URLAPI}/api/contact/contact-us`, formData);
      toast.success("Thank You For Contacting Us");
      setTimeout(() => {
        setFormData({ name: "", email: "", message: "" }); // إعادة تعيين الحقول
        setLoading(false);
      }, 2000);
    } catch (error) {
      toast.error("Failed to send your message. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="container mt-5 mb-5">
        <h2 className="text-center mb-4">Contact us</h2>
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
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="message" className="form-label">
              How can we help you?
            </label>
            <textarea
              className="form-control"
              id="message"
              name="message"
              rows="4"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading || formData.message.trim() === ""}
          >
            {loading ? "Sending..." : "Submit"}
          </button>
        </form>
      </div>
    </>
  );
}

export default Contact;
