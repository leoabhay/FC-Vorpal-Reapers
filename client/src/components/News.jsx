import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Calendar, User } from 'lucide-react';

export default function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/news').then(res => {
      setNews(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-red-600 mb-4">Latest News</h1>
        <p className="text-xl text-gray-600">Stay updated with FC Vorpal Swords</p>
      </div>
      <div className="space-y-8">
        {news.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="h-24 w-24 mx-auto text-gray-300 mb-4" />
            <p className="text-xl text-gray-500">No news articles yet</p>
          </div>
        ) : (
          news.map(item => (
            <div key={item._id} className="bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden hover:shadow-2xl transition-shadow">
              {item.image && (
                <div className="w-full h-64 md:h-96 bg-gray-200 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">{item.title}</h2>
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        item.category === 'match' ? 'bg-red-100 text-red-800' :
                        item.category === 'transfer' ? 'bg-blue-100 text-blue-800' :
                        item.category === 'training' ? 'bg-green-100 text-green-800' :
                        item.category === 'announcement' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.category}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-red-600" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      {item.author?.name && (
                        <span className="text-sm text-gray-500 flex items-center">
                          <User className="h-4 w-4 mr-1 text-red-600" />
                          {item.author.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-lg text-gray-700 mb-4 font-medium">{item.excerpt}</p>
                <div className="prose max-w-none whitespace-pre-line text-gray-600 leading-relaxed">
                  {item.content}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
