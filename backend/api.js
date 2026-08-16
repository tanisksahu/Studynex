const express = require('express');
const { User, Subject, Unit, Mastery, Task, Material, Exam } = require('./models');
const multer = require('multer');
const { extractAcademicData } = require('./services/ai/extractionService');
const { processCommand } = require('./services/ai/actionEngine');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Middleware to require authId header
router.use((req, res, next) => {
  const authId = req.headers['x-user-id'];
  if (!authId) return res.status(401).json({ error: 'Missing x-user-id header' });
  if (typeof authId !== 'string' || authId.length > 100) return res.status(400).json({ error: 'Invalid x-user-id' });
  req.authId = authId;
  next();
});

// Migration endpoint - Atomic Bulk Upserts
router.post('/migrate', async (req, res) => {
  const { authId } = req;
  const { profile, settings, notifications, subjects, units, mastery, tasks, materials, exams } = req.body;
  
  if (typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'Invalid payload format' });
  }

  try {
    // 1. User Document Upsert
    await User.findOneAndUpdate(
      { authId },
      { authId, profile, settings, notifications },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const promises = [];

    // 2. Subjects Upsert
    if (Array.isArray(subjects) && subjects.length > 0) {
      const subjectOps = subjects.map(s => ({
        updateOne: {
          filter: { userId: authId, id: s.id },
          update: { $set: { ...s, userId: authId } },
          upsert: true
        }
      }));
      promises.push(Subject.bulkWrite(subjectOps));
    }

    // 3. Units Upsert
    if (Array.isArray(units) && units.length > 0) {
      const unitOps = units.map(u => ({
        updateOne: {
          filter: { userId: authId, subjectId: u.subjectId, unitNumber: u.unitNumber },
          update: { $set: { ...u, userId: authId } },
          upsert: true
        }
      }));
      promises.push(Unit.bulkWrite(unitOps));
    }

    // 4. Mastery Upsert
    if (Array.isArray(mastery) && mastery.length > 0) {
      const masteryOps = mastery.map(m => ({
        updateOne: {
          filter: { userId: authId, subjectId: m.subjectId },
          update: { $set: { ...m, userId: authId } },
          upsert: true
        }
      }));
      promises.push(Mastery.bulkWrite(masteryOps));
    }

    // 5. Tasks Upsert
    if (Array.isArray(tasks) && tasks.length > 0) {
      const taskOps = tasks.map(t => ({
        updateOne: {
          filter: { userId: authId, id: t.id },
          update: { $set: { ...t, userId: authId } },
          upsert: true
        }
      }));
      promises.push(Task.bulkWrite(taskOps));
    }

    // 6. Materials Upsert
    if (Array.isArray(materials) && materials.length > 0) {
      const materialOps = materials.map(m => ({
        updateOne: {
          filter: { userId: authId, id: m.id },
          update: { $set: { ...m, userId: authId } },
          upsert: true
        }
      }));
      promises.push(Material.bulkWrite(materialOps));
    }

    // 7. Exams Upsert
    if (Array.isArray(exams) && exams.length > 0) {
      const examOps = exams.map(e => ({
        updateOne: {
          filter: { userId: authId, id: e.id },
          update: { $set: { ...e, userId: authId } },
          upsert: true
        }
      }));
      promises.push(Exam.bulkWrite(examOps));
    }

    // Await all bulk operations simultaneously. If one fails, the error is caught
    await Promise.all(promises);

    res.json({ success: true, message: 'Migration complete' });
  } catch (error) {
    console.error('Migration error:', error.message);
    res.status(500).json({ error: 'Migration failed. No data was destroyed.' });
  }
});

