import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import { handleFileSelect } from '../utils/fileUpload';

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [news, setNews] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Player Form State
  const [playerForm, setPlayerForm] = useState({
    name: '',
    position: 'Forward',
    number: '',
    age: '',
    nationality: '',
    goals: 0,
    assists: 0,
    bio: '',
    image: ''
  });

  // Match Form State
  const [matchForm, setMatchForm] = useState({
    homeTeam: '',
    awayTeam: '',
    date: '',
    time: '',
    venue: '',
    competition: 'Premier League',
    homeScore: '',
    awayScore: '',
    status: 'scheduled',
    goalScorers: []
  });
  const [goalScorerForm, setGoalScorerForm] = useState({ playerName: '', goals: 1, team: 'home' });

  // News Form State
  const [newsForm, setNewsForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'other',
    image: ''
  });

  // Gallery Form State
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    imageUrl: '',
    description: '',
    category: 'other'
  });
  
  // File preview states
  const [playerImagePreview, setPlayerImagePreview] = useState('');
  const [newsImagePreview, setNewsImagePreview] = useState('');
  const [galleryImagePreview, setGalleryImagePreview] = useState('');
  
  // Edit states
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [editingMatchId, setEditingMatchId] = useState(null);
  const [editingNewsId, setEditingNewsId] = useState(null);
  const [editingGalleryId, setEditingGalleryId] = useState(null);

  const showMessage = useCallback((msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  }, []);

  // 1. Define loadData FIRST
const loadData = useCallback(async () => {
  setLoading(true); // Good practice to show a spinner
  try {
    const [playersRes, matchesRes, newsRes, galleryRes] = await Promise.all([
      axios.get('/api/players'),
      axios.get('/api/matches'),
      axios.get('/api/news'),
      axios.get('/api/gallery')
    ]);
    setPlayers(playersRes.data);
    setMatches(matchesRes.data);
    setNews(newsRes.data);
    setGallery(galleryRes.data);
  } catch (error) {
    console.error('Error loading data:', error);
    showMessage('Failed to load dashboard data.');
  } finally {
    setLoading(false);
  }
}, [showMessage]); // Added showMessage as it's used inside

// 2. Define useEffect LAST
useEffect(() => {
  if (!isAdmin) {
    navigate('/');
  } else {
    loadData();
  }
}, [isAdmin, navigate, loadData]);

// Sync activeTab with URL (for browser back/forward navigation)
useEffect(() => {
  const tabFromUrl = searchParams.get('tab') || 'overview';
  if (tabFromUrl !== activeTab) {
    setActiveTab(tabFromUrl);
  }
}, [searchParams, activeTab]);

