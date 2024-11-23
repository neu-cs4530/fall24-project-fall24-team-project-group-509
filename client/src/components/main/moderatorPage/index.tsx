import { Link } from 'react-router-dom';
import useModeratorPage from '../../../hooks/useModeratorPage';

const ModeratorPage = () => {
  const { user, pendingFlags } = useModeratorPage();

  return (
    <div>
      <h1>Welcome, {user.username}</h1>
      <h2>Here are the flagged posts for you to review:</h2>
      <ul>
        {pendingFlags.map(flag => (
          <li key={flag._id}>
            <Link to={`/flag/${flag._id}`}>
              {flag.flaggedBy} flagged {flag.postType} for {flag.reason}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ModeratorPage;
