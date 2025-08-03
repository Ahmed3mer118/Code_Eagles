import React, { useState, useEffect, useContext } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import UserService from "../../classes/UserService";
import AuthServices from "../../classes/Auth";
import CountUp from "react-countup"
import Loading from "../shared/Loading";

function AllGroup() {
  const authServices = new AuthServices();
  const token = authServices.getToken();
  const [userService] = useState(new UserService(token));
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await userService.getGroups();
        setGroups(response);
      } catch (err) {
        console.error("Error fetching groups:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [token]);
  const handleCourseInquiry = (courseId, courseTitle) => {
    const message = `عايز أعرف إزاي أشترك في كورس ${courseTitle}`;
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = import.meta.env.VITE_PHONE_NUMBER;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  if (loading) {
    return (
      <Loading />
    );
  }

  return (
    <>
      <section className="py-16 " id="courses">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-blue-600 mb-4">
              Available Courses
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our comprehensive programming courses and start your
              learning journey today
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.isArray(groups) &&
              groups.map((group) => (
                <div
                  key={group._id}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={group.imageCourse}
                      alt={group.title}
                      className="w-full h-full "
                      loading="lazy"
                    />
                    <div className="absolute top-3 right-3 bg-black/80 text-white text-sm px-3 py-1 rounded-full">
                      {group.start_date?.slice(0, 10) || "Coming Soon"}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">
                      {group.title}
                    </h3>

                    <div className="flex items-center justify-center mb-4">
                      <span className="text-gray-600 font-medium">
                        Instructor: {group.instructorName || "Ahmed Amer"}
                      </span>
                    </div>

                    <div className="flex flex-col space-y-3">
                      <Link
                        to={`/content/${group.slug}`}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg text-center transition-colors duration-200"
                      >
                        View Course Details
                      </Link>
                      <button
                        onClick={() =>
                          handleCourseInquiry(group._id, group.title)
                        }
                        className="w-full bg-blue-100 hover:bg-blue-200 text-blue-600 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Ask About This Course
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {(!Array.isArray(groups) || groups.length === 0) && (
            <div className="max-w-2xl mx-auto mt-12">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-blue-800">
                      No Courses Available
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        We're currently preparing new courses. Please check back
                        later or contact us for more information.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default AllGroup;
