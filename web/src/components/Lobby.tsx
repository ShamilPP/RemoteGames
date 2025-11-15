import { QRCodeSVG } from 'qrcode.react';
import '../styles/Lobby.css';

interface LobbyProps {
  players: Array<{ userId: string; name?: string; isOwner: boolean }>;
  joinCode: string;
  onStart: () => void;
  canStart: boolean;
}

export default function Lobby({ players, joinCode, onStart, canStart }: LobbyProps) {
  const joinUrl = `${window.location.origin}/join/${joinCode}`;

  return (
    <div className="lobby">
      <div className="lobby-content">
        <h3>Waiting for players...</h3>
        <div className="qr-code-container">
          <QRCodeSVG value={joinUrl} size={256} />
          <p className="join-code-text">{joinCode}</p>
        </div>
        <div className="players-list">
          <h4>Players ({players.length})</h4>
          {players.map((player) => (
            <div key={player.userId} className="player-item">
              {player.name || 'Player'} {player.isOwner && '(Owner)'}
            </div>
          ))}
        </div>
        <button
          onClick={onStart}
          disabled={!canStart}
          className="start-game-btn"
        >
          Start Game
        </button>
      </div>
    </div>
  );
}

