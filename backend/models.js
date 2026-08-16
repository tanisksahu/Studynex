const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  authId: { type: String, required: true, unique: true, index: true },
  profile: {
    firstName: String, lastName: String, email: String, 
    institution: String, xp: Number, level: Number, 
    streak: Number, targetGpa: Number, studyTimeMinutes: Number,
    avatarUrl: String,
    degree: String,
    program: String,
    graduationYear: Number,
    skills: [String],
    certifications: [String],
    projects: [mongoose.Schema.Types.Mixed],
    experience: [mongoose.Schema.Types.Mixed],
    achievements: [String],
    linkedin: String,
    github: String,
    portfolio: String,
    interests: [String]
  },
  settings: { type: mongoose.Schema.Types.Mixed, default: {} },
  notifications: [{
    id: Number, 
    type: { type: String }, 
    message: String, 
    timestamp: String, 
    read: Boolean
  }]
}, { timestamps: true });

const subjectSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  id: { type: Number, required: true },
  name: String, code: String, difficulty: String, examDate: String, totalUnits: Number,
  credits: Number, type: String, priority: String, targetGrade: String
}, { timestamps: true });
subjectSchema.index({ userId: 1, id: 1 }, { unique: true });

const unitSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  subjectId: { type: Number, required: true },
  unitNumber: Number,
  name: String,
  completed: Boolean
}, { timestamps: true });
unitSchema.index({ userId: 1, subjectId: 1, unitNumber: 1 }, { unique: true });

const masterySchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  subjectId: { type: Number, required: true },
  retention: Number,
  timeSpent: Number,
  level: String
}, { timestamps: true });
masterySchema.index({ userId: 1, subjectId: 1 }, { unique: true });

const taskSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  id: { type: Number, required: true },
  title: String,
  time: String,
  completed: Boolean,
  isLive: Boolean,
  priority: Boolean
}, { timestamps: true });
taskSchema.index({ userId: 1, id: 1 }, { unique: true });

const materialSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  id: { type: Number, required: true },
  title: String, type: String, subject: String, unit: String, topic: String, 
  addedAt: String, confidence: Number,
  subjectId: Number, unitNumber: Number, status: String, importance: String, summary: String
}, { timestamps: true });
materialSchema.index({ userId: 1, id: 1 }, { unique: true });

const examSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  id: { type: Number, required: true },
  subjectId: Number,
  subjectName: String,
  courseCode: String,
  date: String,
  startTime: String,
  endTime: String,
  venue: String,
  type: String,
  semester: String,
  sourceDocument: String
}, { timestamps: true });
examSchema.index({ userId: 1, id: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);
const Subject = mongoose.model('Subject', subjectSchema);
const Unit = mongoose.model('Unit', unitSchema);
const Mastery = mongoose.model('Mastery', masterySchema);
const Task = mongoose.model('Task', taskSchema);
const Material = mongoose.model('Material', materialSchema);
const Exam = mongoose.model('Exam', examSchema);

module.exports = { User, Subject, Unit, Mastery, Task, Material, Exam };
