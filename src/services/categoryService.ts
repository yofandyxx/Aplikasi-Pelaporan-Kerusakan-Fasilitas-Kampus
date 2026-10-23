// Service untuk manajemen kategori kerusakan fasilitas
// Menyediakan operasi CRUD dengan validasi dan query terparameterisasi

import { getDatabase } from '../database/database';
import { Category } from '../types';

/**
 * Mengambil semua kategori dari database
 * @returns Daftar kategori
 */
export const getAllCategories = async (): Promise<Category[]> => {
  const db = getDatabase();
  const rows = await db.getAllAsync<Category>('SELECT * FROM categories ORDER BY name ASC');
  return rows;
};

/**
 * Mengambil kategori berdasarkan id
 * @param id Id kategori
 * @returns Kategori atau null jika tidak ditemukan
 */
export const getCategoryById = async (id: number): Promise<Category | null> => {
  const db = getDatabase();
  const row = await db.getFirstAsync<Category>('SELECT * FROM categories WHERE id = ?', [id]);
  return row ?? null;
};

/**
 * Membuat kategori baru
 * @param category Data kategori tanpa id
 * @returns Id kategori yang baru dibuat
 */
export const createCategory = async (category: Omit<Category, 'id'>): Promise<number> => {
  // Validasi: nama wajib diisi
  if (!category.name || category.name.trim() === '') {
    throw new Error('Nama kategori wajib diisi');
  }

  const db = getDatabase();

  // Cek duplikat nama
  const existing = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM categories WHERE name = ?',
    [category.name.trim()]
  );
  if (existing) {
    throw new Error('Nama kategori sudah digunakan');
  }

  const result = await db.runAsync(
    'INSERT INTO categories (name, icon, description) VALUES (?, ?, ?)',
    [category.name.trim(), category.icon ?? '', category.description ?? '']
  );
  return result.lastInsertRowId;
};

/**
 * Memperbarui kategori
 * @param id Id kategori
 * @param category Data partial kategori
 */
export const updateCategory = async (id: number, category: Partial<Category>): Promise<void> => {
  const db = getDatabase();

  const existing = await db.getFirstAsync<Category>('SELECT * FROM categories WHERE id = ?', [id]);
  if (!existing) {
    throw new Error('Kategori tidak ditemukan');
  }

  const name = category.name !== undefined ? category.name.trim() : existing.name;
  if (name === '') {
    throw new Error('Nama kategori wajib diisi');
  }

  // Cek duplikat nama (kecuali dirinya sendiri)
  const duplicate = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM categories WHERE name = ? AND id != ?',
    [name, id]
  );
  if (duplicate) {
    throw new Error('Nama kategori sudah digunakan');
  }

  const icon = category.icon !== undefined ? category.icon : existing.icon;
  const description = category.description !== undefined ? category.description : existing.description;

  await db.runAsync(
    'UPDATE categories SET name = ?, icon = ?, description = ? WHERE id = ?',
    [name, icon, description, id]
  );
};

/**
 * Menghapus kategori
 * @param id Id kategori
 */
export const deleteCategory = async (id: number): Promise<void> => {
  const db = getDatabase();

  // Cek apakah masih digunakan di laporan
  const used = await isCategoryUsedInReports(id);
  if (used) {
    throw new Error('Kategori tidak dapat dihapus karena masih digunakan dalam laporan');
  }

  await db.runAsync('DELETE FROM categories WHERE id = ?', [id]);
};

/**
 * Mengecek apakah kategori masih digunakan dalam laporan kerusakan
 * @param id Id kategori
 * @returns true jika masih digunakan
 */
export const isCategoryUsedInReports = async (id: number): Promise<boolean> => {
  const db = getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM damage_reports WHERE category_id = ?',
    [id]
  );
  return (row?.count ?? 0) > 0;
};
