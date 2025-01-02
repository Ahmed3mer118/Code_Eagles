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
import AllCourses from "./Users/Lecture/AllCourses";
import Contact from "./Users/Contact/Contact";
import Notification from "./Users/Notification/Notification";

// PrivateRoute
import PrivateRoute from "./DashboardAdmin/PrivateRoute";
import { AuthProvider } from "./DashboardAdmin/context/AuthContext ";
import GetAllMessage from "./DashboardAdmin/Messages/GetAllMessage";
import VerificationForm from "./Users/Register/VerificationForm";
import DataProvider from "./Users/Context/Context.jsx";
import CourseDetail from "./Users/Lecture/CourseDetails.jsx";


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
      element: <Layout />,
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
          path:"/course/:courseDetails",
          element:<CourseDetail/>
        },
        {
          path: "/all-courses",
          element: <AllCourses />,
        },

        {
          path: "/:groupId/course",
          element: <Courses />,
        },
        {
          path: "/:groupId/course/:id",
          element: <Courses />,
        },
        {
          path: "/:groupId/course?/:id/Add-Task/:taskId",
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
          <RouterProvider router={router} />
        </DataProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
