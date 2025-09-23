import ApiService from './api';
import { DEPARTMENTS } from '../utils/validation';

class DepartmentService {
  static async getDepartments() {
    try {
      const response = await ApiService.getAllDepartments();
      if (response.success !== false && response.departments) {
        return response.departments;
      }
      // Fallback to static departments if API fails
      return DEPARTMENTS;
    } catch (error) {
      console.warn('Failed to load departments from API, using fallback:', error);
      return DEPARTMENTS;
    }
  }

  static async getDepartmentName(code) {
    try {
      const departments = await this.getDepartments();
      return departments[code] || 'Unknown Department';
    } catch (error) {
      return DEPARTMENTS[code] || 'Unknown Department';
    }
  }

  static async getDepartmentCode(name) {
    try {
      const departments = await this.getDepartments();
      const entries = Object.entries(departments);
      const entry = entries.find(([code, deptName]) => deptName === name);
      return entry ? entry[0] : null;
    } catch (error) {
      const entries = Object.entries(DEPARTMENTS);
      const entry = entries.find(([code, deptName]) => deptName === name);
      return entry ? entry[0] : null;
    }
  }

  static async getAllDepartmentEntries() {
    try {
      const departments = await this.getDepartments();
      return Object.entries(departments);
    } catch (error) {
      return Object.entries(DEPARTMENTS);
    }
  }
}

export default DepartmentService;