const mongoose = require('mongoose');
const User = require('../models/User');
const Drive = require('../models/Drive');

const companies = [
  { companyName: 'TCS', role: 'Software Engineer', package: '4.5 LPA', cgpa: 7.0, departments: ['CSE', 'IT', 'ECE'], driveDate: '2026-08-10', deadlineDays: 11, interviewDate: '2026-08-12', openings: 25, description: 'Backend and frontend development roles for graduating students.' },
  { companyName: 'Infosys', role: 'Full Stack Developer', package: '5.2 LPA', cgpa: 7.2, departments: ['CSE', 'IT', 'ECE'], driveDate: '2026-08-12', deadlineDays: 13, interviewDate: '2026-08-14', openings: 18, description: 'Focus on modern web development and API integration.' },
  { companyName: 'Wipro', role: 'Associate Engineer', package: '4.8 LPA', cgpa: 7.0, departments: ['CSE', 'EEE', 'MECH'], driveDate: '2026-08-15', deadlineDays: 15, interviewDate: '2026-08-17', openings: 20, description: 'Engineering and software roles for campus hires.' },
  { companyName: 'Cognizant', role: 'Software Developer', package: '5.0 LPA', cgpa: 7.1, departments: ['CSE', 'IT', 'ECE'], driveDate: '2026-08-18', deadlineDays: 18, interviewDate: '2026-08-20', openings: 22, description: 'Development and support engineering opportunities.' },
  { companyName: 'Accenture', role: 'Application Developer', package: '6.0 LPA', cgpa: 7.4, departments: ['CSE', 'IT'], driveDate: '2026-08-20', deadlineDays: 20, interviewDate: '2026-08-22', openings: 15, description: 'Strong coding and problem solving required.' },
  { companyName: 'Capgemini', role: 'Analyst', package: '4.6 LPA', cgpa: 7.0, departments: ['CSE', 'ECE', 'EEE'], driveDate: '2026-08-22', deadlineDays: 22, interviewDate: '2026-08-24', openings: 17, description: 'Business and technical graduate roles.' },
  { companyName: 'Zoho', role: 'Product Engineer', package: '7.0 LPA', cgpa: 7.8, departments: ['CSE', 'IT'], driveDate: '2026-08-25', deadlineDays: 25, interviewDate: '2026-08-27', openings: 10, description: 'High-growth product engineering roles.' },
  { companyName: 'HCL', role: 'Software Engineer', package: '4.9 LPA', cgpa: 7.1, departments: ['CSE', 'ECE', 'IT'], driveDate: '2026-08-28', deadlineDays: 28, interviewDate: '2026-08-30', openings: 16, description: 'Software engineering and automation track.' },
  { companyName: 'Hexaware', role: 'Associate Consultant', package: '4.7 LPA', cgpa: 7.0, departments: ['CSE', 'IT', 'EEE'], driveDate: '2026-09-01', deadlineDays: 32, interviewDate: '2026-09-03', openings: 14, description: 'Consulting and development opportunities.' },
  { companyName: 'IBM', role: 'Software Specialist', package: '6.5 LPA', cgpa: 7.5, departments: ['CSE', 'IT', 'ECE'], driveDate: '2026-09-03', deadlineDays: 35, interviewDate: '2026-09-05', openings: 12, description: 'Innovative development roles with strong technical depth.' },
];

const seedData = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return;
    }

    const existingDrives = await Drive.countDocuments();
    if (existingDrives === 0) {
      const coordinator = await User.findOne({ role: { $in: ['coordinator', 'admin'] } });
      if (!coordinator) return;

      for (const company of companies) {
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + company.deadlineDays);
        deadline.setHours(23, 59, 59, 999);

        await Drive.create({
          title: `${company.companyName} ${company.role}`,
          company: company.companyName,
          description: company.description,
          location: 'Online / Chennai',
          eligibility: `CGPA >= ${company.cgpa} and departments: ${company.departments.join(', ')}`,
          package: company.package,
          deadline,
          interviewDate: new Date(company.interviewDate),
          status: 'open',
          createdBy: coordinator._id,
          role: company.role,
          salaryPackage: company.package,
          cgpaRequirement: company.cgpa,
          allowedDepartments: company.departments,
          driveDate: new Date(company.driveDate),
          registrationDeadline: deadline,
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
