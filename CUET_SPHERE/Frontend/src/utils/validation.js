// Department mapping based on CUET student ID structure
export const DEPARTMENTS = {
  '01': 'Computer Science & Engineering',
  '02': 'Electrical & Electronic Engineering',
  '03': 'Mechanical Engineering',
  '04': 'Civil Engineering',
  '05': 'Chemical Engineering'
};

export const HALLS = [
  'Bangabandhu Sheikh Mujibur Rahman Hall',
  'Shaheed Tajuddin Ahmad Hall',
  'Pritilata Waddedar Hall',
  'Begum Rokeya Hall',
  'Deshnetri Begum Khaleda Zia Hall',
  'Sheikh Hasina Hall'
];

// Extract batch from student ID (first 2 digits)
export const extractBatch = (studentId) => {
  if (!studentId || studentId.length < 2) return '';
  return '20' + studentId.substring(0, 2);
};

// Extract department from student ID (3rd and 4th digits)
export const extractDepartment = (studentId) => {
  if (!studentId || studentId.length < 4) return '';
  const deptCode = studentId.substring(2, 4);
  return DEPARTMENTS[deptCode] || '';
};

// Validate email format
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate student ID (7 digits)
export const validateStudentId = (studentId) => {
  const idRegex = /^\d{7}$/;
  return idRegex.test(studentId);
};

// Validate form data
export const validateSignupForm = (formData) => {
  const errors = {};

  if (!formData.fullName?.trim()) {
    errors.fullName = 'Full name is required';
  }

  if (!formData.studentId) {
    errors.studentId = 'Student ID is required';
  } else if (!validateStudentId(formData.studentId)) {
    errors.studentId = 'Student ID must be exactly 7 digits';
  }

  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!formData.hall) {
    errors.hall = 'Please select a hall';
  }

  return errors;
};

export const validateLoginForm = (formData) => {
  const errors = {};

  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!formData.password) {
    errors.password = 'Password is required';
  }

  return errors;
};