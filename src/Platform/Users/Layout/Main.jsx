import React, { useContext, useEffect, useState } from "react";
import "./nav.css"; // Make sure to import the CSS file
import Courses from "../Lecture/Courses";
import Group from "../Group/Group";
import AllGroup from "../Group/AllGroup";
import axios from "axios";
import { DataContext } from "../Context/Context";
import FeedBack from "../FeedBack/FeedBack";
import Contact from "../Contact/Contact";
import About from "./About";
import Content from "../Lecture/Content";
import { GoArrowUp } from "react-icons/go";

function Main() {
  const handleWhatsAppRedirect = () => {
    const phoneNumber = "201033705805";
    const message = encodeURIComponent("عايز اعرف تفاصيل الاشتراك ");
    const url = `https://api.whatsapp.com/send/?phone=${phoneNumber}&text=${message}&type=phone_number&app_absent=0`;
    window.open(url, "", "heigth=500;width=500");
  };
  const [showScoll, setShowScoll] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      const scrollSpan = 500;
      window.scrollY > scrollSpan ? setShowScoll(true) : setShowScoll(false);
    };
    window.addEventListener("scroll", handleScroll);
 
  }, []);
  const scrollTop = ()=>{
    window.scrollTo({
      top:0,
      behavior:"smooth"
    })
  }

  return (
    <>
      <>
        <div className="main-background">
          <div className="main-content">
            {/* <h1 className="cssanimation typing text-center">Web Development Courses Platform</h1> */}
            <h1 className="text-center">Web Development Courses Platform</h1>
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
              aria-label="Submit Form"
            >
              Book Now
            </button>
            {/* </a> */}
          </div>
        </div>
        <Content />
        <About />
        <Group />
        <AllGroup />
        <FeedBack />
        {/* <UserChat /> */}
        <Contact />
      </>
      {showScoll && (
        <span
        onClick={scrollTop}
          aria-label="span"
          className="bg-success"
          style={{
            position: "fixed",
            bottom: "10px",
            right: "30px",
            borderRadius: "50%",
            cursor: "pointer",
            padding: "10px",
            height:"40px",
            width:"40px",
            display:"flex",
            justifyContent:"center",
            alignItems:"center",
            fontSize: "18px",
            color: "white",
          }}
        >
          <GoArrowUp />
        </span>
      )}
    </>
  );
}

export default Main;
