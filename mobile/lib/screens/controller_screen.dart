import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:sensors_plus/sensors_plus.dart';
import '../services/socket_service.dart';
import '../widgets/big_button.dart';
import '../widgets/joystick.dart';
import 'dart:async';

class ControllerScreen extends StatefulWidget {
  const ControllerScreen({super.key});

  @override
  State<ControllerScreen> createState() => _ControllerScreenState();
}

class _ControllerScreenState extends State<ControllerScreen> {
  int _controlMode = 0; // 0 = buttons, 1 = tilt
  StreamSubscription<AccelerometerEvent>? _accelerometerSubscription;

  @override
  void initState() {
    super.initState();
    _startTiltControl();
  }

  @override
  void dispose() {
    _accelerometerSubscription?.cancel();
    super.dispose();
  }

  void _startTiltControl() {
    if (_controlMode == 1) {
      _accelerometerSubscription = accelerometerEventStream().listen((event) {
        final socketService = Provider.of<SocketService>(context, listen: false);
        socketService.sendInput(
          event: 'tilt',
          x: event.x,
          y: event.y,
        );
      });
    } else {
      _accelerometerSubscription?.cancel();
    }
  }

  void _sendButtonPress(String button) {
    final socketService = Provider.of<SocketService>(context, listen: false);
    socketService.sendInput(
      event: 'btnDown',
      button: button,
    );
  }

  void _sendButtonRelease(String button) {
    final socketService = Provider.of<SocketService>(context, listen: false);
    socketService.sendInput(
      event: 'btnUp',
      button: button,
    );
  }

  void _onJoystickMove(double x, double y) {
    final socketService = Provider.of<SocketService>(context, listen: false);
    socketService.sendInput(
      event: 'move',
      x: x,
      y: y,
    );
  }

  @override
  Widget build(BuildContext context) {
    final socketService = Provider.of<SocketService>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Controller'),
        actions: [
          IconButton(
            icon: Icon(_controlMode == 0 ? Icons.phone_android : Icons.gamepad),
            onPressed: () {
              setState(() {
                _controlMode = (_controlMode + 1) % 2;
                _startTiltControl();
              });
            },
            tooltip: 'Switch Control Mode',
          ),
        ],
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Colors.blue.shade900,
              Colors.purple.shade900,
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Connection status
              Container(
                padding: const EdgeInsets.all(8),
                color: socketService.connected
                    ? Colors.green.withOpacity(0.3)
                    : Colors.red.withOpacity(0.3),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      socketService.connected
                          ? Icons.check_circle
                          : Icons.error,
                      color: Colors.white,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      socketService.connected
                          ? 'Connected'
                          : 'Disconnected',
                      style: const TextStyle(color: Colors.white),
                    ),
                  ],
                ),
              ),
              // Controller UI
              Expanded(
                child: _controlMode == 0
                    ? _buildButtonPad()
                    : _buildTiltControl(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildButtonPad() {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // D-Pad / Joystick
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              Joystick(
                onMove: _onJoystickMove,
                size: 150,
              ),
              // Action buttons
              Column(
                children: [
                  BigButton(
                    label: 'A',
                    onPressed: () => _sendButtonPress('A'),
                    onReleased: () => _sendButtonRelease('A'),
                    color: Colors.green,
                  ),
                  const SizedBox(height: 16),
                  BigButton(
                    label: 'B',
                    onPressed: () => _sendButtonPress('B'),
                    onReleased: () => _sendButtonRelease('B'),
                    color: Colors.red,
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 32),
          // Additional buttons
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              BigButton(
                label: 'UP',
                onPressed: () => _sendButtonPress('up'),
                onReleased: () => _sendButtonRelease('up'),
                color: Colors.blue,
              ),
              BigButton(
                label: 'DOWN',
                onPressed: () => _sendButtonPress('down'),
                onReleased: () => _sendButtonRelease('down'),
                color: Colors.blue,
              ),
              BigButton(
                label: 'LEFT',
                onPressed: () => _sendButtonPress('left'),
                onReleased: () => _sendButtonRelease('left'),
                color: Colors.blue,
              ),
              BigButton(
                label: 'RIGHT',
                onPressed: () => _sendButtonPress('right'),
                onReleased: () => _sendButtonRelease('right'),
                color: Colors.blue,
              ),
            ],
          ),
          const SizedBox(height: 16),
          BigButton(
            label: 'BOOST',
            onPressed: () => _sendButtonPress('boost'),
            onReleased: () => _sendButtonRelease('boost'),
            color: Colors.orange,
            width: double.infinity,
          ),
        ],
      ),
    );
  }

  Widget _buildTiltControl() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.phone_android,
            size: 100,
            color: Colors.white,
          ),
          const SizedBox(height: 24),
          const Text(
            'Tilt Mode Active',
            style: TextStyle(
              fontSize: 24,
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Tilt your device to control',
            style: TextStyle(fontSize: 16, color: Colors.white70),
          ),
          const SizedBox(height: 48),
          // Action button for tilt mode
          BigButton(
            label: 'ACTION',
            onPressed: () => _sendButtonPress('action'),
            onReleased: () => _sendButtonRelease('action'),
            color: Colors.green,
            width: 200,
          ),
        ],
      ),
    );
  }
}

