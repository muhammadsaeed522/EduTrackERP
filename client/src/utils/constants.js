export const ROLES = { ADMIN: 'admin', TEACHER: 'teacher', STUDENT: 'student' };

export const DISCIPLINE_CATEGORIES = {
  daily_routine: { letter: 'A', label: 'Daily Routine', items: [
    { key: 'wake_up', label: 'Wake-up on time' },
    { key: 'breakfast_lineup', label: 'Breakfast lineup' },
    { key: 'school_lineup', label: 'School lineup' },
    { key: 'lunch_lineup', label: 'Lunch lineup' },
    { key: 'maghrib_lineup', label: 'Maghrib lineup' },
    { key: 'lights_out', label: 'Lights out' },
    { key: 'general_behavior', label: 'General behavior' },
  ]},
  hygiene_turnout: { letter: 'B', label: 'Hygiene & Turnout', items: [
    { key: 'hygiene', label: 'Hygiene' },
    { key: 'dress', label: 'Dress' },
    { key: 'footwear', label: 'Footwear' },
    { key: 'belongings', label: 'Care of belongings' },
  ]},
  study_discipline: { letter: 'C', label: 'Study Discipline', items: [
    { key: 'toye_1', label: 'Toye 1' },
    { key: 'toye_2', label: 'Toye 2' },
  ]},
  activities: { letter: 'D', label: 'Activities', items: [
    { key: 'sports', label: 'Sports participation' },
    { key: 'house_activities', label: 'House activities' },
  ]},
  academic_discipline: { letter: 'E', label: 'Academic Discipline', items: [
    { key: 'homework', label: 'Homework' },
    { key: 'test_performance', label: 'Test performance' },
    { key: 'class_behavior', label: 'Class behavior' },
    { key: 'improvement', label: 'Improvement' },
  ]},
};

export const PENALTY_TYPES = {
  minor: ['abusive_language', 'lying', 'littering'],
  serious: ['fighting', 'bullying', 'stealing', 'property_damage'],
  major: ['smoking', 'drugs', 'harassment'],
};

export const PENALTY_DEDUCTIONS = { minor: 5, serious: 15, major: 30 };

export const BONUS_POINTS = {
  cleanliness: 5,
  competition_winner: 10,
  perfect_discipline: 15,
  leadership: 8,
};

export const BONUS_TYPES = [
  { value: 'cleanliness', label: 'Cleanliness', points: 5 },
  { value: 'competition_winner', label: 'Competition Winner', points: 10 },
  { value: 'perfect_discipline', label: 'Perfect Discipline', points: 15 },
  { value: 'leadership', label: 'Leadership', points: 8 },
];

export const ATTENDANCE_STATUSES = ['present', 'absent', 'late', 'excused'];

export const BEHAVIOR_STATUS = [
  { value: 'excellent', label: 'Excellent', color: 'emerald' },
  { value: 'good', label: 'Good', color: 'blue' },
  { value: 'satisfactory', label: 'Satisfactory', color: 'amber' },
  { value: 'warning', label: 'Warning', color: 'orange' },
  { value: 'critical', label: 'Critical', color: 'red' },
];

export const DISCIPLINARY_ACTIONS = [
  { value: 'verbal_warning', label: 'Verbal Warning' },
  { value: 'written_warning', label: 'Written Warning' },
  { value: 'detention', label: 'Detention' },
  { value: 'parent_call', label: 'Parent Call' },
  { value: 'counseling', label: 'Counseling' },
  { value: 'suspension', label: 'Suspension' },
  { value: 'community_service', label: 'Community Service' },
];

export const buildDefaultCategoryScores = () => {
  const scores = {};
  Object.entries(DISCIPLINE_CATEGORIES).forEach(([catKey, cat]) => {
    scores[catKey] = {
      items: cat.items.map((i) => ({
        ...i,
        score: 5,
        remarks: '',
        recordedAt: null,
        recordedBy: null,
        recordedByName: '',
      })),
      remarks: '',
      recordedBy: null,
      updatedAt: null,
    };
  });
  return scores;
};
