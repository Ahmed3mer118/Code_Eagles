import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { DataContext } from "../Context/Context";

function AllGroup() {
  const { URLAPI, handleJoinGroup } = useContext(DataContext);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllGroup, setshowAllGroup] = useState(false);

  // Fetch all groups
  useEffect(() => {
    axios
      .get(`${URLAPI}/api/groups`)
      .then((res) => {
        setGroups(res.data);
        setshowAllGroup(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setshowAllGroup(true);
        setLoading(false);
      });
  }, [URLAPI]);

  if (loading) return <h1 className="text-center">Loading groups...</h1>;

  return (
    <>
      {showAllGroup && (
        <div className="container mb-3" style={{width:"80%"}}>
          <h1 className="text-center my-4">All Groups</h1>
          <div className="row g-4">
            {groups ? (
              groups.map((group) => (
                <div className="col-md-4" key={group._id}>
                  <div className="card shadow-sm">
                    <div className="card-body text-center">
                      <h5 className="card-title">{group.title}</h5>
                      <p className="card-text">
                        Start Date: {group.start_date?.slice(0, 10)}
                      </p>
                      <button
                        className="btn btn-success"
                        onClick={() => handleJoinGroup(group._id)}
                        disabled={loading}
                      >
                        {loading?"Loading" :"Join Group"}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <h1>No Group</h1>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default AllGroup;
