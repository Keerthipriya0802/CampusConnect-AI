const axios = require('axios');
const Drive = require('../models/Drive');
const StudentProfile = require('../models/StudentProfile');
const Application = require('../models/Application');

const getEligibilityForDrive = async (drive, studentProfile) => {
  if (!studentProfile) return false;
  const cgpa = studentProfile.cgpa || 0;
  const allowedDepartments = drive.allowedDepartments || [];
  const matchesDepartment = allowedDepartments.length === 0 || allowedDepartments.includes(studentProfile.department);
  const matchesCgpa = cgpa >= (drive.cgpaRequirement || 0);
  return matchesDepartment && matchesCgpa;
};

const buildDbAnswer = async (message, user) => {
  const lower = (message || '').toLowerCase();
  const studentProfile = user ? await StudentProfile.findOne({ user: user._id }) : null;

  if (lower.includes('eligible') && lower.includes('tcs')) {
    const drive = await Drive.findOne({ company: 'TCS' });
    if (!drive || !studentProfile) return 'I need student profile data to determine eligibility.';
    const eligible = await getEligibilityForDrive(drive, studentProfile);
    return eligible ? `Yes, you are eligible for ${drive.company} ${drive.role}.` : `You do not meet the current eligibility criteria for ${drive.company}.`;
  }

  if (lower.includes('eligible') && lower.includes('company')) {
    const drives = await Drive.find({ status: 'open' });
    const matches = [];
    for (const drive of drives) {
      const eligible = studentProfile ? await getEligibilityForDrive(drive, studentProfile) : false;
      if (eligible) matches.push(`${drive.company} - ${drive.role}`);
    }
    return matches.length ? `You are eligible for: ${matches.join(', ')}` : 'You do not match any currently open drives.';
  }

  if (lower.includes('upcoming') && lower.includes('drive')) {
    const drives = await Drive.find({ status: 'open' }).sort({ driveDate: 1 });
    return drives.length ? `Upcoming drives: ${drives.map((drive) => `${drive.company} (${drive.role})`).join(', ')}` : 'No open drives found.';
  }

  if (lower.includes('application status') || lower.includes('status')) {
    const applications = await Application.find({ student: user._id }).populate('drive');
    if (!applications.length) return 'You have not applied to any drives yet.';
    const summary = applications.map((app) => `${app.drive.company}: ${app.status}`).join('; ');
    return `Your application status: ${summary}`;
  }

  if (lower.includes('interview') && lower.includes('schedule')) {
    const drives = await Drive.find({ status: 'open' }).sort({ interviewDate: 1 });
    return drives.length ? `Interview schedules: ${drives.map((drive) => `${drive.company} - ${drive.interviewDate ? drive.interviewDate.toDateString() : 'TBD'}`).join('; ')}` : 'No interview schedules available.';
  }

  if (lower.includes('cgpa')) {
    return studentProfile ? `Your current CGPA is ${studentProfile.cgpa}.` : 'No student profile found yet.';
  }

  if (lower.includes('process') || lower.includes('recruitment')) {
    return 'The recruitment process usually includes registration, eligibility screening, technical round, HR round, and final offer review.';
  }

  if (lower.includes('hr') && lower.includes('question')) {
    return 'Sample HR question: Tell me about yourself and explain why you are interested in this company.';
  }

  if (lower.includes('technical') && lower.includes('question')) {
    return 'Sample technical question: Explain the difference between React state and props.';
  }

  if (lower.includes('aptitude') || lower.includes('tip')) {
    return 'Aptitude tip: practice time-speed accuracy, permutation-combination, and arithmetic reasoning daily.';
  }

  return null;
};

exports.chatWithAI = async (req, res, next) => {
  try {
    const { message } = req.body;
    const dbReply = await buildDbAnswer(message, req.user);

    if (dbReply) {
      return res.json({ reply: dbReply, source: 'database' });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return res.json({ reply: 'I can help with placement guidance from the available database. Ask about eligibility, drive details, or your status.', source: 'fallback' });
    }

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: message }] }],
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const reply = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
      return res.json({ reply, source: 'gemini' });
    } catch (error) {
      return res.json({ reply: 'The AI service is currently unavailable, but I can still help with placement guidance from the database.', source: 'fallback' });
    }
  } catch (error) {
    next(error);
  }
};

exports.generateAnnouncement = async (req, res, next) => {
  try {
    const { company, role, details } = req.body;
    const reply = `Announcement: ${company} is conducting a ${role} drive. ${details}. Please stay updated in the portal.`;
    res.json({ reply });
  } catch (error) {
    next(error);
  }
};

exports.generateReport = async (req, res, next) => {
  try {
    const { totalDrives, registeredStudents, selectedStudents } = req.body;
    const reply = `Placement Summary: ${totalDrives} drives are active, ${registeredStudents} students are registered, and ${selectedStudents} students have been selected so far.`;
    res.json({ reply });
  } catch (error) {
    next(error);
  }
};
