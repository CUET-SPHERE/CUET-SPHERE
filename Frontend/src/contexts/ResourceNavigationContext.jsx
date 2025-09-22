import React, { createContext, useContext, useState, useCallback } from 'react';

const ResourceNavigationContext = createContext();

export const useResourceNavigation = () => {
   const context = useContext(ResourceNavigationContext);
   if (!context) {
      throw new Error('useResourceNavigation must be used within a ResourceNavigationProvider');
   }
   return context;
};

export const ResourceNavigationProvider = ({ children }) => {
   const [navigationTarget, setNavigationTarget] = useState(null);
   const [highlightedResourceId, setHighlightedResourceId] = useState(null);

   // Navigate to a specific resource
   const navigateToResource = useCallback((resource) => {
      // Extract navigation data from resource
      const level = resource.level || parseInt(resource.semesterName?.split('-')[0]) || 1;
      const term = resource.term || parseInt(resource.semesterName?.split('-')[1]) || 1;
      const courseCode = resource.courseCode;
      const resourceId = resource.id || resource.resourceId;

      console.log('Navigating to resource:', {
         level,
         term,
         courseCode,
         resourceId,
         semesterName: resource.semesterName
      });

      // Set navigation target
      setNavigationTarget({
         level,
         term,
         courseCode,
         resourceId,
         timestamp: Date.now() // For triggering updates
      });

      // Set highlighted resource
      setHighlightedResourceId(resourceId);

      // Clear highlight after 3 seconds
      setTimeout(() => {
         setHighlightedResourceId(null);
      }, 3000);
   }, []);

   // Clear navigation target (called after navigation is complete)
   const clearNavigationTarget = useCallback(() => {
      setNavigationTarget(null);
   }, []);

   // Check if a resource is currently highlighted
   const isResourceHighlighted = useCallback((resourceId) => {
      return highlightedResourceId === resourceId;
   }, [highlightedResourceId]);

   const value = {
      navigationTarget,
      navigateToResource,
      clearNavigationTarget,
      isResourceHighlighted,
      highlightedResourceId
   };

   return (
      <ResourceNavigationContext.Provider value={value}>
         {children}
      </ResourceNavigationContext.Provider>
   );
};

export default ResourceNavigationProvider;