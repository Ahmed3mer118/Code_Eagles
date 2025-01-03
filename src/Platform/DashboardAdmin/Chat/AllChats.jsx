import React from "react";
import { Link } from "react-router-dom";

function AllChats() {
  return (
    <div>
     <h1 className="text-center mt-2 mb-2"> All Chats</h1>
      <ul>
        <li>
               <span>Private :</span> <Link to={""}> 0</Link>
        </li>
        <li>
               <span>Group :</span> <Link to={""}> 0</Link>
        </li>
        <li>
               <span>Public :</span> <Link to={""}> 0</Link>
        </li>
      </ul>
      <div className="card m-2 p-2">
        <h1>Name : Ahmed Amer</h1>
        <h3>Group : 2024-12-12</h3>
        <p>
            <b> Message : </b> Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia dicta ullam ipsam sed facere optio error totam quisquam voluptatibus nostrum! Fugit impedit animi reiciendis aperiam molestias debitis quo amet perspiciatis.</p>
        <button className="btn btn-success card-button">Reply</button>
      </div>
      <div className="card m-2 p-2">
        <h1>Name : Ahmed Amer</h1>
        <h3>Group : 2024-12-12</h3>
        <p>
            <b> Message : </b> Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia dicta ullam ipsam sed facere optio error totam quisquam voluptatibus nostrum! Fugit impedit animi reiciendis aperiam molestias debitis quo amet perspiciatis.</p>
        <button className="btn btn-success card-button">Reply</button>
      </div>

    </div>
  );
}

export default AllChats;
