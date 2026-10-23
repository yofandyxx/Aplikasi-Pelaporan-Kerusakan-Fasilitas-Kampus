// Inisialisasi database SQLite untuk aplikasi PPNP Maintenance
// Menggunakan expo-sqlite untuk manajemen database lokal

import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES } from './schema';

export type { SQLiteDatabase as Database } from 'expo-sqlite';

// Nama database yang digunakan
const DATABASE_NAME = 'ppnp_maintenance.db';

// Instance database singleton
let db: SQLite.SQLiteDatabase | null = null;

/**
 * Mendapatkan instance database SQLite
 * Menggunakan pola singleton untuk memastikan hanya ada satu koneksi database
 * @returns Instance database SQLite
 */
export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (db === null) {
    db = SQLite.openDatabaseSync(DATABASE_NAME);
  }
  return db;
};

/**
 * Menginisialisasi database
 * - Membuka koneksi database
 * - Mengaktifkan foreign key constraint
 * - Membuat tabel-tabel jika belum tersedia
 * @returns Promise yang selesai ketika inisialisasi berhasil
 */
export const initDatabase = async (): Promise<void> => {
  try {
    const database = getDatabase();
    
    // Aktifkan foreign key untuk menjamin integritas referensial
    await database.execAsync('PRAGMA foreign_keys = ON;');
    
    // Buat tabel-tabel jika belum tersedia
    await database.execAsync(CREATE_TABLES);
    // Data awal membuat aplikasi langsung siap dipakai saat praktikum.
    const categoryCount = await database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM categories');
    if ((categoryCount?.count ?? 0) === 0) {
      await database.runAsync('INSERT INTO categories (name, icon, description) VALUES (?, ?, ?)', ['Listrik', 'flash', 'Instalasi listrik dan lampu']);
      await database.runAsync('INSERT INTO categories (name, icon, description) VALUES (?, ?, ?)', ['AC / Pendingin Ruangan', 'air-conditioner', 'Perangkat pendingin ruangan']);
      await database.runAsync('INSERT INTO categories (name, icon, description) VALUES (?, ?, ?)', ['Air / Plumbing', 'water', 'Pipa dan saluran air']);
      await database.runAsync('INSERT INTO categories (name, icon, description) VALUES (?, ?, ?)', ['Komputer dan Jaringan', 'laptop', 'Perangkat TIK dan jaringan']);
    }
    const locationCount = await database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM locations');
    if ((locationCount?.count ?? 0) === 0) {
      await database.runAsync('INSERT INTO locations (name, building, floor_room, description) VALUES (?, ?, ?, ?)', ['Ruang Kelas A1', 'Gedung A', 'Lantai 1', 'Ruang kelas utama']);
      await database.runAsync('INSERT INTO locations (name, building, floor_room, description) VALUES (?, ?, ?, ?)', ['Laboratorium Komputer', 'Gedung B', 'Lantai 2', 'Laboratorium praktikum']);
      await database.runAsync('INSERT INTO locations (name, building, floor_room, description) VALUES (?, ?, ?, ?)', ['Ruang Dosen', 'Gedung A', 'Lantai 2', 'Ruang kerja dosen']);
    }
    
    console.log('Database berhasil diinisialisasi');
  } catch (error) {
    console.error('Error saat inisialisasi database:', error);
    throw error;
  }
};
