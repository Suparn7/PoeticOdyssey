// userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../appwrite/userService';  // Import user service to fetch user data

// Async thunk to fetch user data (e.g., LikedPosts, SavedPosts, etc.)
export const fetchUserData = createAsyncThunk('user/fetchUserData', async (userId) => {
    const userData = await userService.getUserById(userId);  // Assuming userService has a function to fetch user data
    return userData;
});

const userSlice = createSlice({
    name: 'user',
    initialState: {
        userData: null,  // Store user data like name, email, likedPosts, etc.
        likedPosts: [],
        savedPosts: [],
        postsCreated: [],
        createdAt: null,
        updatedAt: null,
        isVerified: false,
        isAdmin: false,
        status: 'idle',  // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null,
    },
    reducers: {
        setUserData(state, action) {
            // Only set user data if action payload is valid
            if (action.payload) {
                state.userData = action.payload;
                state.likedPosts = action.payload.likedPosts || [];
                state.savedPosts = action.payload.savedPosts || [];
                state.postsCreated = action.payload.postsCreated || [];
                state.createdAt = action.payload.createdAt || null;
                state.updatedAt = action.payload.updatedAt || null;
                state.isVerified = action.payload.isVerified || false;
                state.isAdmin = action.payload.isAdmin || false;
            }
        },
        clearUserData(state) {
            // Optional: Add a clear user data action to reset state
            state.userData = null;
            state.likedPosts = [];
            state.savedPosts = [];
            state.postsCreated = []
            state.createdAt = null;
            state.updatedAt = null;
            state.isVerified = false;
            state.isAdmin = false;
            state.error = null;
            state.status = 'idle';
        },
        updateUserData(state, action) {
            const { field, value } = action.payload;
            if (state.userData) {
                state.userData[field] = value;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserData.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchUserData.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Avoid overwriting userData with null or invalid data
                if (action.payload) {
                    state.userData = action.payload;
                    state.likedPosts = action.payload.likedPosts;
                    state.savedPosts = action.payload.savedPosts;
                    state.postsCreated = action.payload.postsCreated;
                    state.createdAt = action.payload.createdAt;
                    state.updatedAt = action.payload.updatedAt;
                    state.isVerified = action.payload.isVerified;
                    state.isAdmin = action.payload.isAdmin;
                }
            })
            .addCase(fetchUserData.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});

export const { setUserData, clearUserData, updateUserData } = userSlice.actions;

export default userSlice.reducer;
