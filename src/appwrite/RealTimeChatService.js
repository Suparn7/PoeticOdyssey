import { Client, Databases } from 'appwrite';
import conf from '../conf/conf';

class RealTimeChatService {
    constructor() {
        this.client = new Client();
        this.client.setEndpoint(conf.appwriteUrl).setProject(conf.appwriteProjectId);
        this.databases = new Databases(this.client);
    }
    // Subscribe to new messages in a chat
    subscribeToMessages(chatId, callback) {
        const unsubscribe = this.client.subscribe(
            `databases.${conf.appwriteDatabaseId}.collections.${conf.appwriteMessagesCollectionId}.documents`,
            async (response) => {
                // Only process messages for the chat this user is part of
                if (response.payload.chatId === chatId) {
                    callback(response.payload); // Trigger callback for relevant messages
                }
            }
        );
        
        return unsubscribe;
    }

    // Subscribe to chat updates (for general chat status)
    subscribeToChat(userId, callback) {
        const unsubscribe = this.client.subscribe(
            `databases.${conf.appwriteDatabaseId}.collections.${conf.appwriteChatsCollectionId}.documents`,
            async (response) => {
                if (response.payload.participants.includes(userId)) {
                    callback(response);
                }
            }
        );
        
        return unsubscribe;
    }

    // Subscribe to reactions updates
    subscribeToReactions(chatId, callback) {
        const unsubscribe = this.client.subscribe(
        `databases.${conf.appwriteDatabaseId}.collections.${conf.appwriteMessagesCollectionId}.documents`,
        async (response) => {
            if (response.payload.chatId === chatId) {
            const reactionUpdates = response.payload.reactions || [];
            reactionUpdates.forEach((reaction) => {
                // Trigger callback with updated reactions
                const [messageId, userId, reactionType] = reaction.split("-");
                callback({ messageId, userId, reactionType });
            });
            }
        }
        );
        return unsubscribe;
    }
}

export default new RealTimeChatService();
