import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import InstructorService from "../../classes/InstructorService";
import AuthServices from "../../classes/Auth";
import AdminService from "../../classes/AdminService";
function UpdateLecture() {
  const authServices = new AuthServices();
  const token = authServices.getToken();
  const URLAPI = authServices.URLAPI;
  const adminServices = new AdminService(token);
  const instructorService = new InstructorService(token);
  const { slug, slugLecture } = useParams();
  const navigate = useNavigate();
  const [dataUpdate, setdataUpdate] = useState({
    title: "",
    description: "",
    article: "",
    resources: "" || [],
    groupSlug: slug,
  });

  useEffect(() => {
    if (!token) {
      toast.error("Unauthorized. Please log in.");
      return;
    }
  }, [token, navigate]);

  // get lecture by id
  useEffect(() => {
    const getLecture = async () => {
      try {
        if (window.location.pathname.includes("/dashboard")) {
          const response = await adminServices.getLectureDetails(slugLecture);
          console.log(response.lecture)
          setdataUpdate(response.lecture);
        } else {
          const response = await instructorService.getLectureDetails(
            slugLecture
          );
          setdataUpdate(response.lecture);
        }
      } catch (error) {
        toast.error("Failed to fetch lecture data");
      }
    };
    getLecture();
  }, [slugLecture, token, slug]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!dataUpdate.title || !dataUpdate.description || !dataUpdate.article) {
      toast.error("Please fill in all fields");
      return;
    }

    const data = {
      title: dataUpdate.title,
      description: dataUpdate.description,
      article: dataUpdate.article,
      resources: dataUpdate.resources,
      groupSlug: slug,
    };
    try {
      if (window.location.pathname.includes("/dashboard")) {
        await adminServices.updateLecture(slugLecture, data);
      } else {
        await instructorService.updateLecture(slugLecture, data);
      }

      const redirectPath = window.location.pathname.includes("/dashboard")
        ? `/dashboard/admin/group/${slug}/lectures`
        : `/instructor/${slug}/lectures`;

      navigate(redirectPath);
    } catch (error) {
      toast.error("Failed to update lecture");
    }
  };

  return (
    <>
      <Toaster position="top-center" />

      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Update Lecture
        </h2>

        <form className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              placeholder="Lecture Title"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              onChange={(e) =>
                setdataUpdate({ ...dataUpdate, title: e.target.value })
              }
              value={dataUpdate.title}
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              placeholder="Lecture Description"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows="3"
              onChange={(e) =>
                setdataUpdate({ ...dataUpdate, description: e.target.value })
              }
              value={dataUpdate.description}
            ></textarea>
          </div>

          <div>
            <label
              htmlFor="article"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Article
            </label>
            <input
              type="text"
              id="article"
              placeholder="Related Article"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              onChange={(e) =>
                setdataUpdate({ ...dataUpdate, article: e.target.value })
              }
              value={dataUpdate.article}
            />
          </div>

          <div>
            <label
              htmlFor="resources"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Resources URL
            </label>
            <input
              type="url"
              id="resources"
              placeholder="https://example.com/resources"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              onChange={(e) =>
                setdataUpdate({ ...dataUpdate, resources: e.target.value })
              }
              value={dataUpdate.resources}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleUpdate}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
              aria-label="Update lecture"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              Update Lecture
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default UpdateLecture;
