import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  getFlagById,
  banUser,
  shadowBanUser,
  deletePost,
  reviewFlag,
} from '../../../services/moderatorService'; // Adjust paths as necessary
import { Flag } from '../../../types';
import useUserContext from '../../../hooks/useUserContext';

const ModeratorActionPage = () => {
  const { user } = useUserContext();
  const { fid } = useParams();
  const navigate = useNavigate();
  const [flag, setFlag] = useState<Flag | null>(null);
  const [flagId, setFlagId] = useState<string>(fid || '');

  useEffect(() => {
    // Fetch the flag details using the flagId from the URL
    const fetchFlagDetails = async () => {
      try {
        const fetchedFlag = await getFlagById(flagId, user.username);
        setFlag(fetchedFlag);
      } catch (error) {
        console.error('Error fetching flag details:', error);
      }
    };

    fetchFlagDetails();
  }, [flagId, user.username]);

  // Action handlers
  const handleBanUser = async () => {
    if (flag) {
      try {
        await banUser(flag.flaggedBy, user.username);
        navigate('/flags');
      } catch (error) {
        console.error('Error banning user:', error);
      }
    }
  };

  const handleRestrictUser = async () => {
    if (flag) {
      try {
        await shadowBanUser(flag.flaggedBy, user.username);
        navigate('/flags');
      } catch (error) {
        console.error('Error restricting user:', error);
      }
    }
  };

  const handleIgnoreFlag = async () => {
    if (flag) {
      try {
        await reviewFlag(flag._id as string, user.username);
        navigate('/flags');
      } catch (error) {
        console.error('Error ignoring flag:', error);
      }
    }
  };

  const handleDeletePost = async () => {
    if (flag) {
      try {
        await deletePost(flag.postId, flag.postType, 'moderatorUsername');
        navigate('/flags');
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  if (!flag) return <p>Loading: {fid}</p>;

  return (
    <div>
      <h1>Moderator Action Page</h1>
      <p>
        <strong>Flagged Text:</strong> {flag.postText}
      </p>
      <p>
        <strong>Flagged By:</strong> {flag.flaggedBy}
      </p>
      <p>
        <strong>Reason:</strong> {flag.reason}
      </p>
      <div>
        <button onClick={handleBanUser}>Ban User</button>
        <button onClick={handleRestrictUser}>Restrict User</button>
        <button onClick={handleIgnoreFlag}>Ignore Flag</button>
        <button onClick={handleDeletePost}>Delete Post</button>
      </div>
    </div>
  );
};

export default ModeratorActionPage;
