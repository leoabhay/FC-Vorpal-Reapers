import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Bell, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Home() {
  const [nextMatch, setNextMatch] = useState(null);
  const [latestNews, setLatestNews] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    axios.get('/api/matches').then(res => {
      const upcoming = res.data.filter(m => new Date(m.date) >= new Date());
      setNextMatch(upcoming[0]);
    }).catch(err => console.error(err));

    axios.get('/api/news').then(res => {
      setLatestNews(res.data.slice(0, 3));
    }).catch(err => console.error(err));

    axios.get('/api/gallery').then(res => {
      // Get team category images for slideshow
      const teamImages = res.data.filter(item => item.category === 'team');
      setGalleryImages(teamImages);
    }).catch(err => console.error(err));
  }, []);

  // Auto-rotate slideshow
  useEffect(() => {
    if (galleryImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % galleryImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [galleryImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % galleryImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Section with Slideshow */}
      <div className="relative h-96 md:h-[500px] rounded-xl overflow-hidden shadow-2xl">
        {galleryImages.length > 0 ? (
          <>
            <div className="absolute inset-0">
              {galleryImages.map((image, index) => (
                <div
                  key={image._id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <img
                    src={image.imageUrl}
                    alt={image.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/1200x500?text=Team+Photo';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                </div>
              ))}
            </div>
            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all z-10"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all z-10"
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                  {galleryImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentSlide ? 'bg-white w-8' : 'bg-white/50 w-2'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center text-white px-4">
                <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-2xl">
                  FC Vorpal Swords
                </h1>
                <p className="text-xl md:text-3xl text-red-100 drop-shadow-lg">
                  When teams enter Nightfall Fortress, their light fades and the Reapers rise.
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-5xl md:text-7xl font-bold mb-4">FC Vorpal Swords</h1>
              <p className="text-xl md:text-3xl text-red-100">When teams enter Nightfall Fortress, their light fades and the Reapers rise.</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-gray-100 hover:shadow-xl transition-shadow">
          <h2 className="text-3xl font-bold mb-6 flex items-center text-red-600">
            <Calendar className="mr-3 h-8 w-8" /> Next Match
          </h2>
          {nextMatch ? (
            <div className="space-y-3">
              <p className="text-2xl font-bold text-gray-800">{nextMatch.homeTeam} vs {nextMatch.awayTeam}</p>
              <p className="text-lg text-gray-600 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(nextMatch.date).toLocaleDateString()} at {nextMatch.time}
              </p>
              <p className="text-gray-600 bg-red-50 p-3 rounded-lg">{nextMatch.venue}</p>
            </div>
          ) : (
            <p className="text-gray-500 text-lg">No upcoming matches</p>
          )}
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-gray-100 hover:shadow-xl transition-shadow">
          <h2 className="text-3xl font-bold mb-6 flex items-center text-red-600">
            <Trophy className="mr-3 h-8 w-8" /> Overall Stats
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-700 font-medium">Matches Played:</span>
              <span className="font-bold text-xl text-gray-800">128</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-700 font-medium">Titles Won:</span>
              <span className="font-bold text-xl text-blue-600">5</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-700 font-medium">Wins:</span>
              <span className="font-bold text-xl text-green-600">101</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-700 font-medium">Draws:</span>
              <span className="font-bold text-xl text-yellow-600">12</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700 font-medium">Losses:</span>
              <span className="font-bold text-xl text-red-600">15</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-gray-100">
        <h2 className="text-3xl font-bold mb-6 flex items-center text-red-600">
          <Bell className="mr-3 h-8 w-8" /> Latest News
        </h2>
        <div className="space-y-6">
          {latestNews.map(news => (
            <div key={news._id} className="border-l-4 border-red-600 pl-6 pb-6 last:pb-0 hover:bg-red-50 p-4 rounded-r-lg transition-colors">
              {news.image && (
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <h3 className="text-xl font-bold text-gray-800 mb-2">{news.title}</h3>
              <p className="text-gray-600 mb-3">{news.excerpt}</p>
              <p className="text-sm text-gray-500 font-medium">{new Date(news.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
