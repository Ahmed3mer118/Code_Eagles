import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { DataContext } from "../Context/Context";

function Group() {
  const { URLAPI, handleJoinGroup , getTokenUser} = useContext(DataContext);
  const [group, setGroup] = useState('');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const groupId = JSON.parse( localStorage.getItem("newGroup"))
  const userIdLocal = JSON.parse(localStorage.getItem("userId"));
 

  useEffect(() => {
    if (userIdLocal) {
      axios
        .get(`${URLAPI}/api/users/${userIdLocal}`, {
          headers: {
            Authorization: `${getTokenUser}`,
          },
        })
        .then((res) => {
          setUserId(res.data._id);
          setLoading(false);
        });
    }

  
  }, [groupId, getTokenUser]);

  return (
    <>
      <ToastContainer />
      <div style={{ padding: "20px" }}>
        {group ? (
          <>
        <h1 className="text-center">New Group</h1>
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "15px",
              width: "250px",
              textAlign: "center",
              margin: "auto",
            }}
          >
            <h2>{group.title}</h2>
            <p>{group.start_date?.slice(0, 10)}</p>
            <button onClick={handleJoinGroup} className="btn btn-success" disabled={loading}>
              Join Group
            </button>
          </div>
          </>
        ) : (
          <div></div>
        )}
      </div>
    </>
  );
}

export default Group;
