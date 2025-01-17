// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'; // Import PersistGate
import { store, persistor } from './store/store.js'; // Import store and persistor
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import SignUp from './pages/SignUp.jsx';
import AllPosts from './pages/AllPosts.jsx';
import Protected from './components/AuthLayout.jsx';
import AddPost from './pages/AddPost.jsx';
import EditPost from './pages/EditPost.jsx';
import Post from './pages/Post.jsx';
import MyPosts from './pages/MyPosts.jsx';
import Profile from './pages/Profile.jsx';
import LikedPosts from './pages/LikedPosts.jsx';
import SavedPosts from './pages/SavedPosts.jsx';
import NotFound from './pages/NotFound.jsx';
import UserPosts from './pages/UserPosts.jsx';
import ChatPage from './pages/Chat/Chat.jsx';

const router = createBrowserRouter([
  {
    path: '/PoeticOdyssey',
    element: <App />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/login', element: <Protected authentication={false}><Login /></Protected> },
      { path: '/signup', element: <Protected authentication={false}><SignUp /></Protected> },
      { path: '/all-posts', element: <Protected authentication><AllPosts /></Protected> },
      { path: '/add-post', element: <Protected authentication><AddPost /></Protected> },
      { path: '/edit-post/:slug', element: <Protected authentication><EditPost /></Protected> },
      { path: '/post/:slug', element: <Protected authentication><Post /></Protected> },
      { path: '/my-posts', element: <Protected authentication><MyPosts /></Protected> },
      { path: '/profile', element: <Protected authentication><Profile /></Protected> },
      { path: '/profile/:slug', element: <Protected authentication><Profile /></Protected> },
      { path: '/liked-posts', element: <Protected authentication><LikedPosts /></Protected> },
      { path: '/saved-posts', element: <Protected authentication><SavedPosts /></Protected> },
      { path: '/user-posts', element: <Protected authentication><UserPosts /></Protected> },
      { path: '/user-posts/:slug', element: <Protected authentication><UserPosts /></Protected> },
      { path: '/chat', element: <Protected authentication><ChatPage /></Protected> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

// Global error handling
window.addEventListener('error', (event) => {
});

window.addEventListener('unhandledrejection', (event) => {
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouterProvider router={router}  />
      </PersistGate>
    </Provider>
  </StrictMode>
);
