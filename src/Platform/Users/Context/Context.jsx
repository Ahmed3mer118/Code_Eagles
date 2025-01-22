import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const DataContext = createContext();

function Context({ children }) {
  let getTokenAdmin, getTokenUser;

  getTokenAdmin = JSON.parse(localStorage.getItem("tokenAdmin") || "null");
  getTokenUser = JSON.parse(localStorage.getItem("tokenUser") || "null");
  const token = () => {
    const token = localStorage.getItem("token"); // أو أي طريقة أخرى للتحقق من تسجيل الدخول
    return !!token; // تُرجع true إذا كان token موجودًا، و false إذا لم يكن موجودًا
  };
  // const [URLAPI] = useState("https://api-codeeagles-cpq8.vercel.app");
  const URLAPI = import.meta.env.VITE_API_URL;
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
          console.error("Error fetching user groups:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false); // If no getTokenUser, stop loading
      }
    };

    fetchUserGroups();
  }, [URLAPI, getTokenUser]);

  // Handle join group with groupId
  const handleJoinGroup = async (groupId) => {
    if (!getTokenUser) {
      toast.error("Please login to join the group.");
      return;
    }

    setLoading(true);
    try {
      // Fetch user details to get userId
      const userRes = await axios.get(`${URLAPI}/api/users`, {
        headers: { Authorization: `${getTokenUser}` },
      });

      const userId = userRes.data._id;

      const FilterMember = userGroups.filter(
        (element) => element.groupId == groupId
      );

      for (let i = 0; i < FilterMember; i++) {
        const element = FilterMember[i];

        if (element.status == "approved") {
          toast.info("You are already a member of this group.");
          return;
        } else {
          toast.info(
            "You have already sent a request. Please wait for approval."
          );
          return;
        }
      }

      // Send the join request
      const joinRes = {
        groupId,
        userId,
      };

      await axios.post(`${URLAPI}/api/users/joinGroupRequest`, joinRes, {
        headers: {
          "Content-Type": "application/json",
          Authorization: getTokenUser,
        },
      });

      toast.success(
        "Your request to join has been sent successfully. Please wait for the request to be accepted."
      );
      return;
    } catch (err) {
      console.error("Error sending join request:", err);
      toast.error("Failed to send join request. Please try again.");
      setLoading(false);
    }
  };

  // Memoize values for better performance
  // const memoizedUserGroups = useMemo(() => userGroups, [userGroups]);
  // const memoizedHandleJoinGroup = useCallback(handleJoinGroup, [getTokenUser, userGroups, URLAPI]);

  return (
    <DataContext.Provider
      value={{
        URLAPI,
        // handleJoinGroup: memoizedHandleJoinGroup,
        handleJoinGroup,
        getTokenAdmin,
        getTokenUser,
        loading,
        token,
        // userGroups: memoizedUserGroups,
        userGroups,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export default Context;
