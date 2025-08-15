import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import AdminService from "../../classes/AdminService";
import InstructorService from "../../classes/InstructorService";
import AuthServices from "../../classes/Auth";

function AttendanceList() {
  const authServices = new AuthServices();
  const token = authServices.getToken();
  const adminServices = new AdminService(token);
  const instructorService = new InstructorService(token);
  const { slugLecture } = useParams();
  const [attendedUsers, setAttendedUsers] = useState([]);
  const [notAttendedUsers, setNotAttendedUsers] = useState([]);
  const [lectureTitle, setLectureTitle] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchAttendance = async ()=>{

      if (slugLecture ) {
        let resAttend;
        let resNonAttend;
        try{
          setLoading(false)
          if (window.location.pathname.includes("/dashboard")) {
            resAttend = await adminServices.getAttendance(slugLecture);
            resNonAttend = await adminServices.getNonAttendance(slugLecture);
          }else{
            resAttend = await instructorService.getAttendance(slugLecture);
            resNonAttend = await instructorService.getNonAttendance(slugLecture);
          }
          setAttendedUsers(resAttend.attendance || []);
          setNotAttendedUsers(resNonAttend.usersNotAttended || []);
          setLectureTitle(resAttend.lectureTitle || "Unknown Lecture");
        }
    
          catch(err){
            console.error("Error fetching attendance data:", err);
            toast.error("Failed to load attendance data!");
            setLoading(false);
          }
      }
    }
    fetchAttendance()
  }, [slugLecture, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
    <Toaster position="top-center" />
    
    <h3 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-8">
      Attendance List for <span className="text-blue-600 dark:text-blue-400">"{lectureTitle}"</span>
    </h3>
  
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Present Students Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-gray-800 border border-green-200 dark:border-green-800">
        <div className="bg-green-600 dark:bg-green-700 px-6 py-3">
          <h5 className="text-lg font-semibold text-white flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Present Students ({attendedUsers.length})
          </h5>
        </div>
        <div className="p-4">
          {attendedUsers.length > 0? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Attended At</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  { attendedUsers.map((student, index) => (
                    <tr key={student.userId._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{index + 1}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-white">
                        {student.userId.name.trim()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 dark:text-gray-300">
                        {student.userId.email}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 dark:text-gray-300">
                        {new Date(student.attendedAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6">
              <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              <p className="mt-2 text-gray-600 dark:text-gray-400">No attendance records yet</p>
            </div>
          )}
        </div>
      </div>
  
      {/* Absent Students Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-gray-800 border border-red-200 dark:border-red-800">
        <div className="bg-red-600 dark:bg-red-700 px-6 py-3">
          <h5 className="text-lg font-semibold text-white flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            Absent Students ({notAttendedUsers.length})
          </h5>
        </div>
        <div className="p-4">
          {notAttendedUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Email</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {notAttendedUsers.map((student, index) => (
                    <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{index + 1}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-white">
                        {student.user_id.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 dark:text-gray-300">
                        {student.user_id.email}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6">
              <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <p className="mt-2 text-gray-600 dark:text-gray-400">All students are present</p>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
}

export default AttendanceList;