// GET all user data
router.get('/data', async (req, res) => {
  try {
    let user = await User.findOne({ authId: req.authId });
    if (!user) {
      return res.json({
        profile: { firstName: 'New', lastName: 'User', xp: 0, level: 1, streak: 0, studyTimeMinutes: 0 },
        settings: { theme: 'dark', dataPersistence: true, aiInjection: true, notifications: true, reminders: true },
        notifications: [], subjects: [], units: [], mastery: [], tasks: [], materials: []
      });
    }

    const [subjects, units, mastery, tasks, materials, exams] = await Promise.all([
      Subject.find({ userId: req.authId }),
      Unit.find({ userId: req.authId }),
      Mastery.find({ userId: req.authId }),
      Task.find({ userId: req.authId }),
      Material.find({ userId: req.authId }),
      Exam.find({ userId: req.authId })
    ]);

    res.json({
      profile: user.profile,
      settings: user.settings,
      notifications: user.notifications,
      subjects, units, mastery, tasks, materials, exams
    });
  } catch (error) {
    console.error('Data fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Profile & Settings
router.put('/profile', async (req, res) => {
  await User.findOneAndUpdate({ authId: req.authId }, { profile: req.body }, { upsert: true });
  res.json({ success: true });
});

router.put('/settings', async (req, res) => {
  await User.findOneAndUpdate({ authId: req.authId }, { settings: req.body }, { upsert: true });
  res.json({ success: true });
});

router.put('/notifications', async (req, res) => {
  await User.findOneAndUpdate({ authId: req.authId }, { notifications: req.body }, { upsert: true });
  res.json({ success: true });
});

// Subjects
router.post('/subjects', async (req, res) => {
  const subject = await Subject.findOneAndUpdate(
    { id: req.body.id, userId: req.authId },
    { $set: { ...req.body, userId: req.authId } },
    { new: true, upsert: true }
  );
  res.json(subject);
});

router.delete('/subjects/:id', async (req, res) => {
  await Subject.deleteOne({ id: req.params.id, userId: req.authId });
  await Unit.deleteMany({ subjectId: req.params.id, userId: req.authId });
  await Mastery.deleteMany({ subjectId: req.params.id, userId: req.authId });
  res.json({ success: true });
});

// Units
router.post('/units', async (req, res) => {
  const unit = await Unit.findOneAndUpdate(
    { subjectId: req.body.subjectId, unitNumber: req.body.unitNumber, userId: req.authId },
    { $set: { ...req.body, userId: req.authId } },
    { new: true, upsert: true }
  );
  res.json(unit);
});

router.put('/units/:subjectId/:unitNumber', async (req, res) => {
  const unit = await Unit.findOneAndUpdate(
    { subjectId: req.params.subjectId, unitNumber: req.params.unitNumber, userId: req.authId },
    { $set: { ...req.body, userId: req.authId } },
    { new: true, upsert: true }
  );
  res.json(unit);
});

// Mastery
router.post('/mastery', async (req, res) => {
  if (!Array.isArray(req.body)) return res.status(400).json({ error: 'Expected array' });
  const ops = req.body.map(m => ({
    updateOne: {
      filter: { userId: req.authId, subjectId: m.subjectId },
      update: { $set: { ...m, userId: req.authId } },
      upsert: true
    }
  }));
  if (ops.length > 0) await Mastery.bulkWrite(ops);
  res.json({ success: true });
});

// Tasks
router.post('/tasks', async (req, res) => {
  if (!Array.isArray(req.body)) return res.status(400).json({ error: 'Expected array' });
  const ops = req.body.map(t => ({
    updateOne: {
      filter: { userId: req.authId, id: t.id },
      update: { $set: { ...t, userId: req.authId } },
      upsert: true
    }
  }));
  if (ops.length > 0) await Task.bulkWrite(ops);
  res.json({ success: true });
});

// Materials
router.post('/materials', async (req, res) => {
  if (!Array.isArray(req.body)) return res.status(400).json({ error: 'Expected array' });
  const ops = req.body.map(m => ({
    updateOne: {
      filter: { userId: req.authId, id: m.id },
      update: { $set: { ...m, userId: req.authId } },
      upsert: true
    }
  }));
  if (ops.length > 0) await Material.bulkWrite(ops);
  res.json({ success: true });
});

// Exams
router.post('/exams', async (req, res) => {
  const exam = await Exam.findOneAndUpdate(
    { id: req.body.id, userId: req.authId },
    { $set: { ...req.body, userId: req.authId } },
    { new: true, upsert: true }
  );
  res.json(exam);
});

router.delete('/exams/:id', async (req, res) => {
  await Exam.deleteOne({ id: req.params.id, userId: req.authId });
  res.json({ success: true });
});

// --- AI Endpoints ---

router.post('/ai/extract', (req, res) => {
  upload.array('documents')(req, res, async function (err) {
    if (err) {
      console.error('Multer Error:', err);
      return res.status(400).json({ success: false, errorCode: 'FILE_NOT_RECEIVED', message: err.message || 'File upload failed', retryable: true });
    }
    
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, errorCode: 'EMPTY_FILE', message: 'No files uploaded', retryable: true });
      }
      
      // Temporary diagnostic logs
      console.log(`[AI Extract] filename=${req.files[0].originalname}`);
      console.log(`[AI Extract] mimetype=${req.files[0].mimetype}`);
      console.log(`[AI Extract] size=${req.files[0].size}`);
      console.log(`[AI Extract] buffer available=${!!req.files[0].buffer}`);
      
      let context = {};
      if (req.body.context) {
        try {
          context = JSON.parse(req.body.context);
        } catch (e) {
          console.warn('Failed to parse context in /api/ai/extract:', e.message);
        }
      }
      
      const result = await extractAcademicData(req.files, context);
      res.json(result);
    } catch (error) {
      console.error('AI Extract Error:', error);
      res.status(500).json({ success: false, errorCode: 'EXTRACTION_PARSE_FAILED', message: 'Internal AI Error', retryable: true });
    }
  });
});

router.post('/ai/command', async (req, res) => {
  try {
    const { command, context } = req.body;
    if (!command) return res.status(400).json({ error: 'Missing command' });
    
    const result = await processCommand(command, context || {});
    res.json(result);
  } catch (error) {
    console.error('AI Command Error:', error);
    res.status(500).json({ error: 'Internal AI Error' });
  }
});

module.exports = router;
