// Tema dan konstanta untuk aplikasi PPNP Maintenance
// Berisi warna, tipografi, spacing, dan konfigurasi tampilan aplikasi

import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

/**
 * Palet warna utama aplikasi
 */
export const Colors = {
  // Warna utama
  primary: '#4657e8',      // Indigo modern
  primaryLight: '#7180ff',
  primaryDark: '#26358f',
  
  // Warna aksen
  accent: '#13b8a6',       // Teal
  accentLight: '#22d3ee',
  accentDark: '#0891b2',
  
  // Warna sekunder
  secondary: '#8b5cf6',    // Ungu
  secondaryLight: '#a78bfa',
  secondaryDark: '#7c3aed',
  
  // Warna sukses, peringatan, bahaya
  success: '#10b981',      // Hijau
  successLight: '#34d399',
  successDark: '#059669',
  
  warning: '#f59e0b',      // Oranye
  warningLight: '#fbbf24',
  warningDark: '#d97706',
  
  danger: '#ef4444',       // Merah
  dangerLight: '#f87171',
  dangerDark: '#dc2626',
  
  // Warna netral
  white: '#ffffff',
  black: '#000000',
  background: '#f6f8fc',
  surface: '#ffffff',
  
  // Warna teks
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textTertiary: '#94a3b8',
  textLight: '#cbd5e1',
  
  // Warna border dan divider
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  divider: '#e2e8f0',
  
  // Warna overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
} as const;

/**
 * Warna berdasarkan status laporan
 */
export const StatusColors = {
  Baru: '#3b82f6',      // Biru
  Diproses: '#f59e0b',   // Oranye
  Selesai: '#10b981',    // Hijau
} as const;

/**
 * Warna berdasarkan tingkat prioritas
 */
export const PriorityColors = {
  Tinggi: '#ef4444',     // Merah
  Sedang: '#eab308',     // Kuning
  Rendah: '#22c55e',     // Hijau
} as const;

/**
 * Latar belakang warna berdasarkan status
 */
export const StatusBackgroundColors = {
  Baru: '#eff6ff',
  Diproses: '#fef3c7',
  Selesai: '#ecfdf5',
} as const;

/**
 * Latar belakang warna berdasarkan prioritas
 */
export const PriorityBackgroundColors = {
  Tinggi: '#fef2f2',
  Sedang: '#fefce8',
  Rendah: '#f0fdf4',
} as const;

/**
 * Tipografi
 */
export const Typography = {
  // Ukuran font
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
  },
  
  // Ketebalan font
  fontWeight: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  
  // Tinggi baris
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Spasi huruf
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
} as const;

/**
 * Spacing (jarak) aplikasi
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
  '6xl': 80,
} as const;

/**
 * Border radius (sudut melengkung)
 */
export const BorderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;

/**
 * Shadow (bayangan)
 */
export const Shadow = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;

/**
 * Ukuran layar
 */
export const ScreenSize = {
  width,
  height,
} as const;

/**
 * Konstanta aplikasi
 */
export const AppConstants = {
  appName: 'PPNP Maintenance',
  appVersion: '1.0.0',
  appDescription: 'Sistem Pelaporan Kerusakan Fasilitas Berbasis SQLite',
  
  // Konfigurasi database
  databaseName: 'ppnp_maintenance.db',
  
  // Konfigurasi gambar
  imageQuality: 0.7,
  maxImageSizeMB: 5,
  
  // Konfigurasi tanggal
  dateFormat: 'DD/MM/YYYY',
  dateTimeFormat: 'DD/MM/YYYY HH:mm',
  
  // Durasi animasi
  animationDuration: {
    fast: 200,
    base: 300,
    slow: 500,
  },
} as const;

/**
 * Teks label untuk status
 */
export const StatusLabels = {
  Baru: 'Baru',
  Diproses: 'Sedang Diproses',
  Selesai: 'Selesai',
} as const;

/**
 * Teks label untuk prioritas
 */
export const PriorityLabels = {
  Tinggi: 'Prioritas Tinggi',
  Sedang: 'Prioritas Sedang',
  Rendah: 'Prioritas Rendah',
} as const;

/**
 * Ikon untuk kategori (default)
 */
export const DefaultCategoryIcons = [
  'build',
  'flash',
  'water',
  'home',
  'tools',
  'warning',
  'construct',
  'wrench',
] as const;
