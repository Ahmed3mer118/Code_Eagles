import React, { Fragment, useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { DataContext } from "../Context/Context";
import { collapseToast, toast, ToastContainer } from "react-toastify";

function OutletCourse() {
  const { URLAPI, getTokenUser } = useContext(DataContext);
  const { id, groupId } = useParams();
  const [lecture, setLecture] = useState([]);
  const [lectureVideo,setLectureVideo] = useState([])
  const [disabledInput, setDisabledInput] = useState(false);
  const [attendCode, setAttendCode] = useState({ code: "" });
  const [isSubmissionAllowed, setIsSubmissionAllowed] = useState(true);

  // get lecture
  useEffect(() => {
    if (!id) {
      console.log("Lecture ID is missing");
      return;
    }
    axios
      .get(`${URLAPI}/api/lectures/${id}`, {
        headers: {
          Authorization: `${getTokenUser}`,
        },
      })
      .then((res) => {
        setLecture(res.data.lecture );
        setLectureVideo(res.data.lecture.resources.toString())
      
      })
      .catch((err) => {
        console.error("Error fetching lecture data:", err);
      });
  }, [id, getTokenUser, URLAPI]);

  console.log(lectureVideo)
  // تسجيل الحضور
  const handleAttend = (e) => {
    e.preventDefault();
  
    // إذا كان الإدخال معطلًا، لا تفعل شيئًا
    if (disabledInput) {
      toast.warning("You have already attended this lecture.");
      return;
    }

    axios
      .post(
        `${URLAPI}/api/lectures/attend`,
        { ...attendCode, lectureId: id },
        {
          headers: {
            Authorization: `${getTokenUser}`,
          },
        }
      )
      .then(() => {
        toast.success("Attend Lecture Is Done");
        setDisabledInput(true); // تعطيل خانة الإدخال بعد النجاح
      })
      .catch((error) => {
        if (error.response?.status === 400) {
          toast.error("You already attended this lecture.");
        } else {
          toast.error("An error occurred while processing your attendance.");
        }
      });
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
          {id ? `Title: ${lecture.title}` : "No Lecture Selected"}
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
          {id && (
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
                    onChange={(e) =>
                      setAttendCode({
                        ...attendCode,
                        code: e.target.value.trim(),
                      })
                    }
                    disabled={disabledInput}
                  />
                  <input
                    type="button"
                    value="Send"
                    className="btn btn-primary"
                    style={{ padding: "10px 20px" }}
                    onClick={handleAttend}
                    disabled={disabledInput}
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

                      <Link
                        to={`/${groupId}/course/${lecture._id}/Add-Task/${item._id}`}
                      >
                        <button
                          className="btn btn-success"
                          disabled={!isSubmissionAllowed}
                        >
                          Submit Task
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}

              {/* <Link to={`/${groupId}/course/${lecture._id}/Add-Task`}>
                <button
                  className="btn btn-success m-2"
                  style={{ padding: "10px 20px" }}
                >
                  Add Task
                </button>
              </Link> */}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default OutletCourse;
