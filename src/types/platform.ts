export interface AcademyCard {
  id: string;
  slug: string;
  name: string;
  ownerName: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  description: string | null;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  studentsCount: number;
  coursesCount: number;
  category?: string;
}

export interface PlatformStats {
  activeAcademies: number;
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalQuizAttempts: number;
}

export interface PlatformFaq {
  id: string;
  question: { ar: string; en?: string };
  answer: { ar: string; en?: string };
  sortOrder: number;
}

export interface Testimonial {
  id: string;
  name: string | null;
  role: string | null;
  content: { ar: string; en?: string } | null;
  rating: number | null;
  avatarUrl: string | null;
}