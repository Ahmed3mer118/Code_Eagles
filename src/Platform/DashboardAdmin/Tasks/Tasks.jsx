import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { DataContext } from "../../Users/Context/Context";
import "./Task.css";
import { Helmet } from "react-helmet-async";

function Tasks() {
  const { groupId, lectureId } = useParams(); // يتم استخدام lectureId بدلاً من taskId هنا
  const { URLAPI, getTokenAdmin } = useContext(DataContext);
  const [dataLecture, setDataLecture] = useState([]);

  if (!getTokenAdmin) {
    toast.error("Unauthorized. Please log in.");
    return;
  }

  useEffect(() => {
    axios
      .get(`${URLAPI}/api/lectures/group/${groupId}`, {
        headers: {
          Authorization: `${getTokenAdmin}`,
        },
      })
      .then((res) => {
        console.log(res.data.lectures)
        const filterTaskGroup = res.data.lectures.filter((item) => {
          return  item.tasks && item.tasks.length > 0;
        });
        setDataLecture(filterTaskGroup);
      })
      .catch((error) => {
        console.error("Error fetching lectures:", error);
        toast.error("Failed to load lectures");
      });
  }, [groupId, getTokenAdmin]);

  return (
    <>
      <Helmet>
        <title>Tasks</title>
      </Helmet>
      <ToastContainer />
      <table className="table text-center mt-2 mb-2">
        <thead>
          <tr>
            <th className="border p-2">Lecture</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Submitted By</th>
            {/* <th className="border p-2">Start Date</th> */}
            <th className="border p-2">End Date</th>
            <th className="border p-2">See More</th>
          </tr>
        </thead>
        <tbody>
          {dataLecture.map((lecture) => (
            <React.Fragment key={lecture._id}>
              {lecture.tasks?.map((task) => (
                <tr key={task._id}>
                  <td className="border p-2">{lecture.title}</td>
                  <td className="border p-2">{task.description_task}</td>
                  <td className="border p-2">
                    <Link
                      to={`/admin/${groupId}/lectures/${lecture._id}/tasks/${task._id}/submissions`}
                       aria-label="link"
                    >
                      {task.submissions.length > 0
                        ? task.submissions.length
                        : 0}
                    </Link>
                  </td>
                  {/* <td className="border p-2">
                    {task.start_date?.slice(0, 10) || "N/A"}
                  </td> */}
                  <td className="border p-2">
                    {task.end_date?.slice(0, 10) || "N/A"}
                  </td>
                  <td className="border p-2">
                    <Link
                      to={`/admin/${groupId}/lectures/${lecture._id}/tasks/updateTask/${task._id}`}
                       aria-label="link"
                    >
                      See More
                    </Link>
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default Tasks;
