'use client';

import React, { useState } from 'react';
import Chatbot from './Chatbot';

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Chatbot isWidget={true} onClose={() => setIsOpen(false)} />
    </>
  );
}
