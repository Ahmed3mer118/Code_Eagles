// src/features/student/StudentRoutes.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import StudentGuard from './StudentGuard';
import StudentDashboard from './pages/StudentDashboard';
import StudentSubjects from './pages/StudentSubjects';
import StudentSubjectDetails from './pages/StudentSubjectDetails'; // 🆕
import StudentCourses from './pages/StudentCourses';
import StudentLectures from './pages/StudentLectures';
import StudentAssignments from './pages/StudentAssignments';
import StudentQuizzes from './pages/StudentQuizzes';
import StudentGrades from './pages/StudentGrades';
import StudentNotifications from './pages/StudentNotifications';
import StudentProfile from './pages/StudentProfile';           
import StudentLayout from './StudentLayout';
import StudentCourseDetails from './pages/StudentCourseDetails';
import StudentModuleLectures from './pages/StudentModuleLectures';
import StudentLecturePlayer from './pages/StudentLecturePlayer';
import StudentAssignmentDetails from './pages/StudentAssignmentDetails';
import StudentQuizTake from './pages/StudentQuizTake';
import StudentQuizResult from './pages/StudentQuizResult';

// 🆕 صفحات جديدة
import StudentPoints from './pages/StudentPoints';
import StudentLeaderboard from './pages/StudentLeaderboard';
import StudentPaymentPlans from './pages/StudentPaymentPlans';
import StudentPayments from './pages/StudentPayments';
import StudentEnrollments from './pages/StudentEnrollments';
import StudentSubscription from './pages/StudentSubscription';

export default function StudentRoutes() {
  return (
    <Routes>
      <Route element={<StudentGuard />}>
        <Route element={<StudentLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* Dashboard */}
          <Route path="dashboard" element={<StudentDashboard />} />

          {/* Subjects */}
          <Route path="subjects" element={<StudentSubjects />} />
          <Route path="subjects/:id" element={<StudentSubjectDetails />} />

          {/* Courses */}
          <Route path="courses" element={<StudentCourses />} />
          <Route path="courses/:courseId" element={<StudentCourseDetails />} />

          {/* Lectures */}
          <Route path="lectures" element={<StudentLectures />} />
          <Route
            path="modules/:moduleId/lectures"
            element={<StudentModuleLectures />}
          />
          <Route path="lectures/:lectureId" element={<StudentLecturePlayer />} />

          {/* Assignments */}
          <Route path="assignments" element={<StudentAssignments />} />
          <Route
            path="assignments/:assignmentId"
            element={<StudentAssignmentDetails />}
          />

          {/* Quizzes */}
          <Route path="quizzes" element={<StudentQuizzes />} />
          <Route path="quizzes/:quizId/take" element={<StudentQuizTake />} />
          <Route
            path="quizzes/:quizId/result/:attemptId"
            element={<StudentQuizResult />}
          />

          {/* Grades */}
          <Route path="grades" element={<StudentGrades />} />

          {/* 🆕 Gamification */}
          <Route path="points" element={<StudentPoints />} />
          <Route path="leaderboard" element={<StudentLeaderboard />} />

          {/* 🆕 Payments */}
          <Route path="payment-plans" element={<StudentPaymentPlans />} />
          <Route path="payments" element={<StudentPayments />} />
          <Route path="enrollments" element={<StudentEnrollments />} />
          <Route path="subscription" element={<StudentSubscription />} />

          {/* Others */}
          <Route path="notifications" element={<StudentNotifications />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>
      </Route>
    </Routes>
  );
}
