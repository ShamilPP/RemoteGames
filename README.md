# Game Monitor - Multiplayer Microgames Platform

A single-host web "monitor" where 1-2 mobile devices connect as low-latency gamepads to play simple multiplayer micro-games. The web app renders games and broadcasts state, while mobile apps send control events. Node server handles matchmaking, room management, and real-time relay.

## 🎮 Features

- **Real-time multiplayer gaming** with <100ms latency
- **3 simple games**: Pong, Duel Racer, Reaction Blitz
- **Room-based matchmaking** with QR code join
- **Mobile controllers** with button pad and tilt control modes
- **Web monitor** with real-time game rendering
- **Leaderboards** and match history
- **Anonymous and email authentication**

## 🏗️ Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Mobile    │────────▶│   Node.js    │◀────────│     Web     │
│  Controller │  WS     │    Server    │   WS    │   Monitor   │
│   (Flutter) │         │ (Socket.IO)  │         │   (React)   │
└─────────────┘         └──────────────┘         └─────────────┘
                              │
                              ▼
                        ┌──────────────┐
                        │   MongoDB    │
                        └──────────────┘
```

## 📁 Project Structure

```
.
├── server/          # Node.js + TypeScript + Express + Socket.IO
├── web/             # React + TypeScript + Vite
├── mobile/          # Flutter (Dart)
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- Flutter SDK (for mobile app)
- npm or yarn

### 1. Server Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

Server runs on `http://localhost:3000`

### 2. Web Monitor Setup

```bash
cd web
npm install
npm run dev
```

Web app runs on `http://localhost:5173`

### 3. Mobile Controller Setup

```bash
cd mobile
flutter pub get
flutter run
```

Update server URL in `lib/services/api_service.dart` and `lib/services/socket_service.dart` to match your server.

## 🎯 Games

### Pong
Classic Pong between two players. Move paddles to hit the ball.

### Duel Racer
Top-down racing game. Tap to switch lanes, avoid obstacles. First to finish wins!

### Reaction Blitz
Quick reaction game. Hit buttons when targets appear. Fastest wins!

## 📡 API Endpoints

### Authentication
- `POST /api/auth/anon` - Create anonymous user
- `POST /api/auth/register` - Register with email
- `POST /api/auth/login` - Login

### Rooms
- `POST /api/rooms` - Create room
- `GET /api/rooms/:roomId` - Get room details
- `POST /api/rooms/:roomId/join` - Join room
- `POST /api/rooms/:roomId/start` - Start game

### Games
- `GET /api/games` - List games
- `GET /api/games/:gameId` - Get game details

### Matches
- `GET /api/matches` - User match history
- `GET /api/matches/leaderboard/:gameId` - Leaderboard

See `server/openapi.yaml` for full API documentation.

## 🔌 Socket.IO Events

### Client → Server
- `joinRoom` - Join a game room
- `controllerInput` - Send controller input
- `chat` - Send chat message

### Server → Client
- `roomJoined` - Confirmation of room join
- `playerJoined` - New player joined
- `stateUpdate` - Game state update (20-30Hz)
- `gameEvent` - Game events (start, end, score)

## 🐳 Docker Deployment

### Server
```bash
cd server
docker build -t game-monitor-server .
docker run -p 3000:3000 --env-file .env game-monitor-server
```

### Web
```bash
cd web
docker build -t game-monitor-web .
docker run -p 80:80 game-monitor-web
```

## 🧪 Testing

### Server Tests
```bash
cd server
npm test
```

### Web E2E Tests
```bash
cd web
npm run test:e2e
```

## 🔧 Configuration

### Environment Variables

**Server** (`server/.env`):
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/gamemonitor
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
```

**Web** (`web/.env`):
```
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

## 📊 Database Schema

- **users** - User accounts (anonymous + email)
- **rooms** - Game rooms with join codes
- **matches** - Match results and history
- **games** - Game catalog
- **leaderboards** - Aggregated leaderboard data

## 🔐 Security

- JWT-based authentication
- Rate limiting on controller inputs
- Server-authoritative game state
- Input validation and sanitization

## 📈 Performance

- 20Hz server tick rate
- State updates every 3 ticks (6.67Hz)
- Client-side prediction for smooth rendering
- Compact input messages (<100 bytes)

## 🛠️ Tech Stack

- **Server**: Node.js, TypeScript, Express, Socket.IO, MongoDB (Mongoose)
- **Web**: React, TypeScript, Vite, Socket.IO Client
- **Mobile**: Flutter, Dart, Socket.IO Client
- **Testing**: Jest, Cypress, Vitest

## 📝 Development Roadmap

- [x] Core infrastructure
- [x] Room management
- [x] Socket.IO integration
- [x] Three game implementations
- [x] Mobile controller app
- [x] Web monitor UI
- [ ] Enhanced game graphics
- [ ] Sound effects
- [ ] Spectator mode
- [ ] Custom game settings
- [ ] Analytics dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🐛 Troubleshooting

### Connection Issues
- Ensure MongoDB is running
- Check CORS settings in server config
- Verify Socket.IO connection URL

### Mobile App Issues
- Update server URL in API service
- Check network permissions
- Ensure device and server are on same network (for local dev)

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ for multiplayer gaming

