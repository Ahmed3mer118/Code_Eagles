import axios from "axios";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify"; 
import { DataContext } from "../../Users/Context/Context";
import { Helmet } from "react-helmet-async";

function NewGroup() {
  const { URLAPI, getTokenAdmin } = useContext(DataContext);
  const [newGroup, setNewGroup] = useState({
    title: "",
    type_course: "online",
    location: "",
    start_date: "",
    end_date: "",
  });
  const [offline, setOffline] = useState(false);
  const navigate = useNavigate()
  const handleNewGroup = async (e) => {
    e.preventDefault();

    if (!getTokenAdmin) {
      toast.error("Unauthorized. Please log in.");
      return;
    }

    try {
      await axios.post(
        `${URLAPI}/api/groups`,
        {
          title: newGroup.title,
          type_course: newGroup.type_course,
          location: newGroup.location , 
          start_date: newGroup.start_date,
          end_date: newGroup.end_date,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: ` ${getTokenAdmin}`, 
          },
        }
      );
      toast.success("Creating successful");
      setTimeout(() => {
        navigate("/admin/allGroups")
      }, 3000);
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group. Please try again.");
    }
  };

  const handleOffline = (e) => {
    const selectedValue = e.target.value;
    setNewGroup({ ...newGroup, type_course: selectedValue });
    setOffline(selectedValue === "offline");
  };

  return (
    <div>
        <Helmet>
        <title>New Group</title>
      </Helmet>
      <ToastContainer />
      <h1>New Group</h1>
      <form className="container" onSubmit={handleNewGroup}>
        <input
          type="text"
          placeholder="Title"
          className="form-control mb-3 mt-4"
          onChange={(e) => setNewGroup({ ...newGroup, title: e.target.value })}
          required 
        />
        <select
          className="form-control"
          onChange={handleOffline}
          value={newGroup.type_course}
        >
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>
        {offline && (
          <input
            type="text"
            placeholder="Location"
            className="form-control ml-3 mt-4"
            value={newGroup.location}
            onChange={(e) =>
              setNewGroup({ ...newGroup, location: e.target.value })
            }
            required 
          />
        )}

        <input
          type="date"
          className="form-control ml-3 mt-4"
          onChange={(e) =>
            setNewGroup({ ...newGroup, start_date: e.target.value })
          }
          required 
        />
        <input
          type="date"
          className="form-control ml-3 mt-4"
          onChange={(e) =>
            setNewGroup({ ...newGroup, end_date: e.target.value })
          }
          required 
        />

        <button type="submit" className="btn btn-primary mt-4" >
          Create
   
        </button>
      </form>
    </div>
  );
}

export default NewGroup;
