import React, { useState } from "react";


const AddChild = () => {
  const [name, setName] = useState("");
  const [className, setClassName] = useState("");
  const [parentName, setParentName] = useState("");

  const handleAddChild = (e) => {
    e.preventDefault();
    // منطق إضافة الطفل
  };

  return (
    <div className="container">
      <h2 className="my-4">إضافة طفل جديد</h2>
      <form onSubmit={handleAddChild}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">اسم الطفل</label>
          <input
            type="text"
            className="form-control"
            id="name"
            placeholder="أدخل اسم الطفل"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="class" className="form-label">الفصل</label>
          <input
            type="text"
            className="form-control"
            id="class"
            placeholder="أدخل الفصل"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="parentName" className="form-label">اسم ولي الأمر</label>
          <input
            type="text"
            className="form-control"
            id="parentName"
            placeholder="أدخل اسم ولي الأمر"
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-success">إضافة الطفل</button>
      </form>
    </div>
  );
};

export default AddChild;
