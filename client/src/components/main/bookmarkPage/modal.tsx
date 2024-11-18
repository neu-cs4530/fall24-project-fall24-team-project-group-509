/* eslint-disable prettier/prettier */
import React, { useState } from 'react';

interface ModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (username: string) => void;
}

const Modal = ({ show, onClose, onSubmit }: ModalProps) => {
  const [input, setInput] = useState('');

  if (!show) return null;

  const handleSubmit = () => {
    onSubmit(input);
    onClose();
  };

  return (
    <div>
      <h2>Share this collection</h2>
      <input
        type='text'
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder='Enter username'
      />
      <button onClick={handleSubmit}>Share</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

export default Modal;
