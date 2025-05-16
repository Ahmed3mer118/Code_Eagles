import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import About from "../Layout/About";
import { DataContext } from "../Context/Context";
import axios from "axios";

import { toast, Toaster } from "react-hot-toast";
import UserService from "../../classes/UserService";  
function Content() {
  const [group, setGroup] = useState([]);
  const [courses, setCourses] = useState([]);
  const [about, setAbout] = useState([]);
  const { contentId } = useParams();
  const { URLAPI, getTokenUser } = useContext(DataContext);
  const [visibleCourses, setVisibleCourses] = useState({});
  const courseRefs = useRef([]);
  const [userService] = useState(new UserService(getTokenUser));
  const [loading, setLoading] = useState(false);
  // const showAbout = location.pathname === "/content/?:contentId";

  useEffect(() => {
    const fetchGroup = async () => {
      if (contentId) {
        setLoading(true);
        const response = await userService.getGroupById(contentId);
        setGroup(response);
        setCourses(response.course_details || []);
        setAbout(response.about_course || []);
        setLoading(false);
      }
    };
    fetchGroup();
  }, [contentId, getTokenUser]);



  const courseBox = (index) => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCourses((prev) => ({
            ...prev,
            [index]: true,
          }));
        } else {
          setVisibleCourses((prev) => ({
            ...prev,
            [index]: false,
          }));
        }
      },
      { threshold: 0.1 }
    );

    if (courseRefs.current[index]) {
      observer.observe(courseRefs.current[index]);
    }

    return () => {
      if (courseRefs.current[index]) {
        observer.unobserve(courseRefs.current[index]);
      }
    };
  };

  useEffect(() => {
    courseRefs.current.forEach((item, index) => courseBox(index));
  }, [courses]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
        }}
      >
        <svg
          className="loading"
          viewBox="25 25 50 50"
          style={{ width: "3.25em" }}
        >
          <circle r="20" cy="50" cx="50"></circle>
        </svg>
      </div>
    );
  }

  return (
    <>
    <Toaster position="top-center"/>
    <div style={{ padding: "20px" }}>
      {[group].map((item,index) => (
        <h1 className="text-center" key={index}>Course : {item.title}</h1>
      ))}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          width: "80%",
          margin: "auto",
        }}
      >
        {courses.map((course, index) => (
          <div
            key={index}
            ref={(el) => (courseRefs.current[index] = el)}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "15px",
              width: "250px",
              textAlign: "center",
              margin: "auto",
              opacity: visibleCourses[index] ? 1 : 0,
              transform: visibleCourses[index]
                ? "translateY(0)"
                : "translateY(20px)",
              transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
            }}
          >
            <img
              src={course.image} 
              alt={course.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "5px",
              }}
              loading="lazy"
            />
            <h2 className="mt-2">{course.title}</h2>
            <p>{course.short_description}</p>
            <Link to={`/content/${contentId}/course/${course._id}`} >
              See More
            </Link>
          </div>
        ))}
      </div>
      {/* {showAbout && <About />} */}
      <About group={group} about={about} courses={courses} loading />
    </div>
    </>
  );
}

export default Content;
