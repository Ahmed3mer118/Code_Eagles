import React, { useContext, useState } from "react";
import { ToastContainer } from "react-toastify";
import { Helmet } from "react-helmet-async";
import RegisterForm from "./RegisterForm";


function Register() {

 
  return (
    <>
      <ToastContainer />
      <Helmet>
        <title>Register</title>
      </Helmet>
      <div className="bg-form">
          <RegisterForm />
      </div>
    </>
  );
}

export default Register;
