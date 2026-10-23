// Tipe data untuk aplikasi PPNP Maintenance
// Berisi definisi semua entitas yang digunakan dalam sistem pelaporan kerusakan fasilitas

/**
 * Kategori kerusakan fasilitas
 */
export interface Category {
  id: number;
  name: string;
  icon: string;
  description: string;
}

/**
 * Lokasi fasilitas yang mengalami kerusakan
 */
export interface Location {
  id: number;
  name: string;
  building: string;
  floor_room: string;
  description: string;
}

/**
 * Tingkat prioritas perbaikan
 */
export type Priority = 'Rendah' | 'Sedang' | 'Tinggi';

/**
 * Status pelaporan kerusakan
 */
export type Status = 'Baru' | 'Diproses' | 'Selesai';

/**
 * Laporan kerusakan fasilitas
 */
export interface DamageReport {
  id: number;
  title: string;
  reporter_name: string;
  category_id: number;
  location_id: number;
  description: string;
  photo_uri: string | null;
  priority: Priority;
  status: Status;
  report_date: string;
  completed_date: string | null;
}

/**
 * Riwayat perbaikan untuk setiap laporan kerusakan
 */
export interface RepairHistory {
  id: number;
  report_id: number;
  previous_status: Status;
  new_status: Status;
  technician_name: string;
  action_description: string;
  notes: string | null;
  repair_photo_uri: string | null;
  action_date: string;
}

/**
 * Tipe data untuk statistik laporan
 */
export interface DamageReportStatistics {
  total: number;
  baru: number;
  diproses: number;
  selesai: number;
  tinggi: number;
  sedang: number;
  rendah: number;
}

/**
 * Tipe data untuk statistik per kategori
 */
export interface CategoryStatistics {
  category_id: number;
  category_name: string;
  total: number;
}

/**
 * Tipe data untuk statistik per lokasi
 */
export interface LocationStatistics {
  location_id: number;
  location_name: string;
  building: string;
  total: number;
}

/**
 * Tipe data gabungan untuk tampilan laporan dengan relasi
 */
export interface DamageReportWithRelations extends DamageReport {
  category: Category;
  location: Location;
}

/**
 * Tipe data gabungan untuk riwayat perbaikan dengan relasi laporan
 */
export interface RepairHistoryWithReport extends RepairHistory {
  report: DamageReport;
}

/**
 * Tipe data untuk form input laporan kerusakan baru
 */
export interface DamageReportInput {
  title: string;
  reporter_name: string;
  category_id: number;
  location_id: number;
  description: string;
  photo_uri?: string | null;
  priority: Priority;
}

/**
 * Tipe data untuk form update status laporan
 */
export interface StatusUpdateInput {
  report_id: number;
  new_status: Status;
  technician_name: string;
  action_description: string;
  notes?: string | null;
  repair_photo_uri?: string | null;
}
