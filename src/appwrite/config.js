import conf from "../conf/conf";
import { Client, Databases, Storage, Query, ID } from "appwrite";
import authService from "./auth";
import { fetchNotifications } from "../store/notificationSlice"; // Import the fetch action
import axios from 'axios';
import userService from "./userService";


export class Service {
    client = new Client();
    databases;
    bucket;

    constructor(){
        this.client.setEndpoint(conf.appwriteUrl).setProject(conf.appwriteProjectId);
        this.databases = new Databases(this.client);
        this.bucket = new Storage(this.client);
    }

    // Database services
    async getPost(slug){
        try {
            return await this.databases.getDocument(conf.appwriteDatabaseId, conf.appwriteCollectionId, slug);
        } catch (error) {
            console.log('Appwrite service :: getPost() :: ', error);
            return false;
        }
    }

    async getPosts(queries = [Query.equal("status", "active")]) {
        let allPosts = []; // Initialize an array to hold all posts
        let totalFetchedPosts = 0; // Track the total number of posts fetched so far
        let totalPosts = 0; // Total posts available in the database (to check when to stop fetching)
        let lastFetchedPostId = null; // To keep track of the last post ID for pagination
    
        try {
            // Get the total number of posts first (to know when to stop fetching)
            const initialResponse = await this.databases.listDocuments(conf.appwriteDatabaseId, conf.appwriteCollectionId, queries);
            totalPosts = initialResponse.total; // Set the total available posts
    
            // Loop until we fetch all posts
            while (totalFetchedPosts < totalPosts) {
                // Add the cursor to the queries if this is not the first call
                if (lastFetchedPostId) {
                    queries.push(Query.cursorAfter(lastFetchedPostId));
                }
    
                // Fetch posts using the query and pagination
                const posts = await this.databases.listDocuments(conf.appwriteDatabaseId, conf.appwriteCollectionId, queries);
                
                // Append the newly fetched posts to the allPosts array
                allPosts = [...allPosts, ...posts.documents];
                totalFetchedPosts += posts.documents.length; // Update the total number of fetched posts
    
                // Get the ID of the last fetched post to use for the next page of data
                if (posts.documents.length > 0) {
                    lastFetchedPostId = posts.documents[posts.documents.length - 1].$id;
                }
    
                // If we've fetched all posts, break the loop
                if (totalFetchedPosts >= totalPosts) {
                    break;
                }
            }
            return allPosts; // Return the complete list of posts
        } catch (error) {
            console.log('Appwrite service :: getPosts() :: ', error);
            return false;
        }
    }
    
    async createPost({slug, title, content, featuredImage, status, userId}){
        try {
            return await this.databases.createDocument(
                conf.appwriteDatabaseId, 
                conf.appwriteCollectionId, 
                slug,
                { title, content, featuredImage, status, userId }
            );
            
        } catch (error) {
            console.log('Appwrite service :: createPost() :: ', error);
            return false;
        }
    }

    async updatePost(slug, {title, content, featuredImage, status}){
        try {
            return this.databases.updateDocument(
                conf.appwriteDatabaseId, 
                conf.appwriteCollectionId, 
                slug,
                {title, content, featuredImage, status}
            );
        } catch (error) {
            console.log('Appwrite service :: updatePost() :: ', error);
            return false;
        }
    }

    async deletePost(slug){
        try {
            await this.databases.deleteDocument(conf.appwriteDatabaseId, conf.appwriteCollectionId, slug);
            return true;
        } catch (error) {
            console.log('Appwrite service :: deletePost() :: ', error);
            return false;
        }
    }

    // Storage services
    // Upload file directly (e.g., from PC or Blob URL)
    async uploadFile(file) {
        try {
            return this.bucket.createFile(conf.appwriteBucketId, ID.unique(), file);
        } catch (error) {
            console.log('Appwrite service :: uploadFile() :: ', error);
            return false;
        }
    }

    // Upload file from a URL (e.g., Pexels image)
    async uploadFileFromUrl(url) {
        try {
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            const fileBlob = new Blob([response.data], { type: 'image/jpeg' });
            const file = new File([fileBlob], 'image.jpg', { type: 'image/jpeg' });

            return this.uploadFile(file); // Reuse the existing uploadFile method
        } catch (error) {
            console.error("Appwrite service :: uploadFileFromUrl() :: ", error);
            return false;
        }
    }

    // Upload file from a Blob (e.g., from a base64 URL or Blob URL)
    async uploadFileFromBlob(blob) {
        try {
            const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
            return this.uploadFile(file); // Reuse the existing uploadFile method
        } catch (error) {
            console.error("Appwrite service :: uploadFileFromBlob() :: ", error);
            return false;
        }
    }

