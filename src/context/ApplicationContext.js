import React, { createContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const ApplicationContext = createContext();

export const ApplicationProvider = ({ children }) => {
  const [applications, setApplications] = useState([]);
  const [resumes, setResumes] = useState([]);
  
  // Load data from localStorage on initial render
  useEffect(() => {
    const savedApplications = localStorage.getItem('applications');
    const savedResumes = localStorage.getItem('resumes');
    
    if (savedApplications) {
      setApplications(JSON.parse(savedApplications));
    }
    
    if (savedResumes) {
      setResumes(JSON.parse(savedResumes));
    }
  }, []);
  
  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('applications', JSON.stringify(applications));
  }, [applications]);
  
  useEffect(() => {
    localStorage.setItem('resumes', JSON.stringify(resumes));
  }, [resumes]);
  
  // Application management functions
  const addApplication = (application) => {
    const newApplication = {
      ...application,
      id: uuidv4(),
      dateAdded: new Date().toISOString(),
      status: application.status || 'Applied',
    };
    setApplications([...applications, newApplication]);
    return newApplication;
  };
  
  const updateApplication = (id, updatedData) => {
    setApplications(
      applications.map((app) => (app.id === id ? { ...app, ...updatedData } : app))
    );
  };
  
  const deleteApplication = (id) => {
    setApplications(applications.filter((app) => app.id !== id));
  };
  
  // Resume management functions
  const addResume = (resume) => {
    const newResume = {
      ...resume,
      id: uuidv4(),
      dateAdded: new Date().toISOString(),
    };
    setResumes([...resumes, newResume]);
    return newResume;
  };
  
  const updateResume = (id, updatedData) => {
    setResumes(
      resumes.map((resume) => (resume.id === id ? { ...resume, ...updatedData } : resume))
    );
  };
  
  const deleteResume = (id) => {
    setResumes(resumes.filter((resume) => resume.id !== id));
  };
  
  // Statistics and dashboard data
  const getApplicationStats = () => {
    const statuses = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});
    
    const lastWeekCount = applications.filter(app => {
      const appDate = new Date(app.dateAdded);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return appDate >= weekAgo;
    }).length;
    
    return {
      total: applications.length,
      statuses,
      lastWeekCount
    };
  };
  
  return (
    <ApplicationContext.Provider
      value={{
        applications,
        resumes,
        addApplication,
        updateApplication,
        deleteApplication,
        addResume,
        updateResume,
        deleteResume,
        getApplicationStats,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};