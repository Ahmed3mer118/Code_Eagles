import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams, Outlet } from "react-router-dom";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";
import { IoMdSettings } from "react-icons/io";
import { FaUsers, FaChalkboardTeacher, FaTasks, FaEnvelope, FaChartLine, FaBook, FaGraduationCap, FaBars, FaHome } from "react-icons/fa";
import serviceFactory from '../utils/serviceFactory';
import Loading from "../User/shared/Loading";

function DashboardInstructor() {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalLectures: 0,
    totalTasks: 0,
    totalQuizzes: 0
  });
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    const fetchInstructorData = async () => {
      try {
        // تحقق من وجود token قبل استخدام الخدمات
        const token = serviceFactory.getToken();
        if (!token) {
          console.log("⚠️ لا يوجد token، إعادة توجيه للدخول");
          toast.error("يرجى تسجيل الدخول");
          navigate("/auth/login");
          return;
        }

        const instructorService = serviceFactory.getInstructorService();
        const response = await instructorService.getAllGroups();
        setGroups(response);
        
        // Calculate stats from groups data
        if (response && Array.isArray(response)) {
          const totalStudents = response.reduce((acc, group) => acc + (group.students?.length || 0), 0);
          const totalLectures = response.reduce((acc, group) => acc + (group.lectures?.length || 0), 0);
          const totalTasks = response.reduce((acc, group) => acc + (group.tasks?.length || 0), 0);
          const totalQuizzes = response.reduce((acc, group) => acc + (group.quizzes?.length || 0), 0);
          
          setStats({
            totalStudents,
            totalLectures,
            totalTasks,
            totalQuizzes
          });
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        
        // Check if it's an authentication error
        if (err.status === 401) {
          console.error("Authentication error - session expired");
          toast.error("انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.");
          navigate("/auth/login");
          return;
        }
        
        toast.error("فشل في تحميل البيانات");
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorData();
  }, [navigate]);

  if (loading) {
    return (
        <Loading />
    );
  }

  const renderMainContent = () => {
    if (window.location.pathname === '/instructor') {
      return (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className="rounded-full bg-blue-500 p-3 mr-4">
                  <FaUsers className="text-white text-xl" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className="rounded-full bg-green-500 p-3 mr-4">
                  <FaBook className="text-white text-xl" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Lectures</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalLectures}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className="rounded-full bg-indigo-500 p-3 mr-4">
                  <FaTasks className="text-white text-xl" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTasks}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className="rounded-full bg-yellow-500 p-3 mr-4">
                  <FaGraduationCap className="text-white text-xl" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Quizzes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalQuizzes}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Groups Section */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6">
              <h4 className="text-xl font-semibold text-gray-900 mb-6">Groups</h4>
              
              {groups?.length === 0 ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">No groups available currently</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.isArray(groups) && groups.map((group) => (
                    <div key={group._id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
                      <h5 className="text-lg font-semibold text-gray-900 mb-2">{group.title}</h5>
                      <p className="text-sm text-gray-600 mb-4">
                        {group.start_date?.split("T")[0]} - {group.end_date?.split("T")[0]}
                      </p>
                      <div className="space-y-2">
                        <button 
                          className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-lg border border-blue-200 transition-colors flex items-center justify-center"
                          onClick={() => navigate(`/instructor/group/${group.slug}/students`)}
                        >
                          <FaUsers className="mr-2" /> Students
                        </button>
                        <button 
                          className="w-full bg-green-50 hover:bg-green-100 text-green-700 font-medium py-2 px-4 rounded-lg border border-green-200 transition-colors flex items-center justify-center"
                          onClick={() => navigate(`/instructor/group/${group.slug}/lectures`)}
                        >
                          <FaChalkboardTeacher className="mr-2" /> Lectures
                        </button>
                        <button 
                          className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium py-2 px-4 rounded-lg border border-indigo-200 transition-colors flex items-center justify-center"
                          onClick={() => navigate(`/instructor/group/${group.slug}/tasks`)}
                        >
                          <FaTasks className="mr-2" /> Tasks 
                        </button>
                        <button 
                          className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium py-2 px-4 rounded-lg border border-purple-200 transition-colors flex items-center justify-center"
                          onClick={() => navigate(`/instructor/group/${group.slug}/quizzes`)}
                        >
                          <FaGraduationCap className="mr-2" /> Quizzes
                        </button>
                        <button 
                          className="w-full bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-medium py-2 px-4 rounded-lg border border-yellow-200 transition-colors flex items-center justify-center"
                          onClick={() => navigate(`/instructor/group/${group.slug}/messages`)}
                        >
                          <FaEnvelope className="mr-2" /> Messages
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
    return <Outlet />;
  };

  return (
    <>
      <Helmet>
        <title>Code Eagles | Instructor Dashboard</title>
      </Helmet>
      
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className={`bg-gray-900 text-white fixed h-full z-50 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-72' : 'w-20'
        }`}>
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            {isSidebarOpen && <h5 className="text-lg font-semibold">Instructor Dashboard</h5>}
            <button 
              className="text-white hover:text-gray-300 transition-colors p-2 rounded-md hover:bg-gray-800"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <FaBars className="text-xl" />
            </button>
          </div>
          
          <nav className="mt-6 px-2 space-y-1">
            <Link 
              to="/instructor"
              className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                activeTab === 'home' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-300 hover:bg-gray-800'
              } ${isSidebarOpen ? 'px-4' : 'justify-center'}`}
            >
              <FaHome className={`text-lg ${isSidebarOpen ? 'mr-3' : ''}`} />
              {isSidebarOpen && <span className="text-sm">Home</span>}
            </Link>
            
            <Link 
              to="/instructor/email-request"
              className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                activeTab === 'emailRequest' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-300 hover:bg-gray-800'
              } ${isSidebarOpen ? 'px-4' : 'justify-center'}`}
            >
              <FaEnvelope className={`text-lg ${isSidebarOpen ? 'mr-3' : ''}`} />
              {isSidebarOpen && <span className="text-sm">Email Request</span>}
            </Link>

            <Link 
              to="/instructor/setting"
              className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                activeTab === 'setting' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-300 hover:bg-gray-800'
              } ${isSidebarOpen ? 'px-4' : 'justify-center'}`}
            >
              <IoMdSettings className={`text-lg ${isSidebarOpen ? 'mr-3' : ''}`} />
              {isSidebarOpen && <span className="text-sm">Settings</span>}
            </Link>
          </nav>
        </div>


        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'ml-72' : 'ml-16'
        }`}>
          <div className="p-6">
            {renderMainContent()}
          </div>
        </div>
      </div>
    </>
  );
}

export default DashboardInstructor; 