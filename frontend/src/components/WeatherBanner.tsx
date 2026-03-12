import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Thermometer } from 'lucide-react';

const WeatherBanner: React.FC = () => {
  const [weather, setWeather] = useState({
    temp: 0,
    condition: 'Loading...',
    humidity: 0,
    location: 'Coimbatore'
  });

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Fetch real weather for Coimbatore using free Open-Meteo API
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=11.0168&longitude=76.9558&current=temperature_2m,relative_humidity_2m,weather_code');
        if (res.ok) {
          const data = await res.json();
          const current = data.current;

          let conditionStr = 'Cloudy';
          if (current.weather_code === 0) conditionStr = 'Sunny';
          else if (current.weather_code > 0 && current.weather_code <= 3) conditionStr = 'Partly Cloudy';
          else if (current.weather_code >= 51) conditionStr = 'Rain';

          setWeather({
            temp: Math.round(current.temperature_2m),
            condition: conditionStr,
            humidity: Math.round(current.relative_humidity_2m),
            location: 'Coimbatore, TN'
          });
        }
      } catch (err) {
        console.error('Failed to fetch weather data', err);
      }
    };

    fetchWeather();
    // Refresh every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = () => {
    switch (weather.condition) {
      case 'Sunny':
        return <Sun className="w-5 h-5 text-yellow-300" />;
      case 'Partly Cloudy':
      case 'Cloudy':
        return <Cloud className="w-5 h-5 text-blue-100" />;
      case 'Rain':
      case 'Light Rain':
        return <CloudRain className="w-5 h-5 text-blue-200 opacity-90" />;
      default:
        return <Cloud className="w-5 h-5 text-blue-100" />;
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getWeatherIcon()}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">{weather.temp}°C</span>
              <span className="text-sm opacity-90">{weather.condition}</span>
            </div>
            <div className="text-xs opacity-75">{weather.location}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-xs opacity-75">
            <Thermometer className="w-3 h-3" />
            <span>{weather.humidity}% humidity</span>
          </div>
          <div className="text-xs opacity-75 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherBanner;