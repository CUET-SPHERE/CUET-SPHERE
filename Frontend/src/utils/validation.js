export const DEPARTMENTS = {
  '01': 'Civil Engineering',
  '02': 'Electrical &amp; Electronic Engineering',
  '03': 'Mechanical Engineering',
  '04': 'Computer Science &amp; Engineering',
  '05': 'Urban &amp; Regional Planning',
  '06': 'Architecture',
  '07': 'Petroleum &amp; Mining Engineering',
  '08': 'Electronics &amp; Telecommunication Engineering',
  '09': 'Mechatronics &amp; Industrial Engineering',
  '10': 'Water Resources Engineering',
  '11': 'Biomedical Engineering',
  '12': 'Materials Science &amp; Engineering',
};

export const HALLS = [
  'Kazi Nazrul Islam Hall',
  'Syed Muhammad Shah Hall',
  'Tarek Huda Hall',
  'Dr. Qudrat-E-Khuda Hall',
  'Bangabandhu Hall',
  'Shaheed Mohammad Shah Hall',
  'Sufia Kamal Hall',
  'Sheikh Russel Hall',
];

export const GENDERS = ['Male', 'Female', 'Other'];

export const extractBatch = (studentId) => {
  if (typeof studentId !== 'string' || studentId.length < 2) return '';
  return `20${studentId.substring(0, 2)}`;
};

export const extractDepartment = (studentId) => {
  if (typeof studentId !== 'string' || studentId.length < 4) return '';
  const deptCode = studentId.substring(2, 4);
  return DEPARTMENTS[deptCode] || '';
};

export const validateSignupForm = (formData) => {
  const errors = {};

  if (!formData.fullName.trim()) {
    errors.fullName = 'Full name is required.';
  }

  if (!/^\d{7}$/.test(formData.studentId)) {
    errors.studentId = 'Student ID must be exactly 7 digits.';
  } else if (!extractDepartment(formData.studentId)) {
    errors.studentId = 'Invalid department code in Student ID.';
  }

  if (!formData.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = 'Email address is invalid.';
  }

  if (!formData.password) {
    errors.password = 'Password is required.';
  } else if (formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters long.';
  }

  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  if (!formData.hall) {
    errors.hall = 'Please select your hall of residence.';
  }

  if (!formData.gender) {
    errors.gender = 'Please select your gender.';
  }

  return errors;
};

// --- ADDED THIS FUNCTION ---
export const validateLoginForm = (formData) => {
  const errors = {};

  if (!formData.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = 'Email address is invalid.';
  }

  if (!formData.password) {
    errors.password = 'Password is required.';
  }

  return errors;
};
