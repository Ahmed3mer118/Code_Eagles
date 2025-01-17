import axios from "axios";
import React, { useContext, useState } from "react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { DataContext } from "../../Users/Context/Context";

function UpdateGroup() {
  const { groupId } = useParams();
  const { URLAPI, getTokenAdmin } = useContext(DataContext);
  const [updateDataGroup, setUpdateDataGroup] = useState({
    title: "",
    location: "",
    type_course: "",
    start_date: "",
    end_date: "",
  });
  const [offline, setOffline] = useState(false);
  const [loading, setLoading] = useState(false);
  const naviagte = useNavigate();
  useEffect(() => {
    axios
      .get(`${URLAPI}/api/groups/${groupId}`,{
        headers:{
          Authorization:`${getTokenAdmin}`
        }
      })
      .then((res) => setUpdateDataGroup(res.data));
  }, [groupId]);

  const handleOffline = (e) => {
    const selectedValue = e.target.value;
    setUpdateDataGroup({ ...updateDataGroup, type_course: selectedValue });
    setOffline(selectedValue === "offline");
  };

  //   function update data group
  const handleUpdateGroup = (e) => {
    e.preventDefault();
    if (!getTokenAdmin) {
      toast.error("Unauthorized. Please log in.");
      return;
    }
    setLoading(true);
    try {
      axios
        .put(`${URLAPI}/api/groups/` + groupId, updateDataGroup, {
          headers: {
            Authorization: `${getTokenAdmin}`,
          },
        })
        .then(() => {
          toast.success("Group Updated successfully");
          setTimeout(() => {
            naviagte(`/admin/allGroups`);
          }, 3500);
        });
    } catch (error) {
      toast.error("Error" + error);
    }
    setLoading(false);
  };
  // function delete  group
  const handleDeleteGroup = async (id) => {
    if (!getTokenAdmin) {
      toast.error("Unauthorized. Please log in.");
      return;
    }
    try {
      await axios.delete(`${URLAPI}/api/groups/${id}`, {
        headers: {
          Authorization: `${getTokenAdmin}`,
        },
      });
      toast.success("Group deleted successfully");
      setTimeout(() => {
        naviagte(`/admin/allGroups`);
      }, 3500);
    } catch (error) {
      toast.error("Error deleting group: " + error.message);
    }
  };
  return (
    <div className="Update-group">
      <ToastContainer />
      <h1>Update Group</h1>
      <form className="w-100" onSubmit={handleDeleteGroup}>
        <input
          type="text"
          placeholder="Title"
          className="border rounded p-2 m-2 col-lg-6 col-md-10 col-sm-5 col"
          value={updateDataGroup.title}
          onChange={(e) =>
            setUpdateDataGroup({ ...updateDataGroup, title: e.target.value })
          }
        />
        <select
          className="border rounded p-2 m-2 col-lg-6 col-md-10 col-sm-5 col"
          onChange={handleOffline}
          value={updateDataGroup.type_course}
        >
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>
        {offline && (
          <input
            type="text"
            placeholder="Location"
            className="border rounded p-2 m-2 col-lg-6 col-md-10 col-sm-5 col"
            value={updateDataGroup.location}
            onChange={(e) =>
              setUpdateDataGroup({
                ...updateDataGroup,
                location: e.target.value,
              })
            }
          />
        )}
        <input
          type="date"
          className="border rounded p-2 m-2 col-lg-6 col-md-10 col-sm-5 col"
          value={
            updateDataGroup.start_date
              ? updateDataGroup.start_date.split("T")[0]
              : ""
          }
          onChange={(e) =>
            setUpdateDataGroup({
              ...updateDataGroup,
              start_date: e.target.value,
            })
          }
        />

        <input
          type="date"
          className="border rounded p-2 m-2 col-lg-6 col-md-10 col-sm-5 col"
          onChange={(e) =>
            setUpdateDataGroup({ ...updateDataGroup, end_date: e.target.value })
          }
          value={
            updateDataGroup.end_date
              ? updateDataGroup.end_date.split("T")[0]
              : ""
          }
        />
        <div className="d-flex  flex-wrap">
          <button
            className="btn btn-success col-lg-2 col-md-4 col-sm-10 col  m-2"
            onClick={handleUpdateGroup}
            disabled={loading}
            aria-label="submit"
          >
            {loading ? "Updating..." : "Update"}
          </button>
          <button
            className="btn btn-danger col=lg-2  col-md-4 col-sm-10 col m-2"
            onClick={(e) => {
              e.preventDefault();
              handleDeleteGroup(groupId);
            }}
            aria-label="submit"
          >
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}

export default UpdateGroup;