// Update URL when activeTab changes
const handleTabChange = (tab) => {
  setActiveTab(tab);
  setSearchParams({ tab });
};

  // Player CRUD Operations
  const handleAddPlayer = async () => {
    if (!playerForm.name || !playerForm.number || !playerForm.age || !playerForm.nationality) {
      showMessage('Please fill all required fields');
      return;
    }
    
    setLoading(true);
    try {
      if (editingPlayerId) {
        await axios.put(`/api/players/${editingPlayerId}`, playerForm);
        showMessage('Player updated successfully!');
        setEditingPlayerId(null);
      } else {
        await axios.post('/api/players', playerForm);
        showMessage('Player added successfully!');
      }
      setPlayerForm({ name: '', position: 'Forward', number: '', age: '', nationality: '', goals: 0, assists: 0, bio: '', image: '' });
      setPlayerImagePreview('');
      loadData();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Error saving player');
    }
    setLoading(false);
  };

  const handleEditPlayer = (player) => {
    setPlayerForm({
      name: player.name || '',
      position: player.position || 'Forward',
      number: player.number || '',
      age: player.age || '',
      nationality: player.nationality || '',
      goals: player.goals || 0,
      assists: player.assists || 0,
      bio: player.bio || '',
      image: player.image || ''
    });
    setPlayerImagePreview(player.image && player.image.startsWith('data:') ? player.image : '');
    setEditingPlayerId(player._id);
  };

  const handleCancelEditPlayer = () => {
    setPlayerForm({ name: '', position: 'Forward', number: '', age: '', nationality: '', goals: 0, assists: 0, bio: '', image: '' });
    setPlayerImagePreview('');
    setEditingPlayerId(null);
  };

  const handleDeletePlayer = async (id) => {
    if (!window.confirm('Delete this player?')) return;
    
    setLoading(true);
    try {
      await axios.delete(`/api/players/${id}`);
      loadData();
      showMessage('Player deleted successfully!');
    } catch (error) {
      showMessage('Error deleting player', error);
    }
    setLoading(false);
  };

  // Match CRUD Operations
  const handleAddMatch = async () => {
    if (!matchForm.homeTeam || !matchForm.awayTeam || !matchForm.date || !matchForm.time || !matchForm.venue) {
      showMessage('Please fill all required fields');
      return;
    }
    
    setLoading(true);
    try {
      const matchData = {
        ...matchForm,
        homeScore: matchForm.homeScore ? parseInt(matchForm.homeScore) : null,
        awayScore: matchForm.awayScore ? parseInt(matchForm.awayScore) : null,
        goalScorers: matchForm.goalScorers || []
      };
      if (editingMatchId) {
        await axios.put(`/api/matches/${editingMatchId}`, matchData);
        showMessage('Match updated successfully!');
        setEditingMatchId(null);
      } else {
        await axios.post('/api/matches', matchData);
        showMessage('Match added successfully!');
      }
      setMatchForm({ homeTeam: '', awayTeam: '', date: '', time: '', venue: '', competition: 'Premier League', homeScore: '', awayScore: '', status: 'scheduled', goalScorers: [] });
      setGoalScorerForm({ playerName: '', goals: 1, team: 'home' });
      loadData();
    } catch (error) {
      showMessage('Error saving match', error);
    }
    setLoading(false);
  };

  const handleEditMatch = (match) => {
    const matchDate = new Date(match.date);
    const dateStr = matchDate.toISOString().split('T')[0];
    setMatchForm({
      homeTeam: match.homeTeam || '',
      awayTeam: match.awayTeam || '',
      date: dateStr,
      time: match.time || '',
      venue: match.venue || '',
      competition: match.competition || 'Premier League',
      homeScore: match.homeScore !== null && match.homeScore !== undefined ? match.homeScore : '',
      awayScore: match.awayScore !== null && match.awayScore !== undefined ? match.awayScore : '',
      status: match.status || 'scheduled',
      goalScorers: match.goalScorers || []
    });
    setEditingMatchId(match._id);
  };

  const handleCancelEditMatch = () => {
    setMatchForm({ homeTeam: '', awayTeam: '', date: '', time: '', venue: '', competition: 'Premier League', homeScore: '', awayScore: '', status: 'scheduled', goalScorers: [] });
    setGoalScorerForm({ playerName: '', goals: 1, team: 'home' });
    setEditingMatchId(null);
  };

  const handleDeleteMatch = async (id) => {
    if (!window.confirm('Delete this match?')) return;
    
    setLoading(true);
    try {
      await axios.delete(`/api/matches/${id}`);
      loadData();
      showMessage('Match deleted successfully!');
    } catch (error) {
      showMessage('Error deleting match', error);
    }
    setLoading(false);
  };

  // News CRUD Operations
  const handleAddNews = async () => {
    if (!newsForm.title || !newsForm.excerpt || !newsForm.content) {
      showMessage('Please fill all required fields');
      return;
    }
    
    setLoading(true);
    try {
      if (editingNewsId) {
        await axios.put(`/api/news/${editingNewsId}`, newsForm);
        showMessage('News updated successfully!');
        setEditingNewsId(null);
      } else {
        await axios.post('/api/news', newsForm);
        showMessage('News added successfully!');
      }
      setNewsForm({ title: '', excerpt: '', content: '', category: 'other', image: '' });
      setNewsImagePreview('');
      loadData();
    } catch (error) {
      showMessage('Error saving news', error);
    }
    setLoading(false);
  };

  const handleEditNews = (newsItem) => {
    setNewsForm({
      title: newsItem.title || '',
      excerpt: newsItem.excerpt || '',
      content: newsItem.content || '',
      category: newsItem.category || 'other',
      image: newsItem.image || ''
    });
    setNewsImagePreview(newsItem.image && newsItem.image.startsWith('data:') ? newsItem.image : '');
    setEditingNewsId(newsItem._id);
  };

  const handleCancelEditNews = () => {
    setNewsForm({ title: '', excerpt: '', content: '', category: 'other', image: '' });
    setNewsImagePreview('');
    setEditingNewsId(null);
  };

  const handleDeleteNews = async (id) => {
    if (!window.confirm('Delete this news?')) return;
    
    setLoading(true);
    try {
      await axios.delete(`/api/news/${id}`);
      loadData();
      showMessage('News deleted successfully!');
    } catch (error) {
      showMessage('Error deleting news', error);
    }
    setLoading(false);
  };

  // Gallery CRUD Operations
  const handleAddGallery = async () => {
    if (!galleryForm.title || !galleryForm.imageUrl) {
      showMessage('Please fill all required fields');
      return;
    }
    
    setLoading(true);
    try {
      if (editingGalleryId) {
        await axios.put(`/api/gallery/${editingGalleryId}`, galleryForm);
        showMessage('Gallery item updated successfully!');
        setEditingGalleryId(null);
      } else {
        await axios.post('/api/gallery', galleryForm);
        showMessage('Gallery item added successfully!');
      }
      setGalleryForm({ title: '', imageUrl: '', description: '', category: 'other' });
      setGalleryImagePreview('');
      loadData();
    } catch (error) {
      showMessage('Error saving gallery item', error);
    }
    setLoading(false);
  };

  const handleEditGallery = (galleryItem) => {
    setGalleryForm({
      title: galleryItem.title || '',
      imageUrl: galleryItem.imageUrl || '',
      description: galleryItem.description || '',
      category: galleryItem.category || 'other'
    });
    setGalleryImagePreview(galleryItem.imageUrl && galleryItem.imageUrl.startsWith('data:') ? galleryItem.imageUrl : '');
    setEditingGalleryId(galleryItem._id);
  };

  const handleCancelEditGallery = () => {
    setGalleryForm({ title: '', imageUrl: '', description: '', category: 'other' });
    setGalleryImagePreview('');
    setEditingGalleryId(null);
  };

  const handleDeleteGallery = async (id) => {
    if (!window.confirm('Delete this gallery item?')) return;
    
    setLoading(true);
    try {
      await axios.delete(`/api/gallery/${id}`);
      loadData();
      showMessage('Gallery item deleted successfully!');
    } catch (error) {
      showMessage('Error deleting gallery item', error);
    }
    setLoading(false);
  };

  // File upload handlers
  const handlePlayerImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const base64 = await handleFileSelect(file);
        setPlayerImagePreview(base64);
        setPlayerForm({ ...playerForm, image: base64 });
      } catch (error) {
        showMessage(error.message);
      }
    }
  };

  const handleNewsImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const base64 = await handleFileSelect(file);
        setNewsImagePreview(base64);
        setNewsForm({ ...newsForm, image: base64 });
      } catch (error) {
        showMessage(error.message);
      }
    }
  };

  const handleGalleryImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const base64 = await handleFileSelect(file);
        setGalleryImagePreview(base64);
        setGalleryForm({ ...galleryForm, imageUrl: base64 });
      } catch (error) {
        showMessage(error.message);
      }
    }
  };

  // Goal scorer handlers
  const addGoalScorer = () => {
    if (!goalScorerForm.playerName) {
      showMessage('Please enter player name');
      return;
    }
    setMatchForm({
      ...matchForm,
      goalScorers: [...(matchForm.goalScorers || []), goalScorerForm]
    });
    setGoalScorerForm({ playerName: '', goals: 1, team: 'home' });
  };

  const removeGoalScorer = (index) => {
    const newScorers = [...(matchForm.goalScorers || [])];
    newScorers.splice(index, 1);
    setMatchForm({ ...matchForm, goalScorers: newScorers });
  };

  if (!isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-red-600 to-red-800 text-transparent bg-clip-text">Admin Dashboard</h1>
      
      {message && (
        <div className={`mb-4 p-4 rounded-lg shadow-md ${message.includes('Error') || message.includes('fill') ? 'bg-red-100 text-red-700 border-l-4 border-red-600' : 'bg-green-100 text-green-700 border-l-4 border-green-600'}`}>
          {message}
        </div>
      )}
      
      <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => handleTabChange('overview')}
          className={`px-6 py-3 rounded-lg whitespace-nowrap font-semibold transition-all shadow-sm ${activeTab === 'overview' ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-red-50 border-2 border-gray-200'}`}
        >
          Overview
        </button>
        <button
          onClick={() => handleTabChange('players')}
          className={`px-6 py-3 rounded-lg whitespace-nowrap font-semibold transition-all shadow-sm ${activeTab === 'players' ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-red-50 border-2 border-gray-200'}`}
        >
          Players
        </button>
        <button
          onClick={() => handleTabChange('matches')}
          className={`px-6 py-3 rounded-lg whitespace-nowrap font-semibold transition-all shadow-sm ${activeTab === 'matches' ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-red-50 border-2 border-gray-200'}`}
        >
          Matches
        </button>
        <button
          onClick={() => handleTabChange('news')}
          className={`px-6 py-3 rounded-lg whitespace-nowrap font-semibold transition-all shadow-sm ${activeTab === 'news' ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-red-50 border-2 border-gray-200'}`}
        >
          News
        </button>
        <button
          onClick={() => handleTabChange('gallery')}
          className={`px-6 py-3 rounded-lg whitespace-nowrap font-semibold transition-all shadow-sm ${activeTab === 'gallery' ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-red-50 border-2 border-gray-200'}`}
        >
          Gallery
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-red-600 to-red-700 text-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
            <h3 className="text-xl font-bold mb-2">Total Players</h3>
            <p className="text-5xl font-bold">{players.length}</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
            <h3 className="text-xl font-bold mb-2">Total Matches</h3>
            <p className="text-5xl font-bold">{matches.length}</p>
          </div>
          <div className="bg-gradient-to-br from-red-700 to-red-800 text-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
            <h3 className="text-xl font-bold mb-2">Total News</h3>
            <p className="text-5xl font-bold">{news.length}</p>
          </div>
          <div className="bg-gradient-to-br from-red-800 to-red-900 text-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
            <h3 className="text-xl font-bold mb-2">Gallery Items</h3>
            <p className="text-5xl font-bold">{gallery.length}</p>
          </div>
        </div>
      )}

      {/* PLAYERS TAB */}
      {activeTab === 'players' && (
        <div>
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="text-xl font-bold mb-4">{editingPlayerId ? 'Edit Player' : 'Add New Player'}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Name *"
                value={playerForm.name}
                onChange={e => setPlayerForm({...playerForm, name: e.target.value})}
                className="border p-2 rounded"
              />
              <select
                value={playerForm.position}
                onChange={e => setPlayerForm({...playerForm, position: e.target.value})}
                className="border p-2 rounded"
              >
                <option value="Goalkeeper">Goalkeeper</option>
                <option value="Defender">Defender</option>
                <option value="Midfielder">Midfielder</option>
                <option value="Forward">Forward</option>
              </select>
              <input
                type="number"
                placeholder="Number *"
                value={playerForm.number}
                onChange={e => setPlayerForm({...playerForm, number: e.target.value})}
                className="border p-2 rounded"
                min="1"
                max="99"
              />
              <input
                type="number"
                placeholder="Age *"
                value={playerForm.age}
                onChange={e => setPlayerForm({...playerForm, age: e.target.value})}
                className="border p-2 rounded"
                min="16"
                max="50"
              />
              <input
                type="text"
                placeholder="Nationality *"
                value={playerForm.nationality}
                onChange={e => setPlayerForm({...playerForm, nationality: e.target.value})}
                className="border p-2 rounded"
              />
              <input
                type="number"
                placeholder="Goals"
                value={playerForm.goals}
                onChange={e => setPlayerForm({...playerForm, goals: e.target.value})}
                className="border p-2 rounded"
                min="0"
              />
              <input
                type="number"
                placeholder="Assists"
                value={playerForm.assists}
                onChange={e => setPlayerForm({...playerForm, assists: e.target.value})}
                className="border p-2 rounded"
                min="0"
              />
              <div className="col-span-2 space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Player Image (Optional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={playerForm.image && !playerForm.image.startsWith('data:') ? playerForm.image : ''}
                    onChange={e => {
                      setPlayerForm({...playerForm, image: e.target.value});
                      setPlayerImagePreview('');
                    }}
                    className="flex-1 border-2 border-gray-300 p-2 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200"
                  />
                  <label className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer font-semibold">
                    Upload
                    <input type="file" accept="image/*" onChange={handlePlayerImageUpload} className="hidden" />
                  </label>
                </div>
                {playerImagePreview && (
                  <div className="mt-2">
                    <img src={playerImagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300" />
                  </div>
                )}
              </div>
              <textarea
                placeholder="Bio (optional)"
                value={playerForm.bio}
                onChange={e => setPlayerForm({...playerForm, bio: e.target.value})}
                className="border p-2 rounded col-span-2"
                rows="2"
              />
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleAddPlayer}
                disabled={loading}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-semibold shadow-lg transition-all transform hover:scale-105"
              >
                {loading ? (editingPlayerId ? 'Updating...' : 'Adding...') : (editingPlayerId ? 'Update Player' : 'Add Player')}
              </button>
              {editingPlayerId && (
                <button
                  onClick={handleCancelEditPlayer}
                  disabled={loading}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 font-semibold shadow-lg transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Players List ({players.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Position</th>
                    <th className="p-2 text-center">Number</th>
                    <th className="p-2 text-center">Age</th>
                    <th className="p-2 text-left">Nationality</th>
                    <th className="p-2 text-center">Goals</th>
                    <th className="p-2 text-center">Assists</th>
                    <th className="p-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map(player => (
                    <tr key={player._id} className="border-b">
                      <td className="p-2">{player.name}</td>
                      <td className="p-2">{player.position}</td>
                      <td className="p-2 text-center">#{player.number}</td>
                      <td className="p-2 text-center">{player.age}</td>
                      <td className="p-2">{player.nationality}</td>
                      <td className="p-2 text-center">{player.goals}</td>
                      <td className="p-2 text-center">{player.assists}</td>
                      <td className="p-2 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEditPlayer(player)}
                            className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                            disabled={loading || editingPlayerId === player._id}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePlayer(player._id)}
                            className="text-red-600 hover:text-red-800 hover:underline font-semibold"
                            disabled={loading}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MATCHES TAB */}
      {activeTab === 'matches' && (
        <div>
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="text-xl font-bold mb-4">{editingMatchId ? 'Edit Match' : 'Add New Match'}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Home Team *"
                value={matchForm.homeTeam}
                onChange={e => setMatchForm({...matchForm, homeTeam: e.target.value})}
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Away Team *"
                value={matchForm.awayTeam}
                onChange={e => setMatchForm({...matchForm, awayTeam: e.target.value})}
                className="border p-2 rounded"
              />
              <input
                type="date"
                value={matchForm.date}
                onChange={e => setMatchForm({...matchForm, date: e.target.value})}
                className="border p-2 rounded"
              />
              <input
                type="time"
                value={matchForm.time}
                onChange={e => setMatchForm({...matchForm, time: e.target.value})}
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Venue *"
                value={matchForm.venue}
                onChange={e => setMatchForm({...matchForm, venue: e.target.value})}
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Competition"
                value={matchForm.competition}
                onChange={e => setMatchForm({...matchForm, competition: e.target.value})}
                className="border p-2 rounded"
              />
              <input
                type="number"
                placeholder="Home Score (optional)"
                value={matchForm.homeScore}
                onChange={e => setMatchForm({...matchForm, homeScore: e.target.value})}
                className="border p-2 rounded"
                min="0"
              />
              <input
                type="number"
                placeholder="Away Score (optional)"
                value={matchForm.awayScore}
                onChange={e => setMatchForm({...matchForm, awayScore: e.target.value})}
                className="border p-2 rounded"
                min="0"
              />
              <select
                value={matchForm.status}
                onChange={e => setMatchForm({...matchForm, status: e.target.value})}
                className="border p-2 rounded"
              >
                <option value="scheduled">Scheduled</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            {(matchForm.homeScore || matchForm.awayScore) && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                <h4 className="font-semibold mb-3">Goal Scorers</h4>
                <div className="grid md:grid-cols-3 gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Player Name"
                    value={goalScorerForm.playerName}
                    onChange={e => setGoalScorerForm({...goalScorerForm, playerName: e.target.value})}
                    className="border p-2 rounded"
                  />
                  <input
                    type="number"
                    placeholder="Goals"
                    value={goalScorerForm.goals}
                    onChange={e => setGoalScorerForm({...goalScorerForm, goals: parseInt(e.target.value) || 1})}
                    className="border p-2 rounded"
                    min="1"
                  />
                  <div className="flex gap-2">
                    <select
                      value={goalScorerForm.team}
                      onChange={e => setGoalScorerForm({...goalScorerForm, team: e.target.value})}
                      className="border p-2 rounded flex-1"
                    >
                      <option value="home">Home</option>
                      <option value="away">Away</option>
                    </select>
                    <button
                      type="button"
                      onClick={addGoalScorer}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
                {matchForm.goalScorers && matchForm.goalScorers.length > 0 && (
                  <div className="space-y-1">
                    {matchForm.goalScorers.map((scorer, index) => (
                      <div key={index} className="flex justify-between items-center bg-white p-2 rounded border">
                        <span className="text-sm">{scorer.playerName} ({scorer.goals} goal{scorer.goals > 1 ? 's' : ''}) - {scorer.team === 'home' ? matchForm.homeTeam : matchForm.awayTeam}</span>
                        <button
                          type="button"
                          onClick={() => removeGoalScorer(index)}
                          className="text-red-600 hover:underline text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleAddMatch}
                disabled={loading}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-semibold shadow-lg transition-all transform hover:scale-105"
              >
                {loading ? (editingMatchId ? 'Updating...' : 'Adding...') : (editingMatchId ? 'Update Match' : 'Add Match')}
              </button>
              {editingMatchId && (
                <button
                  onClick={handleCancelEditMatch}
                  disabled={loading}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 font-semibold shadow-lg transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Matches List ({matches.length})</h3>
            <div className="space-y-2">
              {matches.map(match => (
                <div key={match._id} className="flex justify-between items-center border-b py-2">
                  <div>
                    <p className="font-semibold">{match.homeTeam} vs {match.awayTeam}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(match.date).toLocaleDateString()} at {match.time} - {match.venue}
                    </p>
                    {match.competition && (
                      <p className="text-xs text-gray-500">{match.competition}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteMatch(match._id)}
                    className="text-red-600 hover:underline"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* NEWS TAB */}
      {activeTab === 'news' && (
        <div>
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="text-xl font-bold mb-4">{editingNewsId ? 'Edit News' : 'Add New News'}</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title *"
                value={newsForm.title}
                onChange={e => setNewsForm({...newsForm, title: e.target.value})}
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Excerpt *"
                value={newsForm.excerpt}
                onChange={e => setNewsForm({...newsForm, excerpt: e.target.value})}
                className="w-full border p-2 rounded"
              />
              <textarea
                placeholder="Content *"
                value={newsForm.content}
                onChange={e => setNewsForm({...newsForm, content: e.target.value})}
                rows="6"
                className="w-full border p-2 rounded"
              />
              <select
                value={newsForm.category}
                onChange={e => setNewsForm({...newsForm, category: e.target.value})}
                className="w-full border p-2 rounded"
              >
                <option value="match">Match</option>
                <option value="transfer">Transfer</option>
                <option value="training">Training</option>
                <option value="announcement">Announcement</option>
                <option value="other">Other</option>
              </select>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">News Image (Optional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={newsForm.image && !newsForm.image.startsWith('data:') ? newsForm.image : ''}
                    onChange={e => {
                      setNewsForm({...newsForm, image: e.target.value});
                      setNewsImagePreview('');
                    }}
                    className="flex-1 border-2 border-gray-300 p-2 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200"
                  />
                  <label className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer font-semibold">
                    Upload
                    <input type="file" accept="image/*" onChange={handleNewsImageUpload} className="hidden" />
                  </label>
                </div>
                {newsImagePreview && (
                  <div className="mt-2">
                    <img src={newsImagePreview} alt="Preview" className="w-48 h-32 object-cover rounded-lg border-2 border-gray-300" />
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleAddNews}
                disabled={loading}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-semibold shadow-lg transition-all transform hover:scale-105"
              >
                {loading ? (editingNewsId ? 'Updating...' : 'Adding...') : (editingNewsId ? 'Update News' : 'Add News')}
              </button>
              {editingNewsId && (
                <button
                  onClick={handleCancelEditNews}
                  disabled={loading}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 font-semibold shadow-lg transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">News List ({news.length})</h3>
            <div className="space-y-3">
              {news.map(item => (
                <div key={item._id} className="flex justify-between items-start border-b py-3">
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.excerpt}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {item.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteNews(item._id)}
                    className="text-red-600 hover:underline ml-4"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* GALLERY TAB */}
      {activeTab === 'gallery' && (
        <div>
          <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-200">
            <h3 className="text-2xl font-bold mb-4 text-red-600">{editingGalleryId ? 'Edit Gallery Item' : 'Add New Gallery Item'}</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title *"
                value={galleryForm.title}
                onChange={e => setGalleryForm({...galleryForm, title: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
              />
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Image *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={galleryForm.imageUrl && !galleryForm.imageUrl.startsWith('data:') ? galleryForm.imageUrl : ''}
                    onChange={e => {
                      setGalleryForm({...galleryForm, imageUrl: e.target.value});
                      setGalleryImagePreview('');
                    }}
                    className="flex-1 border-2 border-gray-300 p-3 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                  />
                  <label className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer font-semibold">
                    Upload
                    <input type="file" accept="image/*" onChange={handleGalleryImageUpload} className="hidden" />
                  </label>
                </div>
                {galleryImagePreview && (
                  <div className="mt-2">
                    <img src={galleryImagePreview} alt="Preview" className="w-48 h-32 object-cover rounded-lg border-2 border-gray-300" />
                  </div>
                )}
              </div>
              <textarea
                placeholder="Description (optional)"
                value={galleryForm.description}
                onChange={e => setGalleryForm({...galleryForm, description: e.target.value})}
                rows="3"
                className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
              />
              <select
                value={galleryForm.category}
                onChange={e => setGalleryForm({...galleryForm, category: e.target.value})}
                className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
              >
                <option value="match">Match</option>
                <option value="training">Training</option>
                <option value="team">Team</option>
                <option value="events">Events</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleAddGallery}
                disabled={loading}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-semibold shadow-lg transition-all transform hover:scale-105"
              >
                {loading ? (editingGalleryId ? 'Updating...' : 'Adding...') : (editingGalleryId ? 'Update Gallery Item' : 'Add Gallery Item')}
              </button>
              {editingGalleryId && (
                <button
                  onClick={handleCancelEditGallery}
                  disabled={loading}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 font-semibold shadow-lg transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-2xl font-bold mb-4 text-red-600">Gallery Items ({gallery.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gallery.map(item => (
                <div key={item._id} className="border-2 border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                  <div className="aspect-video bg-gray-200 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400?text=Image+Not+Found';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-semibold">
                        {item.category}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditGallery(item)}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-semibold text-sm"
                          disabled={loading || editingGalleryId === item._id}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteGallery(item._id)}
                          className="text-red-600 hover:text-red-800 hover:underline font-semibold text-sm"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {gallery.length === 0 && (
              <p className="text-center text-gray-500 py-8">No gallery items yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}