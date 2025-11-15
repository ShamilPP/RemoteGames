import 'package:flutter/material.dart';
import 'dart:math';

class Joystick extends StatefulWidget {
  final Function(double x, double y) onMove;
  final double size;

  const Joystick({
    super.key,
    required this.onMove,
    this.size = 150,
  });

  @override
  State<Joystick> createState() => _JoystickState();
}

class _JoystickState extends State<Joystick> {
  Offset _position = Offset.zero;
  bool _isDragging = false;

  void _updatePosition(Offset localPosition) {
    final center = widget.size / 2;
    final radius = widget.size / 2 - 20;

    // Calculate distance from center
    final dx = localPosition.dx - center;
    final dy = localPosition.dy - center;
    final distance = sqrt(dx * dx + dy * dy);

    if (distance > radius) {
      // Clamp to circle
      final angle = atan2(dy, dx);
      _position = Offset(
        center + cos(angle) * radius,
        center + sin(angle) * radius,
      );
    } else {
      _position = localPosition;
    }

    // Normalize to -1 to 1
    final normalizedX = (dx / radius).clamp(-1.0, 1.0);
    final normalizedY = (dy / radius).clamp(-1.0, 1.0);

    widget.onMove(normalizedX, normalizedY);
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onPanStart: (details) {
        setState(() {
          _isDragging = true;
          _updatePosition(details.localPosition);
        });
      },
      onPanUpdate: (details) {
        setState(() {
          _updatePosition(details.localPosition);
        });
      },
      onPanEnd: (_) {
        setState(() {
          _isDragging = false;
          _position = Offset(widget.size / 2, widget.size / 2);
          widget.onMove(0, 0);
        });
      },
      child: Container(
        width: widget.size,
        height: widget.size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: Colors.grey.shade800,
          border: Border.all(color: Colors.white, width: 2),
        ),
        child: Stack(
          children: [
            // Center indicator
            Positioned(
              left: widget.size / 2 - 1,
              top: widget.size / 2 - 1,
              child: Container(
                width: 2,
                height: 2,
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                ),
              ),
            ),
            // Joystick handle
            Positioned(
              left: _position.dx - 15,
              top: _position.dy - 15,
              child: Container(
                width: 30,
                height: 30,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: _isDragging ? Colors.blue : Colors.white,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.3),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

