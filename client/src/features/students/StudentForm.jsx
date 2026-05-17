import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../services/api';

const schema = z.object({
  fullName: z.string().min(2),
  rollNumber: z.string().min(1),
  class: z.string().min(1),
  grade: z.string().optional(),
  house: z.string().optional(),
  contact: z.string().optional(),
  password: z.string().min(4).optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
});

export default function StudentForm({ initial, onSubmit, onCancel }) {
  const [houses, setHouses] = useState([]);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initial || { password: 'student123' },
  });

  useEffect(() => {
    api.get('/houses').then(({ data }) => setHouses(data.data));
  }, []);

  const submit = (data) => {
    onSubmit({
      fullName: data.fullName,
      rollNumber: data.rollNumber,
      class: data.class,
      grade: data.grade,
      house: data.house || undefined,
      contact: data.contact,
      password: data.password,
      guardian: data.guardianName ? { name: data.guardianName, phone: data.guardianPhone, relation: 'Guardian' } : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Full Name</label>
          <input className="input" {...register('fullName')} />
          {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName.message}</p>}
        </div>
        <div>
          <label className="label">Roll Number</label>
          <input className="input" {...register('rollNumber')} disabled={!!initial} />
        </div>
        <div>
          <label className="label">Class</label>
          <input className="input" {...register('class')} placeholder="10-A" />
        </div>
        <div>
          <label className="label">Grade</label>
          <input className="input" {...register('grade')} />
        </div>
        <div>
          <label className="label">House</label>
          <select className="input" {...register('house')}>
            <option value="">Select house</option>
            {houses.map((h) => (
              <option key={h._id} value={h._id}>{h.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Contact</label>
          <input className="input" {...register('contact')} />
        </div>
        {!initial && (
          <div>
            <label className="label">Login Password</label>
            <input className="input" type="password" {...register('password')} />
          </div>
        )}
        <div>
          <label className="label">Guardian Name</label>
          <input className="input" {...register('guardianName')} />
        </div>
        <div>
          <label className="label">Guardian Phone</label>
          <input className="input" {...register('guardianPhone')} />
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="btn-primary">Save</button>
      </div>
    </form>
  );
}
