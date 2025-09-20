import { API_BASE_URL, getAuthToken, handleResponse } from './apiUtils';

class SemesterService {
   // Function to fetch semester info by department
   static async getSemestersByDepartment(department) {
      const token = getAuthToken();
      try {
         const response = await fetch(`${API_BASE_URL}/api/semester-info/by-department?department=${encodeURIComponent(department)}`, {
            method: 'GET',
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json',
            },
         });

         return await handleResponse(response);
      } catch (error) {
         console.warn("Semester info API not available:", error);
         // Return mock data
         return [
            { id: 1, semesterName: '1-1', isActive: false },
            { id: 2, semesterName: '1-2', isActive: false },
            { id: 3, semesterName: '2-1', isActive: false },
            { id: 4, semesterName: '2-2', isActive: true },
         ];
      }
   }

   // Function to get semester by name and department
   static async getSemesterByNameAndDepartment(semesterName, department) {
      const token = getAuthToken();
      try {
         const response = await fetch(
            `${API_BASE_URL}/api/semester-info/by-name?semesterName=${encodeURIComponent(semesterName)}&department=${encodeURIComponent(department)}`,
            {
               method: 'GET',
               headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
               },
            }
         );

         return await handleResponse(response);
      } catch (error) {
         console.warn("Semester info API not available:", error);
         // Return mock data
         if (semesterName === '2-2') {
            return { id: 4, semesterName: '2-2', isActive: true };
         }
         return null;
      }
   }

   // Ensure that a semester exists with the given ID and name
   static async ensureSemesterExists(semesterId, semesterName, department) {
      const token = getAuthToken();
      try {
         const url = new URL(`${API_BASE_URL}/api/semester-info/ensure`);
         url.searchParams.append('semesterName', semesterName);
         url.searchParams.append('department', department);
         if (semesterId) {
            url.searchParams.append('id', semesterId);
         }

         const response = await fetch(url.toString(), {
            method: 'POST',
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json',
            }
         });

         return await handleResponse(response);
      } catch (error) {
         console.warn("Ensure semester API not available:", error);
         // Return mock data
         return {
            id: semesterId || 4,
            semesterName: semesterName,
            department: department,
            isActive: false,
            created: false
         };
      }
   }
}

export default SemesterService;