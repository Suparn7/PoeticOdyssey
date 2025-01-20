import { useState, useEffect } from 'react';
import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import authService from './appwrite/auth';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import { login, logout } from './store/authSlice';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'; // Import ErrorBoundary

function App() {
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();

    useEffect(() => {
        authService.getCurrentUser()
            .then((userData) => {
                if (userData) {
                    dispatch(login({ userData }));
                } else {
                    dispatch(logout());
                }
            })
            .finally(() => setLoading(false));
    }, [dispatch]);

    return !loading ? (
        <ErrorBoundary> {/* Wrap with ErrorBoundary */}
            <div className='min-h-screen flex flex-col bg-cover bg-center' style={{ backgroundImage: 'url(https://images.pexels.com/photos/2098427/pexels-photo-2098427.jpeg)' }}>
                <Header />
                <main className='flex-grow transition-transform duration-300'>
                    <Outlet />
                </main>
                <Footer className="bg-black bg-opacity-50" />
            </div>
        </ErrorBoundary>
    ) : null;
}

export default App;
