import { useState } from 'react';

const ModeratorPage = () => {
  const [moderator, setModerator] = useState('');

  return <h1>Hello {moderator}</h1>;
};

export default ModeratorPage;
