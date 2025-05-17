import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { DataContext } from "../../Users/Context/Context";
import { Helmet } from "react-helmet-async";
import InstructorService from "../../classes/InstructorService";
import AdminService from "../../classes/AdminService";

function Tasks() {
  const { groupId, lectureId } = useParams(); 
  const { URLAPI, getTokenAdmin, getTokenInstructor } = useContext(DataContext);
  const [tasksState, setTasksState] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [adminService] = useState(new AdminService(URLAPI, getTokenAdmin));
  const [instructorService] = useState(new InstructorService(URLAPI, getTokenInstructor));

  useEffect(() => {
    if(window.location.pathname.includes("/admin")){  
      if (!getTokenAdmin) {
        toast.error("Unauthorized. Please log in.");
        return;
      }
    }
    else{
      if (!getTokenInstructor) {
        toast.error("Unauthorized. Please log in.");
        return;
      }
      }
  }, [getTokenAdmin, getTokenInstructor]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let response;
        if (window.location.pathname.includes("/admin")) {
          response = await adminService.getTasks(groupId);
        } else {
          response = await instructorService.getTasks(groupId);
         
        }
        
        if (response && response.tasks) {
          setTasksState(response.tasks);
        } else {
          setTasksState([]);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast.error("Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [groupId, getTokenAdmin, getTokenInstructor]);

  return (
    <>
      <Helmet>
        <title>Code Eagel - Tasks</title>
      </Helmet>
      <Toaster />
      {loading ? (
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
      ) : (
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
            {tasksState.map((task) => (
              
              <tr key={task.taskId}>
                <td className="border p-2">{task.lectureTitle}</td>
                <td className="border p-2">{task.taskDescription}</td>
                <td className="border p-2">
                  <Link
                    to={`/${window.location.pathname.includes("/admin") ? "admin" : "instructor"}/${groupId}/lectures/${task.lectureId}/tasks/${task.taskId}/submissions`}
                    aria-label="link"
                  >
                 
                    {task.submissions?.length || 0}
                  </Link>
                </td>
                {/* <td className="border p-2">
                  {task.start_date?.slice(0, 10) || "N/A"}
                </td> */}
                <td className="border p-2">
                  {task.endDate ? new Date(task.endDate).toLocaleDateString() : "N/A"}
                </td>
                <td className="border p-2">
                  <Link
                    to={`/${window.location.pathname.includes("/admin") ? "admin" : "instructor"}/${groupId}/lectures/${task.lectureId}/tasks/updateTask/${task.taskId}`}
                    aria-label="link"
                  >
                    See More
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

export default Tasks;
