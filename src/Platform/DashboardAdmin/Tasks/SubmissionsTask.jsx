import React, { useContext, useEffect, useState } from "react";
import { DataContext } from "../../Users/Context/Context";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import InstructorService from "../../classes/InstructorService";
import AdminService from "../../classes/AdminService";
function SubmissionsTask() {
  const { URLAPI, getTokenAdmin, getTokenInstructor } = useContext(DataContext);
  const { lectureId, taskId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [taskName, setTaskName] = useState([]);
  const [scores, setScores] = useState({
    feedback: "",
    score: 0,
  });
  const [adminService] = useState(new AdminService(URLAPI, getTokenAdmin))
  const [instructorService] = useState(new InstructorService(URLAPI, getTokenInstructor))
  const [loading, setLoading] = useState(false)

  // get all user submit task
  useEffect(() => {
    if (lectureId && taskId) {
      // Fetch all submissions
      setLoading(true)
      instructorService.getSubmissionsTask(lectureId, taskId).then((res) => {
        setSubmissions(res.data.submittedUsers);
        setLoading(false)
      })
      adminService.getSubmissionsTask(lectureId, taskId).then((res) => {
        setSubmissions(res.data.submittedUsers);
        setLoading(false)
      })
    }
  }, [lectureId, taskId, URLAPI, getTokenAdmin]);

  const handleSendScore = (submissionId) => {
    console.log(submissionId);
    if (submissionId !== undefined) {
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
          toast.success(" feedback sent successfully");
          // تحديث بيانات العنصر محليًا
          setSubmissions((prevSubmissions) =>
            prevSubmissions.map((submission) =>
              submission.submissionId === submissionId
                ? {
                    ...submission,
                    score: scores.score,
                    feedback: scores.feedback,
                  }
                : submission
            )
          );

          // إعادة تعيين الحقول
          setScores({ feedback: "", score: 0 });
        })
        .catch((err) => {
          console.error("Error updating score", err);
          toast.error("Failed to send feedback!");
        });
    }
  };

  return (
    <>
      <ToastContainer />
      <Helmet>
        <title>Submissions Tasks</title>
      </Helmet>
      <table className="table mt-2">
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
          {Array.isArray(submissions) &&
            submissions.map((item, index) => (
              <tr key={index}>
                <td className="border text-center">{index + 1}</td>
                <td className="border text-center">{item.name}</td>

                <td className="border text-center">
                  <Link
                    to={item.submission.submissionLink}
                    target="_blank"
                    aria-label="link"
                  >
                    View Submission
                  </Link>
                </td>
                <td className="border text-center" style={{ width: "150px" }}>
                  {item.submission.score !== null ? (
                    <span>{item.submission.score}</span>
                  ) : (
                    <input
                      type="number"
                      onChange={(e) =>
                        setScores({ ...scores, score: e.target.value.trim() })
                      }
                      className="form-control"
                      placeholder="Enter Score"
                      style={{ width: "100%" }}
                    />
                  )}
                </td>
                <td className="border text-center" style={{ width: "200px" }}>
                  {item.submission.feedback !== null ? (
                    <span>{item.submission.feedback}</span>
                  ) : (
                    <input
                      type="text"
                      onChange={(e) =>
                        setScores({
                          ...scores,
                          feedback: e.target.value.trim(),
                        })
                      }
                      className="form-control"
                      placeholder="Enter Feedback"
                      style={{ width: "100%" }}
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
            ))}
        </tbody>
      </table>
    </>
  );
}

export default SubmissionsTask;
