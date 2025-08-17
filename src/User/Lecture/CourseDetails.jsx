import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Loading from "../shared/Loading";
import AuthServices from "../../classes/Auth";
import UserService from "../../classes/UserService";

function CourseDetail() {
  const { slug, contentId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const authServices = new AuthServices();
  const token = authServices.getToken();
  const userService = new UserService(token);

  useEffect(() => {
    const fetchCourse = async () => {
      window.scrollTo(0, 0);
      try {
        setLoading(true);
        setError(null);
        
        if (slug) {
          const response = await userService.getGroupById(slug);
          const foundCourse = response.course_details?.find(c => c._id === contentId);
          
          if (foundCourse) {
            setCourse(foundCourse);
          } else {
            setError("Course content not found");
          }
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [slug, contentId, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <svg
            className="h-12 w-12 text-red-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-xl font-medium text-gray-900 mb-2">{error || "Course not found"}</h2>
          <p className="text-gray-600">
            The requested course content could not be loaded. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Course Image */}
        <div className="lg:w-1/2">
          <div className="rounded-xl overflow-hidden shadow-lg bg-white">
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-64 sm:h-80 md:h-96 "
              loading="lazy"
            />
          </div>
        </div>

        {/* Course Details */}
        <div className="lg:w-1/2">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 sm:p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
              
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Course Description</h2>
                <ol className="space-y-3">
                  {course.description?.split(". ").filter(Boolean).map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg
                        className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700">{item}.</span>
                    </li>
                  ))}
                </ol>
              </div>

           
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;