import '../styles/Scoreboard.css';

interface ScoreboardProps {
  players: Array<{ userId: string; name?: string; isOwner: boolean }>;
  gameState?: any;
}

export default function Scoreboard({ players, gameState }: ScoreboardProps) {
  const getScores = () => {
    if (!gameState) return players.map(() => 0);
    
    if (gameState.scores) {
      return gameState.scores;
    }
    if (gameState.paddles) {
      return gameState.paddles.map((p: any) => p.score || 0);
    }
    return players.map(() => 0);
  };

  const scores = getScores();

  return (
    <div className="scoreboard">
      <h4>Scoreboard</h4>
      <div className="scores">
        {players.map((player, index) => (
          <div key={player.userId} className="score-item">
            <span className="player-name">
              {player.name || `Player ${index + 1}`}
            </span>
            <span className="score">{scores[index] || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

