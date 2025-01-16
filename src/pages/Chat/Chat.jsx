import React, { useState, useEffect } from "react";
import ChatWindow from "../../components/Chat/ChatWindow";
import Modal from "../../components/Chat/Modal";
import "./ChatPage.css";
import chatService from "../../appwrite/ChatService";
import userService from "../../appwrite/userService";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import realTimeChatService from "../../appwrite/RealTimeChatService";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const ChatPage = () => {
  const user = useSelector((state) => state.auth.userData);
  const userInfo = useSelector((state) => state.user.userData);

  const [chatId, setChatId] = useState(null);
  const [userId, setUserId] = useState(user.$id);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [chatList, setChatList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMore, setShowMore] = useState(false);
  const navigate = useNavigate();
  const [latestMessages, setLatestMessages] = useState({});

  // Function to update the chat list with a new message
  const updateChatListWithNewMessage = (chatId, newMessage) => {
    
    // setLatestMessages((prevMessages) => ({
    //   ...prevMessages,
    //   [chatId]: newMessage, // Update the latest message for this chat
    // }));
    
    setChatList((prevChatList) => {
      const updatedChatList = prevChatList.map((chat) => {
        if (chat.chatId === chatId) {
          return { ...chat, latestMessage: newMessage };
        }
        return chat;
      });
      return updatedChatList;
    });

  };
  
  // Fetch data and set state
  const fetchData = async () => {
    try {
      const chats = await chatService.getChatsByUser(userId);
      const users = await userService.getAllUsers();
  
      if (chats.length > 0) {
        // Fetch latest messages for each chat and add it to the chat object
        const messagesPromises = chats.map(async (chat) => {
          const messages = await chatService.getMessagesByChat(chat.chatId);
          return messages.length > 0 ? messages[messages.length - 1] : null;
        });
  
        // Wait for all the promises to resolve
        const latestMessagesList = await Promise.all(messagesPromises);
  
        // Add the latest message to each chat object
        const updatedChats = chats.map((chat, index) => ({
          ...chat,
          latestMessage: latestMessagesList[index],  // Add the latest message here
        }));
  
        // Update the chat list with latest messages
        setChatList(updatedChats);
      }
  
      if (users.length > 0) {
        setUserList(users);
      }
      setLoading(false);
    } catch (err) {
      console.log(err);
      setError("Failed to load chats. Please try again later.");
      setLoading(false);
    }
  };
  

  // Fetch data initially and when the user ID changes
  useEffect(() => {
    fetchData(); // Initially fetch data when component mounts
  }, [userId]);

  // Start real-time message subscription for all chats
  useEffect(() => {
    const unsubscribeFns = chatList.map((chat) => {
        return realTimeChatService.subscribeToMessages(chat.chatId, (newMessage) => {
            // First, check if the chat already exists in the chatList
            const existingChat = chatList.find(c => c.chatId === newMessage.chatId);
            
            if (existingChat) {
                // Update the latest message for the existing chat
                setChatList((prevList) =>
                    prevList.map((c) =>
                        c.chatId === newMessage.chatId
                            ? { ...c, latestMessage: newMessage }
                            : c
                    )
                );
            } else {
                // If the chat doesn't exist, create a new entry for it
                const newChat = {
                    chatId: newMessage.chatId,
                    createdAt: new Date().toISOString(),
                    chatName: selectedUserName, // You might want to set chatName dynamically
                    latestMessage: newMessage,
                };

                // Add the new chat to the chat list
                setChatList((prevList) => [...prevList, newChat]);
            }
        });
    });

    // Cleanup subscriptions when the component unmounts
    return () => {
        unsubscribeFns.forEach((unsubscribe) => unsubscribe());
    };
}, [chatList, userId]); // Re-run effect if userId or chatList changes


useEffect(() => {
  const unsubscribe = realTimeChatService.subscribeToChat(userId, async (response) => {
      // Only handle create/update events
      if (response.events.some(event => event.includes('create') || event.includes('update'))) {
          const chat = response.payload;
          const chatId = chat.chatId;

          // Ensure the user is a participant before adding the chat to the list
          if (chat.participants.includes(userId)) {
              const messages = await chatService.getMessagesByChat(chatId);
              const latestMessage = messages[messages.length - 1];

              setChatList((prevList) => {
                  const existingChat = prevList.find(c => c.chatId === chatId);

                  if (existingChat) {
                      return prevList.map((existing) =>
                          existing.chatId === chatId
                              ? { ...existing, latestMessage }
                              : existing
                      );
                  } else {
                      return [...prevList, { ...chat, latestMessage }];
                  }
              });
          }
      }
  });

  // Cleanup the subscription on component unmount
  return () => {
      unsubscribe(); // Unsubscribe when the component is unmounted
  };
}, [chatList, userId]); // Re-run effect if chatList or userId changes

  
   // Re-run effect if chatList changes
  

  const closeModal = () => {
    setIsModalOpen(false);
    navigate('/');
  };

  const handleUserSelect = async (selectedUserId) => {
    try {
      const existingChat = await chatService.getChatBetweenUsers(userId, selectedUserId);
      const selectedUserInfo = await userService.getUserById(selectedUserId);
      if (existingChat) {
        setChatId(existingChat.chatId);
      } else {
        const newChat = await chatService.createChat(userId, selectedUserId, selectedUserInfo.name);
        setChatList((prevChatList) => [...prevChatList, newChat]);
        setChatId(newChat.chatId);
      }
    } catch (error) {
      setError("Failed to create or fetch chat.");
      console.error(error);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredUsers = userList && userList.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) && user.$id !== userId
);


  const handleBackToList = () => {
    setChatId(null);
    setSearchQuery("")
    fetchData(); // Re-fetch data when returning to the list
  };

  return (
    <div className="chatBtnWrapper">
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {chatId ? (
          <div>
            <button className="back-btn" onClick={handleBackToList}>
              <FontAwesomeIcon icon={faArrowLeft} size="lg" />
            </button>
            {chatList.map((chat) => {
              if (chat.chatId === chatId) {
                const receiverId = chat.participants.find(id => id !== userId);
                const receiver = userList.find(userItem => userItem.userId === receiverId);
                const receiverName = receiver ? receiver.name : "Unknown";

                return <ChatWindow 
                key={chatId} 
                chatId={chatId} 
                userId={userId} 
                receiverId={receiverId} 
                receiverName={receiverName} 
                receiverProfilePicUrl = {receiver.profilePicUrl}
                updateLatestMessage={updateChatListWithNewMessage}
                 />;
              }
              return null;
            })}
          </div>
        ) : (
          <div>
            {loading ? (
              <div className="chat-loading-text-container">
              <p className="chat-loading-text">
                {['L', 'o', 'a', 'd', 'i', 'n', 'g', '...'].map((letter, index) => (
                  <span
                    key={index}
                    className="chat-loading-letter"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {letter}
                  </span>
                ))}
              </p>
            </div>
            
            ) : error ? (
              <p>{error}</p>
            ) : chatList.length === 0 || chatList.every((chat) => chat.latestMessage === null || chat.latestMessage === "" || chat.latestMessage === undefined) ? (
              <div className="search-section" style={{ "minWidth": "100%" }}>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="searchInput text-black"
                />
                <p>No chats available. Select a user to start a chat.</p>
                <ul className="user-list">
                  {filteredUsers && filteredUsers.slice(0, showMore ? filteredUsers.length : 5).map((user) => (
                    <li className="user-card break-words" key={user.$id} onClick={() => handleUserSelect(user.$id)}>
                      <img src={user.profilePicUrl} alt={user.name} className="profile-pic" />
                      <span>{user.name}</span>
                    </li>
                  ))}
                </ul>
                {!showMore && filteredUsers.length > 5 && (
                  <button onClick={() => setShowMore(true)}>Show More Users</button>
                )}
              </div>
            ) : (
              <div className="chatList-modal-content">
                <div className="chat-section">
                  <p>Recent Chats</p>
                  <ul className="chat-list">
                    {chatList.map((chat) => {
                      const latestMessage = chat.latestMessage;
                      const latestMessageContent = latestMessage ? latestMessage.messageContent : "No messages yet";
                      const latestMessageImg = latestMessage ? latestMessage.msgImg : null;

                      // Find the receiver (the one who is not the current user)
                      const receiverId = chat.participants.find(id => id !== userId);
                      
                      // Find the receiver's name and profile picture from the userList
                      const receiver = userList.find(userItem => userItem.userId === receiverId);
                      const receiverName = receiver ? receiver.name : "Unknown";
                      const receiverProfilePicUrl = receiver ? receiver.profilePicUrl : null;

                      return (
                        latestMessageContent !== "No messages yet" && (
                          <li key={chat.chatId} className="chat-card" onClick={() => setChatId(chat.chatId)}>
                            <div className="chat-card-content">
                              <div className="profile-pic-container">
                                <img
                                  src={receiverProfilePicUrl || "https://via.placeholder.com/50"}  // Fallback to placeholder if no profile picture
                                  alt={`${receiverName}'s profile`}
                                  className="profile-pic"
                                />
                              </div>
                              <div className="flex flex-col">
                              <span className="chat-name">{receiverName}</span>
                              <span className="recent-message">
                                {latestMessageImg && !latestMessageContent ? (
                                  <FontAwesomeIcon icon={faImage} />
                                ) : (
                                  `${latestMessageContent.length > 10 ? latestMessageContent.substring(0, 10) + "..." : latestMessageContent}`
                                )}
                              </span>
                              </div>
                            </div>
                          </li>
                        )
                      );
                    })}
                  </ul>
                </div>

                <div className="search-section">
                  <p className="search-text">Search Users to Start Chatting</p>
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="searchInput text-black"
                  />
                  <ul className="user-list">
                    {searchQuery &&
                      filteredUsers.slice(0, showMore ? filteredUsers.length : 5).map((user) => (
                        <li key={user.$id} className="user-card" onClick={() => handleUserSelect(user.$id)}>
                          <div className="profile-pic-container">
                            <img
                              src={user.profilePicUrl || "https://via.placeholder.com/50"}  // Fallback to placeholder if no profile picture
                              alt={user.name}
                              className="profile-pic"
                            />
                          </div>
                          <span className="user-name">{user.name}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>

            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ChatPage;
