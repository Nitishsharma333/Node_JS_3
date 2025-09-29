const express = require('express');
const router = express.Router();

// Simulate 10 seats
let seats = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  status: 'available',
  lockExpiry: null,
}));

// Helper to unlock expired seats
function unlockExpiredSeats() {
  const now = Date.now();
  seats.forEach(seat => {
    if (seat.status === 'locked' && seat.lockExpiry && seat.lockExpiry < now) {
      seat.status = 'available';
      seat.lockExpiry = null;
    }
  });
}

// GET: View all seats
router.get('/', (req, res) => {
  unlockExpiredSeats();
  res.json({ success: true, seats });
});

// POST: Lock a seat (expires after 1 minute)
router.post('/lock/:id', (req, res) => {
  unlockExpiredSeats();
  const seatId = parseInt(req.params.id);
  const seat = seats.find(s => s.id === seatId);

  if (!seat) return res.status(404).json({ success: false, message: 'Seat not found.' });
  if (seat.status === 'booked') return res.status(400).json({ success: false, message: 'Seat already booked.' });
  if (seat.status === 'locked') return res.status(400).json({ success: false, message: 'Seat is already locked.' });

  seat.status = 'locked';
  seat.lockExpiry = Date.now() + 60 * 1000; // 1 minute lock
  res.json({ success: true, message: `Seat ${seatId} locked for 1 minute.` });
});

// POST: Confirm booking (must be locked first)
router.post('/book/:id', (req, res) => {
  unlockExpiredSeats();
  const seatId = parseInt(req.params.id);
  const seat = seats.find(s => s.id === seatId);

  if (!seat) return res.status(404).json({ success: false, message: 'Seat not found.' });
  if (seat.status === 'available') return res.status(400).json({ success: false, message: 'Seat not locked yet.' });
  if (seat.status === 'booked') return res.status(400).json({ success: false, message: 'Seat already booked.' });

  if (seat.status === 'locked' && seat.lockExpiry > Date.now()) {
    seat.status = 'booked';
    seat.lockExpiry = null;
    return res.json({ success: true, message: `Seat ${seatId} booked successfully!` });
  }

  seat.status = 'available';
  seat.lockExpiry = null;
  res.status(400).json({ success: false, message: 'Lock expired. Please lock again before booking.' });
});

module.exports = router;
