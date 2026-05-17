/**
 * Local-only data layer — no HTTP, no MongoDB. All data in localStorage.
 */
import {
  initDb,
  getDb,
  saveDb,
  uid,
  hashPassword,
  verifyPassword,
  dayKey,
  populateHouse,
  calcDisciplineTotal,
  refreshStudentScore,
} from './localDb.js';
import { DISCIPLINE_CATEGORIES, PENALTY_DEDUCTIONS, BONUS_POINTS } from '../utils/constants.js';
import { generateStudentReportBlob } from '../utils/generateStudentPdf.js';

const fail = (message, status = 400) => {
  const err = new Error(message);
  err.response = { data: { success: false, message }, status };
  throw err;
};

const wrap = (data, message = 'Success', extra = {}) => ({
  data: { success: true, message, data, ...extra },
});

const database = () => initDb();

const persist = () => saveDb(getDb());

const userDto = (u) => ({
  id: u._id,
  email: u.email,
  name: u.name,
  role: u.role,
  rollNumber: u.rollNumber,
  studentProfile: u.studentProfile,
});

export const signup = ({ name, email, password, role = 'teacher' }) => {
  const db = database();
  if (db.users.some((u) => u.email?.toLowerCase() === email.toLowerCase())) {
    fail('Email already registered');
  }
  const user = {
    _id: uid(),
    email: email.toLowerCase(),
    password: hashPassword(password),
    name,
    role: role === 'admin' ? 'admin' : 'teacher',
  };
  db.users.push(user);
  persist();
  return { user: userDto(user), token: 'local-' + user._id };
};

export const teacherLogin = (email, password) => {
  const db = database();
  const user = db.users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase() && ['admin', 'teacher'].includes(u.role)
  );
  if (!user || !verifyPassword(password, user.password)) fail('Invalid email or password', 401);
  return { user: userDto(user), token: 'local-' + user._id };
};

export const studentLogin = (rollNumber, password) => {
  const db = database();
  const user = db.users.find(
    (u) => u.rollNumber?.toUpperCase() === rollNumber.toUpperCase() && u.role === 'student'
  );
  if (!user || !verifyPassword(password, user.password)) fail('Invalid roll number or password', 401);
  return { user: userDto(user), token: 'local-' + user._id };
};

export const listStudents = ({ page = 1, limit = 20, search, class: cls, sortBy = 'fullName', order = 'asc' } = {}) => {
  const db = database();
  let list = db.students.filter((s) => s.isActive !== false);
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (s) => s.fullName.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q)
    );
  }
  if (cls) list = list.filter((s) => s.class === cls);
  list.sort((a, b) => {
    const av = a[sortBy] ?? '';
    const bv = b[sortBy] ?? '';
    return order === 'desc' ? (bv > av ? 1 : -1) : av > bv ? 1 : -1;
  });
  const total = list.length;
  const start = (page - 1) * limit;
  const students = list.slice(start, start + limit).map((s) => populateHouse(db, { ...s }));
  return { students, pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 } };
};

export const getStudent = (id) => {
  const db = database();
  const s = db.students.find((x) => x._id === id);
  if (!s) fail('Student not found', 404);
  return populateHouse(db, { ...s });
};

