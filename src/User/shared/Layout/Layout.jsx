import React, { useContext, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "../Header";
import Footer from "../Footer";
import { Helmet } from "react-helmet-async";

function Layout() {
  return (
    <div>
      {/* <Helmet>
        <title>Code Eagles</title>
      </Helmet> */}
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
