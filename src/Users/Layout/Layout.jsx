import React, { useEffect } from 'react'
import Navbar from './Navbar'
import { Outlet, useNavigate } from 'react-router-dom'
import Footer from '../Footer'
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Helmet } from 'react-helmet-async';

function Layout() {
  const navigate = useNavigate()
  const token = localStorage.getItem("tokenUser");
  const expiration = localStorage.getItem("tokenExpirationUser");
  // useEffect(() => {
  
    if (token && expiration) {

      const currentTime = Date.now();
      if (currentTime > expiration) {
        localStorage.removeItem("tokenUser");
        localStorage.removeItem("tokenExpirationUser");
        toast.error("Session expired. Please log in again.");
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      }
    }
  // }, [ expiration]);
  
  return (
    <div>
      <ToastContainer />
      <Helmet >
        <title>Code Eagles</title>
      </Helmet>
        <Navbar />
        <main>
            <Outlet />
        </main>
        <Footer />
        
    </div>
  )
}

export default Layout
