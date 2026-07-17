export type Subject = {
  id: string;
  name: string;
  hours: number;
  icon: 'public' | 'view-in-ar' | 'science' | 'menu-book' | 'blur-on' | 'calculate';
  tint: string;
};

export type WeekPlan = {
  id: string;
  weekLabel: string;
  rank: number;
  subjects: Subject[];
};

export type Teacher = {
  id: string;
  name: string;
  rating: number;
  color: string;
  initials: string;
};

export type CourseDetail = {
  id: string;
  title: string;
  description: string;
  rating: number;
  hours: number;
  lessons: number;
  teachers: Teacher[];
};

export const GRADES = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'] as const;

export const WEEK_PLANS: WeekPlan[] = [
  {
    id: 'week-1',
    weekLabel: 'Week',
    rank: 1,
    subjects: [
      { id: 'geo', name: 'Geography', hours: 8, icon: 'public', tint: '#7EC8E3' },
      { id: 'geom', name: 'Geometry', hours: 14, icon: 'view-in-ar', tint: '#B9A5F5' },
      { id: 'chem', name: 'Chemistry', hours: 10, icon: 'science', tint: '#F5A623' },
      { id: 'lit', name: 'Literature', hours: 6, icon: 'menu-book', tint: '#F2994A' },
      { id: 'phys', name: 'Physics', hours: 12, icon: 'blur-on', tint: '#8B74E8' },
    ],
  },
  {
    id: 'week-2',
    weekLabel: 'Week',
    rank: 2,
    subjects: [
      { id: 'math', name: 'Algebra', hours: 16, icon: 'calculate', tint: '#8B74E8' },
      { id: 'geo-2', name: 'Geography', hours: 5, icon: 'public', tint: '#7EC8E3' },
      { id: 'lit-2', name: 'Literature', hours: 9, icon: 'menu-book', tint: '#F2994A' },
      { id: 'chem-2', name: 'Chemistry', hours: 11, icon: 'science', tint: '#F5A623' },
    ],
  },
];

export const COURSES: Record<string, CourseDetail> = {
  'science-play': {
    id: 'science-play',
    title: 'Science Play',
    description:
      'A playful path through core science ideas — formulas, experiments and guided practice shaped by AI for your level.',
    rating: 5.0,
    hours: 32,
    lessons: 16,
    teachers: [
      { id: 't1', name: 'Ana', rating: 4.8, color: '#B9A5F5', initials: 'A' },
      { id: 't2', name: 'Luis', rating: 4.9, color: '#F5A623', initials: 'L' },
      { id: 't3', name: 'Mia', rating: 4.7, color: '#7EC8E3', initials: 'M' },
      { id: 't4', name: 'Omar', rating: 5.0, color: '#8B74E8', initials: 'O' },
      { id: 't5', name: 'Eva', rating: 4.6, color: '#F2994A', initials: 'E' },
    ],
  },
};

export const DEFAULT_COURSE_ID = 'science-play';

export const CHAT_SEED = [
  {
    id: 'm1',
    role: 'assistant' as const,
    text: 'I sketched a few geometry ideas for you. Want to explore angles next?',
    hasSketch: true,
  },
  {
    id: 'm2',
    role: 'assistant' as const,
    text: 'And what else can be found that is just as interesting but on the topic of education?',
    hasSketch: false,
  },
];
