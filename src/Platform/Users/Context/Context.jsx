import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";  

export const DataContext = createContext();

function Context({ children }) {
  let getTokenAdmin, getTokenUser, getTokenInstructor;

  getTokenAdmin = JSON.parse(localStorage.getItem("token") );
  getTokenUser = JSON.parse(localStorage.getItem("tokenUser") );
  getTokenInstructor = JSON.parse(localStorage.getItem("tokenInstructor") );

  const URLAPI = "https://api-codeeagles-cpq8.vercel.app";
  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's groups on component mount
  useEffect(() => {
    const fetchUserGroups = async () => {
      setLoading(true);
      if (getTokenUser) {
        try {
          const res = await axios.get(`${URLAPI}/api/users`, {
            headers: { Authorization: ` ${getTokenUser}` },
          });
          setUserGroups(res.data.groups || []);
        } catch (err) {
          console.error("Error fetching user groups:", err?.message);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false); // If no getTokenUser, stop loading
      }
    };

    fetchUserGroups();
  }, [URLAPI, getTokenUser]);

  // Handle join group with groupId, requestType, and note
  const handleJoinGroup = async (groupId, requestType, note) => {
    if (!getTokenUser) {
      toast.error("Please login to join the group.");
      return;
    }

    setLoading(true);
    try {
      const FilterMember = userGroups.filter(
        (element) => element.groupId === groupId
      );

      for (let i = 0; i < FilterMember.length; i++) {
        const element = FilterMember[i];

        if (element.status === "approved") {
          toast.promise("You are already a member of this group.");
          return;
        } else {
          toast.success(
            "You have already sent a request. Please wait for approval."
          );
          return;
        }
      }

      // Send the join request
      const joinRes = {
        groupId,
        requestType: requestType === "Full Course" ? "join" : "invite",
        note,
      };

      await axios.post(`${URLAPI}/api/users/joinGroupRequest`, joinRes, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${getTokenUser}`,
        },
      });

      toast.success(
        "Your request to join has been sent successfully. Please wait for the request to be accepted."
      );
      return;
    } catch (err) {
      console.error("Error sending join request:", err);
      toast.error("Failed to send join request. Please try again.");
      return;
    } finally {
      setLoading(false);
    }
  };

  return (
    <DataContext.Provider
      value={{
        URLAPI,
        handleJoinGroup,
        getTokenAdmin,
        getTokenUser,
        getTokenInstructor,
        loading,
        userGroups,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export default Context;
