import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    activeChatId: null,
    chats: [], // All the chats for the logged-in user
    messages: [], // Messages of the active chat
  },
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChatId = action.payload;
    },
    setChats: (state, action) => {
      state.chats = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      const newMessage = action.payload;
      // Only add the message if it doesn't already exist in the messages array
      const exists = state.messages.some((msg) => msg.MessageId === newMessage.MessageId);
      if (!exists) {
        state.messages.push(newMessage);
      }
    },
    // Action to add or update reactions to a message
    addReaction: (state, action) => {
      const { messageId, reactions } = action.payload;
      const messageIndex = state.messages.findIndex((msg) => msg.MessageId === messageId);
      if (messageIndex !== -1) {
        // Only update reactions if the message exists
        state.messages[messageIndex].reactions = reactions;
      }
    },
    removeReaction: (state, action) => {
      const { messageId, reactionType, userId } = action.payload;
      const message = state.messages.find((msg) => msg.MessageId === messageId);
      if (message && message.reactions) {
        message.reactions = message.reactions.filter(
          (reaction) => reaction !== `${userId}-${reactionType}`
        );
      }
    },
  },
});

export const { setActiveChat, setChats, setMessages, addMessage, addReaction, removeReaction } = chatSlice.actions;
export default chatSlice.reducer;
