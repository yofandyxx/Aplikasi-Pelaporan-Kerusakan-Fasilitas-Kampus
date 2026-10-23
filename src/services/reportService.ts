// Service untuk manajemen laporan kerusakan fasilitas
// Menyediakan operasi CRUD, pencarian, filter, dan query terparameterisasi

import { getDatabase } from '../database/database';
import { DamageReport, Priority, Status } from '../types';

const VALID_PRIORITIES: Priority[] = ['Rendah', 'Sedang', 'Tinggi'];
const VALID_STATUSES: Status[] = ['Baru', 'Diproses', 'Selesai'];

/**
 * Memetakan baris database ke objek DamageReport
 */
const mapRow = (row: any): DamageReport => ({
  id: row.id,
  title: row.title,
  reporter_name: row.reporter_name,
  category_id: row.category_id,
  location_id: row.location_id,
  description: row.description,
  photo_uri: row.photo_uri ?? null,
  priority: row.priority as Priority,
  status: row.status as Status,
  report_date: row.report_date,
  completed_date: row.completed_date ?? null,
});

/**
 * Mengambil semua laporan kerusakan
 * @returns Daftar laporan
 */
export const getAllReports = async (): Promise<DamageReport[]> => {
  const db = getDatabase();
  const rows = await db.getAllAsync<any>('SELECT * FROM damage_reports ORDER BY report_date DESC');
  return rows.map(mapRow);
};

/**
 * Mengambil laporan berdasarkan id
 * @param id Id laporan
 * @returns Laporan atau null
 */
export const getReportById = async (id: number): Promise<DamageReport | null> => {
  const db = getDatabase();
  const row = await db.getFirstAsync<any>('SELECT * FROM damage_reports WHERE id = ?', [id]);
  return row ? mapRow(row) : null;
};

/**
 * Membuat laporan kerusakan baru
 * @param report Data laporan tanpa id
 * @returns Id laporan yang baru dibuat
 */
