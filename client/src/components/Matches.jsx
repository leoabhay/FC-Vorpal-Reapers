import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Trophy, Goal } from 'lucide-react';

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/matches').then(res => {
      setMatches(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const upcoming = matches.filter(m => new Date(m.date) >= new Date());
  const past = matches.filter(m => new Date(m.date) < new Date() && m.status === 'completed');

  const MatchCard = ({ match }) => {
    const hasScore = match.homeScore !== null && match.awayScore !== null;
    const homeGoalScorers = match.goalScorers?.filter(g => g.team === 'home') || [];
    const awayGoalScorers = match.goalScorers?.filter(g => g.team === 'away') || [];

    return (
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all">
        <div className="flex justify-between items-center mb-4">
          <div className="flex-1">
            <p className="text-2xl font-bold text-gray-800">{match.homeTeam}</p>
            {hasScore && (
              <p className="text-4xl font-bold text-red-600 mt-2">{match.homeScore}</p>
            )}
            {homeGoalScorers.length > 0 && (
              <div className="mt-2 space-y-1">
                {homeGoalScorers.map((scorer, index) => (
                  <p key={index} className="text-sm text-gray-600 flex items-center">
                    <Goal className="h-3 w-3 mr-1 text-green-600" />
                    {scorer.playerName} ({scorer.goals})
                  </p>
                ))}
              </div>
            )}
          </div>
          <div className="px-6 text-center">
            <p className={`text-lg font-bold ${
              match.status === 'completed' ? 'text-gray-400' : 
              match.status === 'live' ? 'text-red-600 animate-pulse' : 
              'text-gray-500'
            }`}>
              {match.status === 'live' ? 'LIVE' : 'VS'}
            </p>
            {match.status === 'live' && (
              <p className="text-xs text-red-600 mt-1 font-semibold">LIVE</p>
            )}
          </div>
          <div className="flex-1 text-right">
            <p className="text-2xl font-bold text-gray-800">{match.awayTeam}</p>
            {hasScore && (
              <p className="text-4xl font-bold text-red-600 mt-2">{match.awayScore}</p>
            )}
            {awayGoalScorers.length > 0 && (
              <div className="mt-2 space-y-1">
                {awayGoalScorers.map((scorer, index) => (
                  <p key={index} className="text-sm text-gray-600 flex items-center justify-end">
                    <Goal className="h-3 w-3 mr-1 text-green-600" />
                    {scorer.playerName} ({scorer.goals})
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="pt-4 border-t border-gray-200 space-y-1">
          <p className="text-sm text-gray-600 flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-red-600" />
            {new Date(match.date).toLocaleDateString()} at {match.time}
          </p>
          <p className="text-sm text-gray-600">{match.venue}</p>
          {match.competition && (
            <p className="text-xs text-gray-500 mt-1 flex items-center">
              <Trophy className="h-3 w-3 mr-1" />
              {match.competition}
            </p>
          )}
          {match.status && (
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
              match.status === 'completed' ? 'bg-green-100 text-green-800' :
              match.status === 'live' ? 'bg-red-100 text-red-800' :
              match.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
            </span>
          )}
        </div>
      </div>
    );
  };

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
        <h1 className="text-5xl font-bold text-red-600 mb-4">Matches</h1>
        <p className="text-xl text-gray-600">Follow our journey</p>
      </div>
      
      {upcoming.length > 0 && (
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-red-700 border-b-4 border-red-600 pb-2">Upcoming Matches</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {upcoming.map(match => <MatchCard key={match._id} match={match} />)}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold mb-6 text-red-700 border-b-4 border-red-600 pb-2">Past Results</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {past.map(match => <MatchCard key={match._id} match={match} />)}
          </div>
        </div>
      )}

      {upcoming.length === 0 && past.length === 0 && (
        <div className="text-center py-16">
          <Calendar className="h-24 w-24 mx-auto text-gray-300 mb-4" />
          <p className="text-xl text-gray-500">No matches scheduled yet</p>
        </div>
      )}
    </div>
  );
}
