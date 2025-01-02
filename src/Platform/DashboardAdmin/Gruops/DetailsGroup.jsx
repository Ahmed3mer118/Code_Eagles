import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { NavLink, Outlet, useParams } from "react-router-dom";
import { DataContext } from "../../Users/Context/Context";

function DetailsGroup() {
  const { groupId } = useParams();
  const [showDetailsGroup, setShowDetailsGroup] = useState([]);
  const [loading, setLoading] = useState(false);
  const { URLAPI, getTokenAdmin } = useContext(DataContext);
  useEffect(() => {
    axios
      .get(`${URLAPI}/api/groups/${groupId}`, {
        headers: {
          Authorization: `${getTokenAdmin}`,
        },
      })
      .then((res) => setShowDetailsGroup(res.data), setLoading(true))
      .catch((err) => console.log("No Group : " + err));
  }, [groupId]);

  const getLinkClassName = ({ isActive }) =>
    isActive ? "btn btn-success m-2" : "btn btn-warning m-2";

  return (
    <>
      <Helmet>
        <title>
          Group :
          {loading
            ? ` ${showDetailsGroup.title} ${showDetailsGroup.start_date?.slice(
                0,
                10
              )}`
            : ` loading... `}
        </title>
      </Helmet>

      <div>
        <h1 className="text-center">
          {loading
            ? ` Group : ${
                showDetailsGroup.title
              } - ${showDetailsGroup.start_date?.slice(0, 10)} `
            : " loading.."}
        </h1>
        <NavLink to={`/admin/${groupId}/students`} className={getLinkClassName}>
          Students
        </NavLink>
        <NavLink to={`/admin/${groupId}/lectures`} className={getLinkClassName}>
          Lectures
        </NavLink>
        <NavLink to={`/admin/${groupId}/tasks`} className={getLinkClassName}>
          Tasks
        </NavLink>
        <NavLink to={`/admin/${groupId}/update`} className={getLinkClassName}>
          Update
        </NavLink>
      </div>
      <Outlet />
    </>
  );
}

export default DetailsGroup;
