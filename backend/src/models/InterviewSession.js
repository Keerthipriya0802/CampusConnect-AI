const mongoose = require('mongoose');

const answerEvaluationSchema = new mongoose.Schema({
  technicalCorrectness: { type: Number, default: 0 },
  clarity: { type: Number, default: 0 },
  relevance: { type: Number, default: 0 },
  communication: { type: Number, default: 0 },
  problemSolving: { type: Number, default: 0 },
}, { _id: false });

const interviewHistoryEntrySchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, default: '' },
  evaluation: {
    scores: answerEvaluationSchema,
    feedback: String,
    followUpQuestion: String,
    improvementSuggestion: String,
  },
}, { _id: false });

const questionSchema = new mongoose.Schema({
  sequence: { type: Number, required: true },
  question: { type: String, required: true, trim: true },
  expectedSkill: { type: String, default: 'General' },
  topic: { type: String, default: 'General' },
}, { _id: false });

const interviewSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  interviewType: { type: String, enum: ['Technical', 'HR', 'Mixed'], default: 'Technical' },
  domain: { type: String, enum: ['Java', 'Python', 'SQL', 'MERN Stack', 'General'], default: 'General' },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  experienceLevel: { type: String, default: 'Fresher' },
  totalQuestions: { type: Number, default: 5, min: 1 },
  currentIndex: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  questions: [questionSchema],
  history: [interviewHistoryEntrySchema],
  report: {
    totalQuestionsAttempted: Number,
    overallPerformanceScore: Number,
    topicWisePerformance: [
      {
        topic: String,
        score: Number,
        summary: String,
      },
    ],
    strongAreas: [String],
    areasRequiringImprovement: [String],
    sampleAnswers: [
      {
        number: Number,
        question: String,
        improvedAnswer: String,
      },
    ],
    personalizedSuggestions: [String],
    generatedAt: Date,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

interviewSessionSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
