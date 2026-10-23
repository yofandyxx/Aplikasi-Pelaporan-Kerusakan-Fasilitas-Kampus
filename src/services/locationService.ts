// Service untuk manajemen lokasi fasilitas
// Menyediakan operasi CRUD dengan validasi dan query terparameterisasi

import { getDatabase } from '../database/database';
import { Location } from '../types';

/**
 * Mengambil semua lokasi dari database
 * @returns Daftar lokasi
 */
export const getAllLocations = async (): Promise<Location[]> => {
  const db = getDatabase();
  const rows = await db.getAllAsync<Location>('SELECT * FROM locations ORDER BY name ASC');
  return rows;
};

/**
 * Mengambil lokasi berdasarkan id
 * @param id Id lokasi
 * @returns Lokasi atau null jika tidak ditemukan
 */
export const getLocationById = async (id: number): Promise<Location | null> => {
  const db = getDatabase();
  const row = await db.getFirstAsync<Location>('SELECT * FROM locations WHERE id = ?', [id]);
  return row ?? null;
};

/**
 * Membuat lokasi baru
 * @param location Data lokasi tanpa id
 * @returns Id lokasi yang baru dibuat
 */
export const createLocation = async (location: Omit<Location, 'id'>): Promise<number> => {
  // Validasi field wajib
  if (!location.name || location.name.trim() === '') {
    throw new Error('Nama lokasi wajib diisi');
  }
  if (!location.building || location.building.trim() === '') {
    throw new Error('Gedung wajib diisi');
  }
  if (!location.floor_room || location.floor_room.trim() === '') {
    throw new Error('Lantai/Ruangan wajib diisi');
  }

  const db = getDatabase();

  // Cek duplikat kombinasi nama+gedung+lantai
  const existing = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM locations WHERE name = ? AND building = ? AND floor_room = ?',
    [location.name.trim(), location.building.trim(), location.floor_room.trim()]
  );
  if (existing) {
    throw new Error('Kombinasi nama, gedung, dan lantai/ruangan sudah ada');
  }

  const result = await db.runAsync(
    'INSERT INTO locations (name, building, floor_room, description) VALUES (?, ?, ?, ?)',
    [location.name.trim(), location.building.trim(), location.floor_room.trim(), location.description ?? '']
  );
  return result.lastInsertRowId;
};

/**
 * Memperbarui lokasi
 * @param id Id lokasi
 * @param location Data partial lokasi
 */
export const updateLocation = async (id: number, location: Partial<Location>): Promise<void> => {
  const db = getDatabase();

  const existing = await db.getFirstAsync<Location>('SELECT * FROM locations WHERE id = ?', [id]);
  if (!existing) {
    throw new Error('Lokasi tidak ditemukan');
  }

  const name = location.name !== undefined ? location.name.trim() : existing.name;
  const building = location.building !== undefined ? location.building.trim() : existing.building;
  const floor_room = location.floor_room !== undefined ? location.floor_room.trim() : existing.floor_room;

  if (name === '' || building === '' || floor_room === '') {
    throw new Error('Field wajib tidak boleh kosong');
  }

  // Cek duplikat kombinasi (kecuali dirinya sendiri)
  const duplicate = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM locations WHERE name = ? AND building = ? AND floor_room = ? AND id != ?',
    [name, building, floor_room, id]
  );
  if (duplicate) {
    throw new Error('Kombinasi nama, gedung, dan lantai/ruangan sudah ada');
  }

  const description = location.description !== undefined ? location.description : existing.description;

  await db.runAsync(
    'UPDATE locations SET name = ?, building = ?, floor_room = ?, description = ? WHERE id = ?',
    [name, building, floor_room, description, id]
  );
};

/**
 * Menghapus lokasi
 * @param id Id lokasi
 */
export const deleteLocation = async (id: number): Promise<void> => {
  const db = getDatabase();

  const used = await isLocationUsedInReports(id);
  if (used) {
    throw new Error('Lokasi tidak dapat dihapus karena masih digunakan dalam laporan');
  }

  await db.runAsync('DELETE FROM locations WHERE id = ?', [id]);
};

/**
 * Mengecek apakah lokasi masih digunakan dalam laporan kerusakan
 * @param id Id lokasi
 * @returns true jika masih digunakan
 */
export const isLocationUsedInReports = async (id: number): Promise<boolean> => {
  const db = getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM damage_reports WHERE location_id = ?',
    [id]
  );
  return (row?.count ?? 0) > 0;
};
