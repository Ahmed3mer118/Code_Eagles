import React, { useContext, useEffect, useState } from "react";
import { DataContext } from "../../Users/Context/Context";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import {toast ,Toaster } from "react-hot-toast";
import InstructorService from "../../classes/InstructorService";
import AdminService from "../../classes/AdminService";

function SubmissionsTask() {
  const { URLAPI, getTokenAdmin, getTokenInstructor } = useContext(DataContext);
  const { lectureId, taskId } = useParams();
  const [submittedUsers, setSubmittedUsers] = useState([]);
  const [notSubmittedUsers, setNotSubmittedUsers] = useState([]);
  const [scores, setScores] = useState({
    feedback: "",
    score: 0,
  });
  const [adminService] = useState(new AdminService(URLAPI, getTokenAdmin));
  const [instructorService] = useState(new InstructorService(URLAPI, getTokenInstructor));
  const [loading, setLoading] = useState(false);

  // Fetch all submissions (submitted and not submitted users)
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (lectureId && taskId) {
        setLoading(true);
        try {
          let res;
          if (window.location.pathname.includes("/instructor")) {
            res = await instructorService.getSubmissionsTask(lectureId, taskId);
          } else {
            res = await adminService.getSubmissionsTask(lectureId, taskId);
          }

          // res.data structure expected:
          setSubmittedUsers(res.submittedUsers || []);
          setNotSubmittedUsers(res.notSubmittedUsers || []);
        } catch (error) {
          console.error("Failed to fetch submissions:", error);
          toast.error("Failed to fetch submissions.");
        }
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [lectureId, taskId, URLAPI, getTokenAdmin]);

  // Handle sending score and feedback
  const handleSendScore = (userId) => {
    // Find submission by userId from submittedUsers list
    const submission = submittedUsers.find((sub) => sub.userId === userId);
    if (!submission || !submission.submission?.submissionId) {
      toast.error("Submission not found for this user.");
      return;
    }
    const submissionId = submission.submission.submissionId;

    axios
      .put(
        `${URLAPI}/api/lectures/${lectureId}/tasks/${taskId}/submissions/${submissionId}/evaluate`,
        scores,
        {
          headers: {
            Authorization: `${getTokenAdmin}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then(() => {
        toast.success("Feedback sent successfully");
        // Update the local state of submissions
        setSubmittedUsers((prevSubs) =>
          prevSubs.map((sub) =>
            sub.submission.submissionId === submissionId
              ? { ...sub, submission: { ...sub.submission, score: scores.score, feedback: scores.feedback } }
              : sub
          )
        );
        // Reset score and feedback inputs
        setScores({ feedback: "", score: 0 });
      })
      .catch((err) => {
        console.error("Error updating score", err);
        toast.error("Failed to send feedback!");
      });
  };

  if (loading) {
    return <p className="text-center fw-bold">Loading submissions...</p>;
  }

  return (
    <>
      <Toaster />
      <Helmet>
        <title>Task Submissions</title>
      </Helmet>

      <h3 className="mt-4 mb-2">Submitted Users</h3>
      <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th className="border text-center">Id</th>
            <th className="border text-center">Name</th>
            <th className="border text-center">Task</th>
            <th className="border text-center">Score</th>
            <th className="border text-center">Feedback</th>
            <th className="border text-center">Send</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(submittedUsers) && submittedUsers.length > 0 ? (
            submittedUsers.map((item, index) => (
              <tr key={index}>
                <td className="border text-center">{index + 1}</td>
                <td className="border text-center">{item.name}</td>
                <td className="border text-center">
                  <Link to={item.submission.submissionLink} target="_blank" aria-label="link">
                    View Submission
                  </Link>
                </td>
                <td className="border text-center" style={{ width: "150px" }}>
                  {item.submission.score !== null ? (
                    <span>{item.submission.score}</span>
                  ) : (
                    <input
                      type="number"
                      onChange={(e) => setScores({ ...scores, score: e.target.value.trim() })}
                      className="form-control"
                      placeholder="Enter Score"
                      style={{ width: "100%" }}
                      value={scores.score || ""}
                    />
                  )}
                </td>
                <td className="border text-center" style={{ width: "200px" }}>
                  {item.submission.feedback !== null ? (
                    <span>{item.submission.feedback}</span>
                  ) : (
                    <input
                      type="text"
                      onChange={(e) => setScores({ ...scores, feedback: e.target.value.trim() })}
                      className="form-control"
                      placeholder="Enter Feedback"
                      style={{ width: "100%" }}
                      value={scores.feedback || ""}
                    />
                  )}
                </td>
                <td className="border text-center">
                  {item.submission.score !== null ? (
                    <span className="text-success">Evaluated</span>
                  ) : (
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => handleSendScore(item.userId)}
                      style={{ cursor: "pointer" }}
                    >
                      Send
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center">
                No submissions yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
      <h3 className="mt-5 mb-2 text-danger">Users Not Submitted</h3>
      <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th className="border text-center">Id</th>
            <th className="border text-center">Name</th>
            <th className="border text-center">Email</th>
            <th className="border text-center">Score</th>
            <th className="border text-center">Feedback</th>
            {/* <th className="border text-center">Send</th> */}
          </tr>
        </thead>
        <tbody>
          {Array.isArray(notSubmittedUsers) && notSubmittedUsers.length > 0 ? (
            notSubmittedUsers.map((user, index) => (
              <tr key={index}>
                <td className="border text-center">{index + 1}</td>
                <td className="border text-center">{user.name}</td>
                <td className="border text-center">{user.email}</td>
                <td className="border text-center">0</td>
                <td className="border text-center">Not submitted</td>
                {/* <td className="border text-center">
                  <button className="btn btn-outline-primary" onClick={() => handleSendScore(user.userId)}>Send</button>
                </td> */}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center">
                All users have submitted.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </>
  );
}

export default SubmissionsTask;
