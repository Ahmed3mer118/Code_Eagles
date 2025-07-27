import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import About from "../shared/Layout/About";
import { toast, Toaster } from "react-hot-toast";
import UserService from "../../classes/UserService";
import AuthServices from "../../classes/Auth";
import Loading from "../shared/Loading";

function Content() {
  const { slug } = useParams();
  const authServices = new AuthServices()
  const token = authServices.getToken()
  const [group, setGroup] = useState({});
  const [courses, setCourses] = useState([]);
  const [about, setAbout] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visibleCourses, setVisibleCourses] = useState({});
  const courseRefs = useRef([]);
  const [userService] = useState(new UserService(token));

  useEffect(() => {
    const fetchGroup = async () => {

      setLoading(true);
      if (slug) {
        try {
          const response = await userService.getGroupById(slug);
          setGroup(response);
          setCourses(response.course_details || []);
          setAbout(response.about_course || []);
        } catch (error) {
          toast.error("Failed to load course data");
        } finally {
          setLoading(false);
        }
      }
      window.scrollTo(0, 0);
    };
    fetchGroup();
  }, [slug, token]);

  const courseBox = (index) => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisibleCourses((prev) => ({
          ...prev,
          [index]: entry.isIntersecting,
        }));
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
    courseRefs.current.forEach((_, index) => courseBox(index));
  }, [courses]);

  if (loading) {
    return (
        <Loading />
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-8">
          Course: {group.title}
        </h1>

        <div className="flex flex-wrap justify-center gap-6">
          {courses.map((course, index) => (
            <div
              key={index}
              ref={(el) => (courseRefs.current[index] = el)}
              className={`bg-white rounded-xl shadow-md w-64 p-4 transform transition duration-700 ease-out ${
                visibleCourses[index]
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-5"
              }`}
            >
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-40 object-cover rounded-lg mb-3"
                loading="lazy"
              />
              <h2 className="text-xl font-semibold text-gray-800 mb-1">
                {course.title}
              </h2>
              <p className="text-sm text-gray-600 mb-3">{course.short_description}</p>
              <Link
                to={`/content/${slug}/course/${course._id}`}
                className="inline-block text-blue-600 font-medium hover:underline"
              >
                See More
              </Link>
            </div>
          ))}
        </div>

        {/* About Section */}
        <About group={group} about={about} courses={courses} loading />
      </div>
    </>
  );
}

export default Content;
