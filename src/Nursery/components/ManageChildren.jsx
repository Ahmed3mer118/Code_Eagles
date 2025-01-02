import React, { useState } from "react";

const ManageChildren = () => {
  const [children, setChildren] = useState([
    { id: 1, name: "محمد علي", class: "الفصل 1" },
    { id: 2, name: "أحمد حسن", class: "الفصل 2" },
  ]);

  return (
    <div className="container">
      <h2 className="my-4">إدارة الأطفال</h2>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>اسم الطفل</th>
            <th>الفصل</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {children.map((child) => (
            <tr key={child.id}>
              <td>{child.name}</td>
              <td>{child.class}</td>
              <td>
                <button className="btn btn-warning btn-sm">تعديل</button>
                <button className="btn btn-danger btn-sm ms-2">حذف</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn btn-success">إضافة طفل جديد</button>
    </div>
  );
};

export default ManageChildren;
