import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import CryptoJS from "crypto-js"; 
export const DataContext = createContext();

function Context({ children }) {
  const secretKey = "mySuperSecretKey123";
  // const getToken = (key) => {
  //   const encryptedToken = localStorage.getItem(key);
  //   if (encryptedToken) {
    
  //     const decryptedToken = CryptoJS.AES.decrypt(
  //       encryptedToken,
  //       secretKey
  //     ).toString(CryptoJS.enc.Utf8);
  //     return decryptedToken;
  //   }
  //   return null;
  // };
  // const token = getToken("tokenUser" || "tokenAdmin" )
  const getTokenAdmin = JSON.parse(localStorage.getItem("tokenAdmin"));
  const getTokenUser = JSON.parse(localStorage.getItem("tokenUser"));
  const [URLAPI] = useState("https://api-codeeagles-cpq8.vercel.app");
  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(true);

 

  // Fetch user's groups on component mount
  useEffect(() => {
    setLoading(true);
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
      setLoading(false); // If no getTokenUser, stop loading
    }
  }, [URLAPI, getTokenUser]);

  // Handle join group with groupId
  const handleJoinGroup = async (groupId) => {
    if (!getTokenUser) {
      toast.error("Please login to join the group.");
      return;
    }

    if (userGroups.status == "approved") {
      toast.info("You are already a member of this group.");
      return;
    }

    setLoading(true);
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
      setLoading(true);
    } catch (err) {
      // console.error("Error sending join request:", err);
      toast.error(
        "Failed to send join request: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  return (
    <DataContext.Provider
      value={{
        URLAPI,
        handleJoinGroup,
        getTokenAdmin,
        getTokenUser,
        // secretKey,
        // getToken,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export default Context;
