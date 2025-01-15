import { Client, Databases, ID, Query } from 'appwrite';
import conf from '../conf/conf';

class RealTimeNotificationService {
    constructor() {
        this.client = new Client();
        this.client.setEndpoint(conf.appwriteUrl).setProject(conf.appwriteProjectId);
        this.databases = new Databases(this.client);
    }

    // Subscribe to notifications for a specific user
    subscribeToNotifications(userId, callback) {
        const unsubscribe = this.client.subscribe(
            `databases.${conf.appwriteDatabaseId}.collections.${conf.appwriteUserInformationCollectionId}.documents`,
            async (response) => {
                const notificationData = response.payload.notificationMessages;
                
                // Filter notifications to only include messages meant for the current user
                const filteredNotifications = notificationData.filter((message) => {
                    const parts = message.split('|||');
                    const toUserId = parts[parts.length - 1]; // Extract the recipient userId
                    return toUserId === userId; // Only return notifications for the logged-in user
                });

                // Pass the filtered notifications to the callback
                if (filteredNotifications.length > 0) {
                    callback(filteredNotifications);
                }
            }
        );
        return unsubscribe;
    }
}

export default new RealTimeNotificationService();
