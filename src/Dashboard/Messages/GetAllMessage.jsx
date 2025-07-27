import React, { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { MdClose, MdReply, MdEmail, MdPerson, MdAccessTime } from "react-icons/md";
import { Helmet } from "react-helmet-async";
import AdminService from "../../classes/AdminService";
import AuthServices from "../../classes/Auth";

function GetAllMessage() {
  const authService = new AuthServices();
  const token = authService.getToken();
  const adminServices = new AdminService(token);
  
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [showFormReply, setShowFormReply] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await adminServices.getAllContact();
        console.log(res)
        setMessages(res.messages || []);
      } catch (error) {
        toast.error("Failed to fetch messages. Please try again.");
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reply.trim()) {
      toast.error("Reply cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    try {
      const messageReply = {
        messageId: currentMessage._id,
        adminReply: reply,
      };
      await adminServices.sentMessageReply(messageReply);
      
      toast.success("Reply sent successfully!");
      setMessages(prev => prev.map(msg => 
        msg._id === currentMessage._id ? {...msg, isReplied: true, adminReply: reply} : msg
      ));
      setShowFormReply(false);
      setReply("");
    } catch (err) {
      toast.error("Error sending reply");
      console.error("Reply error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleReplyForm = (message = null) => {
    setCurrentMessage(message);
    setShowFormReply(!!message);
    setReply(message?.adminReply || "");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-center" />
      <Helmet>
        <title>Admin | Messages</title>
      </Helmet>

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Customer Messages</h1>
        <p className="text-gray-600">View and respond to customer inquiries</p>
      </div>

      {messages.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <p className="text-blue-800">No messages available yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {messages.map((message, index) => (
                  <tr key={message._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {message.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {message.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      <div className="line-clamp-2">{message.message}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        message.isReplied 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {message.isReplied ? 'Replied' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => toggleReplyForm(message)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <MdReply className="mr-1" /> Reply
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showFormReply && currentMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">Reply to Message</h3>
              <button
                onClick={() => toggleReplyForm()}
                className="text-gray-400 hover:text-gray-500"
              >
                <MdClose className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-3">
                  <MdPerson className="text-gray-500 mr-2" />
                  <span className="font-medium">From: {currentMessage.name}</span>
                </div>
                <div className="flex items-center mb-3">
                  <MdEmail className="text-gray-500 mr-2" />
                  <span>{currentMessage.email}</span>
                </div>
                <div className="flex items-center mb-3">
                  <MdAccessTime className="text-gray-500 mr-2" />
                  <span>
                    {new Date(currentMessage.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-gray-700 whitespace-pre-line">{currentMessage.message}</p>
                </div>
                {currentMessage.adminReply && (
                  <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-100">
                    <p className="text-sm font-medium text-blue-800 mb-1">Previous reply:</p>
                    <p className="text-blue-700 whitespace-pre-line">{currentMessage.adminReply}</p>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label htmlFor="reply" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Reply
                  </label>
                  <textarea
                    id="reply"
                    rows={5}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-3"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => toggleReplyForm()}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!reply.trim() || isSubmitting}
                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      (!reply.trim() || isSubmitting) ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : 'Send Reply'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GetAllMessage;