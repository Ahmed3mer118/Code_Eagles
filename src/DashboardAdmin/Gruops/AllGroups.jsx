import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { DataContext } from "../../Users/Context/Context";

function AllGroups() {
  const { URLAPI, getTokenAdmin } = useContext(DataContext);
  const [showGroup, setShowGroup] = useState({});
  const [offline, setOffline] = useState([]);
  const [online, setOnline] = useState([]);
  const location = useLocation();

  if (!getTokenAdmin) {
    toast.error("Unauthorized. Please log in.");
    return;
  }

  useEffect(() => {
    axios
      .get(`${URLAPI}/api/groups`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${getTokenAdmin}`,
        },
      })
      .then((res) => {
        const onlineGroup = res.data.filter(
          (item) => item.type_course === "online"
        );
        setOnline(onlineGroup);
        const offlineGroup = res.data.filter(
          (item) => item.type_course !== "online"
        );
        setOffline(offlineGroup);
      })
      .catch((error) => {
        toast.error("Error fetching groups: " + error.message);
      });
  }, [location.pathname]);

  const handleShowGroup = (id) => {
    // setShowGroup((prevState) => ({ ...prevState, [id]: !prevState[id] }));
    socket.emit("sendGroupId", id);
  };

  const renderGroupButtons = (groupList) => {
    return groupList.map((item) => (
      <div className="d-flex flex-wrap" key={item._id}>
        <Link to={`/admin/${item._id}`}>
          <button className="btn btn-warning d-block m-2">
            {item.title} - {item.start_date?.slice(0, 10)}
          </button>
        </Link>
     
      </div>
    ));
  };

  return (
    <div>
      <ToastContainer />
      <h1 className="text-center">All Groups</h1>
      <div className="d-flex flex-wrap justify-content-between container m-auto">
        <div className="sm-w-100 m-2">
          <h1>Online Groups</h1>
          {renderGroupButtons(online)}
        </div>
        <div className="sm-w-100 m-2">
          <h1>Offline Groups</h1>
          {renderGroupButtons(offline)}
        </div>
      </div>
    </div>
  );
}

export default AllGroups;
