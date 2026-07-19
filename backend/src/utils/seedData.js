const mongoose = require('mongoose');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Drive = require('../models/Drive');

const departments = ['CSE', 'ECE', 'EEE', 'MECH', 'IT'];
const skillsPool = [
  ['React', 'Node.js', 'MongoDB'],
  ['Java', 'Spring Boot', 'MySQL'],
  ['Python', 'Django', 'SQL'],
  ['C++', 'DSA', 'System Design'],
  ['JavaScript', 'Express', 'REST APIs'],
];

const companies = [
  { companyName: 'TCS', role: 'Software Engineer', package: '4.5 LPA', cgpa: 7.0, departments: ['CSE', 'IT', 'ECE'], driveDate: '2026-08-10', deadline: '2026-08-01', interviewDate: '2026-08-12', openings: 25, description: 'Backend and frontend development roles for graduating students.' },
  { companyName: 'Infosys', role: 'Full Stack Developer', package: '5.2 LPA', cgpa: 7.2, departments: ['CSE', 'IT', 'ECE'], driveDate: '2026-08-12', deadline: '2026-08-03', interviewDate: '2026-08-14', openings: 18, description: 'Focus on modern web development and API integration.' },
  { companyName: 'Wipro', role: 'Associate Engineer', package: '4.8 LPA', cgpa: 7.0, departments: ['CSE', 'EEE', 'MECH'], driveDate: '2026-08-15', deadline: '2026-08-05', interviewDate: '2026-08-17', openings: 20, description: 'Engineering and software roles for campus hires.' },
  { companyName: 'Cognizant', role: 'Software Developer', package: '5.0 LPA', cgpa: 7.1, departments: ['CSE', 'IT', 'ECE'], driveDate: '2026-08-18', deadline: '2026-08-08', interviewDate: '2026-08-20', openings: 22, description: 'Development and support engineering opportunities.' },
  { companyName: 'Accenture', role: 'Application Developer', package: '6.0 LPA', cgpa: 7.4, departments: ['CSE', 'IT'], driveDate: '2026-08-20', deadline: '2026-08-10', interviewDate: '2026-08-22', openings: 15, description: 'Strong coding and problem solving required.' },
  { companyName: 'Capgemini', role: 'Analyst', package: '4.6 LPA', cgpa: 7.0, departments: ['CSE', 'ECE', 'EEE'], driveDate: '2026-08-22', deadline: '2026-08-12', interviewDate: '2026-08-24', openings: 17, description: 'Business and technical graduate roles.' },
  { companyName: 'Zoho', role: 'Product Engineer', package: '7.0 LPA', cgpa: 7.8, departments: ['CSE', 'IT'], driveDate: '2026-08-25', deadline: '2026-08-15', interviewDate: '2026-08-27', openings: 10, description: 'High-growth product engineering roles.' },
  { companyName: 'HCL', role: 'Software Engineer', package: '4.9 LPA', cgpa: 7.1, departments: ['CSE', 'ECE', 'IT'], driveDate: '2026-08-28', deadline: '2026-08-18', interviewDate: '2026-08-30', openings: 16, description: 'Software engineering and automation track.' },
  { companyName: 'Hexaware', role: 'Associate Consultant', package: '4.7 LPA', cgpa: 7.0, departments: ['CSE', 'IT', 'EEE'], driveDate: '2026-09-01', deadline: '2026-08-22', interviewDate: '2026-09-03', openings: 14, description: 'Consulting and development opportunities.' },
  { companyName: 'IBM', role: 'Software Specialist', package: '6.5 LPA', cgpa: 7.5, departments: ['CSE', 'IT', 'ECE'], driveDate: '2026-09-03', deadline: '2026-08-25', interviewDate: '2026-09-05', openings: 12, description: 'Innovative development roles with strong technical depth.' },
];

const seedData = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return;
    }

    const existingUsers = await User.countDocuments();
    if (existingUsers === 0) {
      const coordinator = await User.create({ name: 'coordinator', email: 'coordinator123@gmail.com', password: 'coordinator123', role: 'coordinator' });
      await User.create({ name: 'student', email: 'student123@gmail.com', password: 'student123', role: 'student' });

      for (let i = 1; i <= 20; i += 1) {
        const user = await User.create({
          name: `Student ${i}`,
          email: `student${i}@mail.com`,
          password: 'student123',
          role: 'student',
        });

        const dept = departments[(i - 1) % departments.length];
        const skillSet = skillsPool[(i - 1) % skillsPool.length];
        await StudentProfile.create({
          user: user._id,
          registerNumber: `REG${1000 + i}`,
          department: dept,
          year: i <= 10 ? 'Final Year' : 'Pre-Final Year',
          cgpa: Number((7.0 + (i % 5) * 0.3).toFixed(1)),
          skills: skillSet,
          resume: `resume-${i}.pdf`,
          phoneNumber: `9876543${String(i).padStart(2, '0')}`,
          placementStatus: i % 3 === 0 ? 'Placed' : 'Active',
        });
      }

      for (const company of companies) {
        await Drive.create({
          title: `${company.companyName} ${company.role}`,
          company: company.companyName,
          description: company.description,
          location: 'Online / Chennai',
          eligibility: `CGPA >= ${company.cgpa} and departments: ${company.departments.join(', ')}`,
          package: company.package,
          deadline: new Date(company.deadline),
          interviewDate: new Date(company.interviewDate),
          status: 'open',
          createdBy: coordinator._id,
          role: company.role,
          salaryPackage: company.package,
          cgpaRequirement: company.cgpa,
          allowedDepartments: company.departments,
          driveDate: new Date(company.driveDate),
          registrationDeadline: new Date(company.deadline),
          jobDescription: company.description,
          openings: company.openings,
        });
      }
    }
  } catch (error) {
    console.warn('Seed data skipped:', error.message);
  }
};

module.exports = seedData;
