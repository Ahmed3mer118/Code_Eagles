import React, { createContext, useEffect, useState, useContext } from "react";
import AdminService from "../../classes/AdminService";
import { DataContext } from "../../../Platform/Users/Context/Context"

export const MaintenanceContext = createContext();

export const MaintenanceProvider = ({ children }) => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const { URLAPI, getTokenAdmin } = useContext(DataContext);

  useEffect(() => {
    const fetchStatus = async () => {
      try {

        if (!getTokenAdmin) return;

        const adminService = new AdminService(URLAPI, getTokenAdmin, maintenanceMode);
        const res = await adminService.getLockCode();
        // console.log(res.isActive);
        if(res.isActive === true){
          setMaintenanceMode(true);
        }else{
          setMaintenanceMode(false);
        }
      } catch (err) {
        console.error("Maintenance check error:", err);
      }
    };

    fetchStatus();
  }, [URLAPI, getTokenAdmin]);

  return (
    <MaintenanceContext.Provider value={maintenanceMode}>
      {children}
    </MaintenanceContext.Provider>
  );
};


