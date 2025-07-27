// src/components/Chat/StudentChat.js
import React, { useEffect, useState } from "react";

function StudentChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState(null);

  //
  return (
    <div>
      <h3>Chat with Student</h3>
      <div></div>
    </div>
  );
}

export default StudentChat;
