import React, { useContext, useEffect, useState } from "react";
import "./nav.css"; // Make sure to import the CSS file
import Courses from "../Lecture/Courses";
import Group from "../Group/Group";
import AllGroup from "../Group/AllGroup";
import AllCourses from "../Lecture/AllCourses";
import axios from "axios";
import { DataContext } from "../Context/Context";
import FeedBack from "../FeedBack/FeedBack";
import Contact from "../Contact/Contact";
import About from "./About";

function Main() {
  const [group_Id, setGroupId] = useState(null);

  const userIdLocal = JSON.parse(localStorage.getItem("userId"));
  const { URLAPI, getTokenUser } = useContext(DataContext);
  // const phoneNumber = "201033705805";
  // const message = "عايز اعرف تفاصيل الدفعه الجديده";
  // const url = `https://api.whatsapp.com/send/?phone=${phoneNumber}&text=${encodeURIComponent(
  //   message
  // )}&type=phone_number&app_absent=0`;
  const handleWhatsAppRedirect = () => {
    const phoneNumber = "201033705805";
    const message = encodeURIComponent("عايز اعرف تفاصيل الدفعه الجديده");
    const url = `https://api.whatsapp.com/send/?phone=${phoneNumber}&text=${message}&type=phone_number&app_absent=0`;
    window.open(url, "", "heigth=500;width=500");
  };

  useEffect(() => {
    if (getTokenUser && getTokenUser) {
      axios
        .get(`${URLAPI}/api/groups`, {
          headers: {
            Authorization: `${getTokenUser}`,
          },
        })
        .then((res) => {
          const groups = res.data;
          const group = groups.find((group) =>
            group.members.some((member) => member._id === getTokenUser)
          );

          if (group) {
            setGroupId(group._id);
          } else {
            setGroupId(null);
          }
        })
        .catch((err) => {
          console.error("Error fetching groups:", err);
        });
    }
  }, [getTokenUser, URLAPI]);

  return (
    <>
      {group_Id ? (
        <>
          {/* <AllGroup /> عرض جميع المجموعات إذا كان الطالب في مجموعة */}
          <Courses />
        </>
      ) : (
        <>
          <div className="main-background">
            <div className="main-content">
              <h1>Web Development Courses Platform</h1>
              <p>
                Here you'll find everything you need to learn programming and
                build websites using the latest technologies.
              </p>
              {/* <a
                href={`${url}`}
                target="_blank"
                 rel="noopener noreferrer"
              > */}
              <button
                className="btn btn-success"
                onClick={handleWhatsAppRedirect}
                style={{
                  padding: "10px",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Book Now
              </button>
              {/* </a> */}
            </div>
          </div>
          <AllCourses />
          <About />
          <Group />
          <AllGroup />
          <FeedBack />
          {/* <UserChat /> */}
          <Contact />
        </>
      )}
    </>
  );
}

export default Main;
