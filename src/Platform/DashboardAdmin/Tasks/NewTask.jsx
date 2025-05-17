import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { DataContext } from "../../Users/Context/Context";
import { Helmet } from "react-helmet-async";
import AdminService from "../../classes/AdminService";
import InstructorService from "../../classes/InstructorService";
function NewTask() {
  const { URLAPI, getTokenAdmin, getTokenInstructor } = useContext(DataContext);
  const { groupId, lectureId, taskId } = useParams();
  const [newTask, setNewTask] = useState({
    description_task: "",
    start_date: "",
    end_date: "",
  });
  const [updateTask, setUpdateTask] = useState({
    description_task: "",
    start_date: "",
    end_date: "",
  });
  const [switchTask, setSwitchTask] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
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
  // إضافة مهمة جديدة
  const handleAddTask = async (e) => {
    e.preventDefault();
    let response;
    if(window.location.pathname.includes("/admin")){  
      response = await adminService.addTask(lectureId, newTask);  
    }
    else{
      response = await instructorService.addTask(lectureId, newTask);  
    }
   if (response) {
    toast.success("Task Created Successfully");
    setTimeout(() => {
      if (window.location.pathname.includes("/admin")) {
        navigate(`/admin/${groupId}/lectures`);
      } else {
        navigate(`/instructor/${groupId}/lectures`);
      }
      }, 3000);
    }else{
      toast.error("Task Created Failed");
    }
  };
  // جلب المهام
  useEffect(() => {
    if (
      location.pathname ==
      `/admin/${groupId}/lectures/${lectureId}/tasks/updateTask/${taskId}` ||
       location.pathname==`/instructor/${groupId}/lectures/${lectureId}/tasks/updateTask/${taskId}`
    ) {
      setSwitchTask(true);
      let token = getTokenAdmin || getTokenInstructor;
      axios
        .get(`${URLAPI}/api/lectures/${lectureId}/tasks/${taskId}`, {
          headers: { Authorization: `${token}` },
        })
        .then((res) => {
          setUpdateTask(res.data.task);
        });
    } else {
      setSwitchTask(false);
    }
  }, [lectureId, taskId, location.pathname]);

  // تحديث المهمة
  const handleUpdateTask = async (e) => {
    e.preventDefault();
    let response;
    if(window.location.pathname.includes("/admin")){
      response = await adminService.updateTask(lectureId, taskId, updateTask);  
    }
    else{
      response = await instructorService.updateTask(lectureId, taskId, updateTask);  
    }
    if (response) {
      toast.success("Task updated successfully.");
      setTimeout(() => {
        if (window.location.pathname.includes("/admin")) {
          navigate(`/admin/${groupId}/tasks`);
        } else {
          navigate(`/instructor/${groupId}/tasks`);
        }
      }, 2500);
    } else {
      toast.error("Task Updated Failed");
      
    }
  };

  // حذف المهمة
  const handleDeletTask = async (id) => {
    if (!id) {
      toast.error("Task ID is required for deletion.");
      return;
    }
    let response;
    if(window.location.pathname.includes("/admin")){
      response = await adminService.deleteTask(lectureId, taskId);  
    }
    else{
      response = await instructorService.deleteTask(lectureId, taskId);  
    }

    if (response) {
        toast.success("Task deleted successfully.");
      setTimeout(() => {
        if (window.location.pathname.includes("/admin")) {
          navigate(`/admin/${groupId}/tasks`);
        } else {
          navigate(`/instructor/${groupId}/tasks`);
        }
      }, 2500);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <>
        <Helmet>
          <title>{updateTask ? "Update Task" : "Create Task"}</title>
        </Helmet>
        {/* create task */}
        {!switchTask ? (
          <form className="row m-2 w-100 p-3" onSubmit={handleAddTask}>
            <h2>Create New Task</h2>
            <input
              type="text"
              placeholder="Description"
              className="border rounded p-2 m-2 col-lg-6 col-md-10 col-sm-5"
              value={newTask.description_task}
              onChange={(e) =>
                setNewTask({ ...newTask, description_task: e.target.value })
              }
              required
            />
            <input
              type="date"
              className="border rounded p-2 m-2 col-lg-6 col-md-10 col-sm-5"
              value={newTask.start_date}
              onChange={(e) =>
                setNewTask({ ...newTask, start_date: e.target.value })
              }
              required
            />
            <input
              type="date"
              className="border rounded p-2 m-2 col-lg-6 col-md-10 col-sm-5"
              value={newTask.end_date}
              onChange={(e) =>
                setNewTask({ ...newTask, end_date: e.target.value })
              }
              required
            />
            <button
              className="btn btn-primary col-3 m-3 p-2 m-2 col-lg-6 col-md-10 col-sm-5"
              onClick={handleAddTask}
            >
              Create
            </button>
          </form>
        ) : (
          <>
            <form className="row m-2 w-100 p-2" onSubmit={handleUpdateTask}>
              <h2>Update Task</h2>
              <input
                type="text"
                placeholder="Description"
                className="border rounded p-2 m-2 col-lg-6 col-md-10 col-sm-5"
                onChange={(e) =>
                  setUpdateTask({
                    ...updateTask,
                    description_task: e.target.value,
                  })
                }
                value={updateTask.description_task}
                required
              />
              <input
                type="date"
                className="border rounded p-2 m-2 col-lg-6 col-md-10 col-sm-5"
                onChange={(e) =>
                  setUpdateTask({ ...updateTask, start_date: e.target.value })
                }
                value={
                  updateTask.start_date
                    ? updateTask.start_date.split("T")[0]
                    : ""
                }
                required
              />
              <input
                type="date"
                className="border rounded p-2 m-2 col-lg-6 col-md-10 col-sm-5"
                onChange={(e) =>
                  setUpdateTask({ ...updateTask, end_date: e.target.value })
                }
                value={
                  updateTask.end_date ? updateTask.end_date.split("T")[0] : ""
                }
                required
              />
            </form>
            <button
              className="btn btn-success col-3 m-3"
              onClick={handleUpdateTask}
                aria-label="submit"
            >
              Update
            </button>
            <button
              className="btn btn-danger col-3"
              onClick={() => handleDeletTask(taskId)}
               aria-label="submit"
            >
              Delete
            </button>
          </>
        )}
      </>
    </>
  );
}

export default NewTask;
