// Definisi skema database SQLite untuk aplikasi PPNP Maintenance
// Berisi struktur tabel dan relasi untuk sistem pelaporan kerusakan fasilitas

/**
 * Skema SQL untuk pembuatan tabel-tabel database
 */
export const CREATE_TABLES = `
  -- Tabel kategori kerusakan
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    icon TEXT,
    description TEXT
  );

  -- Tabel lokasi fasilitas
  CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    building TEXT NOT NULL,
    floor_room TEXT NOT NULL,
    description TEXT,
    UNIQUE(name, building, floor_room)
  );

  -- Tabel laporan kerusakan fasilitas
  CREATE TABLE IF NOT EXISTS damage_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    reporter_name TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    location_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    photo_uri TEXT,
    priority TEXT CHECK(priority IN ('Rendah', 'Sedang', 'Tinggi')) NOT NULL,
    status TEXT CHECK(status IN ('Baru', 'Diproses', 'Selesai')) NOT NULL DEFAULT 'Baru',
    report_date TEXT NOT NULL,
    completed_date TEXT,
    FOREIGN KEY(category_id) REFERENCES categories(id),
    FOREIGN KEY(location_id) REFERENCES locations(id)
  );

  -- Tabel riwayat perbaikan
  CREATE TABLE IF NOT EXISTS repair_histories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    previous_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    technician_name TEXT NOT NULL,
    action_description TEXT NOT NULL,
    notes TEXT,
    repair_photo_uri TEXT,
    action_date TEXT NOT NULL,
    FOREIGN KEY(report_id) REFERENCES damage_reports(id)
  );
`;

/**
 * Nama-nama tabel yang digunakan dalam database
 */
export const TABLE_NAMES = {
  CATEGORIES: 'categories',
  LOCATIONS: 'locations',
  DAMAGE_REPORTS: 'damage_reports',
  REPAIR_HISTORIES: 'repair_histories',
} as const;
