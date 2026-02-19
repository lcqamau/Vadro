import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const NotificationsScreen = ({ navigation }) => {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [promoEnabled, setPromoEnabled] = useState(true);

  const ToggleItem = ({ label, value, onValueChange }) => (
    <View style={styles.item}>
      <Text style={styles.label}>{label}</Text>
      <Switch 
        trackColor={{ false: "#767577", true: "#00D668" }}
        thumbColor={value ? "#fff" : "#f4f3f4"}
        onValueChange={onValueChange}
        value={value}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notifications</Text>
            <View style={{ width: 24 }} />
        </View>
        
        <ScrollView style={styles.content}>
            <Text style={styles.sectionTitle}>Préférences</Text>
            <View style={styles.section}>
                <ToggleItem 
                    label="Notifications Push" 
                    value={pushEnabled} 
                    onValueChange={setPushEnabled} 
                />
                <View style={styles.divider} />
                <ToggleItem 
                    label="Emails marketing" 
                    value={emailEnabled} 
                    onValueChange={setEmailEnabled} 
                />
            </View>

            <Text style={styles.sectionTitle}>Types de notifications</Text>
            <View style={styles.section}>
                <ToggleItem 
                    label="Nouvelles fonctionnalités" 
                    value={promoEnabled} 
                    onValueChange={setPromoEnabled} 
                />
                <View style={styles.divider} />
                <ToggleItem 
                    label="Rappels de voyage" 
                    value={true} 
                    onValueChange={() => {}} 
                />
            </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff' },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  content: { padding: 20 },
  sectionTitle: { fontSize: 13, color: '#666', marginBottom: 10,  textTransform: 'uppercase', marginLeft: 10 },
  section: { backgroundColor: '#fff', borderRadius: 10, overflow: 'hidden', marginBottom: 30 },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 },
  label: { fontSize: 16, color: '#1A1A1A' },
  divider: { height: 1, backgroundColor: '#E5E5EA', marginLeft: 15 }
});

export default NotificationsScreen;
