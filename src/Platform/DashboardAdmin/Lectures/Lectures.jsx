import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Lecture.css";
import { DataContext } from "../../Users/Context/Context";

function Lectures() {
  const { URLAPI, getTokenAdmin } = useContext(DataContext);
  const { groupId, lectureId } = useParams();
  const [loading, setLoading] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [tableLecture, setTable] = useState(false);

  const [dataLecture, setDataLecture] = useState({
    title: "",
    description: "",
    article: "",
    resources: "",
    mediaLinks: "",
  });
  const [allDataLectures, setAllDataLectures] = useState([]);

  if (!getTokenAdmin) {
    toast.error("Unauthorized. Please log in.");
    return;
  }

  // get lecture by group id
  useEffect(() => {
    const fetchDataGroup = async () => {
      setLoading(true);
   
      await axios
        .get(`${URLAPI}/api/lectures/group/${groupId}`, {
          headers: {
            Authorization: `${getTokenAdmin}`,
          },
        })
        .then((response) => {
          setAllDataLectures(response.data.lectures);
          setLoading(false);
        })
        .catch((err) => {
          console.log("No Lectures " + err);
          setLoading(false);
        });
    };

    fetchDataGroup();
  }, [groupId, tableLecture]);

  const handleChangeLecture = (e) => {
    e.preventDefault();
    setTable(!tableLecture);
  };
  // add lecture 
  const handleAddLecture = async (e) => {
    e.preventDefault();

    if (dataLecture.title && dataLecture.description && dataLecture.article) {
      try {
        await axios
          .post(
            `${URLAPI}/api/lectures`,
            {
              group_id: groupId,
              title: dataLecture.title,
              description: dataLecture.description,
              article: dataLecture.article,
              resources: dataLecture.resources,
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `${getTokenAdmin}`, // تأكد أن الـ token موجود
              },
            }
          )
          .then((response) => {
            if (response.status === 201) {
              toast.success("Lecture created successfully!");
              setTimeout(() => {
                setTable(false)
              }, 2000);
            } else {
              toast.error("Failed to create lecture.");
            }
          });
      } catch (error) {
        console.error("Error adding lecture:", error);
        if (error.response) {
          toast.error(
            `Error: ${
              error.response.data.message || "Failed to create lecture."
            }`
          );
        } else {
          toast.error("Error adding lecture.");
        }
      }
    } else {
      toast.error("Please fill in all fields!");
    }
  };

  // delete lecture
  const handleDeleteLecture = (id) => {
    axios
      .delete(`${URLAPI}/api/lectures/${id}`, {
        headers: {
          Authorization: `${getTokenAdmin}`,
        },
      })
      .then(
        () => toast.success("Delete Lecture Successful"),
        setTimeout(() => {
          window.location.reload();
        }, 3000)
      );
  };

  // const handleUploadLecture = async (file) => {
  //   const formData = new FormData();
  //   formData.append("file", file);
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

  //     return response.data.url; // افترض أن السحابة ترجع الرابط في `url`
  //   } catch (error) {
  //     console.error("Error uploading file:", error);
  //     toast.error("Error uploading file");
  //     throw error;
  //   }
  // };

  return (
    <>
      <ToastContainer position="top-right" />
      {loading && <h1>Loading...</h1>}
      <button className="btn btn-success m-2" onClick={handleChangeLecture}>
        {tableLecture ? "Show Lectures" : "New Lecture"}
      </button>
      {!tableLecture ? (
        <main className="container m-auto  mt-2 p-2 row  lectures-card">
          {allDataLectures.map((item, index) => (
            <div className="card" key={index}>
              <ul className="list-group list-group-flush ">
                <li className="list-group-item">Number :{item.title}</li>
                <li className="list-group-item">article :{item.article}</li>
                <li className="list-group-item">
                  description : {item.description}
                </li>
                <li className="list-group-item">
                  <Link
                    target="_blank"
                    to={`${item.resources}`}
                    className="text-primary"
                  >
                    Link Lecture
                  </Link>
                </li>
                <li className="list-group-item">
          
                  Attendance : <Link to={`/admin/${groupId}/lectures/${item._id}/attendance`}> {item.attendanceCount}</Link>
                </li>
                {/* <li className="list-group-item">Upload : </li> */}
                <li className="list-group-item">
                  <Link
                    to={`/admin/${groupId}/lectures/${item._id}/newTask`}
                    className="btn btn-success"
                  >
                    New Task
                  </Link>
                </li>
                {/* <li className="list-group-item">
                  <Link
                    to={`/admin/${groupId}/tasks/${item._id}`}
                    className="text-light btn btn-primary"
                  >
                    View Task
                  </Link>
                </li> */}
                <li className="list-group-item">
                  <Link
                    to={`/admin/${groupId}/lectures/Qr-code/${item._id}`}
                    className="text-light  btn btn-success"
                  >
                    Create QR
                  </Link>
                </li>

                <li className="list-group-item">
                  <Link to={`/admin/${groupId}/lectures/update/${item._id}`}>
                    <button className="btn btn-success m-2">Update</button>
                  </Link>

                  <button
                    className="btn btn-danger m-2"
                    onClick={() => {
                      handleDeleteLecture(item._id);
                    }}
                  >
                    Delete
                  </button>
                </li>
              </ul>
            </div>
          ))}
        </main>
      ) : (
        <>
          <form className="row p-3 w-100 m-2">
            <h2>New Lecture</h2>
            <input
              type="text"
              placeholder="Title"
              className="border rounded p-2 m-2 col-lg-6 col-md-10 col-sm-5"
              onChange={(e) =>
                setDataLecture({
                  ...dataLecture,
                  title: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="article"
              className=" border rounded p-2 m-2 col-lg-6 col-md-10 col-sm-5"
              onChange={(e) =>
                setDataLecture({ ...dataLecture, article: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="description"
              className=" border rounded p-2 m-2 col-lg-6 col-md-10 col-sm-5"
              onChange={(e) =>
                setDataLecture({ ...dataLecture, description: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Url lecture"
              className=" border rounded p-2 m-2 col-lg-6 col-md-10 col-sm-5"
              onChange={(e) =>
                setDataLecture({
                  ...dataLecture,
                  resources: e.target.value,
                })
              }
            />
          </form>
          <button
            className="btn btn-primary m-2 col-lg-3 col-md-5 ms-4 "
            onClick={handleAddLecture}
          >
            Create
          </button>
        </>
      )}

      <Outlet />
    </>
  );
}

export default Lectures;
