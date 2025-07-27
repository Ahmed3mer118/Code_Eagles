import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import AuthServices from "../../classes/Auth";
import AdminService from "../../classes/AdminService";
import InstructorService from "../../classes/InstructorService";

function SubmissionsTask() {
  const authServices = new AuthServices();
  const token = authServices.getToken();
  const adminServices = new AdminService(token);
  const instructorService = new InstructorService(token);
  const { lectureId, taskId } = useParams();
  
  const [submittedUsers, setSubmittedUsers] = useState([]);
  const [notSubmittedUsers, setNotSubmittedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [evaluationData, setEvaluationData] = useState({
    userId: "",
    feedback: "",
    score: 0
  });

  // API Service Functions
  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const service = window.location.pathname.includes("/instructor") 
        ? instructorService 
        : adminServices;
      
      const res = await service.getSubmissionsTask(lectureId, taskId);
      setSubmittedUsers(res.submittedUsers || []);
      setNotSubmittedUsers(res.notSubmittedUsers || []);
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
      toast.error("Failed to fetch submissions.");
    } finally {
      setLoading(false);
    }
  };

  const evaluateSubmission = async (userId) => {
    if (!evaluationData.feedback || !evaluationData.score) {
      toast.error("Please provide both feedback and score");
      return;
    }

    try {
      const service = window.location.pathname.includes("/instructor") 
        ? instructorService 
        : adminServices;
      
      await service.evaluateSubmission(
        lectureId, 
        taskId, 
        userId, 
        evaluationData
      );

      toast.success("Evaluation submitted successfully");
      fetchSubmissions(); // Refresh data
      setEvaluationData({ userId: "", feedback: "", score: 0 }); // Reset form
    } catch (error) {
      console.error("Evaluation failed:", error);
      toast.error("Failed to submit evaluation");
    }
  };

  useEffect(() => {
    if (lectureId && taskId) {
      fetchSubmissions();
    }
  }, [lectureId, taskId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <Helmet>
        <title>Task Submissions</title>
      </Helmet>
    
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Submitted Users Section */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Submitted Users ({submittedUsers.length})
          </h3>
          
          <SubmissionTable 
            users={submittedUsers}
            evaluationData={evaluationData}
            setEvaluationData={setEvaluationData}
            onEvaluate={evaluateSubmission}
          />
        </div>
      
        {/* Not Submitted Users Section */}
        <div>
          <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
            Users Not Submitted ({notSubmittedUsers.length})
          </h3>
          
          <NonSubmissionTable users={notSubmittedUsers} />
        </div>
      </div>
    </>
  );
}

// Component for Submitted Users Table
const SubmissionTable = ({ users, evaluationData, setEvaluationData, onEvaluate }) => (
  <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700">
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead className="bg-gray-50 dark:bg-gray-800">
        <tr>
          <TableHeader>#</TableHeader>
          <TableHeader>Name</TableHeader>
          <TableHeader>Task</TableHeader>
          <TableHeader>Score</TableHeader>
          <TableHeader>Feedback</TableHeader>
          <TableHeader>Status</TableHeader>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
        {users.length > 0 ? (
          users.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <TableCell>{index + 1}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>
                <SubmissionLink link={item.submission.submissionLink} />
              </TableCell>
              <TableCell>
                <ScoreDisplay 
                  score={item.submission.score} 
                  evaluationData={evaluationData}
                  setEvaluationData={setEvaluationData}
                  userId={item.userId}
                />
              </TableCell>
              <TableCell>
                <FeedbackDisplay 
                  feedback={item.submission.feedback} 
                  evaluationData={evaluationData}
                  setEvaluationData={setEvaluationData}
                  userId={item.userId}
                />
              </TableCell>
              <TableCell>
                <EvaluationStatus 
                  isEvaluated={item.submission.score !== null} 
                  onEvaluate={() => onEvaluate(item.userId)}
                />
              </TableCell>
            </tr>
          ))
        ) : (
          <EmptyTableRow colSpan={6} message="No submissions yet." />
        )}
      </tbody>
    </table>
  </div>
);

// Component for Not Submitted Users Table
const NonSubmissionTable = ({ users }) => (
  <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700">
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead className="bg-gray-50 dark:bg-gray-800">
        <tr>
          <TableHeader>#</TableHeader>
          <TableHeader>Name</TableHeader>
          <TableHeader>Email</TableHeader>
          <TableHeader>Score</TableHeader>
          <TableHeader>Status</TableHeader>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
        {users.length > 0 ? (
          users.map((user, index) => (
            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <TableCell>{index + 1}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  0
                </span>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  Not submitted
                </span>
              </TableCell>
            </tr>
          ))
        ) : (
          <EmptyTableRow colSpan={5} message="All users have submitted." />
        )}
      </tbody>
    </table>
  </div>
);

// Reusable Components
const TableHeader = ({ children }) => (
  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
    {children}
  </th>
);

const TableCell = ({ children }) => (
  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-800 dark:text-gray-200">
    {children}
  </td>
);

const EmptyTableRow = ({ colSpan, message }) => (
  <tr>
    <td colSpan={colSpan} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
      {message}
    </td>
  </tr>
);

const SubmissionLink = ({ link }) => (
  <Link 
    to={link} 
    target="_blank"
    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline"
    aria-label="View submission"
  >
    View Submission
  </Link>
);

const ScoreDisplay = ({ score, evaluationData, setEvaluationData, userId }) => {
  if (score !== null) {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        score >= 70 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
        score >= 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      }`}>
        {score}
      </span>
    );
  }
  
  return (
    <input
      type="number"
      onChange={(e) => setEvaluationData({
        ...evaluationData,
        userId,
        score: parseInt(e.target.value) || 0
      })}
      className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      placeholder="Score"
      min="0"
      max="100"
      value={evaluationData.userId === userId ? evaluationData.score : ""}
    />
  );
};

const FeedbackDisplay = ({ feedback, evaluationData, setEvaluationData, userId }) => {
  if (feedback !== null) {
    return <span className="text-gray-800 dark:text-gray-300">{feedback}</span>;
  }
  
  return (
    <input
      type="text"
      onChange={(e) => setEvaluationData({
        ...evaluationData,
        userId,
        feedback: e.target.value
      })}
      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      placeholder="Feedback"
      value={evaluationData.userId === userId ? evaluationData.feedback : ""}
    />
  );
};

const EvaluationStatus = ({ isEvaluated, onEvaluate }) => {
  if (isEvaluated) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Evaluated
      </span>
    );
  }
  
  return (
    <button
      onClick={onEvaluate}
      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center mx-auto"
    >
      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
      Send
    </button>
  );
};

export default SubmissionsTask;