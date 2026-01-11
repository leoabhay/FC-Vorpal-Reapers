import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Loader2 } from 'lucide-react';

export default function Team() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/players').then(res => {
      setPlayers(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-red-600 mb-4">Our Squad</h1>
        <p className="text-xl text-gray-600">Meet the Reapers</p>
      </div>
      
      {positions.map(position => {
        const posPlayers = players.filter(p => p.position === position);
        if (posPlayers.length === 0) return null;
        
        return (
          <div key={position} className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-red-700 border-b-4 border-red-600 pb-2">{position}s</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {posPlayers.map(player => (
                <div 
                  key={player._id} 
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:scale-105 border-2 border-gray-100"
                >
                  {/* Player Photo */}
                  <div className="relative bg-gradient-to-br from-red-50 to-red-100 h-64 overflow-hidden">
                    {player.image ? (
                      <img
                        src={player.image}
                        alt={player.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-full h-full flex items-center justify-center ${player.image ? 'hidden' : 'flex'} bg-gradient-to-br from-red-100 to-red-200`}
                    >
                      <User className="h-24 w-24 text-red-400" />
                    </div>
                    {/* Player Number Badge */}
                    <div className="absolute top-4 right-4 bg-red-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                      {player.number}
                    </div>
                  </div>
                  
                  {/* Player Info */}
                  <div className="p-5">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">{player.name}</h3>
                    <div className="space-y-1 text-sm text-gray-600 mb-3">
                      <p className="flex items-center">
                        <span className="font-semibold mr-2">Age:</span>
                        {player.age}
                      </p>
                      <p className="flex items-center">
                        <span className="font-semibold mr-2">Nationality:</span>
                        {player.nationality}
                      </p>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                      <div className="text-center flex-1">
                        <p className="text-xs text-gray-500 mb-1">Goals</p>
                        <p className="text-2xl font-bold text-red-600">{player.goals || 0}</p>
                      </div>
                      <div className="w-px h-8 bg-gray-300"></div>
                      <div className="text-center flex-1">
                        <p className="text-xs text-gray-500 mb-1">Assists</p>
                        <p className="text-2xl font-bold text-red-600">{player.assists || 0}</p>
                      </div>
                    </div>
                    {player.bio && (
                      <p className="mt-3 text-xs text-gray-500 line-clamp-2 italic">{player.bio}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      
      {players.length === 0 && (
        <div className="text-center py-16">
          <User className="h-24 w-24 mx-auto text-gray-300 mb-4" />
          <p className="text-xl text-gray-500">No players added yet</p>
        </div>
      )}
    </div>
  );
}
