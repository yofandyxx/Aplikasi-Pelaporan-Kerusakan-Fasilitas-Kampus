// Service untuk manajemen riwayat perbaikan dan workflow status laporan
// Menggunakan transaksi SQLite untuk perubahan status yang atomik

import { getDatabase } from '../database/database';
import { RepairHistory, Status } from '../types';

/**
 * Memetakan baris database ke objek RepairHistory
 */
const mapRow = (row: any): RepairHistory => ({
  id: row.id,
  report_id: row.report_id,
  previous_status: row.previous_status as Status,
  new_status: row.new_status as Status,
  technician_name: row.technician_name,
  action_description: row.action_description,
  notes: row.notes ?? null,
  repair_photo_uri: row.repair_photo_uri ?? null,
  action_date: row.action_date,
});

/**
 * Mengambil riwayat perbaikan berdasarkan id laporan
 * @param reportId Id laporan
 * @returns Daftar riwayat perbaikan
 */
export const getRepairHistoriesByReportId = async (reportId: number): Promise<RepairHistory[]> => {
  const db = getDatabase();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM repair_histories WHERE report_id = ? ORDER BY action_date ASC',
    [reportId]
  );
  return rows.map(mapRow);
};

/**
 * Membuat riwayat perbaikan baru
 * @param history Data riwayat tanpa id
 * @returns Id riwayat yang baru dibuat
 */
export const createRepairHistory = async (history: Omit<RepairHistory, 'id'>): Promise<number> => {
  const db = getDatabase();
  const actionDate = history.action_date && history.action_date.trim() !== ''
    ? history.action_date
    : new Date().toISOString();

  const result = await db.runAsync(
    `INSERT INTO repair_histories (report_id, previous_status, new_status, technician_name, action_description, notes, repair_photo_uri, action_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      history.report_id,
      history.previous_status,
      history.new_status,
      history.technician_name,
      history.action_description,
      history.notes ?? null,
      history.repair_photo_uri ?? null,
      actionDate,
    ]
  );
  return result.lastInsertRowId;
};

/**
 * Memulai proses perbaikan: ubah status Baru -> Diproses dan simpan riwayat (transaksi)
 * @param reportId Id laporan
 * @param technicianName Nama teknisi
 * @param actionDescription Deskripsi tindakan
 * @param notes Catatan opsional
 */
export const startProcessing = async (
  reportId: number,
  technicianName: string,
  actionDescription: string,
  notes?: string
): Promise<void> => {
  const db = getDatabase();

  // Validasi input
  if (!technicianName || technicianName.trim() === '') {
    throw new Error('Nama teknisi wajib diisi');
  }
  if (!actionDescription || actionDescription.trim() === '') {
    throw new Error('Deskripsi tindakan wajib diisi');
  }

  const report = await db.getFirstAsync<any>('SELECT * FROM damage_reports WHERE id = ?', [reportId]);
  if (!report) {
    throw new Error('Laporan tidak ditemukan');
  }

  // Validasi workflow: hanya Baru -> Diproses yang diizinkan
  if (report.status !== 'Baru') {
    throw new Error('Hanya laporan dengan status Baru yang dapat diproses');
  }

  // Transaksi: ubah status + simpan riwayat
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      "UPDATE damage_reports SET status = 'Diproses' WHERE id = ?",
      [reportId]
    );
    await db.runAsync(
      `INSERT INTO repair_histories (report_id, previous_status, new_status, technician_name, action_description, notes, repair_photo_uri, action_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [reportId, 'Baru', 'Diproses', technicianName.trim(), actionDescription.trim(), notes ?? null, null, new Date().toISOString()]
    );
  });
};

/**
 * Menyelesaikan perbaikan: ubah status Diproses -> Selesai dan simpan riwayat + completed_date (transaksi)
 * @param reportId Id laporan
 * @param technicianName Nama teknisi
 * @param actionDescription Deskripsi tindakan
 * @param notes Catatan opsional
 * @param repairPhotoUri URI foto perbaikan opsional
 */
export const completeRepair = async (
  reportId: number,
  technicianName: string,
  actionDescription: string,
  notes?: string,
  repairPhotoUri?: string
): Promise<void> => {
  const db = getDatabase();

  if (!technicianName || technicianName.trim() === '') {
    throw new Error('Nama teknisi wajib diisi');
  }
  if (!actionDescription || actionDescription.trim() === '') {
    throw new Error('Deskripsi tindakan wajib diisi');
  }

  const report = await db.getFirstAsync<any>('SELECT * FROM damage_reports WHERE id = ?', [reportId]);
  if (!report) {
    throw new Error('Laporan tidak ditemukan');
  }

  // Validasi workflow: hanya Diproses -> Selesai yang diizinkan (tidak boleh Baru -> Selesai langsung)
  if (report.status !== 'Diproses') {
    throw new Error('Hanya laporan dengan status Diproses yang dapat diselesaikan');
  }

  const completedDate = new Date().toISOString();

  // Transaksi: ubah status + completed_date + simpan riwayat
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      "UPDATE damage_reports SET status = 'Selesai', completed_date = ? WHERE id = ?",
      [completedDate, reportId]
    );
    await db.runAsync(
      `INSERT INTO repair_histories (report_id, previous_status, new_status, technician_name, action_description, notes, repair_photo_uri, action_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [reportId, 'Diproses', 'Selesai', technicianName.trim(), actionDescription.trim(), notes ?? null, repairPhotoUri ?? null, completedDate]
    );
  });
};
