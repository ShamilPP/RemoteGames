# Game Controller Mobile App

Flutter mobile app for connecting as a game controller to the Game Monitor platform.

## Setup

1. Install Flutter: https://flutter.dev/docs/get-started/install

2. Install dependencies:
```bash
flutter pub get
```

3. Update the API base URL in `lib/services/api_service.dart` if needed.

4. Run the app:
```bash
flutter run
```

## Features

- Join rooms by code or QR scan
- Two control modes:
  - Button pad with joystick
  - Tilt control using device accelerometer
- Real-time connection status
- Low-latency input transmission

## Configuration

Update the server URL in `lib/services/api_service.dart` and `lib/services/socket_service.dart` to match your server.

