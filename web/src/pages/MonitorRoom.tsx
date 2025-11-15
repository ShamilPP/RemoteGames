import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { roomAPI } from '../services/api';
import GameCanvas from '../components/GameCanvas';
import Lobby from '../components/Lobby';
import Scoreboard from '../components/Scoreboard';
import '../styles/MonitorRoom.css';

export default function MonitorRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';
  const { socket, connected } = useSocket(token);
  const [room, setRoom] = useState<any>(null);
  const [gameState, setGameState] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [joinCode, setJoinCode] = useState<string>('');

  useEffect(() => {
    if (!roomId) {
      navigate('/');
      return;
    }

    loadRoom();
  }, [roomId]);

  useEffect(() => {
    if (!socket || !roomId) return;

    socket.emit('joinRoom', { roomId, token });

    socket.on('roomJoined', (data: any) => {
      setRoom(data);
      setPlayers(data.players || []);
    });

    socket.on('playerJoined', (data: any) => {
      loadRoom(); // Reload room to get updated player list
    });

    socket.on('playerLeft', (data: any) => {
      loadRoom();
    });

    socket.on('stateUpdate', (data: any) => {
      setGameState(data.state);
    });

    socket.on('gameEvent', (data: any) => {
      console.log('Game event:', data);
    });

    return () => {
      socket.off('roomJoined');
      socket.off('playerJoined');
      socket.off('playerLeft');
      socket.off('stateUpdate');
      socket.off('gameEvent');
    };
  }, [socket, roomId, token]);

  const loadRoom = async () => {
    try {
      const roomData = await roomAPI.getRoom(roomId!);
      setRoom(roomData);
      setJoinCode(roomData.joinCode);
      setPlayers(roomData.players || []);
    } catch (error) {
      console.error('Error loading room:', error);
      navigate('/');
    }
  };

  const handleStartGame = async () => {
    if (!roomId) return;
    try {
      await roomAPI.startGame(roomId);
      loadRoom();
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  if (!room) {
    return <div className="monitor-room">Loading room...</div>;
  }

  return (
    <div className="monitor-room">
      <div className="monitor-header">
        <h2>{room.gameId}</h2>
        <div className="join-code">Join Code: {joinCode}</div>
      </div>

      {room.status === 'waiting' ? (
        <Lobby
          players={players}
          joinCode={joinCode}
          onStart={handleStartGame}
          canStart={players.length >= 1}
        />
      ) : room.status === 'running' ? (
        <div className="game-container">
          <GameCanvas
            gameId={room.gameId}
            gameState={gameState}
            socket={socket}
          />
          <Scoreboard players={players} gameState={gameState} />
        </div>
      ) : (
        <div className="game-finished">
          <h3>Game Finished</h3>
          <Scoreboard players={players} gameState={gameState} />
        </div>
      )}
    </div>
  );
}

