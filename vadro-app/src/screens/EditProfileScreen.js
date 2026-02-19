import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import client from '../api/client';

const EditProfileScreen = ({ navigation, route }) => {
  const [user, setUser] = useState(route.params?.user || {});
  const [username, setUsername] = useState(user.username || '');
  const [bio, setBio] = useState(user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [loading, setLoading] = useState(false);

  // Fonction UPLOAD Image
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Besoin d\'accès à la galerie.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
        setLoading(true);
        const localUri = result.assets[0].uri;
        
        const formData = new FormData();
        formData.append('image', {
            uri: localUri,
            name: 'avatar.jpg',
            type: 'image/jpeg',
        });

        try {
            const response = await client.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            // Construction URL complète
            const baseUrl = client.defaults.baseURL.replace('/api', ''); 
            const serverImageUrl = baseUrl + response.data.imageUrl;
            setAvatarUrl(serverImageUrl);
        } catch (error) {
            console.error("Upload error:", error);
            Alert.alert("Erreur", "Echec de l'upload.");
        } finally {
            setLoading(false);
        }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await client.put('/users/profile', {
        username,
        bio,
        avatarUrl
      });
      Alert.alert("Succès", "Profil mis à jour !");
      navigation.goBack();
    } catch (error) {
      console.error("Update profile error:", error);
      Alert.alert("Erreur", "Impossible de mettre à jour le profil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{flex: 1}}>
        {/* HEADER */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Ionicons name="close" size={24} color="#1A1A1A" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Modifier le profil</Text>
            <TouchableOpacity onPress={handleSave} disabled={loading}>
                {loading ? <ActivityIndicator color="#00D668" /> : <Text style={styles.saveText}>Enregistrer</Text>}
            </TouchableOpacity>
        </View>

        <View style={styles.content}>
            {/* AVATAR */}
            <View style={styles.avatarContainer}>
                <Image 
                    source={{ uri: avatarUrl || 'https://ui-avatars.com/api/?name=User&background=00D668&color=fff' }} 
                    style={styles.avatar} 
                />
                <TouchableOpacity style={styles.editAvatarBtn} onPress={pickImage}>
                    <Ionicons name="camera" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* CHAMPS */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>Nom d'utilisateur</Text>
                <TextInput 
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Votre pseudo"
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Bio</Text>
                <TextInput 
                    style={[styles.input, styles.textArea]}
                    value={bio}
                    onChangeText={setBio}
                    placeholder="Dites quelque chose sur vous..."
                    multiline
                />
            </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  headerTitle: { fontSize: 16, fontWeight: 'bold' },
  backBtn: { padding: 5 },
  saveText: { color: '#00D668', fontWeight: 'bold', fontSize: 16 },
  
  content: { padding: 20, alignItems: 'center' },
  
  avatarContainer: { position: 'relative', marginBottom: 30 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F0F0F0' },
  editAvatarBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#00D668', width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff' },

  formGroup: { width: '100%', marginBottom: 20 },
  label: { fontSize: 14, color: '#666', marginBottom: 8, fontWeight: '600' },
  input: { backgroundColor: '#F9F9F9', padding: 15, borderRadius: 12, fontSize: 16, color: '#1A1A1A', borderWidth: 1, borderColor: '#F0F0F0' },
  textArea: { height: 100, textAlignVertical: 'top' }
});

export default EditProfileScreen;
