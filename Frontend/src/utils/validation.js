export const DEPARTMENTS = {
  '01': 'Civil Engineering',
  '02': 'Electrical & Electronic Engineering',
  '03': 'Mechanical Engineering',
  '04': 'Computer Science & Engineering',
  '05': 'Urban & Regional Planning',
  '06': 'Architecture',
  '07': 'Petroleum & Mining Engineering',
  '08': 'Electronics & Telecommunication Engineering',
  '09': 'Mechatronics & Industrial Engineering',
  '10': 'Water Resources Engineering',
  '11': 'Biomedical Engineering',
  '12': 'Materials Science & Engineering',
};

export const BOYS_HALLS = [
  'Kazi Nazrul Islam Hall',
  'Shaheed Muhammad Shah Hall',
  'Tarek Huda Hall',
  'Dr. Qudrat-E-Khuda Hall',
  'Muktizuddha Hall',
  'Shaheed Abu Sayed Hall'
];

export const GIRLS_HALLS = [
  'Sufia Kamal Hall',
  'Shamsunnahar Hall',
  'Taposhi Rabeya Hall'
];

export const HALLS = [...BOYS_HALLS, ...GIRLS_HALLS];

export const GENDERS = ['Male', 'Female'];

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

  if (!formData.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = 'Email address is invalid.';
  } else if (!formData.email.endsWith('@student.cuet.ac.bd')) {
    errors.email = 'Email must be a valid CUET student email (@student.cuet.ac.bd).';
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
