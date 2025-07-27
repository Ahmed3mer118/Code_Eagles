import React, { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import { Link } from "react-router-dom";
import {toast ,Toaster } from "react-hot-toast";
import { BiUserPlus } from "react-icons/bi";
import { FaEnvelope } from "react-icons/fa";
import { MdFeedback } from "react-icons/md";
import AuthServices from "../../classes/Auth";
import AdminService from "../../classes/AdminService";

function DashboardIndex() {
  const authServices = new AuthServices()
  const token = authServices.getToken()
  const URLAPI = authServices.URLAPI
  const adminServices = new AdminService(token)
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    requests: 0,
    messages: 0,
    feedback: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // تهيئة المتغيرات
        let requestsData = [];
        let messagesData = { messages: [] };
        let feedbackData = { feedbacks: [] };


        try {
          const requestsRes = await axios.get(`${URLAPI}/api/users/pending-users`, {
            headers: { Authorization: `${token}` }
          });
          requestsData = requestsRes.data;

        } catch (error) {
          console.error("Error fetching pending requests:", error);

        }


        try {
          const messagesRes = await axios.get(`${URLAPI}/api/contact/contact-us/messages`, {
            headers: { Authorization: `${token}` }
          });
          messagesData = messagesRes.data;

        } catch (error) {
          console.error("Error fetching messages:", error);

        }


        try {
          const feedbackRes = await axios.get(`${URLAPI}/api/users/get-all-feedback`, {
            headers: { Authorization: `${token}` }
          });
          feedbackData = feedbackRes.data;

        } catch (error) {
          console.error("Error fetching feedback:", error);

        }


        let requestsCount = 0;
        if (Array.isArray(requestsData)) {
          requestsCount = requestsData.length;
        } else if (requestsData && typeof requestsData === 'object') {
          requestsCount = requestsData.message === "No pending group requests found" ? 0 : 0;
        }

        const messagesCount = messagesData.messages ? messagesData.messages.length : 0;



        const feedbackCount = feedbackData.feedbacks ? feedbackData.feedbacks.length : 0;



        setStats({
          requests: requestsCount,
          messages: messagesCount,
          feedback: feedbackCount
        });
      } catch (error) {
        console.error("Error in dashboard data processing:", error);
        toast.error("Failed to process dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [URLAPI, token]);

  if (loading) {
    return (
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
        <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
    <Helmet>
      <title>Code Eagles | Admin Dashboard</title>
    </Helmet>
  
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-2">Admin Dashboard</h1>
      <p className="text-lg text-gray-600">Welcome to your admin dashboard</p>
    </div>
  
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50 mr-4">
              <BiUserPlus className="text-blue-600 text-2xl" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Requests</p>
              <p className="text-2xl font-semibold text-gray-800">{stats.requests}</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <Link 
            to="/dashboard/admin/email-request" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
          >
            View All Requests
          </Link>
        </div>
      </div>
  
      {/* Messages Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-50 mr-4">
              <FaEnvelope className="text-green-600 text-2xl" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Messages</p>
              <p className="text-2xl font-semibold text-gray-800">{stats.messages}</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <Link 
            to="/dashboard/admin/get-all-message-by-admin" 
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
          >
            View All Messages
          </Link>
        </div>
      </div>
  
      {/* Feedback Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-cyan-50 mr-4">
              <MdFeedback className="text-cyan-600 text-2xl" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Feedbacks</p>
              <p className="text-2xl font-semibold text-gray-800">{stats.feedback}</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <Link 
            to="/dashboard/admin/get-all-feekback-by-admin" 
            className="inline-flex items-center px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
          >
            View All Feedback
          </Link>
        </div>
      </div>
    </div>
  
    {/* Additional Admin Sections Can Be Added Below */}
  </div>
  );
}

export default DashboardIndex;
