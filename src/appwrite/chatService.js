import { Client, Databases, Query, ID, Storage } from 'appwrite';
import conf from '../conf/conf';

export class ChatService {
  client = new Client();
  databases;
  bucket;

  constructor() {
    this.client.setEndpoint(conf.appwriteUrl).setProject(conf.appwriteProjectId);
    this.databases = new Databases(this.client);
    this.bucket = new Storage(this.client);
  }

  async uploadChatFile(file) {
      try {
          return this.bucket.createFile(conf.appwriteBucketId, ID.unique(), file);
      } catch (error) {
          console.log('Appwrite service :: uploadFile() :: ', error);
          return false;
      }
  }

  // Fetch all chats for a specific user (by userId)
  async getChatsByUser(userId) {
      try {
          const chats = await this.databases.listDocuments(
              conf.appwriteDatabaseId,
              conf.appwriteChatsCollectionId,
              [Query.equal("participants", [userId])]
          );
          return chats.documents;
      } catch (error) {
          console.log("ChatService :: getChatsByUser() :: ", error);
          return [];
      }
  }

  // Send a message
  async sendMessage({ chatId, senderId, receiverId, messageContent, messageType, imageURL }) {
    try {
        const messageId = ID.unique();
        const messageDocument = {
            MessageId: messageId,
            chatId,
            senderId,
            receiverId,
            messageContent,
            timestamp: new Date().toISOString(),
            isEdited: false,
            msgType: messageType,
            status: "sent",
        };

        // If the message is an image, add imgUrl
        if (messageType === "image" && imageURL) {
            messageDocument.msgImg = imageURL;
        }

        // Add validation for message document
        if (!messageDocument.MessageId || !messageDocument.chatId || !messageDocument.senderId) {
            console.error("Message Document is invalid", messageDocument);
            return false;
        }

        // Save the message in the database
        return await this.databases.createDocument(
            conf.appwriteDatabaseId,
            conf.appwriteMessagesCollectionId,
            messageId,
            messageDocument
        );
    } catch (error) {
        console.log("ChatService :: sendMessage() :: ", error);
        return false;
    }
  }

  // Get a chat between two users
  async getChatBetweenUsers (userId, selectedUserId) {
    try {
      const chats = await this.databases.listDocuments(
          conf.appwriteDatabaseId, 
          conf.appwriteChatsCollectionId, 
          [
            // Query for exact match, but we need both userId and selectedUserId to be present
            Query.equal('participants', [userId, selectedUserId])
          ]
      );
  
      if (chats.documents.length > 0) {
        // Check if both userId and selectedUserId exist, in any order
        const existingChatBetweenUsers = chats.documents.filter((chatY) => {
          return chatY.participants.includes(userId) && chatY.participants.includes(selectedUserId)
        });
       return existingChatBetweenUsers[0];
        
      }
      return null;  // No chat found if conditions aren't met
    } catch (error) {
      throw error;  
    }
  };

  // Create a new chat
  async createChat (userId, selectedUserId, selectedUserName){
    try {
      const chatId = ID.unique()
      const newChat = await this.databases.createDocument(conf.appwriteDatabaseId, conf.appwriteChatsCollectionId,
          chatId,
      {
        chatId,
        participants: [userId, selectedUserId],
        createdAt: new Date().toISOString(),
        chatName: selectedUserName,
      }
    );
      return newChat;  // Return the created chat
    } catch (error) {
      throw error;
    }
  };

  // Edit message
  async editMessage(messageId, newContent) {
    try {
      return await this.databases.updateDocument(
        conf.appwriteDatabaseId,
        conf.appwriteMessagesCollectionId,
        messageId,
        { messageContent: newContent, isEdited: true }
      );
    } catch (error) {
      console.error("Error editing message: ", error);
      return false;
    }
  }

  // Delete message
  async deleteMessage(messageId) {
    try {
      return await this.databases.deleteDocument(
        conf.appwriteDatabaseId,
        conf.appwriteMessagesCollectionId,
        messageId
      );
    } catch (error) {
      console.error("Error deleting message: ", error);
      return false;
    }
  }

   // Fetch all messages for a specific chat
  async getMessagesByChat(chatId) {
      try {
          const messages = await this.databases.listDocuments(
              conf.appwriteDatabaseId,
              conf.appwriteMessagesCollectionId,
              [Query.equal("chatId", [chatId])]
          );
          return messages.documents.map((msg) => ({
            ...msg,
            reactions: msg.reactions || [],  // If no reactions exist, return an empty array
          }));
      } catch (error) {
          console.log("ChatService :: getMessagesByChat() :: ", error);
          return [];
      }
  }

  // Add a reaction to a message
  async addReaction(messageId, userId, reactionType) {
    try {
      // Get the current message data
      const message = await this.databases.getDocument(
        conf.appwriteDatabaseId,
        conf.appwriteMessagesCollectionId,
        messageId
      );

      // Get the current reactions array
      const currentReactions = message.reactions || [];

      // Construct the reaction string in the format 'messageId-userId-reactionType'
      const newReaction = `${messageId}-${userId}-${reactionType}`;

      // Check if the user has already reacted to the message with a different reaction
      const existingReactionIndex = currentReactions.findIndex(
        (reaction) => reaction.startsWith(`${messageId}-${userId}-`)
      );

      if (existingReactionIndex !== -1) {
        // If a reaction already exists for the user, remove the old reaction
        currentReactions.splice(existingReactionIndex, 1);
      }

      // Add the new reaction
      currentReactions.push(newReaction);

      // Update the message with the new reactions array
      await this.databases.updateDocument(
        conf.appwriteDatabaseId,
        conf.appwriteMessagesCollectionId,
        messageId,
        { reactions: currentReactions }
      );
      
      // Return updated reactions list after saving to DB
      return currentReactions;
    } catch (error) {
      console.error("Error adding reaction: ", error);
      return null;
    }
  }

  // Remove a reaction from a message
  async removeReaction(messageId, userId, reactionType) {
    try {
      // Get the current message data
      const message = await this.databases.getDocument(
        conf.appwriteDatabaseId,
        conf.appwriteMessagesCollectionId,
        messageId
      );

      // Get the current reactions array
      const currentReactions = message.reactions || [];

      // Remove the specific reaction that matches the userId and reactionType
      const updatedReactions = currentReactions.filter(
        (reaction) => !(reaction === `${messageId}-${userId}-${reactionType}`)
      );

      // Update the message with the updated reactions array
      await this.databases.updateDocument(
        conf.appwriteDatabaseId,
        conf.appwriteMessagesCollectionId,
        messageId,
        { reactions: updatedReactions }
      );

      // Return true after successfully updating
      return updatedReactions;
    } catch (error) {
      console.error("Error removing reaction: ", error);
      return false;
    }
  }


    
}

const chatService = new ChatService();
export default chatService;
