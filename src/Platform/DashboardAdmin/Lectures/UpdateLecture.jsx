import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast,  Toaster } from "react-hot-toast";
import { DataContext } from "../../Users/Context/Context";
import AdminService from "../../classes/AdminService";
import InstructorService from "../../classes/InstructorService";

function UpdateLecture() {
  const { groupId, lectureId } = useParams();
  const navigate = useNavigate();
  const { URLAPI, getTokenAdmin, getTokenInstructor } = useContext(DataContext);
  const [selectedFile, setSelectedFile] = useState(null);
  const [adminService] = useState(new AdminService(URLAPI, getTokenAdmin));
  const [instructorService] = useState(new InstructorService(URLAPI, getTokenInstructor));
  const [dataUpdate, setdataUpdate] = useState({
    title: "",
    description: "",
    article: "",
    resources: "" || [],
    groupId: groupId,
  });

  // التحقق من الصلاحيات
  useEffect(() => {
    if (!getTokenAdmin && !getTokenInstructor) {
      toast.error("Unauthorized. Please log in.");
      return;
    }
  }, [getTokenAdmin, getTokenInstructor, navigate]);

  // get lecture by id
  useEffect(() => {
    const getLecture = async () => {
      try {
        if (window.location.pathname.includes("/admin")) {
          const response = await adminService.getLectureDetails(lectureId);
          setdataUpdate(response.lecture);
        } else {
          const response = await instructorService.getLectureDetails(lectureId);
          setdataUpdate(response.lecture);
        }
      } catch (error) {
        console.error("Error fetching lecture:", error);
        toast.error("Failed to fetch lecture data");
      }
    };
    
    if (getTokenAdmin || getTokenInstructor) {
      getLecture();
    }
  }, [lectureId, URLAPI, getTokenAdmin, getTokenInstructor, adminService, instructorService, groupId]);

  // تعديل المحاضرة
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
      groupId: groupId,
    }
    try {
      if (window.location.pathname.includes("/admin")) {
        await adminService.updateLecture(lectureId, data);
      } else {
        await instructorService.updateLecture(lectureId, data);
      }

      const redirectPath = window.location.pathname.includes("/admin") 
        ? `/admin/${groupId}/lectures`
        : `/instructor/${groupId}/lectures`;
      
      navigate(redirectPath);
    } catch (error) {
      console.error("Error updating lecture:", error);
      toast.error("Failed to update lecture");
    }
  };

  return (
    <>
      <Toaster position="top-center" />

      <form className="row p-2 ms-1 w-100">
        <h2>Update Lecture</h2>
        <label htmlFor="">Title:</label>
        <input
          type="text"
          placeholder="Title"
          className="border rounded p-2 mt-2 mb-2 m-lg-1 col-lg-3 col-md-10 col-sm-5"
          onChange={(e) =>
            setdataUpdate({
              ...dataUpdate,
              title: e.target.value,
            })
          }
          value={dataUpdate.title}
        />

        <label htmlFor="">Description:</label>
        <input
          type="text"
          placeholder="Description"
          className="border rounded p-2 mt-2 mb-2 m-lg-1 col-lg-3 col-md-10 col-sm-5"
          onChange={(e) =>
            setdataUpdate({ ...dataUpdate, description: e.target.value })
          }
          value={dataUpdate.description}
        />

        <label htmlFor="">Article:</label>
        <input
          type="text"
          placeholder="Article"
          className="border rounded p-2 mt-2 mb-2 m-lg-1 col-lg-3 col-md-10 col-sm-5"
          onChange={(e) =>
            setdataUpdate({ ...dataUpdate, article: e.target.value })
          }
          value={dataUpdate.article}
        />

        <label htmlFor="">Resources URL:</label>
        <input
          type="text"
          placeholder="URL Lecture"
          className="border rounded p-2 mt-2 mb-2 m-lg-1 col-lg-3 col-md-10 col-sm-5"
          onChange={(e) =>
            setdataUpdate({
              ...dataUpdate,
              resources: e.target.value,
            })
          }
          value={dataUpdate.resources}
        />
      </form>

      <button
        className="btn btn-primary col-3 m-3"
        aria-label="submit"
        onClick={handleUpdate}
      >
        Update
      </button>
    </>
  );
}

export default UpdateLecture;
