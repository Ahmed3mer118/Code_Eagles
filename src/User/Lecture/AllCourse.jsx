import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import "./Courses.css";
import { Helmet } from "react-helmet-async";
import UserService from "../../classes/UserService";
import AuthServices from "../../classes/Auth";
import Loading from "../shared/Loading";
function AllCourse() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const authServices = new AuthServices();
  const token = authServices.getToken();
  const [userService] = useState(new UserService(token));
  const navigate = useNavigate();
  

  // Fetch all groups and filter approved ones
  useEffect(() => {
    window.scrollTo(0,0)
    const fetchCourses = async () => {
      setLoading(true);
      try {
        if (!token) {
          toast.error("Please login to join the group.");
          setTimeout(() => {
            if (window.confirm("If you want to go to login page, click ok.")) {
              sessionStorage.setItem("redirectLocation", window.location.href);
              navigate("/auth/login");
            }
          }, 2500);
          return;
        }
        // Fetch user details to get groups
        const userRes = await userService.getUserById();
        const approvedCourses = userRes.groups.filter(
          (group) => group.status === "approved" || group.status == "special"
        );

        // Fetch details for each approved course
        const courseDetails = await Promise.all(
          approvedCourses.map(async (element) => {
            const res = await userService.getGroupById(element.groupSlug );
            return {
              ...res,
              attendancePercentage: element.attendancePercentage,
            };
          })
        );
        // Set the courses state with the fetched details
        setCourses(courseDetails);
      } catch (err) {
        console.error("Error fetching courses:", err);
        toast.error("Failed to fetch courses.");
        return;
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [token]);

  // Handle navigation to course details
  const handleViewCourse = (groupSlug) => {
    navigate(`/course/${groupSlug}`);
  };

  if (loading) {
    return (
      <Loading />
    );
  }

  return (
    <>
      <Helmet>
        <title>Code Eagles | My Couses</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Courses</h1>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(courses) && 
            // courses.isDeleted == true && 
              courses.map((course) => {
                const percentage = course.attendancePercentage || 0;
                const startDate = course.start_date
                  ? new Date(course.start_date).toLocaleDateString()
                  : "Not scheduled";

                return (
                  <div
                    key={course._id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-3">
                        {course.title}
                      </h3>

                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <p className="text-sm text-gray-600">Start Date:</p>
                          <p className="font-medium text-gray-700">
                            {startDate}
                          </p>
                        </div>

                        <div className="relative w-20 h-20">
                          <svg className="w-full h-full" viewBox="0 0 36 36">
                            <circle
                              cx="18"
                              cy="18"
                              r="16"
                              fill="none"
                              stroke="#e6e6e6"
                              strokeWidth="2"
                            />
                            <circle
                              cx="18"
                              cy="18"
                              r="16"
                              fill="none"
                              stroke="#10b981"
                              strokeWidth="2"
                              strokeDasharray={`${percentage} 100`}
                              strokeLinecap="round"
                              transform="rotate(-90 18 18)"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm font-bold text-emerald-600">
                              {Math.round(percentage)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleViewCourse(course.slug)}
                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                        aria-label={`View ${course.title} course`}
                      >
                        View Course
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No courses found
            </h3>
            <p className="mt-1 text-gray-500">
              You haven't registered for any courses yet.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default AllCourse;
