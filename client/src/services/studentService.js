import api from './api';

/** Fetch all active students for dropdowns (paginates if needed). */
export async function fetchAllStudents() {
  const limit = 100;
  let page = 1;
  let all = [];
  let pages = 1;

  do {
    const { data } = await api.get('/students', { params: { page, limit } });
    const batch = data.data || [];
    all = all.concat(batch);
    pages = data.pagination?.pages ?? 1;
    page += 1;
  } while (page <= pages);

  return all;
}
