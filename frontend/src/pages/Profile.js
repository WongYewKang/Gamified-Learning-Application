import React from 'react';

const Profile = ({ user }) => {
  return (
    <div>
      <img src={user.profileImage} alt="Profile" />
      <p>{user.username}</p>
      {/* Add other user details as needed */}
    </div>
  );
};

export default Profile;