    async deleteFile(fileId){
        try {
            return this.bucket.deleteFile(conf.appwriteBucketId, fileId);
        } catch (error) {
            console.log('Appwrite service :: deleteFile() :: ', error);
            return false;
        }
    }

    // Gives a link of the image
    getFilePreview(fileId){
        const filePreview = this.bucket.getFilePreview(conf.appwriteBucketId, fileId);
        return filePreview;
    }  

    // Add to Service class in service.js
    async likePost(postId, userId, dispatch) {
        try {
            const post = await this.databases.getDocument(conf.appwriteDatabaseId, conf.appwriteCollectionId, postId);
            const updatedLikes = [...new Set([...post.likedBy, userId])];
    
            await this.databases.updateDocument(conf.appwriteDatabaseId, conf.appwriteCollectionId, postId, {
                likedBy: updatedLikes,
            });
    
            const user = await userService.getUserById(userId);
            const postUser = await userService.getUserById(post.userId);

            const userName = user.name;
    
            if (userId !== post.userId) {
                await this.createNotification({
                    toUserId: post.userId,
                    name: postUser.name,
                    email: postUser.email,
                    postId: postId,
                    notificationMessages: [{
                        text: `${userName} liked your post.`,
                        read: false,
                        createdAt: new Date().toISOString(),
                    }],
                    fromUserId: user.$id
                }, dispatch); // Pass dispatch here
            }
        } catch (error) {
            console.log('Appwrite service :: likePost() :: ', error);
        }
    }

    async savePost(postId, userId) {
        try {
            const post = await this.databases.getDocument(conf.appwriteDatabaseId, conf.appwriteCollectionId, postId);
            const updatedSavedBy = [...new Set([...post.savedBy, userId])]; // Ensure no duplicates

            await this.databases.updateDocument(conf.appwriteDatabaseId, conf.appwriteCollectionId, postId, {
                savedBy: updatedSavedBy,
            });
        } catch (error) {
            console.log('Appwrite service :: savePost() :: ', error);
        }
    }

    // Add to Service class in service.js
    async unlikePost(postId, userId) {
        try {
            const post = await this.databases.getDocument(conf.appwriteDatabaseId, conf.appwriteCollectionId, postId);
            const updatedLikes = post.likedBy.filter(id => id !== userId); // Remove userId from likedBy array

            await this.databases.updateDocument(conf.appwriteDatabaseId, conf.appwriteCollectionId, postId, {
                likedBy: updatedLikes,
            });
        } catch (error) {
            console.log('Appwrite service :: unlikePost() :: ', error);
        }
    }

    async unsavePost(postId, userId) {
        try {
            const post = await this.databases.getDocument(conf.appwriteDatabaseId, conf.appwriteCollectionId, postId);
            const updatedSavedBy = post.savedBy.filter(id => id !== userId); // Remove userId from savedBy array

            await this.databases.updateDocument(conf.appwriteDatabaseId, conf.appwriteCollectionId, postId, {
                savedBy: updatedSavedBy,
            });
        } catch (error) {
            console.log('Appwrite service :: unsavePost() :: ', error);
        }
    }

    async getLikedPosts(userId) {
        const queries = [
          Query.equal("likedBy", userId) // Assuming 'likedBy' is a field storing user IDs
        ];
        return await this.databases.listDocuments(conf.appwriteDatabaseId, conf.appwriteCollectionId, queries);
    }
    
    async getSavedPosts (userId) {
        const queries = [
          Query.equal("savedBy", userId) // Assuming 'savedBy' is a field storing user IDs
        ];
        return await this.databases.listDocuments(conf.appwriteDatabaseId, conf.appwriteCollectionId, queries);
    }

    async getUserPosts (userId) {
        const queries = [
          Query.equal("userId", userId) // Assuming 'savedBy' is a field storing user IDs
        ];
        return await this.databases.listDocuments(conf.appwriteDatabaseId, conf.appwriteCollectionId, queries);
    }

    async addComment(postId, comment, dispatch) {
        try {
            const post = await this.databases.getDocument(conf.appwriteDatabaseId, conf.appwriteCollectionId, postId);
            const existingComments = post.comments || [];
            const newComment = `${comment.userId}@@@${comment.text}@@@${comment.createdAt}`;
            existingComments.push(newComment);
    
            await this.databases.updateDocument(conf.appwriteDatabaseId, conf.appwriteCollectionId, postId, {
                comments: existingComments,
            });
    
            const user = await userService.getUserById(comment.userId);
            const postUser = await userService.getUserById(post.userId);
            const userName = user.name;
            
            if (comment.userId !== post.userId) {
                const truncatedCommentText = comment.text.slice(0, 5);
                await this.createNotification({
                    toUserId: post.userId,
                    name: postUser.name,
                    email: postUser.email,
                    postId: postId,
                    notificationMessages: [{
                        text: `${userName} commented on your post: "${truncatedCommentText}..."`,
                        read: false,
                        createdAt: new Date().toISOString(),
                    }],
                    fromUserId: user.$id
                }, dispatch); // Pass dispatch here
                
                // Fetch notifications for the user who was commented on
                //dispatch(fetchNotifications(post.userId)); // Update this line to use the correct user ID
            }
        } catch (error) {
            console.log('Appwrite service :: addComment() :: ', error);
        }
    }

