import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

export const DataContext = createContext();
import AuthServices from "../classes/Auth";
import UserService from "../classes/UserService";
function Context({ children }) {
  const userService = new UserService();
  const authServices = new AuthServices();
  const token = authServices.getToken();
  const URLAPI = authServices.URLAPI;

  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's groups on component mount

  useEffect(() => {
    const fetchUserGroups = async () => {
      setLoading(true);
      if (token) {
        try {
          const res = await userService.getUserById();
          setUserGroups(res.groups || []);
        } catch (err) {
          console.error("Error fetching user groups:", err?.message);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserGroups();
  }, [URLAPI, token]);

  // Handle join group with groupId, requestType, and note
  const handleJoinGroup = async (groupId, requestType, note) => {
    if (!token) {
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

      await userService.joinGroupRequest(joinRes);

      toast.success(
        "Your request to join has been sent successfully. Please wait for the request to be accepted."
      );
      return;
    } catch (err) {
      toast.error(err.message);
      return;
    } finally {
      setLoading(false);
    }
  };

  if (token) {
    try {
      const decoded = jwtDecode(token);
      console.log(decoded);
    } catch (err) {
      console.error("Invalid token:", err);
    }
  }

  return (
    <DataContext.Provider
      value={{
        URLAPI,
        handleJoinGroup,
        token,
        loading,
        userGroups,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export default Context;
