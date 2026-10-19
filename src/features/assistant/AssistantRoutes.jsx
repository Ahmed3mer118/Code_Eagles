// src/features/assistant/AssistantRoutes.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import AssistantGuard from './AssistantGuard';
import AssistantLayout from './AssistantLayout';
import AssistantDashboard from './pages/AssistantDashboard';
import AssistantGroups from './pages/AssistantGroups';
import AssistantGroupDetails from './pages/AssistantGroupDetails';
import AssistantProfile from './pages/AssistantProfile'; // 🆕
import AssistantAssignments from './pages/AssistantAssignments';
import AssistantAssignmentDetails from './pages/AssistantAssignmentDetails';
import AssistantQuizzes from './pages/AssistantQuizzes';
import AssistantQuizDetails from './pages/AssistantQuizDetails';
import AssistantStudents from './pages/AssistantStudents';
import AssistantStudentDetails from './pages/AssistantStudentDetails';

export default function AssistantRoutes() {
  return (
    <Routes>
      <Route element={<AssistantGuard />}>
        <Route element={<AssistantLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AssistantDashboard />} />
          <Route path="groups" element={<AssistantGroups />} />
          <Route path="groups/:id" element={<AssistantGroupDetails />} />
          <Route path="profile" element={<AssistantProfile />} /> {/* 🆕 */}
          <Route path="assignments" element={<AssistantAssignments />} />
          <Route path="assignments/:id" element={<AssistantAssignmentDetails />} />
          <Route path="quizzes" element={<AssistantQuizzes />} />
          <Route path="quizzes/:id" element={<AssistantQuizDetails />} />
          <Route path="students" element={<AssistantStudents />} />
          <Route path="students/:id" element={<AssistantStudentDetails />} />
        </Route>
      </Route>
    </Routes>
  );
}