export const createStudent = (data) => {
  const db = database();
  if (db.students.some((s) => s.rollNumber === data.rollNumber)) fail('Roll number exists', 409);
  const studentId = uid();
  const userId = uid();
  db.users.push({
    _id: userId,
    name: data.fullName,
    rollNumber: data.rollNumber,
    password: hashPassword(data.password || 'student123'),
    role: 'student',
    studentProfile: studentId,
  });
  const student = {
    _id: studentId,
    user: userId,
    fullName: data.fullName,
    rollNumber: data.rollNumber,
    class: data.class,
    grade: data.grade,
    house: data.house,
    contact: data.contact,
    guardian: data.guardian,
    finalScore: 0,
    scoreBreakdown: { academics: 0, discipline: 0, attendance: 0, bonuses: 0, penalties: 0 },
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  db.students.push(student);
  refreshStudentScore(db, studentId);
  persist();
  return populateHouse(db, student);
};

export const getDisciplineSession = (studentId, date) => {
  const db = database();
  const student = getStudent(studentId);
  const dk = dayKey(date || new Date());

  const records = db.disciplineRecords.filter((r) => r.student === studentId && dayKey(r.date) === dk);
  const recordsByCategory = Object.fromEntries(records.map((r) => [r.category, r]));

  const categories = {};
  Object.keys(DISCIPLINE_CATEGORIES).forEach((catKey) => {
    const existing = recordsByCategory[catKey];
    categories[catKey] = {
      items: existing?.items || [],
      remarks: existing?.remarks || '',
      totalScore: existing?.totalScore ?? null,
      recordId: existing?._id || null,
      recordedBy: existing?.recordedByName ? { name: existing.recordedByName } : null,
      updatedAt: existing?.updatedAt || null,
    };
  });

  let session = db.disciplineSessions.find((s) => s.student === studentId && dayKey(s.date) === dk);
  if (!session) {
    session = {
      behaviorStatus: 'good',
      warnings: '',
      fineAmount: 0,
      fineRemarks: '',
      disciplinaryActions: [],
      actionNotes: '',
      generalRemarks: '',
      teacherNotes: '',
      attendanceDiscipline: { status: '', isLate: false, remarks: '' },
    };
  }

  const att = db.attendance.find((a) => a.student === studentId && dayKey(a.date) === dk);
  if (att) {
    session = {
      ...session,
      attendanceDiscipline: {
        status: att.status,
        isLate: att.isLate,
        remarks: att.remarks || '',
      },
    };
  }

  const penalties = db.penalties.filter((p) => p.student === studentId && dayKey(p.date) === dk);
  const bonuses = db.bonuses.filter((b) => b.student === studentId && dayKey(b.date) === dk);
  const history = db.disciplineRecords
    .filter((r) => r.student === studentId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 20);
  const allRecords = db.disciplineRecords.filter((r) => r.student === studentId);

  return {
    student,
    date: dk,
    session,
    categories,
    penalties,
    bonuses,
    attendance: att,
    history,
    summary: {
      avgDisciplineScore: allRecords.length
        ? Math.round(allRecords.reduce((s, r) => s + (r.totalScore || 0), 0) / allRecords.length)
        : null,
      penaltyPoints: penalties.reduce((s, p) => s + (p.pointsDeducted || 0), 0),
      bonusPoints: bonuses.reduce((s, b) => s + (b.points || 0), 0),
    },
  };
};

export const saveDisciplineSession = (studentId, payload, teacher) => {
  const db = database();
  const dk = dayKey(payload.date || new Date());
  const now = new Date().toISOString();

  if (payload.categories) {
    Object.entries(payload.categories).forEach(([category, catData]) => {
      if (!catData?.items?.length) return;
      const items = catData.items.map((item) => ({
        ...item,
        recordedAt: item.recordedAt || now,
        recordedBy: item.recordedBy || teacher?.id,
        recordedByName: item.recordedByName || teacher?.name,
      }));
      const totalScore = calcDisciplineTotal(items);
      const existing = db.disciplineRecords.findIndex(
        (r) => r.student === studentId && r.category === category && dayKey(r.date) === dk
      );
      const record = {
        _id: existing >= 0 ? db.disciplineRecords[existing]._id : uid(),
        student: studentId,
        date: dk,
        category,
        items,
        totalScore,
        remarks: catData.remarks || '',
        recordedBy: teacher?.id,
        recordedByName: teacher?.name,
        updatedAt: now,
      };
      if (existing >= 0) db.disciplineRecords[existing] = record;
      else db.disciplineRecords.push(record);
    });
  }

  if (payload.session) {
    const idx = db.disciplineSessions.findIndex((s) => s.student === studentId && dayKey(s.date) === dk);
    const sess = { student: studentId, date: dk, ...payload.session, updatedAt: now };
    if (idx >= 0) db.disciplineSessions[idx] = { ...db.disciplineSessions[idx], ...sess };
    else db.disciplineSessions.push({ _id: uid(), ...sess });

    const att = payload.session.attendanceDiscipline;
    if (att?.status) {
      const aidx = db.attendance.findIndex((a) => a.student === studentId && dayKey(a.date) === dk);
      const row = {
        _id: aidx >= 0 ? db.attendance[aidx]._id : uid(),
        student: studentId,
        date: dk,
        status: att.status,
        isLate: att.isLate || att.status === 'late',
        remarks: att.remarks,
      };
      if (aidx >= 0) db.attendance[aidx] = row;
      else db.attendance.push(row);
    }
  }

  if (payload.penalty?.type) {
    db.penalties.push({
      _id: uid(),
      student: studentId,
      date: dk,
      ...payload.penalty,
      pointsDeducted: PENALTY_DEDUCTIONS[payload.penalty.severity] || 5,
    });
  }
  if (payload.bonus?.type) {
    db.bonuses.push({
      _id: uid(),
      student: studentId,
      date: dk,
      type: payload.bonus.type,
      points: BONUS_POINTS[payload.bonus.type] || 5,
      remarks: payload.bonus.remarks,
    });
  }

  refreshStudentScore(db, studentId);
  persist();
  return getDisciplineSession(studentId, dk);
};

const handle = (method, url, body, config) => {
  initDb();
  const params = config?.params || {};

  if (method === 'POST' && url === '/auth/teacher/login') return wrap(teacherLogin(body.email, body.password), 'Login successful');
  if (method === 'POST' && url === '/auth/student/login') return wrap(studentLogin(body.rollNumber, body.password), 'Login successful');
  if (method === 'POST' && url === '/auth/signup') return wrap(signup(body), 'Account created');

  if (method === 'GET' && url === '/students') {
    const result = listStudents(params);
    return { data: { success: true, message: 'Success', data: result.students, pagination: result.pagination } };
  }
  if (method === 'POST' && url === '/students') return wrap(createStudent(body), 'Student created');

  const studentMatch = url.match(/^\/students\/([^/]+)/);
  if (studentMatch) {
    const id = studentMatch[1];
    if (url.includes('refresh-score') && method === 'POST') {
      const db = database();
      refreshStudentScore(db, id);
      persist();
      const s = getStudent(id);
      return wrap({ finalScore: s.finalScore, ...s.scoreBreakdown });
    }
    if (method === 'GET') return wrap(getStudent(id));
  }

  if (method === 'GET' && url === '/houses') return wrap(database().houses);
  if (method === 'POST' && url === '/houses') {
    const db = database();
    const house = { _id: uid(), totalPoints: 0, weeklyWins: 0, isActive: true, ...body };
    db.houses.push(house);
    persist();
    return wrap(house, 'House created');
  }
  if (method === 'POST' && url === '/houses/weekly-winner') {
    const db = database();
    const houses = db.houses.filter((h) => h.isActive !== false);
    if (!houses.length) fail('No houses found', 404);
    const top = [...houses].sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))[0];
    top.weeklyWins = (top.weeklyWins || 0) + 1;
    persist();
    return wrap(top, 'Weekly winner declared');
  }

  if (method === 'GET' && url === '/academics') return wrap(database().academics);

  const academicStudent = url.match(/^\/academics\/([^/]+)$/);
  if (method === 'GET' && academicStudent) return wrap(database().academics.filter((a) => a.student === academicStudent[1]));
  if (method === 'POST' && url === '/academics') {
    const db = database();
    const marks = body.marks || [];
    let total = 0;
    let max = 0;
    marks.forEach((m) => {
      total += m.score || 0;
      max += m.maxScore || 100;
    });
    const percentage = max ? Math.round((total / max) * 1000) / 10 : 0;
    const gpa = Math.round((percentage / 100) * 4 * 100) / 100;
    const record = { _id: uid(), student: body.student, term: body.term, marks, percentage, gpa };
    db.academics.push(record);
    refreshStudentScore(db, body.student);
    persist();
    return wrap(record, 'Created');
  }
  if (method === 'PUT' && url.startsWith('/academics/')) {
    const db = database();
    const id = url.split('/')[2];
    const idx = db.academics.findIndex((a) => a._id === id);
    if (idx < 0) fail('Academic record not found', 404);
    const marks = body.marks || [];
    let total = 0;
    let max = 0;
    marks.forEach((m) => {
      total += m.score || 0;
      max += m.maxScore || 100;
    });
    const percentage = max ? Math.round((total / max) * 1000) / 10 : 0;
    const gpa = Math.round((percentage / 100) * 4 * 100) / 100;
    const record = { ...db.academics[idx], ...body, marks, percentage, gpa };
    db.academics[idx] = record;
    refreshStudentScore(db, body.student);
    persist();
    return wrap(record);
  }

  if (method === 'GET' && url === '/attendance/daily') {
    const db = database();
    const dk = dayKey(params.date);
    let students = db.students.filter((s) => s.isActive !== false);
    if (params.class) students = students.filter((s) => s.class === params.class);
    return wrap(
      students.map((s) => ({
        _id: s._id,
        fullName: s.fullName,
        rollNumber: s.rollNumber,
        class: s.class,
        attendance: db.attendance.find((a) => a.student === s._id && dayKey(a.date) === dk) || null,
      }))
    );
  }
  if (method === 'POST' && url === '/attendance/bulk') {
    const db = database();
    const dk = dayKey(body.date);
    body.records.forEach((r) => {
      const idx = db.attendance.findIndex((a) => a.student === r.student && dayKey(a.date) === dk);
      const row = {
        _id: idx >= 0 ? db.attendance[idx]._id : uid(),
        student: r.student,
        date: dk,
        status: r.status,
        isLate: r.isLate || r.status === 'late',
        remarks: r.remarks,
      };
      if (idx >= 0) db.attendance[idx] = row;
      else db.attendance.push(row);
      refreshStudentScore(db, r.student);
    });
    persist();
    return wrap(null, 'Saved');
  }
  const attStudent = url.match(/^\/attendance\/([^/]+)$/);
  if (method === 'GET' && attStudent) {
    const db = database();
    const records = db.attendance.filter((a) => a.student === attStudent[1]);
    const present = records.filter((a) => ['present', 'late'].includes(a.status)).length;
    return wrap({
      records,
      summary: {
        total: records.length,
        present,
        percentage: records.length ? Math.round((present / records.length) * 100) : 0,
      },
    });
  }

  const discSession = url.match(/^\/discipline\/session\/([^/]+)$/);
  if (discSession) {
    const sid = discSession[1];
    if (method === 'GET') return wrap(getDisciplineSession(sid, params.date));
    if (method === 'POST') {
      const user = JSON.parse(localStorage.getItem('edutrack_user') || '{}');
      return wrap(saveDisciplineSession(sid, body, { id: user.id, name: user.name }));
    }
  }
  const discStudent = url.match(/^\/discipline\/([^/]+)$/);
  if (method === 'GET' && discStudent) {
    return wrap(
      database()
        .disciplineRecords.filter((r) => r.student === discStudent[1])
        .sort((a, b) => new Date(b.date) - new Date(a.date))
    );
  }

  if (method === 'GET' && url === '/penalties') return wrap(database().penalties);

  const penStudent = url.match(/^\/penalties\/([^/]+)$/);
  if (method === 'GET' && penStudent) return wrap(database().penalties.filter((p) => p.student === penStudent[1]));
  if (method === 'POST' && url === '/penalties') {
    const db = database();
    const p = {
      _id: uid(),
      ...body,
      pointsDeducted: PENALTY_DEDUCTIONS[body.severity] || 5,
      date: new Date().toISOString(),
    };
    db.penalties.push(p);
    refreshStudentScore(db, body.student);
    persist();
    return wrap(p, 'Created');
  }

  if (method === 'GET' && url === '/bonuses') return wrap(database().bonuses);

  const bonStudent = url.match(/^\/bonuses\/([^/]+)$/);
  if (method === 'GET' && bonStudent) return wrap(database().bonuses.filter((b) => b.student === bonStudent[1]));
  if (method === 'POST' && url === '/bonuses') {
    const db = database();
    const b = {
      _id: uid(),
      ...body,
      points: BONUS_POINTS[body.type] || 5,
      date: new Date().toISOString(),
    };
    db.bonuses.push(b);
    refreshStudentScore(db, body.student);
    persist();
    return wrap(b, 'Created');
  }

  if (method === 'GET' && url === '/analytics/dashboard') {
    const db = database();
    const students = db.students.filter((s) => s.isActive !== false);
    return wrap({
      totalStudents: students.length,
      topStudents: [...students].sort((a, b) => b.finalScore - a.finalScore).slice(0, 5),
      weakStudents: [...students].sort((a, b) => a.finalScore - b.finalScore).slice(0, 5),
      houseRankings: [...db.houses].sort((a, b) => b.totalPoints - a.totalPoints),
      attendanceTrend: [],
      disciplineTrend: [],
      classDistribution: Object.entries(
        students.reduce((acc, s) => {
          acc[s.class] = (acc[s.class] || 0) + 1;
          return acc;
        }, {})
      ).map(([_id, count]) => ({ _id, count })),
    });
  }

  const reportMatch = url.match(/^\/reports\/([^/]+)\/pdf$/);
  if (method === 'GET' && reportMatch) {
    const blob = generateStudentReportBlob(reportMatch[1]);
    if (config?.responseType === 'blob') return { data: blob };
    return wrap({ generated: true });
  }

  if (method === 'GET' && url === '/search') {
    const ql = (params.q || '').toLowerCase();
    const db = database();
    return wrap(
      db.students
        .filter(
          (s) =>
            s.isActive !== false &&
            (s.fullName.toLowerCase().includes(ql) || s.rollNumber.toLowerCase().includes(ql))
        )
        .slice(0, 20)
        .map((s) => populateHouse(db, s))
    );
  }

  fail(`Unknown route: ${method} ${url}`, 404);
};

const localApi = {
  get: (url, config) => Promise.resolve(handle('GET', url, null, config)),
  post: (url, body, config) => Promise.resolve(handle('POST', url, body, config)),
  put: (url, body, config) => Promise.resolve(handle('PUT', url, body, config)),
  delete: (url, config) => Promise.resolve(handle('DELETE', url, null, config)),
};

export default localApi;
