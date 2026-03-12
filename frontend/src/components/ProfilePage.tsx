import React, { useState, useEffect } from 'react';
import { MapPin, FileText, ChevronLeft, LogOut } from 'lucide-react';
import { API_BASE } from '../config';
import { useUserLocation } from '../hooks/useUserLocation';

interface ProfilePageProps {
    userId: string;
    onBack: () => void;
    onLogout: () => void;
    currentUser: any;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userId, onBack, onLogout, currentUser }) => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const isOwnProfile = currentUser?._id === userId || currentUser?.id === userId;
    const location = useUserLocation();

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                // We can use the existing search endpoint or a dedicated user endpoint.
                // For now, let's just fetch from the friend search endpoint which returns user info + friend status
                const res = await fetch(`${API_BASE}/api/friends/search?userId=${currentUser?._id || currentUser?.id}&q=`);
                if (res.ok) {
                    const data = await res.json();
                    const targetUser = data.find((u: any) => u._id === userId);
                    if (targetUser) {
                        setProfile(targetUser);
                    } else if (isOwnProfile) {
                        setProfile(currentUser);
                    }
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [userId, currentUser]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full pt-20">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="p-4 pt-20 text-center">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">User not found</h2>
                <button onClick={onBack} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">Go Back</button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 min-h-screen">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profile.username}</h2>
                </div>
                {isOwnProfile && (
                    <button onClick={onLogout} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors" title="Logout">
                        <LogOut className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Profile Info */}
            <div className="p-6 flex flex-col items-center border-b border-gray-100 dark:border-gray-800">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-full flex items-center justify-center text-3xl sm:text-5xl font-bold text-blue-600 dark:text-blue-300 shadow-xl mb-4 border-4 border-white dark:border-gray-800">
                    {profile.username?.charAt(0).toUpperCase()}
                </div>

                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.username}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{profile.email}</p>

                <div className="flex items-center gap-2 mt-3 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {location.city ? `${location.city}, ${location.region}` : 'Location unknown'}
                    </span>
                </div>

                <div className="flex gap-6 mt-6 w-full max-w-sm">
                    <div className="flex-1 text-center">
                        <div className="text-xl font-bold text-gray-900 dark:text-white">12</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mt-1">Posts</div>
                    </div>
                    <div className="w-px bg-gray-200 dark:bg-gray-700" />
                    <div className="flex-1 text-center">
                        <div className="text-xl font-bold text-gray-900 dark:text-white">48</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mt-1">Friends</div>
                    </div>
                </div>
            </div>

            {/* Tabs / Content */}
            <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-500" /> Recent Activity
                </h3>

                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <p className="text-gray-500 dark:text-gray-400">No recent posts to show.</p>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
