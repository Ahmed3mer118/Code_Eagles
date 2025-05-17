import React, { useState, useEffect, useContext } from 'react';
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { DataContext } from '../Users/Context/Context';
import { Helmet } from 'react-helmet-async';
import InstructorService from '../classes/InstructorService';
function InstructorMessage() {
  const { groupId } = useParams();
  const { URLAPI, getTokenInstructor } = useContext(DataContext);
  const instructorService = new InstructorService(URLAPI, getTokenInstructor);
  const [messages, setMessages] = useState([]);
  const [formData, setFormData] = useState({
    message: "",
    sendTo: "", 
  });

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!getTokenInstructor) {
          toast.error("Please log in again");
          navigate("/login");
          return;
        }
        const res = await axios.get(`${URLAPI}/api/instructor/get-group-messages/${groupId}`, {
          headers: {
            Authorization: `${getTokenInstructor}`,
          }
        });
        setMessages(res.data.messages || []);
      } catch (error) {
       setMessages([])
      }
    };
    fetchMessages();
  }, [groupId]);

  const handleChangeMessage = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const res = await instructorService.sendMessageToStudent(formData,groupId)
        if(res){
            toast.success("Message sent successfully");
            setFormData({ message: "", sendTo: "" });
        }
     
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="container py-4">
      <Helmet>
        <title>Messages Management</title>
      </Helmet>

      <div className="row mb-4">
        <div className="col-12">
          <h2 className="mb-4">Messages Management</h2>

          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-3">Send New Message</h5>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="message" className="form-label">Message</label>
                  <textarea
                    className="form-control"
                    id="message"
                    name="message"
                    rows="4"
                    placeholder="Write your message here..."
                    value={formData.message}
                    onChange={handleChangeMessage}
                    required
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label htmlFor="sendTo" className="form-label">Send To</label>
                  <select
                    className="form-select"
                    id="sendTo"
                    name="sendTo"
                    value={formData.sendTo}
                    onChange={handleChangeMessage}
                    required
                  >
                    <option value="">-- Select Group --</option>
                    <option value="approved">Approved Students</option>
                    <option value="special">Special Students</option>
                    <option value="approved+special">All (Approved + Special)</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="row">
          <div className="col-12">
            <h5 className="mb-3">Previous Messages</h5>
            <ul className="list-group">
              {messages.map((msg, index) => (
                <li key={index} className="list-group-item">
                  <strong>To:</strong> {msg.sendTo} <br />
                  <strong>Message:</strong> {msg.message} <br />
                  <small className="text-muted">Sent at: {new Date(msg.createdAt).toLocaleString()}</small>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {messages.length == 0 && (
        <div className="row">
          <div className="col-12">
            <h5 className="mb-3">No messages found</h5>
          </div>
        </div>
      )}
    </div>
  );
}

export default InstructorMessage;
