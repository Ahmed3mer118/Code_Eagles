import React, { useContext, useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./Auth/Login/Login.jsx";
import Register from "./Auth/Register/Register.jsx";
import ForgetPass from "./Auth/Register/ForgetPass.jsx";
import VerificationForm from "./Auth/Register/VerificationForm.jsx";
import Layout from "./User/shared/Layout/Layout.jsx";
import Main from "./User/shared/Layout/Main.jsx";
import { HelmetProvider } from "react-helmet-async";
import AddFeedback from "./User/FeedBack/AddFeedback.jsx";

import Content from "./User/Lecture/Content.jsx";
import Contact from "./User/Contact/Contact.jsx";
import Profile from "./User/Profile/Profile.jsx";
import AllGroup from "./User/Group/AllGroup.jsx";
import AllCourse from "./User/Lecture/AllCourse.jsx";
import AddTask from "./User/Lecture/AddTask.jsx";
import Courses from "./User/Lecture/Courses.jsx";
import Error from "./Dashboard/Error.jsx";
import DashboardIndex from "./Dashboard/Dashboard/DashboardIndex.jsx";
import Dashboard from "./Dashboard/Dashboard/Dashboard.jsx";
import NewGroup from "./Dashboard/Gruops/NewGroup.jsx";
import AllGroups from "./Dashboard/Gruops/AllGroups.jsx";
import DetailsGroup from "./Dashboard/Gruops/DetailsGroup.jsx";
import Students from "./Dashboard/Students/Students.jsx";
import Lectures from "./Dashboard/Lectures/Lectures.jsx";
import AllStudents from "./Dashboard/Students/AllStudents.jsx";
import DetailStudent from "./Dashboard/Students/DetailsStudent.jsx";
import UpdateGroup from "./Dashboard/Gruops/UpdateGroup.jsx";
import UpdateLecture from "./Dashboard/Lectures/UpdateLecture.jsx";
import AttendanceList from "./Dashboard/Lectures/AttendanceList.jsx";
import Tasks from "./Dashboard/Tasks/Tasks.jsx";
import NewTask from "./Dashboard/Tasks/NewTask.jsx";
import SubmissionsTask from "./Dashboard/Tasks/SubmissionsTask.jsx";
import ProfileAdmin from "./Dashboard/ProfileAdmin/Profile.jsx";
import EmailReq from "./Dashboard/Emails/EmailReq.jsx";
import AllQuiz from "./Dashboard/QuizByAdmin/AllQuiz.jsx";
import CreateQuiz from "./Dashboard/QuizByAdmin/CreateQuiz.jsx";
import UpdateQuiz from "./Dashboard/QuizByAdmin/UpdateQuiz.jsx";
import Quiz from "./User/Quiz/Quiz.jsx";
import ShowQuestions from "./User/Quiz/ShowQuestions.jsx";
import ShowAnswers from "./User/Quiz/ShowAnswers.jsx";
import ShowResult from "./User/Quiz/ShowResult.jsx";
import PrivateUser from "./Grauds/PrivateUser.jsx";
import PrivateAdmin from "./Grauds/PrivateAdmin.jsx";
import PrivateInstructor from "./Grauds/PrivateInstructor.jsx";
import DashboardInstructor from "./DashboardInstructor/DashboardInstructor.jsx";
import ProfileInstructor from "./DashboardInstructor/ProfileInstructor.jsx";
import GetAllFeedback from "./Dashboard/GetAllFeedback.jsx";
import GetAllMessage from "./Dashboard/Messages/GetAllMessage.jsx";
import CourseDetail from "./User/Lecture/CourseDetails.jsx";
import InstructorMessage from "./DashboardInstructor/InstructorMessage.jsx"
const helmetContext = {};
function App() {
  const router = createBrowserRouter([
    // auth
    {
      path: "/auth",
      children: [
        {
          path: "login",
          element: <Login />,
        },
        {
          path: "register",
          element: <Register />,
        },
        {
          path: "forget-password",
          element: <ForgetPass />,
        },
        {
          path: "verif-email",
          element: <VerificationForm />,
        },
      ],
    },
// user
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "",
          element: <Main />,
        },
        {
          path: "courses",
          element: <AllGroup />,
        },
        {
          path: "content/:slug",
          element: <Content />,
        },
        {
          path: "content/:slug/course/:contentId",
          element: <CourseDetail />,
        },
        {
          path: "add-feedback",
          element: <AddFeedback />,
        },
        {
          path: "contact",
          element: <Contact />,
        },
        {
          path: "profile",
          element:  <PrivateUser element={<Profile />} />,
        },
        {
          path: "my-courses",
          element: <PrivateUser element={<AllCourse />} />,
        }
        ,
        {
          path:'course/:slug',
          element: <PrivateUser element={<Courses />} />
        },
        {
          path:'course/:slug/lecture/:slugLecture',
          element: <PrivateUser element={<Courses />} />,
        },
        {
          path:'course/:slug/lecture/:slugLecture/quiz/:slugQuiz',
          element: <PrivateUser element={<Quiz />} />,
          children: [
            {
              path: "questions",
              element: <ShowQuestions />,
            },
            {
              path: "answers",
              element: <ShowAnswers />,
            },
            {
              path: "result",
              element: <ShowResult />,
            },
          ]
        },
        {
          path: "course/:slug/lecture/:slugLecture/Add-Task/:slugTask",
          element: <AddTask />,
        },
      ],
    },
    // dashboard
    {
      path: "dashboard",
      element: <PrivateAdmin element={ <Dashboard /> } />,
      children:[
        {
          path:'',
          element: <DashboardIndex />,
        },
        
        {
          path:'admin/newGroup',
          element: <NewGroup />,
        },
        {
          path:'admin/allGroups',
          element: <AllGroups />,
        },
        {
          path:'admin/allStudent',
          element: <AllStudents />,
          
        },
        
        {
          path:'admin/allStudent/student/:studentSlug',
          element: <DetailStudent />,
        },
        {
          path:'admin/group/:slug',
          element: <DetailsGroup />,
          children:[
            {
              path:'students',
              element:<Students />
            },
            {
              path:'lectures',
              element:<Lectures />
            },
            {
              path:'lectures/update/:slugLecture',
              element:<UpdateLecture />
            },
            {
              path:'lectures/:slugLecture/attendance',
              element:<AttendanceList />
            },
           
            {
              path:'tasks',
              element:<Tasks />
            },
            {
              path:'lecture/:slugLecture/tasks/updateTask/:slugTask',
              element:<NewTask />
            },
             {
              path:'lecture/:slugLecture/tasks/:slugTask/submissions',
              element:<SubmissionsTask />
            }
            ,
            ,
            {
              path:'lectures/:slugLecture/newTask',
              element:<NewTask />
            }
            ,
            
            {
              path:'quiz',
              element:<AllQuiz />
            }
            ,
            
            {
              path:'lectures/:slugLecture/newQuiz',
              element:<CreateQuiz />
            }
            ,
            
            {
              path:'lecture/:slugLecture/quiz/updateQuiz/:slugQuiz',
              element:<UpdateQuiz />
            }
            ,
            {
              path:'update',
              element:<UpdateGroup />
            }
          ]
        },
        ,{
          path:"admin/email-request",
          element:<EmailReq />
        }
        ,{
          path:"admin/get-all-feedback-by-admin",
          element:<GetAllFeedback />
        }
        ,{
          path:"admin/get-all-message-by-admin",
          element:<GetAllMessage />
        }
        ,{
          path:"admin/profile-admin",
          element:<ProfileAdmin />
        }
        
       
      ]
    },
    // instructor
    {
      path:"instructor",
      element:<PrivateInstructor element={<DashboardInstructor />} />,
      // element:<DashboardInstructor />,
      children:[
        {
          path:"group/:slug/students",
          element:<Students/>
        },
        {
          path:":slug/student/:studentSlug",
          element:<DetailStudent/>
        },
        {
          path:"group/:slug/lectures",
          element:<Lectures/>
        },
        {
          path:"group/:slug/lectures/:slugLecture/newTask",
          element:<NewTask/>
        },
        {
          path:"group/:slug/lectures/:slugLecture/newQuiz",
          element:<CreateQuiz />
        },
        {
          path:"group/:slug/lectures/update/:slugLecture",
          element:<UpdateLecture />
        },
        
        {
          path:"group/:slug/tasks",
          element:<Tasks/>
        },
        {
          path:"group/:slug/lecture/:slugLecture/tasks/:slugTask/submissions",
          element:<SubmissionsTask/>
        },
        {
          path:"group/:slug/lecture/:slugLecture/tasks/updateTask/:slugTask",
          element:<NewTask/>
        },
        {
          path:"group/:slug/quizzes",
          element:<AllQuiz/>
        },
        {
          path:"group/:slug/lecture/:slugLecture/quiz/:updateQuiz/:slugQuiz",
          element:<UpdateQuiz/>
        },
        {
          path:"group/:slug/messages",
          element:<InstructorMessage/>
        },
        {
          path:'email-request',
          element:<EmailReq />
        },
        {
          path:'setting',
          element:<ProfileInstructor />
        }
      ]
    },
 
    {
      path: "*",
      element: <Error />,
    }
  ]);

  return (
    <HelmetProvider context={helmetContext}>
      <RouterProvider router={router} />
    </HelmetProvider>
  );
}

export default App;
