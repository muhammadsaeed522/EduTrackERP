import { jsPDF } from 'jspdf';
import { initDb, populateHouse } from '../services/localDb.js';

export function generateStudentReportBlob(studentId) {
  const db = initDb();
  const student = db.students.find((s) => s._id === studentId);
  if (!student) throw new Error('Student not found');

  const profile = populateHouse(db, student);
  const b = student.scoreBreakdown || {};
  const attendance = db.attendance
    .filter((a) => a.student === studentId)
    .sort((a, c) => new Date(c.date) - new Date(a.date))
    .slice(0, 30);
  const present = attendance.filter((a) => a.status === 'present' || a.status === 'late').length;
  const attendancePct = attendance.length ? Math.round((present / attendance.length) * 100) : 0;

  const academics = db.academics
    .filter((a) => a.student === studentId)
    .sort((a, c) => new Date(c.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);
  const discipline = db.disciplineRecords
    .filter((d) => d.student === studentId)
    .sort((a, c) => new Date(c.date) - new Date(a.date))
    .slice(0, 10);
  const penalties = db.penalties
    .filter((p) => p.student === studentId)
    .sort((a, c) => new Date(c.date) - new Date(a.date))
    .slice(0, 10);
  const bonuses = db.bonuses
    .filter((x) => x.student === studentId)
    .sort((a, c) => new Date(c.date) - new Date(a.date))
    .slice(0, 10);

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 50;
  let y = margin;
  const line = (text, size = 11, color = '#334155') => {
    doc.setFontSize(size);
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(String(text), 495);
    lines.forEach((ln) => {
      if (y > 780) {
        doc.addPage();
        y = margin;
      }
      doc.text(ln, margin, y);
      y += size + 4;
    });
  };

  line('EduTrack ERP', 22, '#1e40af');
  line('Student Performance Report', 14, '#64748b');
  y += 8;
  line('Student Profile', 16, '#0f172a');
  line(`Name: ${profile.fullName}`);
  line(`Roll Number: ${profile.rollNumber}`);
  line(`Class: ${profile.class}${profile.grade ? ` | Grade: ${profile.grade}` : ''}`);
  line(`House: ${profile.house?.name || 'N/A'}`);
  if (profile.guardian?.name) {
    line(`Guardian: ${profile.guardian.name} (${profile.guardian.phone || ''})`);
  }
  y += 6;
  line('Final Score Summary', 16, '#0f172a');
  line(`Final Score: ${student.finalScore ?? 0}/100`);
  line(`Academics: ${b.academics ?? 0} | Discipline: ${b.discipline ?? 0} | Attendance: ${b.attendance ?? 0}`);
  line(`Bonuses: +${b.bonuses ?? 0} | Penalties: -${b.penalties ?? 0}`);
  y += 6;
  line(`Attendance (${attendancePct}% present)`, 14, '#0f172a');
  attendance.slice(0, 10).forEach((a) => {
    line(`${new Date(a.date).toLocaleDateString()} — ${a.status}${a.isLate ? ' (late)' : ''}`, 10, '#475569');
  });
  y += 4;
  line('Academic Performance', 14, '#0f172a');
  academics.forEach((ac) => {
    line(`Term: ${ac.term || 'N/A'} — GPA: ${Number(ac.gpa || 0).toFixed(2)} | ${Number(ac.percentage || 0).toFixed(1)}%`, 10, '#475569');
    (ac.marks || []).slice(0, 5).forEach((m) => {
      line(`  ${m.subject}: ${m.score}/${m.maxScore} (${m.type})`, 10, '#475569');
    });
  });
  y += 4;
  line('Discipline Records', 14, '#0f172a');
  discipline.forEach((d) => {
    line(`${new Date(d.date).toLocaleDateString()} — ${d.category}: ${d.totalScore}/100`, 10);
  });
  if (penalties.length) {
    y += 4;
    line('Penalties', 14, '#0f172a');
    penalties.forEach((p) => line(`- ${p.type} (${p.severity}): -${p.pointsDeducted} pts`, 10));
  }
  if (bonuses.length) {
    y += 4;
    line('Bonuses', 14, '#0f172a');
    bonuses.forEach((x) => line(`+ ${x.type}: +${x.points} pts`, 10));
  }
  y += 16;
  line(`Generated on ${new Date().toLocaleString()} | EduTrack ERP (local)`, 9, '#94a3b8');

  return doc.output('blob');
}
