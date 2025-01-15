import { Client, Databases, Storage, Query, ID } from "appwrite";
import conf from "../conf/conf";
import { setUserData } from "../store/userSlice";

export class UserService {
    client = new Client();
    databases;
    bucket;

    constructor() {
        this.client.setEndpoint(conf.appwriteUrl).setProject(conf.appwriteProjectId);
        this.databases = new Databases(this.client);
        this.bucket = new Storage(this.client);
    }

    // Create a new user in userInformation collection
    async createUser({userId, email, phone, passwordHash, name, profilePicUrl, bio }) {
        try {
            const userDocument = {
                userId,
                email,
                phone,
                passwordHash,
                name,
                profilePicUrl,
                bio,
                createdAt: new Date().toISOString(),
                likedPosts: [],
                savedPosts: [],
                postsCreated: [],
                isVerified: false,
                isAdmin: false
            };
            
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteUserInformationCollectionId, 
                userId, 
                userDocument
            );
        } catch (error) {
            console.log("UserService :: createUser() :: ", error);
            return false;
        }
    }

    //upload file
    async uploadFile(file) {
        try {
            return this.bucket.createFile(conf.appwriteBucketId, ID.unique(), file);
        } catch (error) {
            console.log('Appwrite service :: uploadFile() :: ', error);
            return false;
        }
    }

    async getAllUsers(queries = []) {
        let allUsers = []; // Initialize an array to hold all users
        let totalFetchedUsers = 0; // Track the total number of posts fetched so far
        let totalUsers = 0; // Total posts available in the database (to check when to stop fetching)
        let lastFetchedUserId = null; // To keep track of the last post ID for pagination
        //return await this.databases.listDocuments(conf.appwriteDatabaseId, conf.appwriteUserInformationCollectionId);

        try {
            // Get the total number of posts first (to know when to stop fetching)
            
            const initialResponse = await this.databases.listDocuments(conf.appwriteDatabaseId, conf.appwriteUserInformationCollectionId, queries);
            totalUsers = initialResponse.total; // Set the total available posts
    
            // Loop until we fetch all posts
            while (totalFetchedUsers < totalUsers) {
                // Add the cursor to the queries if this is not the first call
                if (lastFetchedUserId) {
                    queries.push(Query.cursorAfter(lastFetchedUserId));
                }
    
                // Fetch posts using the query and pagination
                const users = await this.databases.listDocuments(conf.appwriteDatabaseId, conf.appwriteUserInformationCollectionId, queries);
                
                // Append the newly fetched posts to the allPosts array
                allUsers = [...allUsers, ...users.documents];
                totalFetchedUsers += users.documents.length; // Update the total number of fetched posts
    
                // Get the ID of the last fetched post to use for the next page of data
                if (users.documents.length > 0) {
                    lastFetchedUserId = users.documents[users.documents.length - 1].$id;
                }
    
                // If we've fetched all posts, break the loop
                if (totalFetchedUsers >= totalUsers) {
                    break;
                }
            }
    
            return allUsers; // Return the complete list of posts
        } catch (error) {
            console.log('Appwrite service :: getUsers() :: ', error);
            return false;
        }
    }
    // Get user details by userId
    async getUserById(userId) {
        try {
            return await this.databases.getDocument(
                conf.appwriteDatabaseId,
                conf.appwriteUserInformationCollectionId,
                userId
            );
        } catch (error) {
            console.log("UserService :: getUserById() :: ", error);
            return false;
        }
    }

    // Update user profile (e.g., profile picture, bio, etc.)
    async updateUser(userId, { name, profilePicUrl, phone, email, bio, postsCreated, savedPosts, likedPosts }) {
        try {
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteUserInformationCollectionId,
                userId,
                { name, profilePicUrl, phone, email, bio, postsCreated, savedPosts, likedPosts }
            );
        } catch (error) {
            console.log("UserService :: updateUser() :: ", error);
            return false;
        }
    }

    // Like a post by the user (add to likedPosts)
    async likePost(userId, postId) {
        try {
            const user = await this.getUserById(userId);
            if (!user) {
                return false;
            }

            const likedPosts = [...new Set([...user.likedPosts, postId])]; // Add postId to likedPosts array
            await this.updateUser(userId, { likedPosts });

            return true;
        } catch (error) {
            console.log("UserService :: likePost() :: ", error);
            return false;
        }
    }

    // Save a post by the user (add to savedPosts)
    async savePost(userId, postId) {
        try {
            const user = await this.getUserById(userId);
            if (!user) {
                return false;
            }

            const savedPosts = [...new Set([...user.savedPosts, postId])]; // Add postId to savedPosts array
            await this.updateUser(userId, { savedPosts });

            return true;
        } catch (error) {
            console.log("UserService :: savePost() :: ", error);
            return false;
        }
    }

    // Get all liked posts for a user
    async getLikedPosts(userId) {
        try {
            const user = await this.getUserById(userId);
            if (!user) {
                return false;
            }
            const likedPosts = user.likedPosts || [];
            return likedPosts;
        } catch (error) {
            console.log("UserService :: getLikedPosts() :: ", error);
            return [];
        }
    }

    // Get all saved posts for a user
    async getSavedPosts(userId) {
        try {
            const user = await this.getUserById(userId);
            if (!user) {
                return false;
            }
            const savedPosts = user.savedPosts || [];
            return savedPosts;
        } catch (error) {
            console.log("UserService :: getSavedPosts() :: ", error);
            return [];
        }
    }

    // Add a post that the user has created
    async addPostCreated(userId, postId) {
        try {
            const user = await this.getUserById(userId);
            if (!user) {
                return false;
            }

            const postsCreated = [...new Set([...user.postsCreated, postId])]; // Add postId to postsCreated array
            await this.updateUser(userId, { postsCreated });

            return true;
            
        } catch (error) {
            console.log("UserService :: addPostCreated() :: ", error);
            return false;
        }
    }

    // Get all posts created by the user
    async getPostsCreated(userId) {
        try {
            const user = await this.getUserById(userId);
            if (!user) {
                return false;
            }
            const postsCreated = user.postsCreated || [];
            return postsCreated;
        } catch (error) {
            console.log("UserService :: getPostsCreated() :: ", error);
            return [];
        }
    }
}

// Export the UserService instance
const userService = new UserService();
export default userService;
