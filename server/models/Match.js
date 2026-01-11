import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  homeTeam: {
    type: String,
    required: true
  },
  awayTeam: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  venue: {
    type: String,
    required: true
  },
  homeScore: {
    type: Number,
    default: null
  },
  awayScore: {
    type: Number,
    default: null
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  competition: {
    type: String,
    default: 'League'
  },
  goalScorers: [{
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: false
    },
    playerName: {
      type: String,
      required: true
    },
    goals: {
      type: Number,
      default: 1,
      min: 1
    },
    team: {
      type: String,
      enum: ['home', 'away'],
      required: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Match', matchSchema);