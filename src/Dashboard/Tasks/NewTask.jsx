import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import AuthServices from "../../classes/Auth";
import AdminService from "../../classes/AdminService";
import InstructorService from "../../classes/InstructorService";

function NewTask() {
  const authServices = new AuthServices();
  const token = authServices.getToken();
  const adminServices = new AdminService(token);
  const instructorService = new InstructorService(token);
  const { slug, slugLecture, slugTask } = useParams();
  const [isDeleted,setIsDeleted]= useState(false)

  const [newTask, setNewTask] = useState({
    titleTask: "",
    description_task: "",
    start_date: "",
    end_date: "",
  });

  const [updateTask, setUpdateTask] = useState({
    titleTask: "",
    description_task: "",
    start_date: "",
    end_date: "",
  });

  const [switchTask, setSwitchTask] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!token) {
      toast.error("Unauthorized. Please log in.");
      return;
    }
  }, [token]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let response;
      if (window.location.pathname.includes("/dashboard")) {
        response = await adminServices.createTask(slugLecture, newTask);
      } else {
        response = await instructorService.createTask(slugLecture, newTask);
      }
      if (response) {
        toast.success("Task Created Successfully");
        setTimeout(() => navigateToTasks(), 2000);
      }
    } catch (error) {
      toast.error(error.message || "Task Creation Failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchTask = async () => {
      const locationAdmin = location.pathname.includes(
        `/dashboard/admin/group/${slug}/lecture/${slugLecture}/tasks/updateTask/${slugTask}`
      );
      const locationInstructor = location.pathname.includes(
        `/instructor/group/${slug}/lecture/$${slugLecture}/tasks/updateTask/${slugTask}`
      );

      if (locationAdmin || locationInstructor) {
        setSwitchTask(true);
        try {
          const res = locationAdmin
            ? await adminServices.getTask(slugLecture, slugTask)
            : await instructorService.getTask(slugLecture, slugTask);
            setUpdateTask(res.task);
            setIsDeleted(res.task.isDeleted)
        } catch (error) {
          toast.error("Failed to fetch task");
        }
      } else {
        setSwitchTask(false);
      }
    };
    fetchTask();
  }, [slugLecture, slugTask, location.pathname]);

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let response;
      if (window.location.pathname.includes("/admin")) {
        response = await adminServices.updateTask(
          slugLecture,
          slugTask,
          updateTask
        );
      } else {
        response = await instructorService.updateTask(
          slugLecture,
          slugTask,
          updateTask
        );
      }
      if (response) {
        toast.success("Task updated successfully.");
        setTimeout(() => navigateToTasks(), 2000);
      }
    } catch (error) {
      toast.error(error.message || "Task Update Failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!slugTask) {
      toast.error("Task ID is required for deletion.");
      return;
    }
    setIsLoading(true);
    try {
      let response;
      if (window.location.pathname.includes("/dashboard")) {
        response = await adminServices.deleteTask(slugLecture, slugTask);
      } else {
        response = await instructorService.deleteTask(slugLecture, slugTask);
      }
      console.log(response)
      if (response) {
        setIsDeleted(true);
        toast.success("Task deleted successfully.");
        setTimeout(() => {
          navigateToTasks();
        }, 2000);
      }
    } catch (error) {
      toast.error(error.message || "Task Deletion Failed");
    } finally {
      setIsLoading(false);
    }
  };
  const navigateToTasks = () => {
    if (window.location.pathname.includes("/admin")) {
      navigate(`/dashboard/admin/group/${slug}/tasks`);
    } else {
      navigate(`/instructor/group/${slug}/tasks`);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <Helmet>
        <title>{switchTask ? "Update Task" : "Create Task"}</title>
      </Helmet>

      <div className="max-w-4xl mx-auto p-4">
        {!switchTask ? (
          <form
            onSubmit={handleAddTask}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              Create New Task
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title Task
                </label>
                <input
                  type="text"
                  placeholder="Enter task description"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={newTask.titleTask}
                  onChange={(e) =>
                    setNewTask({ ...newTask, titleTask: e.target.value })
                  }
                  required
                />
              </div>

              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Task Description
                </label>
                <input
                  type="text"
                  placeholder="Enter task description"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={newTask.description_task}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description_task: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={newTask.start_date}
                  onChange={(e) =>
                    setNewTask({ ...newTask, start_date: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={newTask.end_date}
                  onChange={(e) =>
                    setNewTask({ ...newTask, end_date: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "Create Task"}
            </button>
          </form>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              Update Task
            </h2>

            <form
              onSubmit={handleUpdateTask}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
            >
              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  placeholder="Enter Task Title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={updateTask.titleTask}
                  onChange={(e) =>
                    setUpdateTask({ ...updateTask, titleTask: e.target.value })
                  }
                  required
                />
              </div>
              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Task Description
                </label>
                <input
                  type="text"
                  placeholder="Enter task description"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={updateTask.description_task}
                  onChange={(e) =>
                    setUpdateTask({
                      ...updateTask,
                      description_task: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={
                    updateTask.start_date
                      ? updateTask.start_date.split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setUpdateTask({ ...updateTask, start_date: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={
                    updateTask.end_date ? updateTask.end_date.split("T")[0] : ""
                  }
                  onChange={(e) =>
                    setUpdateTask({ ...updateTask, end_date: e.target.value })
                  }
                  required
                />
              </div>
            </form>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleUpdateTask}
                disabled={isLoading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
              >
                {isLoading ? "Updating..." : "Update Task"}
              </button>

              <button
                onClick={handleDeleteTask}
                disabled={isLoading }
                className={`px-6 py-2 text-white rounded-md transition-colors flex items-center ${
                  isDeleted 
                    ? "bg-gray-600 hover:bg-gray-700"
                    : "bg-red-600 hover:bg-red-700"
                } ${isLoading ? "opacity-50" : ""}`}
              >
                {isLoading
                  ? "Deleting..."
                  : isDeleted
                  ? "Task Deleted"
                  : "Delete Task"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default NewTask;
