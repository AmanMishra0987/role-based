'use client';

import React from 'react';
import Chatbot from './Chatbot';

export default function FloatingChatbot() {
  return (
    <>
      <Chatbot isWidget={true} onClose={() => {}} />
    </>
  );
}
