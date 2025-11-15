import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  final String baseUrl;

  ApiService({this.baseUrl = 'http://localhost:3000/api'});

  Future<Map<String, dynamic>> createAnonymousUser() async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/anon'),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data;
    }
    throw Exception('Failed to create anonymous user');
  }

  Future<Map<String, dynamic>> joinRoom(String roomId, String token) async {
    final response = await http.post(
      Uri.parse('$baseUrl/rooms/$roomId/join'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to join room');
  }

  Future<Map<String, dynamic>> getRoomByCode(String joinCode) async {
    final response = await http.get(
      Uri.parse('$baseUrl/rooms?joinCode=$joinCode'),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data;
    }
    throw Exception('Failed to get room');
  }
}