export const createReport = async (report: Omit<DamageReport, 'id'>): Promise<number> => {
  // Validasi field wajib
  if (!report.title || report.title.trim() === '') {
    throw new Error('Judul laporan wajib diisi');
  }
  if (!report.reporter_name || report.reporter_name.trim() === '') {
    throw new Error('Nama pelapor wajib diisi');
  }
  if (!report.category_id) {
    throw new Error('Kategori wajib dipilih');
  }
  if (!report.location_id) {
    throw new Error('Lokasi wajib dipilih');
  }
  if (!report.description || report.description.trim() === '') {
    throw new Error('Deskripsi wajib diisi');
  }
  if (!VALID_PRIORITIES.includes(report.priority)) {
    throw new Error('Prioritas tidak valid');
  }

  // Status baru otomatis 'Baru', tidak boleh pilih Diproses/Selesai saat baru
  if (report.status && report.status !== 'Baru') {
    throw new Error('Status laporan baru harus Baru');
  }

  const db = getDatabase();
  // Form lama menggunakan nilai default ID 1. Jika data master pernah dihapus,
  // gunakan data master pertama yang masih tersedia agar foreign key tetap valid.
  let categoryId = report.category_id;
  let locationId = report.location_id;
  const category = await db.getFirstAsync<{ id: number }>('SELECT id FROM categories WHERE id = ?', [categoryId]);
  if (!category) {
    const firstCategory = await db.getFirstAsync<{ id: number }>('SELECT id FROM categories ORDER BY id ASC LIMIT 1');
    if (!firstCategory) throw new Error('Belum ada kategori. Tambahkan kategori terlebih dahulu.');
    categoryId = firstCategory.id;
  }
  const location = await db.getFirstAsync<{ id: number }>('SELECT id FROM locations WHERE id = ?', [locationId]);
  if (!location) {
    const firstLocation = await db.getFirstAsync<{ id: number }>('SELECT id FROM locations ORDER BY id ASC LIMIT 1');
    if (!firstLocation) throw new Error('Belum ada lokasi. Tambahkan lokasi terlebih dahulu.');
    locationId = firstLocation.id;
  }
  const reportDate = report.report_date && report.report_date.trim() !== ''
    ? report.report_date
    : new Date().toISOString();

  const result = await db.runAsync(
    `INSERT INTO damage_reports (title, reporter_name, category_id, location_id, description, photo_uri, priority, status, report_date, completed_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      report.title.trim(),
      report.reporter_name.trim(),
      categoryId,
      locationId,
      report.description.trim(),
      report.photo_uri ?? null,
      report.priority,
      'Baru',
      reportDate,
      null,
    ]
  );
  return result.lastInsertRowId;
};

/**
 * Memperbarui laporan kerusakan
 * @param id Id laporan
 * @param report Data partial laporan
 */
export const updateReport = async (id: number, report: Partial<DamageReport>): Promise<void> => {
  const db = getDatabase();

  const existing = await db.getFirstAsync<any>('SELECT * FROM damage_reports WHERE id = ?', [id]);
  if (!existing) {
    throw new Error('Laporan tidak ditemukan');
  }

  const title = report.title !== undefined ? report.title.trim() : existing.title;
  const reporter_name = report.reporter_name !== undefined ? report.reporter_name.trim() : existing.reporter_name;
  const category_id = report.category_id !== undefined ? report.category_id : existing.category_id;
  const location_id = report.location_id !== undefined ? report.location_id : existing.location_id;
  const description = report.description !== undefined ? report.description.trim() : existing.description;
  const photo_uri = report.photo_uri !== undefined ? report.photo_uri : existing.photo_uri;
  const priority = report.priority !== undefined ? report.priority : existing.priority;
  const status = report.status !== undefined ? report.status : existing.status;
  const report_date = report.report_date !== undefined ? report.report_date : existing.report_date;
  const completed_date = report.completed_date !== undefined ? report.completed_date : existing.completed_date;

  if (title === '' || reporter_name === '' || description === '') {
    throw new Error('Field wajib tidak boleh kosong');
  }
  if (!VALID_PRIORITIES.includes(priority as Priority)) {
    throw new Error('Prioritas tidak valid');
  }
  if (!VALID_STATUSES.includes(status as Status)) {
    throw new Error('Status tidak valid');
  }
  if (status !== existing.status) {
    throw new Error('Status hanya dapat diubah melalui proses penanganan');
  }
  const categoryExists = await db.getFirstAsync<{ id: number }>('SELECT id FROM categories WHERE id = ?', [category_id]);
  if (!categoryExists) throw new Error('Kategori tidak ditemukan');
  const locationExists = await db.getFirstAsync<{ id: number }>('SELECT id FROM locations WHERE id = ?', [location_id]);
  if (!locationExists) throw new Error('Lokasi tidak ditemukan');

  await db.runAsync(
    `UPDATE damage_reports SET title = ?, reporter_name = ?, category_id = ?, location_id = ?, description = ?, photo_uri = ?, priority = ?, status = ?, report_date = ?, completed_date = ? WHERE id = ?`,
    [title, reporter_name, category_id, location_id, description, photo_uri, priority, status, report_date, completed_date, id]
  );
};

/**
 * Menghapus laporan kerusakan
 * @param id Id laporan
 */
export const deleteReport = async (id: number): Promise<void> => {
  const db = getDatabase();
  const history = await db.getFirstAsync<any>('SELECT id FROM repair_histories WHERE report_id = ? LIMIT 1', [id]);
  if (history) throw new Error('Laporan yang sudah memiliki riwayat tidak boleh dihapus');
  await db.runAsync('DELETE FROM damage_reports WHERE id = ?', [id]);
};

/**
 * Mencari laporan berdasarkan kata kunci (judul, deskripsi, nama pelapor)
 * @param query Kata kunci pencarian
 * @returns Daftar laporan yang cocok
 */
export const searchReports = async (query: string): Promise<DamageReport[]> => {
  const db = getDatabase();
  const like = `%${query}%`;
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM damage_reports
     WHERE title LIKE ? OR description LIKE ? OR reporter_name LIKE ?
     ORDER BY report_date DESC`,
    [like, like, like]
  );
  return rows.map(mapRow);
};

/**
 * Memfilter laporan berdasarkan kriteria
 * @param filters Objek filter
 * @returns Daftar laporan yang cocok
 */
export const filterReports = async (filters: {
  categoryId?: number;
  locationId?: number;
  priority?: Priority;
  status?: Status;
}): Promise<DamageReport[]> => {
  const db = getDatabase();
  const conditions: string[] = [];
  const params: any[] = [];

  if (filters.categoryId !== undefined) {
    conditions.push('category_id = ?');
    params.push(filters.categoryId);
  }
  if (filters.locationId !== undefined) {
    conditions.push('location_id = ?');
    params.push(filters.locationId);
  }
  if (filters.priority !== undefined) {
    conditions.push('priority = ?');
    params.push(filters.priority);
  }
  if (filters.status !== undefined) {
    conditions.push('status = ?');
    params.push(filters.status);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM damage_reports ${where} ORDER BY report_date DESC`,
    params
  );
  return rows.map(mapRow);
};

/**
 * Mengambil laporan diurutkan berdasarkan prioritas (Tinggi dulu) lalu tanggal lama
 * @returns Daftar laporan
 */
export const getReportsByPriority = async (): Promise<DamageReport[]> => {
  const db = getDatabase();
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM damage_reports
     ORDER BY CASE priority WHEN 'Tinggi' THEN 1 WHEN 'Sedang' THEN 2 WHEN 'Rendah' THEN 3 ELSE 4 END ASC,
              report_date ASC`
  );
  return rows.map(mapRow);
};
