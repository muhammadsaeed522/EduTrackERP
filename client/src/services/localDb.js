const DB_KEY = 'edutrack_local_db';
const AUTH_KEY = 'edutrack_user';

export const uid = () => crypto.randomUUID();

export const hashPassword = (pw) => btoa(unescape(encodeURIComponent(pw)));

export const verifyPassword = (pw, hash) => hashPassword(pw) === hash;

export const getDb = () => {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const saveDb = (db) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

export const initDb = () => {
  if (getDb()) return getDb();

  const houses = [
    { _id: uid(), name: 'Eagle', color: '#EF4444', motto: 'Soar High', totalPoints: 0, weeklyWins: 0 },
    { _id: uid(), name: 'Lion', color: '#F59E0B', motto: 'Brave Heart', totalPoints: 0, weeklyWins: 0 },
    { _id: uid(), name: 'Falcon', color: '#3B82F6', motto: 'Swift Victory', totalPoints: 0, weeklyWins: 0 },
    { _id: uid(), name: 'Tiger', color: '#10B981', motto: 'Unstoppable', totalPoints: 0, weeklyWins: 0 },
  ];

  const adminId = uid();
  const teacherId = uid();
  const users = [
    {
      _id: adminId,
      email: 'admin@edutrack.com',
      password: hashPassword('admin123'),
      name: 'System Admin',
      role: 'admin',
    },
    {
      _id: teacherId,
      email: 'teacher@edutrack.com',
      password: hashPassword('teacher123'),
      name: 'John Teacher',
      role: 'teacher',
    },
  ];

  const students = [];
  const studentsData = [
    { fullName: 'Ahmed Khan', rollNumber: 'STU001', class: '10-A', grade: 'A' },
    { fullName: 'Fatima Ali', rollNumber: 'STU002', class: '10-A', grade: 'A+' },
    { fullName: 'Hassan Raza', rollNumber: 'STU003', class: '9-B', grade: 'B+' },
    { fullName: 'Ayesha Malik', rollNumber: 'STU004', class: '9-B', grade: 'A' },
    { fullName: 'Omar Siddiqui', rollNumber: 'STU005', class: '8-A', grade: 'B' },
  ];

  studentsData.forEach((s, i) => {
    const studentId = uid();
    const userId = uid();
    users.push({
      _id: userId,
      name: s.fullName,
      rollNumber: s.rollNumber,
      password: hashPassword('student123'),
      role: 'student',
      studentProfile: studentId,
    });
    students.push({
      _id: studentId,
      user: userId,
      ...s,
      house: houses[i % houses.length]._id,
      contact: `0300${1000000 + i}`,
      guardian: { name: `Guardian ${i + 1}`, relation: 'Father', phone: `0301${1000000 + i}` },
      finalScore: 70 + i * 5,
      scoreBreakdown: { academics: 28, discipline: 25, attendance: 8, bonuses: 5, penalties: 0 },
      isActive: true,
      createdAt: new Date().toISOString(),
    });
  });

  const db = {
    users,
    students,
    houses,
    academics: [],
    attendance: [],
    disciplineRecords: [],
    disciplineSessions: [],
    penalties: [],
    bonuses: [],
  };

  saveDb(db);
  return db;
};

export const dayKey = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
};

export const populateHouse = (db, student) => {
  if (!student?.house) return student;
  const house = db.houses.find((h) => h._id === student.house);
  return { ...student, house: house ? { _id: house._id, name: house.name, color: house.color } : null };
};

export const calcDisciplineTotal = (items) => {
  if (!items?.length) return 0;
  const sum = items.reduce((s, i) => s + (Number(i.score) || 0), 0);
  return Math.round((sum / items.length) * 10);
};

export const refreshStudentScore = (db, studentId) => {
  const student = db.students.find((s) => s._id === studentId);
  if (!student) return;

  const academics = db.academics.filter((a) => a.student === studentId);
  let academicScore = 0;
  if (academics.length) {
    const pcts = academics.map((r) => {
      const total = r.marks?.reduce((s, m) => s + (m.score || 0), 0) || 0;
      const max = r.marks?.reduce((s, m) => s + (m.maxScore || 100), 0) || 100;
      return max ? (total / max) * 100 : 0;
    });
    academicScore = Math.round((pcts.reduce((a, b) => a + b, 0) / pcts.length) * 0.4);
  }

  const discRecords = db.disciplineRecords
    .filter((r) => r.student === studentId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 30);
  let disciplineScore = 0;
  if (discRecords.length) {
    disciplineScore = Math.round(
      (discRecords.reduce((s, r) => s + (r.totalScore || 0), 0) / discRecords.length) * 0.35
    );
  }

  const att = db.attendance.filter((a) => a.student === studentId);
  let attendanceScore = 0;
  if (att.length) {
    const present = att.filter((a) => a.status === 'present' || a.status === 'late').length;
    attendanceScore = Math.round((present / att.length) * 100 * 0.1);
  }

  const bonuses = db.bonuses.filter((b) => b.student === studentId).reduce((s, b) => s + (b.points || 0), 0);
  const penalties = db.penalties
    .filter((p) => p.student === studentId)
    .reduce((s, p) => s + (p.pointsDeducted || 0), 0);

  const finalScore = Math.max(0, Math.min(100, academicScore + disciplineScore + attendanceScore + bonuses - penalties));

  student.finalScore = finalScore;
  student.scoreBreakdown = {
    academics: academicScore,
    discipline: disciplineScore,
    attendance: attendanceScore,
    bonuses,
    penalties,
  };
};

export { AUTH_KEY };
