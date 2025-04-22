import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { DataContext } from "../../Users/Context/Context";
import { Helmet } from "react-helmet-async";

function EmailReq() {
  const { URLAPI, getTokenAdmin } = useContext(DataContext);
  const [email, setEmail] = useState();
  const [loading, setLoading] = useState(false);
  const [lectures, setLectures] = useState([]);
  const [lecturesSpecial, setSelectedLectures] = useState([]);

  useEffect(() => {
    setLoading(true);
    if (email) {
      return;
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
    try {
      await axios
        .post(`${URLAPI}/api/users/${status}`, accept, {
          headers: {
            Authorization: `${getTokenAdmin}`,
          },
        })
        .then(() => {
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
      setLectures(response.data.lectures);
    } catch (error) {
      console.error("Error fetching lectures:", error);
    }
  };

  const handleLectureSelection = (lectureId) => {
    setSelectedLectures((prevSelected) => {
      if (prevSelected.includes(lectureId)) {
        return prevSelected.filter((id) => id !== lectureId);
      } else {
        return [...prevSelected, lectureId];
      }
    });
  };

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
    <>
      <Helmet>
        <title>All Request Emails</title>
      </Helmet>
      <Toaster />
      
      <div className="container-fluid py-4">
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="text-center mb-4">All Request Emails</h1>
          </div>
        </div>

        <div className="row">
          {email && email.length > 0 ? (
            email.map((item, index) => (
              <div className="col-12 col-md-6 col-lg-4 mb-4" key={index}>
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <h5 className="card-title mb-3">
                      {item.userName || "No Name"}
                    </h5>
                    <div className="mb-3">
                      <p className="mb-1">
                        <strong>Group:</strong> {item.groupName || "No Group Title"}
                      </p>
                      <p className="mb-1">
                        <strong>Start Date:</strong>{" "}
                        {item.start_date?.slice(0, 10) || "No Start Date"}
                      </p>
                      <p className="mb-1">
                        <strong>Status:</strong>{" "}
                        <span className="badge bg-info">{item.requestType}</span>
                      </p>
                      {item.note && (
                        <p className="mb-1">
                          <strong>Note:</strong> {item.note}
                        </p>
                      )}
                    </div>

                    {item.requestType === "invite" && (
                      <div className="mb-3">
                        <button
                          className="btn btn-info btn-sm mb-3"
                          onClick={() => fetchLectures(item.groupId)}
                        >
                          Select Lectures
                        </button>
                        <div className="list-group">
                          {lectures.map((lecture) => (
                            <div className="list-group-item" key={lecture._id}>
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
                      </div>
                    )}

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() =>
                          handleAccept(item.userId, item.groupId, item.requestType)
                        }
                      >
                        Accept
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRejected(item.userId, item.groupId)}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="alert alert-info text-center">
                No Request Emails Found
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default EmailReq;
