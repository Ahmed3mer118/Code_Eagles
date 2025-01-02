import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";


function CourseDetail() {
  const { courseDetails } = useParams(); // الحصول على اسم الكورس من الرابط
  const [courses] = useState([
    {
      nameCourse: "HTML",
      description: "Learn the basics of HTML.",
      image: "html.webp",
      list: [
        "Basic Structure: Understanding the basic structure of HTML.",
        "Elements and Tags: Recognizing different elements like headings, paragraphs, links, and images.",
        "Forms: Creating forms to collect user data.",
        "Semantic HTML: Using semantic elements to improve SEO and user experience.",
      ],
    },
    {
      nameCourse: "CSS",
      description: "Learn how to style websites with CSS.",
      image: "css3.png",
      list: [
        "Selectors and Properties: Using selectors to apply styles to elements.",
        "Box Model: Understanding the box model (margin, border, padding, content).",
        "Flexbox and Grid: Using modern layout techniques for responsive design.",
        "Responsive Design: Making designs responsive using media queries.",
      ],
    },
    {
      nameCourse: "JavaScript",
      description: "Master the fundamentals of JavaScript.",
      image: "javascript.png",
      list: [
        "Basic Concepts: Variables, Data Types, Operators, Control Structures , Array, If statment , Loop.",
        "DOM (Document Object Model): Interacting with HTML elements, modifying the page, handling events.",
        "BOM (Browser Object Model): Working with browser objects like window, navigator, and location.",
        "APIs (Application Programming Interfaces): Using APIs to fetch data from servers.",
        "AJAX (Asynchronous JavaScript and XML): Making asynchronous requests to fetch data without reloading the page.",
      ],
    },
    {
      nameCourse: "Bootstrap",
      description: "Learn to design responsive websites with Bootstrap.",
      image: "bootstrap-framework.png",
      list: [
        "Grid System: Understanding the grid system for layout.",
        "Components: Using pre-built components like buttons, forms, and dropdowns.",
        "Utilities: Applying utility classes for quick styling.",
      ],
    },
    {
      nameCourse: "Git & GitHub",
      description: "Understand version control with Git and GitHub.",
      image: "git.png",
      list: [
        "Version Control: Understanding the importance of version control.",
        "Basic Commands: Learning basic commands like git init, git add, git commit, git push, and git pull.",
        "Branches: Creating and managing branches in Git.",
        "Collaboration: Working with teams using GitHub, including creating pull requests.",
      ],
    },
    {
        nameCourse: "React",
        description: "Build interactive user interfaces with React.",
        image: "react.png",
        list: [
          "Components: Understanding the concept of components and how to create them.",
          "State and Props: Managing state and passing data between components.",
          "Lifecycle Methods: Understanding the lifecycle of components.",
          "Hooks: Using hooks like useState, useEffect, and useContext....",
          "Routing: Using React Router for navigation.",
          "Context API: Managing global state with Context API.",
          "Styling: Using CSS Modules and Styled Components by Bootstrap.",
        ],
      
    },
  ]);
  useEffect(() => {

    window.scrollTo(0, 0);
  }, []);

  const course = courses.find((c) => c.nameCourse === courseDetails); // البحث عن الكورس

  if (!course) {
    return <h2 className="text-center">Course not found</h2>; // إذا لم يتم العثور على الكورس
  }

  return (
    <div className="container mt-4 mb-3">
      <div className="row">
        <div className="col-md-6 text-center">
          <img
            src={`/images/${course.image}`}
            alt={course.nameCourse}
            className="img-fluid rounded"
            style={{
              height: "300px",
              objectFit: "cover",
            }}
          />
          <h1 className="text-center">{course.nameCourse}</h1>
        </div>
        <div className="col-md-6 mt-3">
          <h3 className="m-3">Course Details:</h3>
          <ul className="list-group">
            {course.list.map((item, idx) => (
              <li key={idx} className="list-group-item">{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;