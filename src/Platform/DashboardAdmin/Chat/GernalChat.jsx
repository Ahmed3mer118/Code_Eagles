// src/components/Chat/GeneralChat.js
import React, { useEffect, useState } from 'react';
// import { connectWebSocket } from '../../services/websocketService';

function GeneralChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState(null);

//   useEffect(() => {
//     const ws = connectWebSocket('ws://localhost:8000/general');
//     setSocket(ws);

//     ws.onmessage = (event) => {
//       setMessages(prevMessages => [...prevMessages, event.data]);
//     };

//     return () => {
//       ws.close();
//     };
//   }, []);

  const sendMessage = () => {
    if (socket && input) {
      socket.send(input);
      setInput('');
    }
  };

  return (
    <div>
      <h3>General Chat</h3>
      <div>
        {messages.map((msg, index) => (
        //   <div key={index}>{msg }</div>
          <div key={index}>jabdbchbahbsdhbhfbshd</div>
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

export default GeneralChat;