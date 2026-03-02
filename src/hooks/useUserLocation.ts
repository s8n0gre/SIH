import { useState, useEffect } from 'react';

interface LocationState {
    city: string;
    region: string;
    loading: boolean;
    error: string | null;
}

export const useUserLocation = () => {
    const [location, setLocation] = useState<LocationState>({
        city: 'Your City',
        region: 'Your Region',
        loading: true,
        error: null
    });

    useEffect(() => {
        const fetchLocation = async () => {
            try {
                // Use ipapi.co (free, no auth required for low limits) to get rough city/state
                const res = await fetch('https://ipapi.co/json/');
                if (res.ok) {
                    const data = await res.json();
                    if (data.city && data.region) {
                        setLocation({
                            city: data.city,
                            region: data.region,
                            loading: false,
                            error: null
                        });
                        return;
                    }
                }
                throw new Error('Could not parse location');
            } catch (err) {
                console.error('Failed to fetch location automatically, using fallback.', err);
                setLocation({
                    city: 'Coimbatore', // Fallback from user's previous preference
                    region: 'Tamil Nadu',
                    loading: false,
                    error: 'Failed to fetch'
                });
            }
        };

        fetchLocation();
    }, []);

    return location;
};
