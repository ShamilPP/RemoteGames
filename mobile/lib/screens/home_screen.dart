import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:qr_code_scanner/qr_code_scanner.dart';
import '../services/socket_service.dart';
import '../services/api_service.dart';
import 'controller_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _codeController = TextEditingController();
  final _apiService = ApiService();
  bool _loading = false;

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }

  Future<void> _joinByCode() async {
    final code = _codeController.text.trim();
    if (code.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a join code')),
      );
      return;
    }

    setState(() => _loading = true);

    try {
      // Create anonymous user
      final authData = await _apiService.createAnonymousUser();
      final token = authData['token'] as String;

      // Get room by code (you may need to adjust this endpoint)
      // For now, assume roomId is the code
      final roomId = code;

      // Join room
      final joinData = await _apiService.joinRoom(roomId, token);

      // Connect socket and navigate
      final socketService = Provider.of<SocketService>(context, listen: false);
      socketService.connect('http://localhost:3000', token);
      socketService.joinRoom(roomId);

      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => const ControllerScreen(),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _scanQR() async {
    // QR Scanner implementation
    // For MVP, we'll use a simple text input
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Enter Join Code'),
        content: TextField(
          controller: _codeController,
          decoration: const InputDecoration(
            hintText: '4-digit code',
            border: OutlineInputBorder(),
          ),
          keyboardType: TextInputType.number,
          maxLength: 4,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _joinByCode();
            },
            child: const Text('Join'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Game Controller'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.videogame_asset,
                size: 80,
                color: Colors.blue,
              ),
              const SizedBox(height: 32),
              const Text(
                'Join a Game Room',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 48),
              TextField(
                controller: _codeController,
                decoration: const InputDecoration(
                  labelText: 'Enter Join Code',
                  border: OutlineInputBorder(),
                  hintText: '4-digit code',
                ),
                keyboardType: TextInputType.number,
                maxLength: 4,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _loading ? null : _joinByCode,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 48,
                    vertical: 16,
                  ),
                ),
                child: _loading
                    ? const CircularProgressIndicator()
                    : const Text('Join Room'),
              ),
              const SizedBox(height: 16),
              OutlinedButton.icon(
                onPressed: _scanQR,
                icon: const Icon(Icons.qr_code_scanner),
                label: const Text('Scan QR Code'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

