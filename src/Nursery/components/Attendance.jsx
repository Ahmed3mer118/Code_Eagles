import React, { useState } from "react";

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([
    { id: 1, child: "محمد علي", status: "حاضر", arrival: "8:00 صباحًا", departure: "2:00 مساءً" },
    { id: 2, child: "أحمد حسن", status: "غائب", arrival: "9:00 صباحًا", departure: "غير محدد" },
  ]);

  return (
    <div className="container">
      <h2 className="my-4">إدارة الحضور</h2>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>اسم الطفل</th>
            <th>الحالة</th>
            <th>وقت الدخول</th>
            <th>وقت الخروج</th>
          </tr>
        </thead>
        <tbody>
          {attendanceData.map((data) => (
            <tr key={data.id}>
              <td>{data.child}</td>
              <td>{data.status}</td>
              <td>{data.arrival}</td>
              <td>{data.departure}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Attendance;
