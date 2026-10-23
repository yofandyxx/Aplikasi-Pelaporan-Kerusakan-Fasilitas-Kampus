// Service untuk statistik dan laporan agregasi
// Menggunakan SQL JOIN, COUNT, GROUP BY untuk query agregasi

import { getDatabase } from '../database/database';
import { DamageReport } from '../types';

const mapRow = (row: any): DamageReport => ({
  id: row.id,
  title: row.title,
  reporter_name: row.reporter_name,
  category_id: row.category_id,
  location_id: row.location_id,
  description: row.description,
  photo_uri: row.photo_uri ?? null,
  priority: row.priority,
  status: row.status,
  report_date: row.report_date,
  completed_date: row.completed_date ?? null,
});

/**
 * Menghitung total laporan kerusakan
 * @returns Jumlah total laporan
 */
export const getTotalReports = async (): Promise<number> => {
  const db = getDatabase();
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM damage_reports');
  return row?.count ?? 0;
};

/**
 * Menghitung jumlah laporan per status
 * @returns Daftar { status, count }
 */
export const getReportsByStatus = async (): Promise<{ status: string; count: number }[]> => {
  const db = getDatabase();
  const rows = await db.getAllAsync<{ status: string; count: number }>(
    'SELECT status, COUNT(*) as count FROM damage_reports GROUP BY status'
  );
  return rows;
};

/**
 * Menghitung jumlah laporan per kategori (dengan JOIN)
 * @returns Daftar { category, count }
 */
export const getReportsByCategory = async (): Promise<{ category: string; count: number }[]> => {
  const db = getDatabase();
  const rows = await db.getAllAsync<{ category: string; count: number }>(
    `SELECT c.name as category, COUNT(dr.id) as count
     FROM categories c
     LEFT JOIN damage_reports dr ON dr.category_id = c.id
     GROUP BY c.id, c.name
     ORDER BY count DESC`
  );
  return rows;
};

/**
 * Menghitung jumlah laporan per lokasi (dengan JOIN)
 * @returns Daftar { location, count }
 */
export const getReportsByLocation = async (): Promise<{ location: string; count: number }[]> => {
  const db = getDatabase();
  const rows = await db.getAllAsync<{ location: string; count: number }>(
    `SELECT (l.name || ' - ' || l.building || ' ' || l.floor_room) as location, COUNT(dr.id) as count
     FROM locations l
     LEFT JOIN damage_reports dr ON dr.location_id = l.id
     GROUP BY l.id, l.name, l.building, l.floor_room
     ORDER BY count DESC`
  );
  return rows;
};

/**
 * Menghitung jumlah laporan per prioritas
 * @returns Daftar { priority, count }
 */
export const getReportsByPriority = async (): Promise<{ priority: string; count: number }[]> => {
  const db = getDatabase();
  const rows = await db.getAllAsync<{ priority: string; count: number }>(
    'SELECT priority, COUNT(*) as count FROM damage_reports GROUP BY priority'
  );
  return rows;
};

/**
 * Menghitung persentase penyelesaian laporan (Selesai / total * 100)
 * @returns Persentase penyelesaian
 */
export const getCompletionPercentage = async (): Promise<number> => {
  const db = getDatabase();
  const totalRow = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM damage_reports');
  const total = totalRow?.count ?? 0;
  if (total === 0) return 0;

  const doneRow = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM damage_reports WHERE status = 'Selesai'"
  );
  const done = doneRow?.count ?? 0;
  return Math.round((done / total) * 100);
};

/**
 * Mengambil laporan terbaru
 * @param limit Jumlah maksimal laporan
 * @returns Daftar laporan terbaru
 */
export const getRecentReports = async (limit: number): Promise<DamageReport[]> => {
  const db = getDatabase();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM damage_reports ORDER BY report_date DESC LIMIT ?',
    [limit]
  );
  return rows.map(mapRow);
};

/**
 * Mengambil laporan dengan prioritas Tinggi
 * @returns Daftar laporan prioritas tinggi
 */
export const getHighPriorityReports = async (): Promise<DamageReport[]> => {
  const db = getDatabase();
  const rows = await db.getAllAsync<any>(
    "SELECT * FROM damage_reports WHERE priority = 'Tinggi' ORDER BY report_date DESC"
  );
  return rows.map(mapRow);
};
