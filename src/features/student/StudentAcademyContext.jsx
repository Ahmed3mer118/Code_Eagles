import { createContext, useContext } from 'react';
import { useStudentAcademy } from './useStudentAcademy';

const StudentAcademyContext = createContext(null);

/** Shared academy state for the student shell — one fetch, switcher + pages stay in sync. */
export function StudentAcademyProvider({ children }) {
  const value = useStudentAcademy({ autoRedirect: true });
  return (
    <StudentAcademyContext.Provider value={value}>
      {children}
    </StudentAcademyContext.Provider>
  );
}

export function useStudentAcademyContext() {
  const ctx = useContext(StudentAcademyContext);
  if (!ctx) {
    throw new Error('useStudentAcademyContext must be used within StudentAcademyProvider');
  }
  return ctx;
}

/** Safe accessor for components that may render outside the provider. */
export function useOptionalStudentAcademy() {
  return useContext(StudentAcademyContext);
}
