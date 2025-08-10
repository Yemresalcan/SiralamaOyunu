import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import leaderboardService from '../services/leaderboard-service';

const { width, height } = Dimensions.get('window');

interface UsernameModalProps {
  visible: boolean;
  onComplete: (username: string) => void;
}

export function UsernameModal({ visible, onComplete }: UsernameModalProps) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateUsername = (text: string): boolean => {
    // Kullanıcı adı kuralları
    if (text.length < 3) {
      setError('Kullanıcı adı en az 3 karakter olmalı');
      return false;
    }
    if (text.length > 15) {
      setError('Kullanıcı adı en fazla 15 karakter olmalı');
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(text)) {
      setError('Sadece harf, rakam ve alt çizgi kullanabilirsiniz');
      return false;
    }
    setError('');
    return true;
  };

  const handleTextChange = (text: string) => {
    setUsername(text);
    if (error) {
      validateUsername(text);
    }
  };

  const handleSubmit = async () => {
    if (!validateUsername(username)) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    try {
      // Kullanıcı adı müsaitliğini kontrol et
      const isAvailable = await leaderboardService.isUsernameAvailable(username);
      
      if (!isAvailable) {
        setError('Bu kullanıcı adı zaten kullanılıyor');
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setLoading(false);
        return;
      }

      // Kullanıcı adını kaydet
      await leaderboardService.saveUsername(username);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      onComplete(username);
    } catch (error) {
      console.error('Kullanıcı adı kaydedilemedi:', error);
      Alert.alert(
        'Hata',
        'Kullanıcı adı kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.',
        [{ text: 'Tamam' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <LinearGradient
        colors={['#87CEEB', '#4A90E2', '#1E90FF']}
        style={styles.container}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.welcomeEmoji}>🎮</Text>
              <Text style={styles.title}>ORDIX'e Hoş Geldin!</Text>
              <Text style={styles.subtitle}>
                Lider tablosunda görünecek kullanıcı adını seç
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, error ? styles.inputError : null]}
                placeholder="Kullanıcı adı"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={username}
                onChangeText={handleTextChange}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={15}
                editable={!loading}
              />
              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : (
                <Text style={styles.helperText}>
                  3-15 karakter, harf, rakam ve alt çizgi
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                (!username || loading) && styles.buttonDisabled
              ]}
              onPress={handleSubmit}
              disabled={!username || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Başla</Text>
                  <Text style={styles.buttonEmoji}>🚀</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <Text style={styles.infoEmoji}>💡</Text>
              <Text style={styles.infoText}>
                Kullanıcı adın tüm oyuncular tarafından görülecek
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </Modal>
  );
}

export default UsernameModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 20,
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    maxWidth: 400,
    alignSelf: 'center',
    width: '90%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeEmoji: {
    fontSize: 60,
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 25,
  },
  input: {
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
    borderRadius: 15,
    padding: 18,
    fontSize: 18,
    color: '#2C3E50',
    borderWidth: 2,
    borderColor: 'rgba(74, 144, 226, 0.3)',
    textAlign: 'center',
    fontWeight: '600',
  },
  inputError: {
    borderColor: '#E74C3C',
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
  },
  helperText: {
    fontSize: 12,
    color: '#95A5A6',
    textAlign: 'center',
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#E74C3C',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#4A90E2',
    borderRadius: 15,
    paddingVertical: 18,
    paddingHorizontal: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    minWidth: 200,
  },
  buttonDisabled: {
    backgroundColor: '#BDC3C7',
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 10,
  },
  buttonEmoji: {
    fontSize: 22,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    padding: 15,
    borderRadius: 12,
    width: '100%',
  },
  infoEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  infoText: {
    fontSize: 13,
    color: '#34495E',
    flex: 1,
    lineHeight: 18,
  },
});
