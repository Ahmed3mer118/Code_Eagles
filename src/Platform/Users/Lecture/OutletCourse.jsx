import React, { Fragment, useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { DataContext } from "../Context/Context";
import { collapseToast, toast, ToastContainer } from "react-toastify";

function OutletCourse() {
  const { URLAPI, getTokenUser } = useContext(DataContext);
  const { lecCourse, groupId } = useParams();
  const [lecture, setLecture] = useState([]);
  const [lectureVideo, setLectureVideo] = useState([]);
  const [disabledInput, setDisabledInput] = useState(false);
  const [attendCode, setAttendCode] = useState({ code: "" });
  const [isSubmissionAllowed, setIsSubmissionAllowed] = useState(true);
  const [deadline, setDeadline] = useState("");
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState("");

  // get lecture
  useEffect(() => {
    if (!lecCourse) {
      console.log("Lecture is missing");
      return;
    }
    axios
      .get(`${URLAPI}/api/lectures/${lecCourse}`, {
        headers: {
          Authorization: `${getTokenUser}`,
        },
      })
      .then((res) => {
        setLecture(res.data.lecture);

        // close task after deadline
        const TimeDeadling = res.data.lecture.tasks;
        for (let i = 0; i < TimeDeadling.length; i++) {
          const element = TimeDeadling[i];
          const backendDeadline = new Date(element.end_date);
          const today = new Date();

          const timeDifference = backendDeadline - today;
          const daysRemaining = Math.ceil(
            timeDifference / (1000 * 60 * 60 * 24)
          );
          if (daysRemaining < 0) {
            setIsSubmissionAllowed(false);
            setDeadline(
              `The deadline for this task has passed  ${
                daysRemaining * -1
              } days ago.`
            );
          } else {
            setIsSubmissionAllowed(true);
            setDeadline(
              `You have ${daysRemaining} days remaining to submit the task.`
            );
          }
        }
      })
      .catch((err) => {
        console.error("Error fetching lecture data:", err);
      });
  }, [lecCourse, getTokenUser, URLAPI]);
useEffect(()=>{
  axios
  .get(`${URLAPI}/api/groups/${groupId}`, {
    headers: {
      Authorization: `${getTokenUser}`,
    },
  })
  .then((res) => {
    setGroupName(res.data.title);
  });
})
  // تسجيل الحضور
  const handleAttend = (e) => {
    e.preventDefault();

    if (disabledInput) {
      toast.info("You have already attended this lecture.");
      return;
    }

    axios
      .post(
        `${URLAPI}/api/lectures/attend`,
        { ...attendCode, lectureId: lecCourse },
        {
          headers: {
            Authorization: `${getTokenUser}`,
          },
        }
      )
      .then(() => {
        toast.success("Attend Lecture Is Done");
        setDisabledInput(true);
      })
      .catch((error) => {
        if (error.response?.status === 400) {
          toast.info("You already attended this lecture.");
        } else {
          toast.error("An error occurred while processing your attendance.");
        }
      });
  };
  const handleSendTask = (groupId, lectureId, itemId) => {
    navigate(`/course/${groupId}/lecture/${lectureId}/Add-Task/${itemId}`);
  };

  return (
    <>
      <ToastContainer />
      <div
        className="lecture-container"
        style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}
      >
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            marginBottom: "20px",
            color: "#333",
          }}
        >
          {lecCourse ? `Title: ${lecture.title}` : `Course : ${groupName}`}
        </h1>

        <div
          style={{ position: "relative", width: "100%", marginBottom: "30px" }}
        >
          <video
            src="https://mega.nz/file/HAABDSwK#3O1Lo9NWjXmysN2QyxWR89qqbnEHFc1ba1Es2taKxfY"
            // src={lectureVideo}
            controls
            controlsList="nodownload"
            disablePictureInPicture
            onContextMenu={(e) => e.preventDefault()}
            style={{
              width: "100%",
              borderRadius: "10px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
            }}
          ></video>

          {/* العلامة المائية */}
          <div
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              color: "rgba(255, 255, 255, 0.8)",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              padding: "5px 10px",
              borderRadius: "5px",
              fontSize: "0.85rem",
              pointerEvents: "none",
              zIndex: 1,
            }}
          >
            BY: Ahmed Amer
          </div>
        </div>

        <div>
          {lecCourse && (
            <>
              <div style={{ marginBottom: "20px" }}>
                <strong style={{ fontSize: "1.2rem", color: "#555" }}>
                  Attendance Code: {disabledInput ? "Hidden" : lecture.code}
                </strong>
                <div className="d-flex align-items-center mt-2">
                  <input
                    type="text"
                    placeholder="Enter Code"
                    className="form-control m-2 w-50"
                    style={{
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      padding: "10px",
                    }}
                    required
                    onChange={(e) =>
                      setAttendCode({
                        ...attendCode,
                        code: e.target.value.trim(),
                      })
                    }
                    disabled={deadline && !isSubmissionAllowed}
                  />
                  <input
                    type="button"
                    value="Send"
                    className="btn btn-primary"
                    style={{ padding: "10px 20px" }}
                    onClick={handleAttend}
                    disabled={deadline && !isSubmissionAllowed}
                  />
                </div>
              </div>
              {Array.isArray(lecture.tasks) && lecture.tasks.length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                  <h2
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "600",
                      marginBottom: "15px",
                      color: "#333",
                    }}
                  >
                    Tasks
                  </h2>
                  {lecture.tasks.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "15px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        marginBottom: "15px",
                        backgroundColor: "#f9f9f9",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "1.2rem",
                          marginBottom: "10px",
                          color: "#444",
                        }}
                      >
                        Task: {item.description_task}
                      </h3>
                      <p style={{ color: "#777", fontSize: "0.9rem" }}>
                        Deadline: {item.end_date?.slice(0, 10)}
                      </p>
                      <p style={{ color: "#777", fontSize: "0.9rem" }}>
                        {deadline}
                      </p>

                      <button
                        className="btn btn-success"
                        onClick={() =>
                          handleSendTask(groupId, lecture._id, item._id)
                        }
                        disabled={!isSubmissionAllowed}
                        aria-label="Submit"
                      >
                        Submit Task
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default OutletCourse;
