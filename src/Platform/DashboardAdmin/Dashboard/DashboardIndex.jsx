import React, { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { DataContext } from "../../Users/Context/Context";
import axios from "axios";
import { Link } from "react-router-dom";
import {toast ,Toaster } from "react-hot-toast";
import { BiUserPlus } from "react-icons/bi";
import { FaEnvelope } from "react-icons/fa";
import { MdFeedback } from "react-icons/md";

function DashboardIndex() {
  const { URLAPI, getTokenAdmin } = useContext(DataContext);
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
            headers: { Authorization: `${getTokenAdmin}` }
          });
          requestsData = requestsRes.data;

        } catch (error) {
          console.error("Error fetching pending requests:", error);

        }


        try {
          const messagesRes = await axios.get(`${URLAPI}/api/contact/contact-us/messages`, {
            headers: { Authorization: `${getTokenAdmin}` }
          });
          messagesData = messagesRes.data;

        } catch (error) {
          console.error("Error fetching messages:", error);

        }


        try {
          const feedbackRes = await axios.get(`${URLAPI}/api/users/get-all-feedback`, {
            headers: { Authorization: `${getTokenAdmin}` }
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
  }, [URLAPI, getTokenAdmin]);

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
      <Helmet>
        <title>Code Eagles | Admin Dashboard</title>
      </Helmet>

      <div className="row mb-4">
        <div className="col-12">
          <h1 className="display-4 fw-bold text-primary mb-3">Admin Dashboard</h1>
          <p className="lead text-muted">Welcome to your admin dashboard</p>
        </div>
      </div>

      <div className="row g-4">
        {/* Requests Card */}
        <div className="col-12 col-sm-6 col-xl-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-primary bg-opacity-10 p-3 rounded">
                    <BiUserPlus className="text-primary fs-4" />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-subtitle text-muted mb-1">Pending Requests</h6>
                  <h3 className="card-title mb-0">{stats.requests}</h3>
                </div>
              </div>
            </div>
            <div className="card-footer bg-transparent border-0">
              <Link to="/admin/emails" className="btn btn-primary btn-sm">
                View All Requests
              </Link>
            </div>
          </div>
        </div>

        {/* Messages Card */}
        <div className="col-12 col-sm-6 col-xl-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-success bg-opacity-10 p-3 rounded">
                    <FaEnvelope className="text-success fs-4" />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-subtitle text-muted mb-1">Messages</h6>
                  <h3 className="card-title mb-0">{stats.messages}</h3>
                </div>
              </div>
            </div>
            <div className="card-footer bg-transparent border-0">
              <Link to="/admin/get-all-message-by-admin" className="btn btn-success btn-sm">
                View All Messages
              </Link>
            </div>
          </div>
      </div>

        {/* Feedback Card */}
        <div className="col-12 col-sm-6 col-xl-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-info bg-opacity-10 p-3 rounded">
                    <MdFeedback className="text-info fs-4" />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-subtitle text-muted mb-1">Feedbacks</h6>
                  <h3 className="card-title mb-0">{stats.feedback}</h3>
                </div>
              </div>
            </div>
            <div className="card-footer bg-transparent border-0">
              <Link to="/admin/get-all-feekback-by-admin" className="btn btn-info btn-sm">
                View All Feedback
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardIndex;
