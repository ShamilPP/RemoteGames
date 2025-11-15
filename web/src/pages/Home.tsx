import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, gameAPI, roomAPI, Game } from '../services/api';
import '../styles/Home.css';

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      // Create anonymous user if not logged in
      const token = localStorage.getItem('token');
      if (!token) {
        await authAPI.createAnonymous();
      }

      // Load games
      const gamesList = await gameAPI.getGames();
      setGames(gamesList);
      if (gamesList.length > 0) {
        setSelectedGame(gamesList[0]._id);
      }
    } catch (error) {
      console.error('Initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!selectedGame) return;

    try {
      const room = await roomAPI.createRoom(selectedGame);
      navigate(`/room/${room.roomId}`);
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room');
    }
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Game Monitor</h1>
        <p className="subtitle">Create a room and connect mobile controllers</p>

        <div className="game-selector">
          <label>Select Game:</label>
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
          >
            {games.map((game) => (
              <option key={game._id} value={game._id}>
                {game.name} ({game.minPlayers}-{game.maxPlayers} players)
              </option>
            ))}
          </select>
        </div>

        <button onClick={handleCreateRoom} className="create-room-btn">
          Create Room
        </button>
      </div>
    </div>
  );
}

