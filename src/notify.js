import React, { useEffect, useState } from 'react';
import './notify.css';

const Notification = ({ message, duration }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    const timer = setTimeout(() => setShow(false), duration * 1000);
    return () => clearTimeout(timer);
  }, [message, duration]);

  if (!show) return null;

  return (
    <div className="Notification">
      {message}
    </div>
  );
};

export default Notification;