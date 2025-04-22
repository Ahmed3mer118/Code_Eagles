import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import { DataContext } from "../../Users/Context/Context";
import { MdClose } from "react-icons/md";
import { Helmet } from "react-helmet-async";

function GetAllMessage() {
  const { URLAPI, getTokenAdmin } = useContext(DataContext);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [showFormReply, setShowFormReply] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${URLAPI}/api/contact/contact-us/messages`, {
          headers: { Authorization: `${getTokenAdmin}` },
        });
        setLoading(false);
        setMessages(res.data.messages);
      } catch (error) {
        toast.error("Failed to fetch messages. Please try again.");
      }
    };
    fetchMessages();
  }, [getTokenAdmin, messages.isReplied]);

  const handleReplyChange = (e) => {
    setReply(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reply) {
      toast.error("Reply cannot be empty.");
      return;
    }
    try {
      await axios.post(
        `${URLAPI}/api/contact/contact-us/reply`,
        {
          messageId: currentMessage._id,
          adminReply: reply,
        },
        {
          headers: { Authorization: `${getTokenAdmin}` },
        }
      );
      toast.success("Reply sent successfully!");
      setReply("");
      setShowFormReply(false);
      setCurrentMessage(null);
    } catch (err) {
      toast.error("Error sending reply");
    }
  };

  const handleReplyClick = (message) => {
    setCurrentMessage(message);
    setReply("");
    setShowFormReply(!showFormReply);
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
      <Toaster position="top-center" />
      <Helmet>
        <title>All Messages</title>
      </Helmet>

      <div className="row mb-4">
        <div className="col-12">
          <h1 className="text-center mb-4">All Messages</h1>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="alert alert-info text-center">
          No messages available.
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(messages) &&
                    messages.map((message, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{message.name}</td>
                        <td>{message.email}</td>
                        <td>{message.message}</td>
                        <td>
                          <span
                            className={`badge ${
                              message.isReplied
                                ? "bg-success"
                                : "bg-danger"
                            }`}
                          >
                            {message.isReplied ? "Replied" : "Pending"}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleReplyClick(message)}
                            className="btn btn-primary btn-sm"
                          >
                            Reply
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

      {showFormReply && currentMessage && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reply to Message</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleReplyClick}
                ></button>
              </div>
              <div className="modal-body">
                <div className="card mb-4">
                  <div className="card-body">
                    <h6 className="card-title">Message Details</h6>
                    <p className="mb-1">
                      <strong>Name:</strong> {currentMessage.name}
                    </p>
                    <p className="mb-1">
                      <strong>Email:</strong> {currentMessage.email}
                    </p>
                    <p className="mb-1">
                      <strong>Date:</strong>{" "}
                      {currentMessage.created_at?.slice(0, 10)}
                    </p>
                    <p className="mb-1">
                      <strong>Message:</strong> {currentMessage.message}
                    </p>
                    {currentMessage.adminReplies ||
                      (currentMessage.adminReply.length > 0 && (
                        <p className="mb-0 text-success">
                          <strong>Previous Reply:</strong>{" "}
                          {currentMessage.adminReply}
                        </p>
                      ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="reply" className="form-label">
                      <strong>Your Reply:</strong>
                    </label>
                    <textarea
                      id="reply"
                      className="form-control"
                      rows="4"
                      value={reply}
                      onChange={handleReplyChange}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={reply.trim() === ""}
                  >
                    Send Reply
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GetAllMessage;
