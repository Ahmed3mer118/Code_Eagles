// src/components/Chat/Chat.js
import React, { useState } from 'react';
import StudentChat from './StudentChat';
import GroupChat from './GroupChat';
import GeneralChat from './GernalChat';

function Chat() {
  const [activeChat, setActiveChat] = useState('student');

  const renderChat = () => {
    switch (activeChat) {
      case 'student':
        return <StudentChat />;
      case 'group':
        return <GroupChat />;
      case 'general':
        return <GeneralChat />;
      default:
        return <StudentChat />;
    }
  };

  return (
    <div>
      <h2>Admin Chat</h2>
      <div>
        <button className='btn btn-warning m-2' onClick={() => setActiveChat('student')}>Chat with Student</button>
        <button className='btn btn-warning m-2' onClick={() => setActiveChat('group')}>Chat with Group</button>
        <button className='btn btn-warning m-2' onClick={() => setActiveChat('general')}>General Chat</button>
      </div>
      {renderChat()}
    </div>
  );
}

export default Chat;