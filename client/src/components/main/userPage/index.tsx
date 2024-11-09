import ProfileView from './userProfile';

const UserProfile = () => {
  const username = ''; // needs to be the username of the user whose page we want to view
  // can add search functionality here
  return (
    <>
      <ProfileView username={username}></ProfileView>
    </>
  );
};

export default UserProfile;
