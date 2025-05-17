import React, { useContext, useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { DataContext } from "./Users/Context/Context.jsx";

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
import ProfileAdmin from "./DashboardAdmin/ProfileAdmin/Profile.jsx";
import AllCourse from "./Users/Lecture/AllCourse.jsx";

import "../App.css";
import PrivateUser from "./Users/Auth/PrivateUser.jsx";
import AllGroup from "./Users/Group/AllGroup.jsx";
import Quiz from "./Users/Quiz/Quiz.jsx";
import { Toaster } from "react-hot-toast";
import CreateQuiz from "./DashboardAdmin/QuizByAdmin/CreateQuiz.jsx";
import AllQuiz from "./DashboardAdmin/QuizByAdmin/AllQuiz.jsx";
import UpdateQuiz from "./DashboardAdmin/QuizByAdmin/UpdateQuiz.jsx";
import ShowQuestions from "./Users/Quiz/ShowQuestions.jsx";
import ShowAnswers from "./Users/Quiz/ShowAnswers.jsx";
import ShowResult from "./Users/Quiz/ShowResult.jsx";

// Instructor Dashboard
import DashboardInstructor from "./DashboardInstructor/DashboardInstructor";
import InstructorMessage from "./DashboardInstructor/InstructorMessage.jsx";
import ProfileInstructor from "./DashboardInstructor/ProfileInstructor";
// PrivateRouteInstructor
import PrivateRouteInstructor from "./DashboardInstructor/PrivateRouteInstructor";
  import Maintenance from "./DashboardAdmin/Maintenance"
import { MaintenanceProvider } from "./DashboardAdmin/context/MaintenanceContext";
const helmetContext = {};
import AdminService from "./classes/AdminService";
let URLAPI = import.meta.env.VITE_API_URL;

function App() {
  const getTokenAdmin = useContext(DataContext);  
  const adminService = new AdminService(URLAPI, getTokenAdmin);

  const [maintenanceMode, setMaintenanceMode] = useState(null);
  useEffect(() => {
    const fetchMaintenanceMode = async () => {
      try {
        const response = await adminService.getLockCode();
        setTimeout(() => {
          setMaintenanceMode(response.isActive);
        }, 1000);
      
      } catch (error) {
        console.error("Error fetching maintenance status", error);
      }
    };
    fetchMaintenanceMode();
  }, [maintenanceMode]);

  useEffect(() => {
    const buttons = document.querySelectorAll("button");
    const links = document.querySelectorAll("a");

    if (maintenanceMode === true) {
      buttons.forEach((btn) => {

        if (!btn.classList.contains("maintenance-toggle")) {
          btn.disabled = true;
        }
      });

      links.forEach((link) => {
        link.style.cursor = "not-allowed";
        link.style.pointerEvents = "none";
      });
    }
  }, [maintenanceMode]);


  const router = createBrowserRouter([
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
          path: "login",
          element: <Login />,
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
            {
              path: "/admin/:groupId/quiz",
              element: <AllQuiz />,
            },
            {
              path: "/admin/:groupId/lectures/:lectureId/quiz",
              element: <CreateQuiz />,
            },
            {
              path: "/admin/:groupId/quiz/edit/:quizId",
              element: <UpdateQuiz />,
            },
          ],
        },
        {
          path: "/admin/pay",
          element: <PaymentComponent />,
        },
      ],
    },
    // user
    {
      path: "/",
      element: <PrivateUser element={<Layout />} />,
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
          path: "/Courses",
          element: <AllGroup />,
        },
        {
          path: "/content/:contentId",
          element: <Content />,
        },
        {
          path: "/my-courses",
          element: <AllCourse />,
        },
        {
          path: "/content/:contentId/course/:courseDetails",
          element: <CourseDetail />,
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
          path: "/course/:groupId/lecture/:lecCourse/quiz/:quizId",
          element: <Quiz />,
          children: [
            {
              path: "/course/:groupId/lecture/:lecCourse/quiz/:quizId/questions",
              element: <ShowQuestions />,
            },
            {
              path: "/course/:groupId/lecture/:lecCourse/quiz/:quizId/answers",
              element: <ShowAnswers />,
            },
            {
              path: "/course/:groupId/lecture/:lecCourse/quiz/:quizId/result",
              element: <ShowResult />,
            },
          ]
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
    // Instructor Routes
    {
      path: "/instructor",
      element: <PrivateRouteInstructor element={<DashboardInstructor />} />,
      children: [
        {
          index: true,
          element: <DashboardInstructor />,
        },
        {
          path: "/instructor/login",
          element: <Login />,
        },
        {
          path: "/instructor/emailRequest",
          element: <EmailReq />,
        },
        {
          path: "/instructor/:groupId/students",

          element: <Students />,
        },
        {
          path: "/instructor/:groupId/student/:studentId",
          element: <DetailsStudent />,
        },
        {
          path: "/instructor/:groupId/lectures",
          element: <Lectures />,
        },
        {
          path: "/instructor/:groupId/tasks",
          element: <Tasks />,
        },
        {
          path: "/instructor/:groupId/lectures/:lectureId/newTask",
          element: <NewTask />,
        },
        {
          path: "/instructor/:groupId/lectures/:lectureId/tasks/updateTask/:taskId",
          element: <NewTask />,
        },
        {
          path: "/instructor/:groupId/lectures/:lectureId/tasks/:taskId/submissions",
          element: <SubmissionsTask />,
        },
        {
          path: "/instructor/:groupId/quizzes",
          element: <AllQuiz />,
        },
        {
          path: "/instructor/:groupId/quiz/edit/:quizId",
          element: <UpdateQuiz />,
        },
        {
          path: "/instructor/:groupId/messages",
          element: <InstructorMessage />,
        },
        {
          path: "/instructor/:groupId/lectures/:lectureId/attendance",
          element: <AttendanceList />,
        },
        {
          path: "/instructor/:groupId/lectures/:lectureId/quiz",
          element: <CreateQuiz />,
        },
        {
          path: "/instructor/:groupId/lectures/:lectureId/tasks",
          element: <NewTask />,
        },
        {
          path: "/instructor/:groupId/lectures/update/:lectureId",
          element: <UpdateLecture />,
        },
        ,
        {
          path: "/instructor/setting",
          element: <ProfileInstructor />,
        }

      ],
    },

    {
      path: "*",
      element: <Error />,
    },
  ]);

  return (
    <HelmetProvider context={helmetContext}>
      <Toaster />
      {maintenanceMode && window.location.pathname !== "/admin/profile-admin" ? <Maintenance /> : (
        <AuthProvider>
          <DataProvider>
            <MaintenanceProvider>
              <RouterProvider router={router} />
            </MaintenanceProvider>
          </DataProvider>
        </AuthProvider>
      )}
    </HelmetProvider>
  );
}

export default App;
