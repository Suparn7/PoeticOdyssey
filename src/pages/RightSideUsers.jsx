import React, { useState, useEffect } from 'react';
import userService from '../appwrite/userService';

const RightSideUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await userService.getAllUsers();
        if (usersData) {
          setUsers(usersData);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="w-full sm:w-1/3 md:w-1/3 lg:w-1/3 p-4">
      <div className="bg-white shadow-lg p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Users</h2>
        {users && users.length > 0 ? (
          <ul className="space-y-4">
            {users.map((user) => (
              <li key={user.id} className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xl font-semibold">{user.name[0]}</span>
                </div>
                <span className="font-medium">{user.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No users available.</p>
        )}
      </div>
    </div>
  );
};

export default RightSideUsers;
