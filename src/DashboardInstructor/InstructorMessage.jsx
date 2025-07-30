import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Helmet } from 'react-helmet-async';
import InstructorService from '../classes/InstructorService';
import AuthServices from '../classes/Auth';

function InstructorMessage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    message: "",
    sendTo: "", 
  });

  // Initialize services
  const authService = new AuthServices();
  const token = authService.getToken();
  const instructorService = new InstructorService(token);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!token) {
          toast.error("Please log in again");
          navigate("/auth/login");
          return;
        }

        const res = await instructorService.getMessages(groupId);
        setMessages(res.messages || []);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setMessages([]);
      }
    };
    
    if (groupId) {
      fetchMessages();
    }
  }, [groupId, navigate, token]);

  const handleChangeMessage = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!token) {
        toast.error("Please log in again");
        navigate("/auth/login");
        return;
      }

      const res = await instructorService.sendMessage(JSON.stringify(formData));
      if (res) {
        toast.success("Message sent successfully");
        setFormData({ message: "", sendTo: "" });
        
        // Refresh messages list
        const updatedMessages = await instructorService.getMessages(groupId);
        setMessages(updatedMessages.messages || []);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <Helmet>
        <title>Messages Management</title>
      </Helmet>

      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Messages Management</h2>

          <div className="bg-gray-50 rounded-lg p-6">
            <h5 className="text-lg font-semibold text-gray-900 mb-4">Send New Message</h5>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  id="message"
                  name="message"
                  rows="4"
                  placeholder="Write your message here..."
                  value={formData.message}
                  onChange={handleChangeMessage}
                  required
                ></textarea>
              </div>

              <div>
                <label htmlFor="sendTo" className="block text-sm font-medium text-gray-700 mb-2">
                  Send To
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

              <button 
                type="submit" 
                disabled={loading}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Previous Messages Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6">
          <h5 className="text-lg font-semibold text-gray-900 mb-4">Previous Messages</h5>
          
          {messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                    <div className="flex items-center mb-2 sm:mb-0">
                      <span className="text-sm font-medium text-gray-700 mr-2">To:</span>
                      <span className="text-sm text-gray-600 bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {msg.sendTo}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-sm font-medium text-gray-700">Message:</span>
                    <p className="text-sm text-gray-600 mt-1 bg-white p-3 rounded border">
                      {msg.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-500">No messages found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InstructorMessage;
