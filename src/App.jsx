import React, {  Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./Auth/Login/Login.jsx";
import Register from "./Auth/Register/Register.jsx";
import ForgetPass from "./Auth/Register/ForgetPass.jsx";
import VerificationForm from "./Auth/Register/VerificationForm.jsx";
import Layout from "./User/shared/Layout/Layout.jsx";
import Main from "./User/shared/Layout/Main.jsx";
import { HelmetProvider } from "react-helmet-async";

// User Components
const AddFeedback = React.lazy(() => import("./User/FeedBack/AddFeedback.jsx"));
const Content = React.lazy(() => import("./User/Lecture/Content.jsx"));
const Contact = React.lazy(() => import("./User/Contact/Contact.jsx"));
const Profile = React.lazy(() => import("./User/Profile/Profile.jsx"));
const AllGroup = React.lazy(() => import("./User/Group/AllGroup.jsx"));
const AllCourse = React.lazy(() => import("./User/Lecture/AllCourse.jsx"));
const AddTask = React.lazy(() => import("./User/Lecture/AddTask.jsx"));
const Courses = React.lazy(() => import("./User/Lecture/Courses.jsx"));
const Quiz = React.lazy(() => import("./User/Quiz/Quiz.jsx"));
const ShowQuestions = React.lazy(() => import("./User/Quiz/ShowQuestions.jsx"));
const ShowAnswers = React.lazy(() => import("./User/Quiz/ShowAnswers.jsx"));
const ShowResult = React.lazy(() => import("./User/Quiz/ShowResult.jsx"));
const CourseDetail = React.lazy(() => import("./User/Lecture/CourseDetails.jsx"));

// Dashboard Components
const Error = React.lazy(() => import("./Dashboard/Error.jsx"));
const DashboardIndex = React.lazy(() => import("./Dashboard/Dashboard/DashboardIndex.jsx"));
const Dashboard = React.lazy(() => import("./Dashboard/Dashboard/Dashboard.jsx"));
const NewGroup = React.lazy(() => import("./Dashboard/Gruops/NewGroup.jsx"));
const AllGroups = React.lazy(() => import("./Dashboard/Gruops/AllGroups.jsx"));
const DetailsGroup = React.lazy(() => import("./Dashboard/Gruops/DetailsGroup.jsx"));
const UpdateGroup = React.lazy(() => import("./Dashboard/Gruops/UpdateGroup.jsx"));
const Students = React.lazy(() => import("./Dashboard/Students/Students.jsx"));
const AllStudents = React.lazy(() => import("./Dashboard/Students/AllStudents.jsx"));
const DetailStudent = React.lazy(() => import("./Dashboard/Students/DetailsStudent.jsx"));
const Lectures = React.lazy(() => import("./Dashboard/Lectures/Lectures.jsx"));
const UpdateLecture = React.lazy(() => import("./Dashboard/Lectures/UpdateLecture.jsx"));
const AttendanceList = React.lazy(() => import("./Dashboard/Lectures/AttendanceList.jsx"));
const Tasks = React.lazy(() => import("./Dashboard/Tasks/Tasks.jsx"));
const NewTask = React.lazy(() => import("./Dashboard/Tasks/NewTask.jsx"));
const SubmissionsTask = React.lazy(() => import("./Dashboard/Tasks/SubmissionsTask.jsx"));
const ProfileAdmin = React.lazy(() => import("./Dashboard/ProfileAdmin/Profile.jsx"));
const EmailReq = React.lazy(() => import("./Dashboard/Emails/EmailReq.jsx"));
const AllQuiz = React.lazy(() => import("./Dashboard/QuizByAdmin/AllQuiz.jsx"));
const CreateQuiz = React.lazy(() => import("./Dashboard/QuizByAdmin/CreateQuiz.jsx"));
const UpdateQuiz = React.lazy(() => import("./Dashboard/QuizByAdmin/UpdateQuiz.jsx"));
const GetAllFeedback = React.lazy(() => import("./Dashboard/GetAllFeedback.jsx"));
const GetAllMessage = React.lazy(() => import("./Dashboard/Messages/GetAllMessage.jsx"));

// Dashboard Instructor Components
const DashboardInstructor = React.lazy(() => import("./DashboardInstructor/DashboardInstructor.jsx"));
const ProfileInstructor = React.lazy(() => import("./DashboardInstructor/ProfileInstructor.jsx"));
const InstructorMessage = React.lazy(() => import("./DashboardInstructor/InstructorMessage.jsx"));

// Guards
const PrivateUser = React.lazy(() => import("./Grauds/PrivateUser.jsx"));
const PrivateAdmin = React.lazy(() => import("./Grauds/PrivateAdmin.jsx"));
const PrivateInstructor = React.lazy(() => import("./Grauds/PrivateInstructor.jsx"));

// Shared
const Loading = React.lazy(() => import("./User/shared/Loading.jsx"));

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
          path:"group/:slug/lectures/:slugLecture/attendance",
          element:<AttendanceList />
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
       <Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
       </Suspense>
    </HelmetProvider>
  );
}

export default App;
