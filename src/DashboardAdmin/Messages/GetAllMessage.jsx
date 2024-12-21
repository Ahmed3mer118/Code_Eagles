import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DataContext } from "../../Users/Context/Context";
import { Link } from "react-router-dom";

function GetAllMessage() {
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState({ reply: "" });
  const { URLAPI, getTokenAdmin } = useContext(DataContext);

  // Fetch all messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `${URLAPI}/api/contact/contact-us/messages`,
          {
            headers: { Authorization: `${getTokenAdmin}` },
          }
        );
        setMessages(res.data.messages);
      } catch (error) {
        toast.error("Failed to fetch messages. Please try again.");
      }
    };
    fetchMessages();
  }, [URLAPI, getTokenAdmin]);

  // Handle reply to a message
  const handleReply = async (messageId) => {
    if (!reply.reply) {
      toast.error("Reply cannot be empty.");
      return;
    }
    console.log(reply.reply)

    // try {
    //   await axios.post(
    //     `${URLAPI}/api/contact/contact-us/reply`,
    //     { id: messageId, reply: reply[messageId] },
    //     { headers: { Authorization: `${getTokenAdmin}` } }
    //   );
    //   toast.success("Reply sent successfully.");
    //   setReply((prev) => ({ ...prev, [messageId]: "" })); // Clear reply input
    // } catch (error) {
    //   toast.error("Failed to send reply. Please try again.");
    // }
  };

  return (
    <div className="container mt-4">
      <ToastContainer />
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
              <th>Reply</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(messages) &&
              messages.reverse().map((message, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{message.name}</td>
                  <td>{message.email}</td>
                  <td>{message.message}</td>
                  <td>
                    {/* <div className="d-flex align-items-center">
                      <input
                        type="text"
                        className="form-control me-2"
                        placeholder="Write your reply"
                      
                        onChange={(e) =>
                          setReply({ ...reply, reply: e.target.value })
                        }
                      />
                      <button
                        className="btn btn-success"
                        onClick={() => handleReply(message.id)}
                      >
                        Send
                      </button>
                    </div> */}
                    <Link to={`/admin/get-all-message-by-admin/replay`}>
                    Replay</Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default GetAllMessage;
