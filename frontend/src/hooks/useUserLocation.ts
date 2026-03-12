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
                // Use get.geojs.io (free, CORS-friendly, no auth required) to get rough city/state
                const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
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
            } catch {
                setLocation({
                    city: 'Coimbatore',
                    region: 'Tamil Nadu',
                    loading: false,
                    error: null
                });
            }
        };

        fetchLocation();
    }, []);

    return location;
};
