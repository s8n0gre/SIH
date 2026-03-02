import React, { useState, useEffect } from 'react';
import { TrendingUp, MessageSquare, Calendar, ExternalLink } from 'lucide-react';

const WeeklyDigest: React.FC = () => {
  const [news, setNews] = useState<any[]>([]);
  const [currentNewsIdx, setCurrentNewsIdx] = useState(0);

  useEffect(() => {
    // Fetch live India news from Times of India RSS via a free JSON proxy
    const fetchNews = async () => {
      try {
        const rssUrl = encodeURIComponent('https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms');
        const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`);
        if (res.ok) {
          const data = await res.json();
          // Filter to items that actually have images
          const validNews = (data.items || []).filter((item: any) => item.enclosure?.link || item.thumbnail);
          if (validNews.length > 0) {
            setNews(validNews.slice(0, 10)); // Top 10
          }
        }
      } catch (err) {
        console.error('Failed to fetch news', err);
      }
    };
    fetchNews();
  }, []);

  // Rotate news every 5 seconds
  useEffect(() => {
    if (news.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentNewsIdx((prev) => (prev + 1) % news.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [news.length]);
  const weeklyStats = {
    totalMessages: 247,
    viralPosts: 12,
    topIssue: 'Water Supply Problems'
  };

  const viralMessages = [
    { title: 'Road repair completed on MG Road', votes: 156, category: 'Infrastructure' },
    { title: 'New traffic signal installed', votes: 89, category: 'Safety' },
    { title: 'Water supply restored in Sector 5', votes: 67, category: 'Utilities' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-blue-500" />
        <h3 className="font-semibold text-gray-900 dark:text-white">Weekly Digest</h3>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{weeklyStats.totalMessages}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Messages</div>
        </div>
        <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
          <div className="text-lg font-bold text-green-600 dark:text-green-400">{weeklyStats.viralPosts}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Viral</div>
        </div>
        <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
          <div className="text-lg font-bold text-orange-600 dark:text-orange-400">5</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Resolved</div>
        </div>
      </div>

      {/* Live India News */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Live India News</h4>
          {news.length > 1 && (
            <div className="flex gap-1">
              {news.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === currentNewsIdx ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative group">
          {news.length > 0 ? (
            <a href={news[currentNewsIdx]?.link} target="_blank" rel="noopener noreferrer" className="block relative h-36">
              <img
                src={news[currentNewsIdx]?.enclosure?.link || news[currentNewsIdx]?.thumbnail}
                alt={news[currentNewsIdx]?.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-3">
                <p className="text-xs font-semibold text-white line-clamp-2 leading-snug">
                  {news[currentNewsIdx]?.title}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[10px] text-gray-300">Times of India · {new Date(news[currentNewsIdx]?.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  <ExternalLink className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </a>
          ) : (
            <div className="h-36 flex items-center justify-center">
              <div className="animate-pulse flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Viral Posts */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          Trending This Week
        </h4>
        <div className="space-y-2">
          {viralMessages.map((message, index) => (
            <div key={index} className="flex items-start gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors">
              <div className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-800 dark:text-gray-200 line-clamp-2">{message.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">{message.votes} votes</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{message.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklyDigest;