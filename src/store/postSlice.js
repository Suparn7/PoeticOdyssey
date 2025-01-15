import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    posts: [],
};

const postSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        setPosts: (state, action) => {
            state.posts = action.payload;
        },
        likePost: (state, action) => {
            const { postId, userId } = action.payload;
            const post = state.posts.find(post => post.$id === postId);
            if (post && !post.likes.includes(userId)) {
                post.likes.push(userId);
            }
        },
        savePost: (state, action) => {
            const { postId, userId } = action.payload;
            const post = state.posts.find(post => post.$id === postId);
            if (post && !post.savedBy.includes(userId)) {
                post.savedBy.push(userId);
            }
        },
        addComment: (state, action) => {
            const { postId, comment } = action.payload;
            const post = state.posts.find(post => post.$id === postId);
            if (post) {
                // Initialize comments array if it doesn't exist
                if (!post.comments) {
                    post.comments = [];
                }
                post.comments.push(comment);
            }
        },
        // New deletePost reducer
        deletePost: (state, action) => {
            const postIdToDelete = action.payload;
            state.posts = state.posts.filter(post => post.$id !== postIdToDelete);
        },
    },
});

export const { setPosts, likePost, savePost, addComment, deletePost } = postSlice.actions;
export default postSlice.reducer;
