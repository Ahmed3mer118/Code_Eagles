import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { DataContext } from "../../Users/Context/Context";
import { Helmet } from "react-helmet-async";

function EmailReq() {
  const { URLAPI, getTokenAdmin } = useContext(DataContext);
  const [email, setEmail] = useState();

  useEffect(() => {
    axios
      .get(`${URLAPI}/api/users/pending-users`, {
        headers: {
          Authorization: `${getTokenAdmin}`,
        },
      })
      .then((res) => {
        console.log(res.data);
        if (res.data) {
          setEmail(res.data);
        } else {
          setEmail("");
        }
      })
      .catch((error) => {
        console.log("Not Request");
        setEmail("");
      });
  }, [getTokenAdmin]);

  const handleAccept = async (id, requestId) => {
    const acceptedReq = {
      groupId: requestId,
      userId: id,
    };

    try {
      await axios.post(`${URLAPI}/api/users/accept-join-request`, acceptedReq, {
        headers: {
          Authorization: `${getTokenAdmin}`,
        },
      });
      toast.success("Request Accepted");
      setEmail(email.filter((item) => item.userId !== id));
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

    try {
      await axios.post(`${URLAPI}/api/users/reject-join-request`, rejectedReq, {
        headers: {
          Authorization: `${getTokenAdmin}`,
        },
      });

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
              <div className="card p-2 m-2 text-center" key={index}>
                <h3> {item.userName || "No Name"} </h3>
                <h4>
                  {item.groupName || "No Group Title"} -{" "}
                  {item.start_date?.slice(0, 10) || "No Start Date"}
                </h4>

                <>
                  <button
                    className="btn btn-success m-2"
                    onClick={() => handleAccept(item.userId, item.groupId)}
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
