import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DataContext } from "../../Users/Context/Context";
import { MdClose } from "react-icons/md";
import { Helmet } from "react-helmet-async";

function GetAllMessage() {
  const { URLAPI, getTokenAdmin } = useContext(DataContext);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentMessage, setCurrentMessage] = useState(null); // Store the current message being replied to
  const [showFormReply, setShowFormReply] = useState(false);

  // Fetch all messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${URLAPI}/api/contact/contact-us/messages`, {
          headers: { Authorization: `${getTokenAdmin}` },
        });
        setMessages(res.data.messages);
        console.log(res.data.messages);
      } catch (error) {
        toast.error("Failed to fetch messages. Please try again.");
      }
    };
    fetchMessages();
  }, [ getTokenAdmin,messages.isReplied]);

  const handleReplyChange = (e) => {
    setReply(e.target.value);
  };

  // Handle reply to a message
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



  return (
    <div className="container mt-4 position-relative">
      <ToastContainer />
      <Helmet>
        <title>All Messages</title>
      </Helmet>
      <h1 className="text-center">All Messages</h1>
      {messages.length === 0 ? (
        <p className="text-center">No messages available.</p>
      ) : (
        <table className="table table-bordered mt-3">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Message</th>
              <th>Status</th>
              <th>Reply</th>
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
                  <td
                    className={
                      message.isReplied == false
                        ? "text-danger"
                        : "text-success"
                    }
                  >
                    {message.isReplied ? "True" : "False"}
                  </td>
                  <td>
                    <span
                      onClick={() => handleReplyClick(message)}
                      style={{ cursor: "pointer" }}
                    >
                      Reply
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
      {showFormReply && currentMessage && (
        <div
          className="container mt-3 me-2"
          style={{
            position: "absolute",
            top: "0",
            backgroundColor: "white",
            boxShadow: "0 9px 21px #999",
            padding: "30px",
            maxWidth: "800px",
            marginRight: "10px",
          }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="text-center mb-3">Reply to Message</h2>
            <MdClose
              style={{ cursor: "pointer", fontSize: "25px" }}
              onClick={handleReplyClick}
            />
          </div>
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Name: {currentMessage.name}</h5>
              <p className="card-text">
                Email: <b>{currentMessage.email}</b>
              </p>
              <p className="card-text">
                Date: <b>{currentMessage.created_at?.slice(0, 10)}</b>
              </p>
              <p className="card-text">
                Message: <b>{currentMessage.message}</b>
              </p>
              <p className="card-text">
                {currentMessage.adminReplies ||currentMessage.adminReply.length > 0  && (
                  <b className={"text-success"}>
                    Admin Reply : {currentMessage.adminReply}
                  </b>
                )}
              </p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="form-group">
              <label htmlFor="reply" className="mb-2">
                <b>Your Reply:</b>
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
              className="btn btn-primary mt-3"
              disabled={ reply.trim() === ""}
              onClick={handleSubmit}
            >
              Send Reply
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default GetAllMessage;
