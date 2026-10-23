// Entry point aplikasi PPNP Maintenance
// Menginisialisasi database SQLite lalu merender AppNavigator

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase as initializeDatabase } from './src/database/database';

// Nama database yang digunakan aplikasi
export default function App() {
  const [dbReady, setDbReady] = useState<boolean>(false);

  useEffect(() => {
    // Inisialisasi database saat aplikasi pertama kali dijalankan
    const bootDatabase = async () => {
      try {
        await initializeDatabase();
        setDbReady(true);
      } catch (error) {
        console.error('Gagal menginisialisasi database:', error);
      }
    };

    bootDatabase();
  }, []);

  // Tampilkan loading selama database belum siap
  if (!dbReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return <AppNavigator />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
