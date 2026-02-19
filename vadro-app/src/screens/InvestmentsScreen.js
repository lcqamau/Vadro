import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const InvestmentsScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Vadro Pro</Text>
            <View style={{ width: 24 }} />
        </View>
        
        <ScrollView style={styles.content}>
            <LinearGradient colors={['#00D668', '#00A852']} style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>Revenus totaux</Text>
                <Text style={styles.balanceAmount}>0,00 €</Text>
                <View style={styles.cardFooter}>
                    <Text style={styles.cardFooterText}>+0% ce mois-ci</Text>
                </View>
            </LinearGradient>

            <Text style={styles.sectionTitle}>Mes Services</Text>
            
            <View style={styles.menuGrid}>
                <TouchableOpacity style={styles.menuItem}>
                    <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
                        <Ionicons name="bar-chart-outline" size={24} color="#00D668" />
                    </View>
                    <Text style={styles.menuText}>Statistiques</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
                        <Ionicons name="people-outline" size={24} color="#2196F3" />
                    </View>
                    <Text style={styles.menuText}>Communauté</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <View style={[styles.iconBox, { backgroundColor: '#FFF3E0' }]}>
                        <Ionicons name="trophy-outline" size={24} color="#FF9800" />
                    </View>
                    <Text style={styles.menuText}>Objectifs</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.promoBox}>
                <Ionicons name="rocket-outline" size={32} color="#fff" />
                <View style={{ flex: 1 }}>
                    <Text style={styles.promoTitle}>Devenir Créateur Certifié</Text>
                    <Text style={styles.promoDesc}>Gagnez de l'argent en partageant vos meilleurs itinéraires.</Text>
                </View>
                <TouchableOpacity style={styles.btnSecondary}>
                    <Text style={{ fontWeight: 'bold' }}>Rejoindre</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff' },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  content: { padding: 20 },
  
  balanceCard: { padding: 25, borderRadius: 20, marginBottom: 30 },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600', textTransform: 'uppercase' },
  balanceAmount: { color: '#fff', fontSize: 36, fontWeight: 'bold', marginVertical: 10 },
  cardFooterText: { color: '#fff', fontSize: 13, fontWeight: '500' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#1A1A1A' },
  
  menuGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  menuItem: { width: (width - 60) / 3, alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, elevation: 2 },
  iconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  menuText: { fontSize: 12, fontWeight: '600', color: '#333' },

  promoBox: { flexDirection: 'row', backgroundColor: '#1A1A1A', borderRadius: 20, padding: 20, alignItems: 'center', gap: 15 },
  promoTitle: { color: '#fff', fontWeight: 'bold', fontSize: 15, marginBottom: 4 },
  promoDesc: { color: '#bbb', fontSize: 12, lineHeight: 16 },
  btnSecondary: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }
});

export default InvestmentsScreen;
