import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import CryptoJS from "crypto-js";
import Cookies from "js-cookie";
export const DataContext = createContext();

function Context({ children }) {
  // const secretKey = "mySuperSecretKey123";
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

  // const getTokenUser = Cookies.get("tokenUser");
  // const getTokenAdmin = Cookies.get("tokenAdmin");

  // Cookies.set("tokenUser", getTokenUser, { expires: 3 * 60 * 60 * 1000 });
  // Cookies.set("tokenAdmin", getTokenAdmin, { expires: 3 * 60 * 60 * 1000 });

  // axios.defaults.withCredentials = true;

  useEffect(() => {
    const handleCopy = async (event) => {
      const currentToken = localStorage.getItem("tokenUser");

      if (currentToken) {
        // منع النسخ الافتراضي
        event.preventDefault();

        // إنشاء توكن جديد
        const newToken = generateNewToken(); // دالة لإنشاء توكن جديد

        // تحديث التوكن في localStorage
        localStorage.setItem("tokenUser", newToken);

        // // إرسال التوكن الجديد إلى الخادم لتحديثه
        // await updateTokenOnServer(newToken);

        // إظهار رسالة للمستخدم
        toast.warning("Token has been changed for security reasons.");
      }
    };

    // إضافة مستمع لحدث copy
    document.addEventListener("copy", handleCopy);

    // تنظيف المستمع عند إلغاء التثبيت
    return () => {
      document.removeEventListener("copy", handleCopy);
    };
  }, []);

  // دالة لإنشاء توكن جديد
  const generateNewToken = () => {
    return `new-token-${Math.random().toString(36).substring(2, 15)}`;
  };

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
        headers: { Authorization: `${getTokenUser}` },
      });

      const joinRes = {
        groupId,
        userId: userRes.data._id,
      };
      console.log(userRes.data.token);
      if (userRes.data.token) {
        // Send the join request
        await axios.post(`${URLAPI}/api/users/joinGroupRequest`, joinRes, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        toast.success(
          "Your request to join has been sent successfully. Please wait for the request to be accepted."
        );
        setLoading(true);
      }
    } catch (err) {
      // console.error("Error sending join request:", err);
      toast.error("Please Login , try agian");
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
