import React, { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { DataContext } from "../../Users/Context/Context";
import axios from "axios";
import { Link } from "react-router-dom";

function DashboardIndex() {
  const { URLAPI, getTokenAdmin } = useContext(DataContext);

  const [requestsCount, setRequestsCount] = useState(0); // عدد الطلبات
  const [submissionsCount, setSubmissionsCount] = useState(0); // عدد التسليمات
  const [messagesCount, setMessagesCount] = useState(0); // عدد الرسائل
  const [feedbackCount, setFeedbackCount] = useState(0); // عدد الـ feedback

  useEffect(() => {
    // جلب كل الطلبات
    axios
      .get(`${URLAPI}/api/users/pending-users`, {
        headers: {
          Authorization: `${getTokenAdmin}`,
        },
      })
      .then((res) => {
        setRequestsCount(res.data.length || 0);
      });

    // جلب عدد التسليمات
    // axios
    // .get(`${URLAPI}/api/Submissions/get-all-submissions`, {
    //   headers: {
    //     Authorization: `${getTokenAdmin}`,
    //   },
    // })
    // .then((res) => {
    //   setSubmissionsCount(res.data.length || 0);
    // })

    // جلب عدد الرسائل
    axios
      .get(`${URLAPI}/api/contact/contact-us/messages`, {
        headers: {
          Authorization: `${getTokenAdmin}`,
        },
      })
      .then((res) => {
        setMessagesCount(res.data.messages.length || 0);
      });

    axios
      .get(`${URLAPI}/api/users/get-all-feedback`, {
        headers: {
          Authorization: `${getTokenAdmin}`,
        },
      })
      .then((res) => {
        setFeedbackCount(res.data.feedbacks.length || 0);
      });
  }, [URLAPI, getTokenAdmin]);

  return (
    <div>
      <Helmet>
        <title>Dashboard</title>
      </Helmet>
      <h1 className="text-center m-auto">Dashboard</h1>

      {/* عدد الطلبات */}
      <div className="card p-2 m-2">
        <h3>Requests: {requestsCount}</h3>
        <Link to="/admin/emails">See All Requests</Link>
      </div>

      {/* عدد التسليمات */}
      <div className="card p-2 m-2">
        <h3>Submissions: {submissionsCount}</h3>
        <Link to="/admin/submissions">See All Submissions</Link>
      </div>

      {/* عدد الرسائل */}
      <div className="card p-2 m-2">
        <h3>Messages: {messagesCount}</h3>
        <Link to="/admin/get-all-message-by-admin">See All Messages</Link>
      </div>

      {/* عدد الـ feedback */}
      <div className="card p-2 m-2">
        <h3>Feedbacks: {feedbackCount}</h3>
        <Link to="/admin/get-all-feekback-by-admin">See All Feedback</Link>
      </div>
    </div>
  );
}

export default DashboardIndex;
