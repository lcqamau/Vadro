import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const SupportScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Aide & Support</Text>
            <View style={{ width: 24 }} />
        </View>
        
        <ScrollView style={styles.content}>
            <Text style={styles.sectionTitle}>FAQ</Text>
            
            <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Comment créer un voyage ?</Text>
                <Text style={styles.faqAnswer}>Cliquez sur le bouton "+" vert en bas de l'écran principal pour commencer à créer ou générer un voyage.</Text>
            </View>

            <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Vadro Pro est-il gratuit ?</Text>
                <Text style={styles.faqAnswer}>Vadro est gratuit pour les voyageurs. Les outils Pro disposent d'un abonnement mensuel.</Text>
            </View>
            
            <Text style={styles.sectionTitle}>Contact</Text>
            <TouchableOpacity style={styles.contactBtn}>
                <Ionicons name="mail-outline" size={20} color="#fff" />
                <Text style={styles.btnText}>Envoyer un email</Text>
            </TouchableOpacity>
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
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, marginTop: 10, color: '#1A1A1A' },
  faqItem: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15 },
  faqQuestion: { fontWeight: 'bold', fontSize: 15, marginBottom: 5 },
  faqAnswer: { color: '#666', lineHeight: 20 },
  contactBtn: { flexDirection: 'row', backgroundColor: '#1A1A1A', padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default SupportScreen;
