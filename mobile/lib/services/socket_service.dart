import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:flutter/foundation.dart';
import 'dart:async';

class SocketService extends ChangeNotifier {
  IO.Socket? _socket;
  bool _connected = false;
  String? _roomId;
  String? _controllerId;
  String? _token;

  bool get connected => _connected;
  String? get roomId => _roomId;
  String? get controllerId => _controllerId;

  void connect(String serverUrl, String token) {
    _token = token;
    _socket = IO.io(
      serverUrl,
      IO.OptionBuilder()
          .setTransports(['websocket', 'polling'])
          .setAuth({'token': token})
          .enableAutoConnect()
          .build(),
    );

    _socket!.onConnect((_) {
      _connected = true;
      notifyListeners();
    });

    _socket!.onDisconnect((_) {
      _connected = false;
      notifyListeners();
    });

    _socket!.onError((error) {
      debugPrint('Socket error: $error');
      _connected = false;
      notifyListeners();
    });

    _socket!.on('roomJoined', (data) {
      _roomId = data['roomId'];
      _controllerId = data['controllerId'];
      notifyListeners();
    });

    _socket!.connect();
  }

  void joinRoom(String roomId) {
    if (_socket != null && _token != null) {
      _socket!.emit('joinRoom', {'roomId': roomId, 'token': _token});
    }
  }

  void sendInput({
    required String event,
    String? button,
    double? x,
    double? y,
  }) {
    if (_socket == null || !_connected) return;

    final input = {
      't': DateTime.now().millisecondsSinceEpoch,
      'e': event,
      if (button != null) 'b': button,
      if (x != null) 'x': x,
      if (y != null) 'y': y,
    };

    _socket!.emit('controllerInput', input);
  }

  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
    _connected = false;
    _roomId = null;
    _controllerId = null;
    notifyListeners();
  }

  @override
  void dispose() {
    disconnect();
    super.dispose();
  }
}

