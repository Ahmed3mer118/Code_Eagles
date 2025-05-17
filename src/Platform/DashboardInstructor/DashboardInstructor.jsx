import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams, Outlet } from "react-router-dom";
import { DataContext } from "../Users/Context/Context";
import axios from "axios";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";
import { IoMdSettings } from "react-icons/io";
import { FaUsers, FaChalkboardTeacher, FaTasks, FaEnvelope, FaChartLine, FaBook, FaGraduationCap, FaBars } from "react-icons/fa";
import InstructorService from '../classes/InstructorService';

function DashboardInstructor() {
  const { URLAPI, getTokenInstructor } = useContext(DataContext);
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
  const instructorService = new InstructorService(URLAPI, getTokenInstructor);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    const fetchInstructorData = async () => {
      try {
      const response = await instructorService.getAllGroups();
        setGroups(response);
      } catch (err) {
     
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };


    fetchInstructorData();
  }, [URLAPI, getTokenInstructor]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const renderMainContent = () => {
    if (window.location.pathname === '/instructor') {
      return (
        <>
          {/* Stats Cards */}
          <div className="row g-4 mb-4">
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="card h-100">
                <div className="card-body d-flex align-items-center">
                  <div className="rounded-circle bg-primary p-3 me-3">
                    <FaUsers className="text-white fs-4" />
                  </div>
                  <div>
                    <h6 className="card-subtitle mb-1 text-muted">Total Students</h6>
                    <h3 className="card-title mb-0">{stats.totalStudents}</h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <div className="card h-100">
                <div className="card-body d-flex align-items-center">
                  <div className="rounded-circle bg-success p-3 me-3">
                    <FaBook className="text-white fs-4" />
                  </div>
                  <div>
                    <h6 className="card-subtitle mb-1 text-muted">Total Lectures</h6>
                    <h3 className="card-title mb-0">{stats.totalLectures}</h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <div className="card h-100">
                <div className="card-body d-flex align-items-center">
                  <div className="rounded-circle bg-info p-3 me-3">
                    <FaTasks className="text-white fs-4" />
                  </div>
                  <div>
                    <h6 className="card-subtitle mb-1 text-muted">Tasks</h6>
                    <h3 className="card-title mb-0">{stats.totalTasks}</h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <div className="card h-100">
                <div className="card-body d-flex align-items-center">
                  <div className="rounded-circle bg-warning p-3 me-3">
                    <FaGraduationCap className="text-white fs-4" />
                  </div>
                  <div>
                    <h6 className="card-subtitle mb-1 text-muted">Quizzes</h6>
                    <h3 className="card-title mb-0">{stats.totalQuizzes}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Groups Section */}
          <div className="card">
            <div className="card-body">
              <h4 className="card-title mb-4">Groups</h4>
              
              {groups?.length === 0 ? (
                <div className="alert alert-info">
                  No groups available currently
                </div>
              ) : (
                <div className="row g-4">
                  {Array.isArray(groups) && groups.map((group) => (
                    <div key={group._id} className="col-12 col-md-6 col-xl-4">
                      <div className="card h-100">
                        <div className="card-body">
                          <h5 className="card-title">{group.title}</h5>
                          <p className="card-text text-muted small">
                            {group.start_date.split("T")[0]} - {group.end_date.split("T")[0]}
                          </p>
                          <div className="d-grid gap-2">
                            <button className="btn btn-outline-primary d-flex align-items-center justify-content-center"
                                    onClick={() => navigate(`/instructor/${group._id}/students`)}>
                              <FaUsers className="me-2" /> Students
                            </button>
                            <button className="btn btn-outline-success d-flex align-items-center justify-content-center"
                                    onClick={() => navigate(`/instructor/${group._id}/lectures`)}>
                              <FaChalkboardTeacher className="me-2" /> Lectures
                            </button>
                            <button className="btn btn-outline-success d-flex align-items-center justify-content-center"
                                    onClick={() => navigate(`/instructor/${group._id}/tasks`)}>
                              <FaTasks className="me-2" /> Tasks 
                            </button>
                            <button className="btn btn-outline-success d-flex align-items-center justify-content-center"
                                    onClick={() => navigate(`/instructor/${group._id}/quizzes`)}>
                              <FaTasks className="me-2" />  Quizzes
                            </button>
                            <button className="btn btn-warning d-flex align-items-center justify-content-center"
                                    onClick={() => navigate(`/instructor/${group._id}/messages`)}>
                              <FaEnvelope className="me-2" /> Messages
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      );
    }
    return <Outlet />;
  };

  return (
    <>
      <Helmet>
        <title>Code Eagles | Instructor Dashboard</title>
      </Helmet>
      
      <div className="d-flex">
        {/* Sidebar */}
        <div className={`bg-dark text-white position-fixed h-100 ${isSidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}
             style={{ width: isSidebarOpen ? '280px' : '50px', right: 0, transition: 'width 0.3s ease', zIndex: 1000 }}>
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom border-secondary">
            {isSidebarOpen && <h5 className="mb-0">Instructor Dashboard</h5>}
            <button className="btn btn-link text-white p-0" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <FaBars />
            </button>
          </div>
          
          <div className="nav flex-column mt-3">
            <button className={`btn btn-link text-white text-decoration-none text-start py-2 px-3 ${activeTab === 'home' ? 'bg-primary' : ''}`}
              onClick={() => setActiveTab('home')}>
              <Link to="/instructor" style={{ textDecoration: 'none', color: 'inherit' }}>
                <FaUsers className="me-2" /> {isSidebarOpen && 'Home'}
              </Link>
            </button>
            <button className={`btn btn-link text-white text-decoration-none text-start py-2 px-3 ${activeTab === 'emailRequest' ? 'bg-primary' : ''}`}
              onClick={() => setActiveTab('emailRequest')}>
              <Link to={`/instructor/emailRequest`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <FaEnvelope className="me-2" /> {isSidebarOpen && 'Email Request'}
              </Link>
            </button>

            <button className={`btn btn-link text-white text-decoration-none text-start py-2 px-3 ${activeTab === 'messages' ? 'bg-primary' : ''}`}
              onClick={() => setActiveTab('messages')}>
              <Link to={`/instructor/${groupId}/messages`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <FaEnvelope className="me-2" /> {isSidebarOpen && 'Messages'}
              </Link>
            </button>

            <button className={`btn btn-link text-white text-decoration-none text-start py-2 px-3 ${activeTab === 'setting' ? 'bg-primary' : ''}`}
              onClick={() => setActiveTab('setting')}>
              <Link to={`/instructor/setting`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <IoMdSettings className="me-2" /> {isSidebarOpen && 'Setting'}
              </Link>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow-1 p-4" style={{ marginRight: isSidebarOpen ? '280px' : '70px', transition: 'margin-right 0.3s ease' }}>
          {renderMainContent()}
        </div>
      </div>
    </>
  );
}

export default DashboardInstructor; 