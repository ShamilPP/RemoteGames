import 'package:flutter/material.dart';

class BigButton extends StatefulWidget {
  final String label;
  final VoidCallback onPressed;
  final VoidCallback onReleased;
  final Color color;
  final double? width;
  final double? height;

  const BigButton({
    super.key,
    required this.label,
    required this.onPressed,
    required this.onReleased,
    this.color = Colors.blue,
    this.width,
    this.height,
  });

  @override
  State<BigButton> createState() => _BigButtonState();
}

class _BigButtonState extends State<BigButton> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) {
        setState(() => _isPressed = true);
        widget.onPressed();
      },
      onTapUp: (_) {
        setState(() => _isPressed = false);
        widget.onReleased();
      },
      onTapCancel: () {
        setState(() => _isPressed = false);
        widget.onReleased();
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 100),
        width: widget.width ?? 80,
        height: widget.height ?? 80,
        decoration: BoxDecoration(
          color: _isPressed
              ? widget.color.withOpacity(0.7)
              : widget.color,
          borderRadius: BorderRadius.circular(40),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.3),
              blurRadius: _isPressed ? 4 : 8,
              offset: Offset(0, _isPressed ? 2 : 4),
            ),
          ],
        ),
        child: Center(
          child: Text(
            widget.label,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );
  }
}