    async getComments(postId) {
        try {
            const post = await this.databases.getDocument(conf.appwriteDatabaseId, conf.appwriteCollectionId, postId);
            const commentsArray = post.comments || [];
            return commentsArray.map(commentString => {
                const parts = commentString.split('@@@');
                return parts.length === 3 ? { userId: parts[0], text: parts[1], createdAt: parts[2] } : null;
            }).filter(Boolean);
        } catch (error) {
            console.log('Appwrite service :: getComments() :: ', error);
            return [];
        }
    }

    async deleteComment(postId, commentCreatedAt) {
        try {
            const post = await this.databases.getDocument(conf.appwriteDatabaseId, conf.appwriteCollectionId, postId);
            const existingComments = post.comments || [];

            // Filter out the comment to be deleted
            const updatedComments = existingComments.filter(comment => {
                const parts = comment.split('@@@');
                return parts[2] !== commentCreatedAt; // Keep all comments except the one with the matching createdAt
            });

            await this.databases.updateDocument(conf.appwriteDatabaseId, conf.appwriteCollectionId, postId, {
                comments: updatedComments,
            });
        } catch (error) {
            console.log('Appwrite service :: deleteComment() :: ', error);
        }
    }

    async createNotification({ toUserId, name, email, postId, notificationMessages, fromUserId }, dispatch) {
        try {
          const userInfo = await this.databases.listDocuments(
            conf.appwriteDatabaseId,
            conf.appwriteUserInformationCollectionId,
            [Query.equal('userId', toUserId)]
          );
      
          let formattedMessages = notificationMessages.map(msg => {
            const id = ID.unique(); // Generate a unique ID for the notification
            return `${id}|||${msg.text}|||${msg.read}|||${msg.createdAt}|||${postId}|||${fromUserId}|||${toUserId}`; // Include postId in the format
          });
      
          if (userInfo.documents.length > 0) {
            // Document exists, update the existing notificationMessages
            const existingDocument = userInfo.documents[0];
            const existingMessages = existingDocument.notificationMessages || [];
      
            // Append new notifications
            const updatedMessages = existingMessages.concat(formattedMessages);
      
            await this.databases.updateDocument(
              conf.appwriteDatabaseId,
              conf.appwriteUserInformationCollectionId,
              existingDocument.$id,
              { notificationMessages: updatedMessages }
            );
          } else {
            // No document exists, create a new one
            await this.databases.createDocument(
              conf.appwriteDatabaseId,
              conf.appwriteUserInformationCollectionId,
              ID.unique(),
              { userId : toUserId, name, email, postId, notificationMessages: formattedMessages } // Store formatted messages
            );
          }
        } catch (error) {
          console.log('Appwrite service :: createNotification() :: ', error);
        }
    }
      
