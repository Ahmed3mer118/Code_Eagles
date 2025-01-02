import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { DataContext } from "../../Users/Context/Context";

function UpdateLecture() {
  const { groupId, lectureId } = useParams();
  const navigate = useNavigate();
  const { URLAPI, getTokenAdmin } = useContext(DataContext);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dataUpdate, setdataUpdate] = useState({
    title: "",
    description: "",
    article: "",
    resources: "",
    link_lecture: "",
    mediaLinks: "",
  });

  if (!getTokenAdmin) {
    toast.error("Unauthorized. Please log in.");
    return;
  }

  // get lecture by id
  useEffect(() => {
    axios
      .get(`${URLAPI}/api/lectures/${lectureId}`, {
        headers: {
          Authorization: `${getTokenAdmin}`,
        },
      })
      .then((res) => {
        setdataUpdate(res.data.lecture); // تخزين المحاضرة الحالية للتعديل عليها
      })
      .catch((err) => {
        console.error("Error fetching lecture:", err);
        toast.error("Error fetching lecture");
      });
  }, [lectureId, URLAPI, getTokenAdmin]);


  // تعديل المحاضرة
  const handleUpdate = (e) => {
    e.preventDefault();
    // التأكد من أن جميع الحقول المطلوبة موجودة
    if (dataUpdate.title && dataUpdate.description && dataUpdate.article) {
      axios
        .put(
          `${URLAPI}/api/lectures/${lectureId}`,
          {
            ...dataUpdate,
            group_id: groupId, // تضمين الـ group_id
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `${getTokenAdmin}`,
            },
          }
        )
        .then(() => {
          toast.success("Lecture updated successfully");
          setTimeout(() => {
            navigate(`/admin/${groupId}/lectures`);
          }, 2000);
        })
        .catch((err) => {
          console.error("Error updating lecture:", err);
          toast.error("Failed to update lecture");
        });
    } else {
      toast.error("Please fill in all fields");
    }
  };
  // const handleUploadLecture = async () => {
  //   if (!selectedFile) {
  //     toast.error("Please select a file to upload");
  //     return;
  //   }

  //   const formData = new FormData();
  //   formData.append("file", selectedFile);

  //   try {
  //     const response = await axios.post(
  //       `${URLAPI}/api/lectures/uploadMediaAndUpdateLecture`,
  //       formData,
  //       {
  //         headers: {
  //           Authorization: `${getTokenAdmin}`,
  //           "Content-Type": "multipart/form-data",
  //         },
  //       }
  //     );
  //     // إضافة رابط الفيديو إلى mediaLinks
  //     setdataUpdate((prevData) => ({
  //       ...prevData,
  //       mediaLinks: response.data.url, // تأكد أن الـ URL يتم إرجاعه في الـ response
  //     }));
  //     toast.success("Video uploaded successfully");
  //   } catch (error) {
  //     console.error("Error uploading file:", error);
  //     toast.error("Error uploading file");
  //   }
  // };

  // التعامل مع تغيير الملف
  // const handleFileChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setSelectedFile(file); // تخزين الملف قبل رفعه
  //   }
  // };

  return (
    <>
      <ToastContainer />
      {/* <div className="p-2">
        <h3>Upload Video</h3>
        <input
          type="file"
          onChange={handleFileChange}
          className="form-control w-50 m-2"
        />
        <button
          onClick={handleUploadLecture}
          className="btn btn-success m-2 col-lg-3 col-md-5 ms-4"
        >
          Upload Lecture
        </button>
      </div> */}

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

      <button className="btn btn-success col-3 m-3" onClick={handleUpdate}>
        Update
      </button>
    </>
  );
}

export default UpdateLecture;
