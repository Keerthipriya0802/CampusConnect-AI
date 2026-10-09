const normalizeDepartment = (department) => {
  const value = String(department || '').trim();
  const abbreviation = value.match(/\(([^)]+)\)/)?.[1];
  return (abbreviation || value).toUpperCase().replace(/[^A-Z0-9]/g, '');
};

const getEligibilityFailures = (profile, drive) => {
  if (!profile) return ['Student profile is unavailable'];

  const failures = [];
  const cgpa = Number(profile.cgpa || 0);
  const arrears = Number(profile.arrears || 0);
  const tenthPercentage = Number(profile.tenthPercentage || 0);
  const twelfthPercentage = Number(profile.twelfthPercentage || 0);

  if (cgpa < Number(drive.cgpaRequirement || 0)) failures.push(`CGPA ${cgpa} is below ${drive.cgpaRequirement}`);
  if (arrears > Number(drive.maxArrears ?? 0)) failures.push(`${arrears} arrears exceeds the maximum ${drive.maxArrears ?? 0}`);
  if (tenthPercentage < Number(drive.tenthPercentageRequirement || 0)) failures.push(`10th percentage ${tenthPercentage} is below ${drive.tenthPercentageRequirement}`);
  if (twelfthPercentage < Number(drive.twelfthPercentageRequirement || 0)) failures.push(`12th percentage ${twelfthPercentage} is below ${drive.twelfthPercentageRequirement}`);

  const allowedDepartments = drive.allowedDepartments || [];
  if (allowedDepartments.length && !allowedDepartments.some((department) => (
    normalizeDepartment(department) === normalizeDepartment(profile.department)
  ))) {
    failures.push(`Department ${profile.department || 'not set'} is not in the allowed departments: ${allowedDepartments.join(', ')}`);
  }

  return failures;
};

const isEligible = (profile, drive) => getEligibilityFailures(profile, drive).length === 0;

module.exports = isEligible;
module.exports.getEligibilityFailures = getEligibilityFailures;