    async fetchNotifications(userId) {
        try {
            const userNotifications = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteUserInformationCollectionId,
                [Query.equal('userId', userId)]
            );
            return userNotifications.documents.length > 0 ? userNotifications.documents[0].notificationMessages : [];
        } catch (error) {
            console.log('Appwrite service :: fetchNotifications() :: ', error);
            return [];
        }
    }

    async deleteNotification(userId, notificationId, dispatch) {
        try {
            // Fetch existing notifications for the user
            const userNotifications = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteUserInformationCollectionId,
                [Query.equal('userId', userId)]
            );
    
            if (userNotifications.documents.length > 0) {
                const existingDocument = userNotifications.documents[0];
                const existingMessages = existingDocument.notificationMessages || [];
    
                // Filter out the notification to be deleted by matching its ID
                const updatedMessages = existingMessages.filter(notification => {
                    const parts = notification.split('|||');
                    return parts[0] !== notificationId; // Compare the unique ID part of the notification
                });
    
                // Update the notifications in the database
                await this.databases.updateDocument(
                    conf.appwriteDatabaseId,
                    conf.appwriteUserInformationCollectionId,
                    existingDocument.$id,
                    { notificationMessages: updatedMessages }
                );
    
                // Optionally, update the notifications in the store if needed
                // dispatch(fetchNotifications(userId)); // Uncomment if using Redux for notifications state
    
                return true; // Notification deleted successfully
            }
    
            console.log('Appwrite service :: deleteNotification() :: No notifications found for user');
            return false; // No notifications found for the user
        } catch (error) {
            console.log('Appwrite service :: deleteNotification() :: ', error);
            return false; // Handle error
        }
    }
    
    async fetchUserFromPostId(postId) {
        try {
            const post = await this.databases.getDocument(conf.appwriteDatabaseId, conf.appwriteCollectionId, postId);
            return post.userId; // Assuming userId is stored in the post document
        } catch (error) {
            console.log('Appwrite service :: fetchUserFromPostId() :: ', error);
            return null; // Return null if there's an error
        }
    }   

    // Follow a user (add to following and followers)
    async followUser(currentUserId, targetUserId, dispatch) {
        try {
            // Fetch the current user
            const currentUser = await this.databases.getDocument(
                conf.appwriteDatabaseId,
                conf.appwriteUserInformationCollectionId,
                currentUserId
            );
    
            // Fetch the target user
            const targetUser = await this.databases.getDocument(
                conf.appwriteDatabaseId,
                conf.appwriteUserInformationCollectionId,
                targetUserId
            );
    
            // Ensure the user is not already following the target user
            if (!currentUser.following.includes(targetUserId)) {
                // Add targetUserId to the current user's following array
                currentUser.following.push(targetUserId);
    
                // Add currentUserId to the target user's followers array
                targetUser.followers.push(currentUserId);
    
                // Update both users in the database
                await this.databases.updateDocument(
                    conf.appwriteDatabaseId,
                    conf.appwriteUserInformationCollectionId,
                    currentUserId,
                    { following: currentUser.following }
                );
    
                await this.databases.updateDocument(
                    conf.appwriteDatabaseId,
                    conf.appwriteUserInformationCollectionId,
                    targetUserId,
                    { followers: targetUser.followers }
                );
    
                // Create a follow notification for the target user
                const notificationMessages = [
                    {
                        text: `${currentUser.name} started following you!`,
                        read: false,
                        createdAt: new Date().toISOString()
                    }
                ];
    
                // Call the method to create the notification for the target user
                await this.createNotification({
                    toUserId: targetUserId,
                    name: targetUser.name,
                    email: targetUser.email,
                    postId: null, // As this is a follow notification, no post is involved
                    notificationMessages,
                    fromUserId: currentUserId
                }, dispatch);
    
                return true;
            } else {
                //console.log(`${currentUserId} is already following ${targetUserId}`);
                return false; // Already following
            }
        } catch (error) {
            console.log('Appwrite service :: followUser() :: ', error);
            return false;
        }
    }

    // Unfollow a user (remove from following and followers)
    async unfollowUser(currentUserId, targetUserId) {
        try {
            // Fetch the current user
            const currentUser = await this.databases.getDocument(conf.appwriteDatabaseId, conf.appwriteUserInformationCollectionId, currentUserId);

            // Fetch the target user
            const targetUser = await this.databases.getDocument(conf.appwriteDatabaseId, conf.appwriteUserInformationCollectionId, targetUserId);

            // Remove targetUserId from the current user's following array
            currentUser.following = currentUser.following.filter(id => id !== targetUserId);

            // Remove currentUserId from the target user's followers array
            targetUser.followers = targetUser.followers.filter(id => id !== currentUserId);

            // Update both users in the database
            await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteUserInformationCollectionId,
                currentUserId,
                { following: currentUser.following }
            );

            await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteUserInformationCollectionId,
                targetUserId,
                { followers: targetUser.followers }
            );

            //console.log(`${currentUserId} has unfollowed ${targetUserId}`);
            return true;
        } catch (error) {
            console.log('Appwrite service :: unfollowUser() :: ', error);
            return false;
        }
    }

    // Get a user's followers
    async getFollowers(userId) {
        try {
            const user = await this.databases.getDocument(conf.appwriteDatabaseId, conf.appwriteUserInformationCollectionId, userId);
            const followers = user.followers || [];
            return followers; // Return an array of user IDs who follow the specified user
        } catch (error) {
            console.log('Appwrite service :: getFollowers() :: ', error);
            return []; // Return an empty array in case of error
        }
    }

    // Get a user's following list
    async getFollowing(userId) {
        try {
            const user = await this.databases.getDocument(conf.appwriteDatabaseId, conf.appwriteUserInformationCollectionId, userId);
            const following = user.following || [];
            return following; // Return an array of user IDs that the specified user is following
        } catch (error) {
            console.log('Appwrite service :: getFollowing() :: ', error);
            return []; // Return an empty array in case of error
        }
    }

    // Check if a user is following another user
    async isFollowing(currentUserId, targetUserId) {
        try {
            const currentUser = await this.databases.getDocument(conf.appwriteDatabaseId, conf.appwriteUserInformationCollectionId, currentUserId);
            return currentUser.following.includes(targetUserId); // Return true if the current user is following the target user
        } catch (error) {
            console.log('Appwrite service :: isFollowing() :: ', error);
            return false;
        }
    }
}

const service = new Service();

export default service;
