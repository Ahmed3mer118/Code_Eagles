// src/components/Chat/GroupChat.js
import React, { useEffect, useState } from 'react';
// import { connectWebSocket } from '../../services/websocketService';

function GroupChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState(null);

  // useEffect(() => {
  //   const ws = connectWebSocket('ws://localhost:8000/group');
  //   setSocket(ws);

  //   ws.onmessage = (event) => {
  //     setMessages(prevMessages => [...prevMessages, event.data]);
  //   };

  //   return () => {
  //     ws.close();
  //   };
  // }, []);

  const sendMessage = () => {
    if (socket && input) {
      socket.send(input);
      setInput('');
    }
  };

  return (
    <div>
      <h3>Group Chat</h3>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={sendMessage}>Send</button>

    </div>
  );
}

export default GroupChat;