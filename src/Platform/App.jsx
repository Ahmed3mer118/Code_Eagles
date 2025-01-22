import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

// Dashboard
import Dashboard from "./DashboardAdmin/Dashboard/Dashboard";
import Error from "./DashboardAdmin/Error";
import DashboardIndex from "./DashboardAdmin/Dashboard/DashboardIndex";
import PaymentComponent from "./DashboardAdmin/Payment/Payment.jsx";

// Group
import NewGroup from "./DashboardAdmin/Gruops/NewGroup";
import AllGroups from "./DashboardAdmin/Gruops/AllGroups";
import DetailsGroup from "./DashboardAdmin/Gruops/DetailsGroup";
import UpdateGroup from "./DashboardAdmin/Gruops/UpdateGroup";

// Tasks
import Tasks from "./DashboardAdmin/Tasks/Tasks";
import NewTask from "./DashboardAdmin/Tasks/NewTask";
import SubmissionsTask from "./DashboardAdmin/Tasks/SubmissionsTask";

// Students
import AllStudents from "./DashboardAdmin/Students/AllStudents";
import Students from "./DashboardAdmin/Students/Students";
import DetailsStudent from "./DashboardAdmin/Students/DetailsStudent";

// Lectures
import Lectures from "./DashboardAdmin/Lectures/Lectures";
import UpdateLecture from "./DashboardAdmin/Lectures/UpdateLecture";
import LectureQRCode from "./DashboardAdmin/Lectures/LectureQRCode";
import AttendanceList from "./DashboardAdmin/Lectures/AttendanceList";

// Emails
import EmailReq from "./DashboardAdmin/Emails/EmailReq";
import GetAllFeedback from "./DashboardAdmin/GetAllFeedback";

// User Pages
import Register from "./Users/Register/Register";
import Login from "./Users/Login/Login";
import ForgetPass from "./Users/Register/ForgetPass";
import Layout from "./Users/Layout/Layout";
import Main from "./Users/Layout/Main";
import Courses from "./Users/Lecture/Courses";
import AddTask from "./Users/Lecture/AddTask";
import Profile from "./Users/Profile/Profile";
import AddFeedback from "./Users/FeedBack/AddFeedback";
import Content from "./Users/Lecture/Content.jsx";
import Contact from "./Users/Contact/Contact";
import Notification from "./Users/Notification/Notification";

// PrivateRoute
import PrivateRoute from "./DashboardAdmin/PrivateRoute";
import { AuthProvider } from "./DashboardAdmin/context/AuthContext ";
import GetAllMessage from "./DashboardAdmin/Messages/GetAllMessage";
import VerificationForm from "./Users/Register/VerificationForm";
import DataProvider from "./Users/Context/Context.jsx";
import CourseDetail from "./Users/Lecture/CourseDetails.jsx";
import ListStd from "./DashboardAdmin/Students/ListStd.jsx";
import Chat from "./DashboardAdmin/Chat/Chat.jsx";
import AllChats from "./DashboardAdmin/Chat/AllChats.jsx";
import ProfileAdmin from "./DashboardAdmin/ProfileAdmin/Profile.jsx";
import AllCourse from "./Users/Lecture/AllCourse.jsx";

import "../App.css"
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PrivateUser from "./Users/PrivateUser.jsx";
const helmetContext = {};

function App() {
  const router = createBrowserRouter([
    {
      path: "/login/admin",
      element: <Login />,
    },
    {
      path: "/admin",
      element: <PrivateRoute element={<Dashboard />} />,
      // element:<Dashboard />,
      children: [
        {
          index: true,
          element: <DashboardIndex />,
        },
        {
          path: "newGroup",
          element: <NewGroup />,
        },
        {
          path: "allGroups",
          element: <AllGroups />,
        },
        {
          path: "allStudent",
          element: <AllStudents />,
        },
        {
          path: "/admin/student/:studentId",
          element: <DetailsStudent />,
        },
        {
          path: "/admin/emails",
          element: <EmailReq />,
        },
        {
          path: "/admin/payment",
          element: <PaymentComponent />,
        },
        {
          path: "/admin/get-all-feekback-by-admin",
          element: <GetAllFeedback />,
        },
        {
          path: "/admin/get-all-message-by-admin",
          element: <GetAllMessage />,
        },
        {
          path: "/admin/list-for-Students-by-admin",
          element: <ListStd />,
        },
        {
          path: "/admin/chat",
          element: <Chat />,
        },
        {
          path: "/admin/profile-admin",
          element: <ProfileAdmin />,
        },
        {
          path: "/admin/:groupId",
          element: <DetailsGroup />,
          children: [
            {
              path: "/admin/:groupId/students",
              element: <Students />,
            },
            {
              path: "/admin/:groupId/lectures",
              element: <Lectures />,
            },
            {
              path: "/admin/:groupId/lectures/:lectureId/attendance",
              element: <AttendanceList />,
            },
            {
              path: "/admin/:groupId/lectures/update/:lectureId",
              element: <UpdateLecture />,
            },
            {
              path: "/admin/:groupId/lectures/Qr-code?/:lectureId",
              element: <LectureQRCode />,
            },
            {
              path: "/admin/:groupId/update",
              element: <UpdateGroup />,
            },

            {
              path: "/admin/:groupId/tasks",
              element: <Tasks />,
            },
            {
              path: "/admin/:groupId/tasks/:lectureId",
              element: <NewTask />,
            },
            {
              path: "/admin/:groupId/lectures/:lectureId/newTask",
              element: <NewTask />,
            },
            {
              path: "/admin/:groupId/lectures/:lectureId/tasks/updateTask/:taskId",
              element: <NewTask />,
            },
            {
              path: "/admin/:groupId/lectures/:lectureId/tasks/:taskId/submissions",
              element: <SubmissionsTask />,
            },
          ],
        },
      ],
    },

    {
      path: "/",
      element : <PrivateUser element={<Layout />}/>,
      // element: <Layout />,
      children: [
        {
          index: true,
          element: <Main />,
        },
        {
          path: "/register",
          element: <Register />,
        },
        {
          path: "/register/verif-email",
          element: <VerificationForm />,
        },
        {
          path: "/login",
          element: <Login />,
        },
        {
          path: "/forgetpassword",
          element: <ForgetPass />,
        },
        {
          path: "/content",
          element: <Content />,
        },
        {
          path: "/my-courses",
          element: <AllCourse />,
        },      
        {
          path:"/content/course/:courseDetails",
          element:<CourseDetail/>
        },
        {
          path: "/course/:groupId",
          element: <Courses />,
        },
        {
          path: "/course/:groupId/lecture/:lecCourse",
          element: <Courses />,
        },
      
        {
          path: "/course/:groupId/lecture?/:lecCourse/Add-Task/:taskId",
          element: <AddTask />,
        },
        {
          path: "/feedback",
          element: <AddFeedback />,
        },
        {
          path: "/contact",
          element: <Contact />,
        },
        {
          path: "/profile",
          element: <Profile />,
        },
        {
          path: "/notification",
          element: <Notification />,
        },
      ],
    },
    {
      path: "*",
      element: <Error />,
    },
  ]);

  return (
    <HelmetProvider context={helmetContext}>
      <AuthProvider>
        <DataProvider>
          <ToastContainer />
          <RouterProvider router={router} />
        </DataProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
