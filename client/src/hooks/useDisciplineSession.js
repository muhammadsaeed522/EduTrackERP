import { useState, useCallback } from 'react';
import api from '../services/api';
import { DISCIPLINE_CATEGORIES, buildDefaultCategoryScores } from '../utils/constants';

const defaultSession = () => ({
  behaviorStatus: 'good',
  warnings: '',
  fineAmount: 0,
  fineRemarks: '',
  disciplinaryActions: [],
  actionNotes: '',
  generalRemarks: '',
  teacherNotes: '',
  attendanceDiscipline: { status: '', isLate: false, remarks: '' },
});

const defaultPenalty = () => ({
  enabled: false,
  type: '',
  severity: 'minor',
  remarks: '',
});

const defaultBonus = () => ({
  enabled: false,
  type: 'cleanliness',
  remarks: '',
});

export function useDisciplineSession(currentTeacher = null) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [student, setStudent] = useState(null);
  const [session, setSession] = useState(defaultSession());
  const [categories, setCategories] = useState(buildDefaultCategoryScores);
  const [penalty, setPenalty] = useState(defaultPenalty());
  const [bonus, setBonus] = useState(defaultBonus());
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));

  const mergeCategoriesFromApi = (apiCategories) => {
    const merged = buildDefaultCategoryScores();
    Object.entries(DISCIPLINE_CATEGORIES).forEach(([catKey, catDef]) => {
      const fromApi = apiCategories?.[catKey];
      merged[catKey] = {
        remarks: fromApi?.remarks || '',
        recordedBy: fromApi?.recordedBy || null,
        updatedAt: fromApi?.updatedAt || null,
        items: catDef.items.map((def) => {
          const saved = fromApi?.items?.find((i) => i.key === def.key);
          return {
            ...def,
            score: saved?.score ?? 5,
            remarks: saved?.remarks || '',
            recordedAt: saved?.recordedAt || null,
            recordedBy: saved?.recordedBy || fromApi?.recordedBy?._id || null,
            recordedByName:
              saved?.recordedByName || fromApi?.recordedBy?.name || '',
          };
        }),
      };
    });
    return merged;
  };

  const load = useCallback(
    async (studentId, date) => {
      if (!studentId) return;
      setLoading(true);
      setLoadError(null);
      try {
        const { data } = await api.get(`/discipline/session/${studentId}`, {
          params: { date: date || selectedDate },
        });
        const payload = data.data;
        setStudent(payload.student);
        setSession({
          ...defaultSession(),
          ...payload.session,
          attendanceDiscipline: {
            ...defaultSession().attendanceDiscipline,
            ...payload.session?.attendanceDiscipline,
          },
        });
        setCategories(mergeCategoriesFromApi(payload.categories));
        setHistory(payload.history || []);
        setSummary(payload.summary);
        setPenalty(defaultPenalty());
        setBonus(defaultBonus());
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load discipline session';
        setLoadError(msg);
        try {
          const { data: studentRes } = await api.get(`/students/${studentId}`);
          setStudent(studentRes.data);
          setCategories(buildDefaultCategoryScores());
        } catch {
          setStudent(null);
        }
      } finally {
        setLoading(false);
      }
    },
    [selectedDate]
  );

  const save = useCallback(
    async (studentId) => {
      if (!studentId) throw new Error('Select a student');
      setSaving(true);
      try {
        const body = {
          date: selectedDate,
          categories: Object.fromEntries(
            Object.entries(categories).map(([key, val]) => [
              key,
              {
                items: val.items.map(
                  ({ key: k, label, score, remarks, recordedAt, recordedBy, recordedByName }) => ({
                    key: k,
                    label,
                    score: Number(score),
                    remarks,
                    recordedAt: recordedAt || new Date().toISOString(),
                    recordedBy: recordedBy || currentTeacher?.id,
                    recordedByName: recordedByName || currentTeacher?.name,
                  })
                ),
                remarks: val.remarks,
              },
            ])
          ),
          session,
        };
        if (penalty.enabled && penalty.type) {
          body.penalty = {
            type: penalty.type,
            severity: penalty.severity,
            remarks: penalty.remarks,
          };
        }
        if (bonus.enabled && bonus.type) {
          body.bonus = { type: bonus.type, remarks: bonus.remarks };
        }
        const { data } = await api.post(`/discipline/session/${studentId}`, body);
        const payload = data.data;
        setStudent(payload.student);
        setHistory(payload.history || []);
        setSummary(payload.summary);
        setCategories(mergeCategoriesFromApi(payload.categories));
        setPenalty(defaultPenalty());
        setBonus(defaultBonus());
        return payload;
      } finally {
        setSaving(false);
      }
    },
    [categories, session, penalty, bonus, selectedDate, currentTeacher]
  );

  const updateItem = (categoryKey, itemKey, field, value) => {
    const now = new Date().toISOString();
    setCategories((prev) => ({
      ...prev,
      [categoryKey]: {
        ...prev[categoryKey],
        items: prev[categoryKey].items.map((item) => {
          if (item.key !== itemKey) return item;
          const updated = { ...item, [field]: value };
          if (field === 'score' || field === 'remarks') {
            updated.recordedAt = now;
            updated.recordedBy = currentTeacher?.id || item.recordedBy;
            updated.recordedByName = currentTeacher?.name || item.recordedByName;
          }
          return updated;
        }),
      },
    }));
  };

  const updateCategoryRemarks = (categoryKey, remarks) => {
    setCategories((prev) => ({
      ...prev,
      [categoryKey]: { ...prev[categoryKey], remarks },
    }));
  };

  return {
    loading,
    saving,
    loadError,
    student,
    session,
    setSession,
    categories,
    penalty,
    setPenalty,
    bonus,
    setBonus,
    history,
    summary,
    selectedDate,
    setSelectedDate,
    load,
    save,
    updateItem,
    updateCategoryRemarks,
  };
}
