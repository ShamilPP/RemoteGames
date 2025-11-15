# Quick Start Guide

Get the Game Monitor platform running in 5 minutes!

## Prerequisites Check

- ✅ Node.js 20+ installed
- ✅ MongoDB running (local or Atlas)
- ✅ Flutter SDK installed (for mobile)

## Step 1: Start MongoDB

**Option A: Local MongoDB**
```bash
# If you have MongoDB installed locally, just start it
mongod
```

**Option B: Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:7
```

**Option C: MongoDB Atlas**
- Create a free cluster at https://www.mongodb.com/cloud/atlas
- Copy the connection string

## Step 2: Start the Server

```bash
cd server
npm install
cp .env.example .env
# Edit .env and set MONGODB_URI
npm run dev
```

Server should be running on `http://localhost:3000`

## Step 3: Start the Web Monitor

```bash
cd web
npm install
npm run dev
```

Web app should be running on `http://localhost:5173`

## Step 4: Test It Out!

1. Open `http://localhost:5173` in your browser
2. Click "Create Room"
3. Note the 4-digit join code
4. Open the mobile app (or use a second device)
5. Enter the join code
6. Start playing!

## Using Docker Compose (Alternative)

```bash
docker-compose up
```

This starts MongoDB, server, and web all at once.

## Mobile App Setup

```bash
cd mobile
flutter pub get
flutter run
```

**Important**: Update the server URL in:
- `lib/services/api_service.dart` (line 5)
- `lib/services/socket_service.dart` (line 30)

Change `http://localhost:3000` to your server's IP address if testing on a physical device.

## Troubleshooting

### "Cannot connect to MongoDB"
- Check MongoDB is running: `mongosh` or `mongo`
- Verify connection string in `.env`

### "Socket connection failed"
- Check CORS settings in `server/src/config/index.ts`
- Ensure server URL matches in web and mobile apps

### Mobile app can't connect
- Use your computer's IP address instead of `localhost`
- Ensure mobile device and server are on same network
- Check firewall settings

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check out the API docs in `server/openapi.yaml`
- Explore the game engines in `server/src/games/`

Happy gaming! 🎮

