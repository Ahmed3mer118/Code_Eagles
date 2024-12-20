import React, { useContext, useEffect, useState } from "react";
import { DataContext } from "../../Users/Context/Context";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

function SubmissionsTask() {
  const { URLAPI, getTokenAdmin } = useContext(DataContext);
  const { lectureId, taskId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [taskName, setTaskName] = useState([]);
  const [scores, setScores] = useState({
    feedback: "",
    score: 0,
  });

  // get all user submit task
  useEffect(() => {
    if (lectureId && taskId) {
      // Fetch all submissions
      axios
        .get(
          `${URLAPI}/api/lectures/${lectureId}/${taskId}/all-user-submit-task`,
          {
            headers: {
              Authorization: `${getTokenAdmin}`,
            },
          }
        )
        .then((res) => {
          setSubmissions(res.data.submissions);
          setTaskName(res.data);
        })
        .catch((err) => {
          console.error("Error fetching submissions:", err);
        });
    }
  }, [lectureId, taskId, URLAPI, getTokenAdmin]);

  useEffect(() => {
    // Fetch user details for each submission
    if (submissions.length > 0) {
      submissions.forEach((submission) => {
        if (submission.userId) {
          axios
            .get(`${URLAPI}/api/users/${submission.userId}`, {
              headers: {
                Authorization: `${getTokenAdmin}`,
              },
            })
            .then((res) => {
              setTaskName({ ...taskName, name: res.data.name });
            })
            .catch((err) => {
              console.error(
                `Error fetching user data for userId ${submission.userId}:`,
                err
              );
            });
        }
      });
    }
  }, [submissions, URLAPI, getTokenAdmin]);

  const handleSendScore = (submissionId) => {
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
          toast.success(taskName.name + " feedback sent successfully");

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
            <th className="border text-center">SName</th>
            <th className="border text-center">NTask</th>
            <th className="border text-center">LTask</th>
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
                <td className="border text-center">{taskName.name}</td>
                <td className="border text-center">
                  {/* {getTaskDescription(taskId)} */}
                  {taskName.taskTitle}
                </td>
                <td className="border text-center">
                  <a
                    href={`${submissions.submissionLink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Submission
                  </a>
                </td>
                <td className="border text-center" style={{ width: "150px" }}>
                  {item.score !== null ? (
                    <span>{item.score}</span>
                  ) : (
                    <input
                      type="number"
                      onChange={(e) =>
                        setScores({ ...scores, score: e.target.value.trim() })
                      }
                      className="form-control"
                      placeholder="Enter Score"
                      style={{ width: "100%" }} // تقييد العرض بحجم العمود
                    />
                  )}
                </td>
                <td className="border text-center" style={{ width: "200px" }}>
                  {item.feedback !== null ? (
                    <span>{item.feedback}</span>
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
                      style={{ width: "100%" }} // تقييد العرض بحجم العمود
                    />
                  )}
                </td>

                <td className="border text-center">
                  {item.score !== null ? (
                    <span className="text-success">Evaluated</span>
                  ) : (
                    <span
                      onClick={() => handleSendScore(item.submissionId)}
                      className="text-primary"
                      style={{ cursor: "pointer" }}
                    >
                      Send
                    </span>
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
