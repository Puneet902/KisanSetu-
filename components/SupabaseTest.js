import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { supabase } from '../src/lib/supabaseClient';

export default function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState('Testing...');
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setLoading(true);
      setConnectionStatus('Testing connection...');
      
      // Test basic connection
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(1);

      if (error) {
        setConnectionStatus('❌ Connection Failed');
        setError(`Error: ${error.message}`);
        console.error('Supabase Error:', error);
      } else {
        setConnectionStatus('✅ Connection Successful');
        setUserData(data);
        setError(null);
        console.log('Supabase Data:', data);
      }
    } catch (err) {
      setConnectionStatus('❌ Connection Error');
      setError(`Exception: ${err.message}`);
      console.error('Connection Exception:', err);
    } finally {
      setLoading(false);
    }
  };

  const testInsert = async () => {
    try {
      setLoading(true);
      const testUser = {
        name: 'Test User',
        phone: '1234567890',
        latitude: 16.4633906,
        longitude: 80.5076824,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('users')
        .insert([testUser])
        .select();

      if (error) {
        Alert.alert('Insert Failed', error.message);
        console.error('Insert Error:', error);
      } else {
        Alert.alert('Success', 'Test user inserted successfully!');
        console.log('Inserted Data:', data);
        testConnection(); // Refresh data
      }
    } catch (err) {
      Alert.alert('Error', err.message);
      console.error('Insert Exception:', err);
    } finally {
      setLoading(false);
    }
  };

  const testTableStructure = async () => {
    try {
      setLoading(true);
      
      // Get table info (this might not work in all Supabase setups)
      const { data, error } = await supabase
        .rpc('get_table_info', { table_name: 'users' });

      if (error) {
        console.log('RPC Error (expected):', error.message);
        Alert.alert('Info', 'Cannot fetch table structure via RPC. Check Supabase dashboard for table schema.');
      } else {
        console.log('Table Structure:', data);
        Alert.alert('Table Info', JSON.stringify(data, null, 2));
      }
    } catch (err) {
      console.log('Table structure test failed (expected):', err.message);
      Alert.alert('Info', 'Table structure test completed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Supabase Connection Test</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusTitle}>Connection Status:</Text>
        <Text style={[styles.status, connectionStatus.includes('✅') ? styles.success : styles.error]}>
          {connectionStatus}
        </Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error Details:</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {userData && (
        <View style={styles.dataContainer}>
          <Text style={styles.dataTitle}>Sample Data ({userData.length} records):</Text>
          <Text style={styles.dataText}>{JSON.stringify(userData, null, 2)}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={testConnection}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Connection</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.insertButton, loading && styles.buttonDisabled]} 
          onPress={testInsert}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Insert</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.infoButton, loading && styles.buttonDisabled]} 
          onPress={testTableStructure}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Table Info</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Environment Check:</Text>
        <Text style={styles.infoText}>
          URL: {process.env.EXPO_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
        </Text>
        <Text style={styles.infoText}>
          Key: {process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  status: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  success: {
    color: '#16a34a',
  },
  error: {
    color: '#dc2626',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 5,
  },
  errorText: {
    fontSize: 14,
    color: '#7f1d1d',
    fontFamily: 'monospace',
  },
  dataContainer: {
    backgroundColor: '#f0fdf4',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a',
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16a34a',
    marginBottom: 5,
  },
  dataText: {
    fontSize: 12,
    color: '#14532d',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  insertButton: {
    backgroundColor: '#16a34a',
  },
  infoButton: {
    backgroundColor: '#f59e0b',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});
