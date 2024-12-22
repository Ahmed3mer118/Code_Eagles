import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const DataContext = createContext();

function Context({ children }) {
  const getTokenAdmin = JSON.parse(localStorage.getItem("tokenAdmin"));
  const getTokenUser = JSON.parse(localStorage.getItem("tokenUser"));
  const [URLAPI] = useState("https://api-codeeagles-cpq8.vercel.app");
  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Handle join group with groupId
  const handleJoinGroup = async (groupId) => {
    if (!getTokenUser) {
      toast.error("Please login to join the group.");
      return;
    }
  
    if (
      userGroups.includes(groupId) &&
      userGroups.groups.status === "approved"
    ) {
      toast.info("You are already a member of this group.");
      return;
    }
  
    setLoading(true); // Set loading to true before starting the request
    try {
      // Fetch user details to get userId
      const userRes = await axios.get(`${URLAPI}/api/users`, {
        headers: { Authorization: ` ${getTokenUser}` },
      });
  
      const joinRes = {
        groupId,
        userId: userRes.data._id,
      };
  
      // Send the join request
      await axios.post(`${URLAPI}/api/users/joinGroupRequest`, joinRes, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${getTokenUser}`,
        },
      });
  
      toast.success(
        "Your request to join has been sent successfully. Please wait for the request to be accepted."
      );
    } catch (err) {
      toast.error(
        "Failed to send join request: " +
          (err.response?.data?.message || err.message)
      );
    } finally {

      setLoading(false);
    }
  };
  

  // Fetch user's groups on component mount
  useEffect(() => {
    if (getTokenUser) {
      axios
        .get(`${URLAPI}/api/users`, {
          headers: { Authorization: `${getTokenUser}` },
        })
        .then((res) => {
          setUserGroups(res.data.groups || []);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching user groups:", err);
          setLoading(false);
        });
    } else {
      setLoading(false); // If no token, stop loading
    }
  }, [URLAPI, getTokenUser]);

  return (
    <DataContext.Provider
      value={{ URLAPI, handleJoinGroup, getTokenUser, getTokenAdmin }}
    >
      {children}
    </DataContext.Provider>
  );
}

export default Context;
