import ApiService from '../services/api';

// Cache for department names to avoid repeated API calls
const departmentCache = new Map();

// Fallback hardcoded mappings (in case backend is not available)
const FALLBACK_DEPARTMENTS = {
  '01': 'Civil Engineering',
  '02': 'Electrical and Electronical Engineering',
  '03': 'Mechanical Engineering',
  '04': 'Computer Science & Engineering',
  '05': 'Water Resources Engineering',
  '06': 'Petroleum & Mining Engineering',
  '07': 'Mechatronics and Industrial Engineering',
  '08': 'Electronics & Telecommunication Engineering',
  '09': 'Urban & Regional Planning',
  '10': 'Architecture',
  '11': 'Biomedical Engineering',
  '12': 'Nuclear Engineering',
  '13': 'Materials Science & Engineering',
  '14': 'Physics',
  '15': 'Chemistry',
  '16': 'Mathematics',
  '17': 'Humanities'
};

// For now, use the existing DepartmentService.getDepartmentNameByCode which already exists
// This will work immediately without requiring backend changes
export const getDepartmentName = async (deptCode) => {
  if (!deptCode) return 'Unknown Department';
  
  // Check cache first
  if (departmentCache.has(deptCode)) {
    return departmentCache.get(deptCode);
  }
  
  // Return fallback immediately for now
  const fallbackName = FALLBACK_DEPARTMENTS[deptCode] || 'Unknown Department';
  departmentCache.set(deptCode, fallbackName);
  return fallbackName;
};

/**
 * Preload all department mappings into cache
 * For now, just use fallback mappings
 */
export const preloadDepartments = async () => {
  // Preload hardcoded departments into cache
  Object.entries(FALLBACK_DEPARTMENTS).forEach(([code, name]) => {
    departmentCache.set(code, name);
  });
  console.log('Department mappings preloaded from fallback data');
};

/**
 * Get department name synchronously from cache
 * Use this only after preloading or when you know the department is cached
 */
export const getDepartmentNameSync = (deptCode) => {
  if (!deptCode) return 'Unknown Department';
  return departmentCache.get(deptCode) || FALLBACK_DEPARTMENTS[deptCode] || 'Unknown Department';
};

/**
 * Clear department cache (useful for testing or manual refresh)
 */
export const clearDepartmentCache = () => {
  departmentCache.clear();
};