import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { DataContext } from "../../Users/Context/Context";
import { Helmet } from "react-helmet-async";

function EmailReq() {
  const { URLAPI, getTokenAdmin } = useContext(DataContext);
  const [email, setEmail] = useState();
  const [loading, setLoading] = useState(false);
  const [lectures, setLectures] = useState([]); // State لتخزين المحاضرات
  const [lecturesSpecial, setSelectedLectures] = useState([]); // State لتخزين المحاضرات المختارة

  useEffect(() => {
    setLoading(true);
    if (email) {
        return
    }
    axios
      .get(`${URLAPI}/api/users/pending-users`, {
        headers: {
          Authorization: `${getTokenAdmin}`,
        },
      })
      .then((res) => {
        if (res.data) {
          setEmail(res.data);
          setLoading(false);
        } else {
          setEmail("");
        }
      })
      .catch((error) => {
        console.log("Not Request");
        console.log(error.message);
        setEmail("");
        setLoading(false);
      });
  }, [getTokenAdmin]);

  const handleAccept = async (id, requestId, requestStutas) => {
    let status =
      requestStutas === "invite"
        ? "accept-special-user"
        : "accept-join-request";
    const acceptedReq = {
      groupId: requestId,
      userId: id,
      lecturesSpecial: lecturesSpecial,
    };
    const accceptJoin = {
      groupId: requestId,
      userId: id,
    };
    let accept = requestStutas === "invite" ? acceptedReq : accceptJoin;
    console.log(status, accept);
    // setLoading(true);
    try {
      await axios
        .post(`${URLAPI}/api/users/${status}`, accept, {
          headers: {
            Authorization: `${getTokenAdmin}`,
          },
        })
        .then(() => {
          // setLoading(false);
          toast.success("Request Accepted");
          setEmail(email.filter((item) => item.userId !== id));
        });
    } catch (error) {
      toast.error(
        `Error accepting request: ${
          error.response.data.message || error.message
        }`
      );
    }
  };

  const handleRejected = async (id, requestId) => {
    const rejectedReq = {
      groupId: requestId,
      userId: id,
    };
    console.log(rejectedReq);
    setLoading(true);
    try {
      setLoading(true);
      // await axios.post(`${URLAPI}/api/users/reject-join-request`, rejectedReq, {
      //   headers: {
      //     Authorization: `${getTokenAdmin}`,
      //   },
      // });
      setLoading(false);
      toast.error("Request Rejected");
      setEmail(email.filter((item) => item.user_id._id !== id));
    } catch (error) {
      toast.error(
        `Error accepting request: ${
          error.response.data.message || error.message
        }`
      );
    }
  };
  const fetchLectures = async (groupId) => {
    console.log(groupId);
    try {
      const response = await axios.get(
        `${URLAPI}/api/lectures/group/${groupId}`,
        {
          headers: { Authorization: getTokenAdmin },
        }
      );
      console.log(response.data.lectures);
      setLectures(response.data.lectures); // تخزين المحاضرات في state
    } catch (error) {
      console.error("Error fetching lectures:", error);
    }
  };

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setStudentData({ ...studentData, [name]: value });

  //   // إذا تم تغيير المجموعة، استرجع المحاضرات
  //   if (name === "groupId" && value) {
  //     fetchLectures(value);
  //   }
  // };

  const handleLectureSelection = (lectureId) => {
    setSelectedLectures((prevSelected) => {
      if (prevSelected.includes(lectureId)) {
        return prevSelected.filter((id) => id !== lectureId); // إزالة المحاضرة إذا كانت مختارة مسبقًا
      } else {
        return [...prevSelected, lectureId]; // إضافة المحاضرة إذا لم تكن مختارة
      }
    });
  };
  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   let payload ={
  //     ...studentData,
  //     lecturesSpecial
  //   }
  //   console.log(payload)
  //   axios
  //     .post(`${URLAPI}/api/users/add-allowed-emails`, payload, {
  //       headers: { Authorization: `${getTokenAdmin}` },
  //     })
  //     .then((res) => {
  //       setShowListStd((prevList) => [...prevList, res.data]);
  //       toast.success("Student added successfully!");
  //       setShowForm(false);
  //       setStudentData({
  //         groupId: "",
  //         allowedEmails: "",
  //       });
  //     })
  //     .catch((error) => {
  //       console.error("Error adding student:", error);
  //       toast.error("Failed to add student.");
  //     });
  // };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
        }}
      >
        <svg
          className="loading"
          viewBox="25 25 50 50"
          style={{ width: "3.25em" }}
        >
          <circle r="20" cy="50" cx="50"></circle>
        </svg>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>All Request Emails</title>
      </Helmet>
      <ToastContainer />
      <h1 className="text-center">All Request Emails</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
          width: "80%",
          margin: "auto",
        }}
      >
        {email && email.length > 0 ? (
          email.map((item, index) => {
            return (
              <div className="card p-2 m-2 " key={index}>
                <h3>Name : {item.userName || "No Name"} </h3>
                <h3>
                  Group : {item.groupName || "No Group Title"} -{" "}
                  {item.start_date?.slice(0, 10) || "No Start Date"}
                </h3>
                <span>
                  {" "}
                  Status : <strong> {item.requestType}</strong>{" "}
                </span>
                <p>
                  Note : <strong>{item.note !== "" ? item.note : ""}</strong>
                </p>
                <>
                  {item.requestType == "invite" && (
                    <button
                      className="btn btn-info m-2"
                      onClick={() => fetchLectures(item.groupId)}
                    >
                      Lectures Select
                    </button>
                  )}
                  <div className="mt-3 w-100">
                    <div className=" p-2">
                      {lectures.map((lecture) => (
                        <div className=" mb-2" key={lecture._id}>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={lecture._id}
                              checked={lecturesSpecial.includes(lecture._id)}
                              onChange={() =>
                                handleLectureSelection(lecture._id)
                              }
                            />
                            <label
                              className="form-check-label"
                              htmlFor={lecture._id}
                            >
                              {lecture.title} - {lecture.description}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* زر الإضافة */}
                    {/* <button className="btn btn-primary mt-3" onClick={handleSubmit}>
     Add Student with Selected Lectures
   </button> */}
                  </div>

                  <button
                    className="btn btn-success m-2"
                    onClick={() =>
                      handleAccept(item.userId, item.groupId, item.requestType)
                    }
                    aria-label="submit"
                  >
                    Accept
                  </button>
                  <button
                    className="btn btn-danger m-2"
                    onClick={() => handleRejected(item.userId, item.groupId)}
                    aria-label="submit"
                  >
                    Reject
                  </button>
                </>
              </div>
            );
          })
        ) : (
          <div className="text-center">
            <h1 className="text-center">No Request Email</h1>
          </div>
        )}
      </div>
    </>
  );
}

export default EmailReq;
