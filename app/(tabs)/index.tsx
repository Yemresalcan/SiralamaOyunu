import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Animated, SafeAreaView, Dimensions, LinearGradient } from 'react-native';
import { Audio } from 'expo-av';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

// Fisher-Yates shuffle algoritması
const shuffleArray = (array) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

// 1-30 arası rastgele 10 sayı seç
const generateRandomNumbers = () => {
  const allNumbers = Array.from({ length: 30 }, (_, i) => i + 1); // 1-30 arası tüm sayılar
  const shuffled = shuffleArray([...allNumbers]);
  return shuffled.slice(0, 10); // İlk 10 tanesini al
};

// Sıralı sayılar (1-10)
const generateSequentialNumbers = () => {
  return Array.from({ length: 10 }, (_, i) => i + 1); // 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
};

// Yüzen Parçacık Bileşeni
const FloatingParticle = ({ delay, emoji }) => {
  const translateY = useRef(new Animated.Value(height)).current;
  const translateX = useRef(new Animated.Value(Math.random() * width)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      translateY.setValue(height + 50);
      translateX.setValue(Math.random() * width);
      opacity.setValue(0);
      rotate.setValue(0);

      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -100,
            duration: 8000,
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: 360,
            duration: 8000,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };
    animate();
  }, []);

  const rotateInterpolate = rotate.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.floatingParticle,
        {
          opacity,
          transform: [
            { translateX },
            { translateY },
            { rotate: rotateInterpolate },
          ],
        },
      ]}
    >
      <Text style={styles.particleEmoji}>{emoji}</Text>
    </Animated.View>
  );
};

// Ayarlar Sayfası
const SettingsScreen = ({ 
  onBack, 
  musicEnabled, 
  onToggleMusic,
  soundEnabled,
  setSoundEnabled,
  hapticEnabled,
  setHapticEnabled,
  difficulty,
  setDifficulty,
  theme,
  setTheme
}) => {
  const slideAnim = useRef(new Animated.Value(width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Ana menü için ses fonksiyonu
  const playSound = async (type) => {
    if (!musicEnabled || !soundEnabled) return;
    
    try {
      if (type === 'button') {
        if (hapticEnabled) {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        
        // Basit beep sesi
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
      }
    } catch (error) {
      console.log('Ses/Haptic feedback çalınamadı:', error);
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleBack = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onBack());
  };

  return (
    <View style={styles.settingsContainer}>
      <ExpoLinearGradient
        colors={['#87CEEB', '#98D8E8', '#B0E0E6']}
        style={styles.settingsBackground}
      >
        {/* Arka Plan Bulutları */}
        <View style={styles.cloudsContainer}>
          <Text style={styles.cloud}>☁️</Text>
          <Text style={[styles.cloud, styles.cloud2]}>☁️</Text>
          <Text style={[styles.cloud, styles.cloud3]}>☁️</Text>
        </View>

        <Animated.View style={[
          styles.settingsContent,
          { 
            transform: [{ translateX: slideAnim }],
            opacity: fadeAnim,
          }
        ]}>
          <View style={styles.settingsHeader}>
            <TouchableOpacity 
              style={styles.settingsBackButton} 
              onPress={() => {
                playSound('button');
                handleBack();
              }}
            >
              <ExpoLinearGradient
                colors={['#FF6B35', '#F7931E', '#FFD700']}
                style={styles.settingsBackButtonGradient}
              >
                <Text style={styles.settingsBackButtonText}>← GERİ</Text>
              </ExpoLinearGradient>
            </TouchableOpacity>
            <Text style={styles.settingsTitle}>⚙️ AYARLAR</Text>
          </View>

          <View style={styles.settingsOptionsContainer}>
            {/* Ses Ayarları */}
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>🔊 SES AYARLARI</Text>
              
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>🎵 Müzik</Text>
                <TouchableOpacity 
                  style={[styles.toggleButton, musicEnabled && styles.toggleButtonActive]}
                  onPress={() => {
                    playSound('button');
                    onToggleMusic();
                  }}
                >
                  <Text style={[styles.toggleText, musicEnabled && styles.toggleTextActive]}>
                    {musicEnabled ? 'AÇIK' : 'KAPALI'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>🔊 Ses Efektleri</Text>
                <TouchableOpacity 
                  style={[styles.toggleButton, soundEnabled && styles.toggleButtonActive]}
                  onPress={() => {
                    playSound('button');
                    setSoundEnabled(!soundEnabled);
                  }}
                >
                  <Text style={[styles.toggleText, soundEnabled && styles.toggleTextActive]}>
                    {soundEnabled ? 'AÇIK' : 'KAPALI'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>📳 Titreşim</Text>
                <TouchableOpacity 
                  style={[styles.toggleButton, hapticEnabled && styles.toggleButtonActive]}
                  onPress={() => {
                    playSound('button');
                    setHapticEnabled(!hapticEnabled);
                  }}
                >
                  <Text style={[styles.toggleText, hapticEnabled && styles.toggleTextActive]}>
                    {hapticEnabled ? 'AÇIK' : 'KAPALI'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Zorluk Ayarları */}
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>🎯 ZORLUK SEVİYESİ</Text>
              
              <View style={styles.difficultyContainer}>
                {[
                  { key: 'easy', label: '😊 KOLAY', desc: 'Daha fazla bonus tur' },
                  { key: 'normal', label: '😐 NORMAL', desc: 'Standart oyun' },
                  { key: 'hard', label: '😤 ZOR', desc: 'Daha az süre' }
                ].map((diff) => (
                  <TouchableOpacity 
                    key={diff.key}
                    style={[styles.difficultyButton, difficulty === diff.key && styles.difficultyButtonActive]}
                    onPress={() => {
                      playSound('button');
                      setDifficulty(diff.key);
                    }}
                  >
                    <ExpoLinearGradient
                      colors={difficulty === diff.key ? 
                        ['#FF4757', '#FF3742', '#FF6B7A'] : 
                        ['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.6)', 'rgba(255,255,255,0.8)']
                      }
                      style={styles.difficultyButtonGradient}
                    >
                      <Text style={[styles.difficultyLabel, difficulty === diff.key && styles.difficultyLabelActive]}>
                        {diff.label}
                      </Text>
                      <Text style={[styles.difficultyDesc, difficulty === diff.key && styles.difficultyDescActive]}>
                        {diff.desc}
                      </Text>
                    </ExpoLinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Tema Ayarları */}
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>🎨 TEMA</Text>
              
              <View style={styles.themeContainer}>
                {[
                  { key: 'sky', label: '☁️ GÖKYÜZÜ', colors: ['#87CEEB', '#98D8E8'] },
                  { key: 'dark', label: '🌙 GECE', colors: ['#2C3E50', '#34495E'] },
                  { key: 'colorful', label: '🌈 RENKLİ', colors: ['#FF6B6B', '#4ECDC4'] }
                ].map((themeOption) => (
                  <TouchableOpacity 
                    key={themeOption.key}
                    style={[styles.themeButton, theme === themeOption.key && styles.themeButtonActive]}
                    onPress={() => {
                      playSound('button');
                      setTheme(themeOption.key);
                    }}
                  >
                    <ExpoLinearGradient
                      colors={themeOption.colors}
                      style={styles.themeButtonGradient}
                    >
                      <Text style={[styles.themeLabel, theme === themeOption.key && styles.themeLabelActive]}>
                        {themeOption.label}
                      </Text>
                    </ExpoLinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.saveSettingsButton} 
            onPress={() => {
              playSound('button');
              handleBack();
            }}
          >
            <ExpoLinearGradient
              colors={['#58D68D', '#27AE60', '#7DCEA0']}
              style={styles.saveSettingsButtonGradient}
            >
              <Text style={styles.saveSettingsButtonText}>💾 KAYDET VE ÇIKIŞ</Text>
            </ExpoLinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ExpoLinearGradient>
    </View>
  );
};

// Nasıl Oynanır Sayfası
const HowToPlayScreen = ({ onBack }) => {
  const slideAnim = useRef(new Animated.Value(width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleBack = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onBack());
  };

     return (
     <View style={styles.howToPlayContainer}>
       <ExpoLinearGradient
         colors={['#1a1a2e', '#16213e', '#0f3460']}
         style={styles.howToPlayGradient}
       >
        <Animated.View style={[
          styles.howToPlayContent,
          { 
            transform: [{ translateX: slideAnim }],
            opacity: fadeAnim,
          }
        ]}>
          <View style={styles.howToPlayHeader}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>← GERİ</Text>
            </TouchableOpacity>
            <Text style={styles.howToPlayTitle}>🎓 NASIL OYNANIR?</Text>
          </View>

          <View style={styles.rulesContainer}>
            {[
              { icon: '🎯', title: 'AMAÇ', text: 'Ekranda beliren sayıları küçükten büyüğe doğru sırala!' },
              { icon: '📍', title: 'YERLEŞTİRME', text: 'Sol taraftaki 1-10 pozisyonlarına sayıları sırayla yerleştir.' },
              { icon: '⭐', title: 'PUANLAMA', text: 'Her doğru yerleştirme 10 puan! Bonus turlarda 5 puan.' },
              { icon: '🎉', title: 'BONUS TUR', text: 'Her 7. oyunda sayılar 1-10 arası sıralı gelir. Çok kolay!' },
              { icon: '❌', title: 'OYUN SONU', text: 'Yanlış sıralama yaparsanız oyun biter. Tekrar deneyin!' },
            ].map((rule, index) => (
              <Animated.View 
                key={index} 
                style={[
                  styles.ruleItem,
                  { 
                    opacity: fadeAnim,
                    transform: [{ 
                      translateX: slideAnim.interpolate({
                        inputRange: [0, width],
                        outputRange: [0, 100],
                      })
                    }]
                  }
                ]}
              >
                <View style={styles.ruleIconContainer}>
                  <Text style={styles.ruleIcon}>{rule.icon}</Text>
                </View>
                <View style={styles.ruleContent}>
                  <Text style={styles.ruleTitle}>{rule.title}</Text>
                  <Text style={styles.ruleText}>{rule.text}</Text>
                </View>
              </Animated.View>
            ))}
          </View>

          <View style={styles.exampleContainer}>
            <Text style={styles.exampleTitle}>💡 ÖRNEK</Text>
            <Text style={styles.exampleText}>Gelen Sayılar: 15, 3, 28, 7</Text>
            <Text style={styles.exampleArrow}>⬇️</Text>
            <Text style={styles.exampleResult}>Doğru Sıralama: 3 → 7 → 15 → 28</Text>
          </View>

          <TouchableOpacity style={styles.startFromHowToButton} onPress={handleBack}>
            <ExpoLinearGradient
              colors={['#ff6b6b', '#ff8e8e', '#ff6b6b']}
              style={styles.startButtonGradient}
            >
              <Text style={styles.startFromHowToButtonText}>🚀 HADI OYNAYALIM!</Text>
            </ExpoLinearGradient>
          </TouchableOpacity>
                 </Animated.View>
       </ExpoLinearGradient>
     </View>
  );
};

// Profesyonel Oyun Menüsü
const MainMenu = ({ onStartGame, onHowToPlay, onSettings, musicEnabled, onToggleMusic }) => {
  const titleBounce = useRef(new Animated.Value(1)).current;
  const buttonFloat = useRef(new Animated.Value(0)).current;
  const characterBounce = useRef(new Animated.Value(1)).current;
  const sparkleRotate = useRef(new Animated.Value(0)).current;

  // Ana menü için ses fonksiyonu - Haptic feedback + Basit ses
  const playSound = async (type) => {
    if (!musicEnabled) return;
    
    try {
      if (type === 'button') {
        // Haptic feedback
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        
        // Basit beep sesi
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
        
        console.log('🔊 Buton ses + haptic feedback çalındı');
      }
    } catch (error) {
      console.log('Ses/Haptic feedback çalınamadı:', error);
    }
  };

  useEffect(() => {
    // Başlık bounce animasyonu
    const bounceTitle = () => {
      Animated.sequence([
        Animated.timing(titleBounce, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(titleBounce, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]).start(() => bounceTitle());
    };

    // Buton yüzen animasyonu
    const floatButtons = () => {
      Animated.sequence([
        Animated.timing(buttonFloat, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(buttonFloat, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start(() => floatButtons());
    };

    // Karakter bounce
    const bounceCharacter = () => {
      Animated.sequence([
        Animated.timing(characterBounce, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(characterBounce, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => bounceCharacter());
    };

    // Işıltı döndürme
    const rotateSparkle = () => {
      Animated.timing(sparkleRotate, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      }).start(() => {
        sparkleRotate.setValue(0);
        rotateSparkle();
      });
    };

    bounceTitle();
    floatButtons();
    bounceCharacter();
    rotateSparkle();
  }, []);

  const buttonFloatY = buttonFloat.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const sparkleRotation = sparkleRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

        return (
     <View style={styles.menuContainer}>
       <ExpoLinearGradient
         colors={['#87CEEB', '#98D8E8', '#B0E0E6']}
         style={styles.menuBackground}
       >
         {/* Arka Plan Bulutları */}
         <View style={styles.cloudsContainer}>
           <Text style={styles.cloud}>☁️</Text>
           <Text style={[styles.cloud, styles.cloud2]}>☁️</Text>
           <Text style={[styles.cloud, styles.cloud3]}>☁️</Text>
         </View>

         {/* Işıltı Efektleri */}
         <Animated.View style={[
           styles.sparkleContainer,
           { transform: [{ rotate: sparkleRotation }] }
         ]}>
           <Text style={styles.sparkle}>✨</Text>
           <Text style={[styles.sparkle, styles.sparkle2]}>⭐</Text>
           <Text style={[styles.sparkle, styles.sparkle3]}>💫</Text>
         </Animated.View>

         {/* Müzik Butonu */}
         <TouchableOpacity 
           style={styles.musicButton} 
           onPress={() => {
             playSound('button');
             onToggleMusic();
           }}
         >
           <ExpoLinearGradient
             colors={['#FFD700', '#FFA500', '#FF8C00']}
             style={styles.musicButtonGradient}
           >
             <Text style={styles.musicButtonText}>{musicEnabled ? '🔊' : '🔇'}</Text>
           </ExpoLinearGradient>
         </TouchableOpacity>

         <View style={styles.menuContent}>
           {/* Oyun Başlığı */}
           <Animated.View style={[
             styles.titleContainer,
             { transform: [{ scale: titleBounce }] }
           ]}>
             <ExpoLinearGradient
               colors={['#FF6B35', '#F7931E', '#FFD700']}
               style={styles.titleBackground}
             >
               <Text style={styles.gameTitle}>SAYI</Text>
               <Text style={styles.gameTitle}>SIRALAMA</Text>
             </ExpoLinearGradient>
           </Animated.View>

           {/* Karakter Bölümü */}
           <Animated.View style={[
             styles.characterContainer,
             { transform: [{ scale: characterBounce }] }
           ]}>
             <View style={styles.numbersRow}>
               <Text style={styles.numberCharacter}>1️⃣</Text>
               <Text style={styles.numberCharacter}>2️⃣</Text>
               <Text style={styles.numberCharacter}>3️⃣</Text>
               <Text style={styles.numberCharacter}>4️⃣</Text>
               <Text style={styles.numberCharacter}>5️⃣</Text>
             </View>
           </Animated.View>

           {/* Ana Butonlar */}
           <Animated.View style={[
             styles.mainButtonsContainer,
             { transform: [{ translateY: buttonFloatY }] }
           ]}>
                           {/* OYNA Butonu */}
              <TouchableOpacity 
                style={styles.playButton} 
                onPress={() => {
                  playSound('button');
                  onStartGame();
                }}
              >
                <ExpoLinearGradient
                  colors={['#FF4757', '#FF3742', '#FF6B7A']}
                  style={styles.playButtonGradient}
                >
                  <View style={styles.buttonShadow} />
                  <Text style={styles.playButtonText}>OYNA</Text>
                </ExpoLinearGradient>
              </TouchableOpacity>

              {/* NASIL OYNANIR Butonu */}
              <TouchableOpacity 
                style={styles.howToPlayButton} 
                onPress={() => {
                  playSound('button');
                  onHowToPlay();
                }}
              >
                <ExpoLinearGradient
                  colors={['#5DADE2', '#3498DB', '#7FB3D3']}
                  style={styles.howToPlayGradient}
                >
                  <View style={styles.buttonShadow} />
                  <Text style={styles.howToPlayButtonText}>📚 NASIL OYNANIR</Text>
                </ExpoLinearGradient>
              </TouchableOpacity>

              {/* AYARLAR Butonu */}
              <TouchableOpacity 
                style={styles.settingsButton}
                onPress={() => {
                  playSound('button');
                  onSettings();
                }}
              >
                <ExpoLinearGradient
                  colors={['#58D68D', '#27AE60', '#7DCEA0']}
                  style={styles.settingsGradient}
                >
                  <View style={styles.buttonShadow} />
                  <Text style={styles.settingsButtonText}>⚙️ AYARLAR</Text>
                </ExpoLinearGradient>
              </TouchableOpacity>
           </Animated.View>

           {/* Alt İkonlar */}
           <View style={styles.bottomIconsContainer}>
             <TouchableOpacity 
               style={styles.bottomIcon}
               onPress={() => playSound('button')}
             >
               <ExpoLinearGradient
                 colors={['#F39C12', '#E67E22', '#F4D03F']}
                 style={styles.bottomIconGradient}
               >
                 <Text style={styles.bottomIconText}>🏆</Text>
               </ExpoLinearGradient>
             </TouchableOpacity>
             
             <TouchableOpacity 
               style={styles.bottomIcon}
               onPress={() => playSound('button')}
             >
               <ExpoLinearGradient
                 colors={['#9B59B6', '#8E44AD', '#BB8FCE']}
                 style={styles.bottomIconGradient}
               >
                 <Text style={styles.bottomIconText}>📊</Text>
               </ExpoLinearGradient>
             </TouchableOpacity>
             
             <TouchableOpacity 
               style={styles.bottomIcon}
               onPress={() => playSound('button')}
             >
               <ExpoLinearGradient
                 colors={['#E74C3C', '#C0392B', '#F1948A']}
                 style={styles.bottomIconGradient}
               >
                 <Text style={styles.bottomIconText}>🛒</Text>
               </ExpoLinearGradient>
             </TouchableOpacity>
           </View>
         </View>
       </ExpoLinearGradient>
     </View>
   );
};

export default function GameScreen() {
  const [currentScreen, setCurrentScreen] = useState('menu');
  const [numberList, setNumberList] = useState([]);
  const [numbersToPlace, setNumbersToPlace] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [wronglyPlaced, setWronglyPlaced] = useState(null);
  const [gameCount, setGameCount] = useState(0);
  const [isEasyRound, setIsEasyRound] = useState(false);
  const [sound, setSound] = useState(null);
  const [musicEnabled, setMusicEnabled] = useState(true);
  
  // Ayarlar state'leri
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [difficulty, setDifficulty] = useState('normal'); // 'easy', 'normal', 'hard'
  const [theme, setTheme] = useState('sky'); // 'sky', 'dark', 'colorful'

  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadMusic();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const loadMusic = async () => {
    try {
      console.log('Müzik sistemi hazır');
    } catch (error) {
      console.log('Müzik yüklenemedi:', error);
    }
  };

  const toggleMusic = () => {
    setMusicEnabled(!musicEnabled);
  };

  // Oyun ekranı için ses fonksiyonu - Haptic feedback + Ses efektleri
  const playSound = async (type) => {
    if (!musicEnabled) return;
    
    try {
      if (type === 'button') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        
        // Buton ses efekti
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
        
        console.log('🔊 Buton ses + haptic feedback');
      } else if (type === 'correct') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Başarı ses efekti (yükselen ton)
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5
        oscillator.frequency.exponentialRampToValueAtTime(784, audioContext.currentTime + 0.2); // G5
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        
        console.log('✅ Doğru yerleştirme ses + haptic feedback');
      } else if (type === 'wrong') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        
        // Hata ses efekti (düşen ton)
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
        
        console.log('❌ Yanlış yerleştirme ses + haptic feedback');
      }
    } catch (error) {
      console.log('Ses/Haptic feedback çalınamadı:', error);
    }
  };

  const popIn = () => {
    scaleAnim.setValue(0);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const startGame = () => {
    console.log('🚀 Oyun başlatılıyor...');
    setCurrentScreen('game');
    initializeGame();
  };

  const showHowToPlay = () => {
    setCurrentScreen('howToPlay');
  };

  const showSettings = () => {
    setCurrentScreen('settings');
  };

  const backToMenu = () => {
    setCurrentScreen('menu');
    setGameCount(0);
    setScore(0);
    setIsEasyRound(false);
    setNumberList([]);
    setNumbersToPlace([]);
    setCurrentNumber(null);
    setGameOver(false);
    setWronglyPlaced(null);
  };

  const initializeGame = () => {
    const newGameCount = gameCount + 1;
    setGameCount(newGameCount);
    
    const isEasy = newGameCount % 7 === 0;
    setIsEasyRound(isEasy);
    
    let numbersToUse;
    if (isEasy) {
      numbersToUse = generateSequentialNumbers();
      Alert.alert(
        "🎉 BONUS TUR!", 
        "Bu tur kolay! Sayılar 1'den 10'a kadar sıralı gelecek.", 
        [{ text: "Harika! 🚀", onPress: () => {} }]
      );
    } else {
      numbersToUse = generateRandomNumbers();
    }
    
    const shuffledNumbers = shuffleArray([...numbersToUse]);
    
    console.log('🎮 Oyun başlatılıyor:', {
      gameCount: newGameCount,
      isEasy,
      numbersToUse,
      shuffledNumbers
    });
    
    setNumberList(new Array(10).fill(undefined));
    setNumbersToPlace(shuffledNumbers);
    setCurrentNumber(shuffledNumbers[0]);
    setScore(score);
    setGameOver(false);
    setWronglyPlaced(null);
  };

  const resetGame = () => {
    setGameCount(0);
    setScore(0);
    setIsEasyRound(false);
    initializeGame();
  };

  useEffect(() => {
    if (currentScreen === 'game' && numbersToPlace.length === 0) {
      initializeGame();
    }
  }, [currentScreen]);

  useEffect(() => {
    if (currentNumber !== null) {
      popIn();
    }
  }, [currentNumber]);

  const handleSlotPress = (slotIndex) => {
    console.log('🎯 Slot tıklandı:', slotIndex);
    console.log('🎮 Oyun durumu:', { gameOver, currentNumber, numberList });
    
    if (gameOver || currentNumber === null) {
      console.log('❌ Oyun bitti veya sayı yok');
      return;
    }

    if (numberList[slotIndex] !== undefined) {
      console.log('❌ Bu slot dolu');
      return;
    }

    console.log('✅ Sayı yerleştiriliyor:', currentNumber, 'slot:', slotIndex);

    const newList = [...numberList];
    newList[slotIndex] = currentNumber;

    const filledNumbers = newList.filter(n => n !== undefined);
    const isCorrectOrder = filledNumbers.every((num, index) => {
      if (index === 0) return true;
      return num > filledNumbers[index - 1];
    });

    console.log('📊 Sıralama kontrolü:', { filledNumbers, isCorrectOrder });

    if (isCorrectOrder) {
      playSound('correct');
      setNumberList(newList);
      const points = isEasyRound ? 5 : 10;
      setScore(score + points);
      
      const remainingNumbers = numbersToPlace.slice(1);
      setNumbersToPlace(remainingNumbers);
      
      console.log('✅ Doğru yerleştirme! Kalan sayılar:', remainingNumbers);
      
      if (remainingNumbers.length === 0) {
        setGameOver(true);
        setCurrentNumber(null);
        const bonusMessage = isEasyRound ? " 🎉 (Bonus Tur Tamamlandı!)" : "";
        Alert.alert(
          "🎊 TEBRİKLER!", 
          `Oyunu bitirdiniz!${bonusMessage}\n🏆 Skorunuz: ${score + points}`, 
          [
            { text: "🚀 Devam Et", onPress: initializeGame },
            { text: "🏠 Ana Menü", onPress: backToMenu }
          ]
        );
      } else {
        setCurrentNumber(remainingNumbers[0]);
      }
    } else {
      playSound('wrong');
      setNumberList(newList);
      setWronglyPlaced({ value: currentNumber, index: slotIndex });
      setGameOver(true);
      console.log('❌ Yanlış yerleştirme!');
      Alert.alert(
        "💥 OYUN BİTTİ!", 
        `Yanlış yerleştirdiniz! Sayılar küçükten büyüğe sıralanmalı.\n📊 Skorunuz: ${score}`, 
        [
          { text: "🔄 Tekrar Dene", onPress: initializeGame },
          { text: "🏠 Ana Menü", onPress: backToMenu }
        ]
      );
    }
  };

  const renderPositions = () => {
    const positions = [];
    
    for (let i = 0; i < 10; i++) {
      const isEmpty = numberList[i] === undefined;
      const isWrong = gameOver && wronglyPlaced?.index === i;
      
      positions.push(
        <View key={`pos-${i + 1}`} style={styles.positionContainer}>
          <Text style={styles.positionNumber}>{i + 1}</Text>
          <TouchableOpacity 
            style={[
              styles.numberSlot, 
              isEmpty && !gameOver && styles.emptySlot,
              isWrong && styles.wrongSlot,
              isEasyRound && styles.easyRoundSlot
            ]}
            onPress={() => {
              console.log('🔘 TouchableOpacity tıklandı, slot:', i);
              console.log('🔘 isEmpty:', isEmpty, 'gameOver:', gameOver);
              handleSlotPress(i);
            }}
            disabled={gameOver || !isEmpty}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {numberList[i] ? (
              <Text style={[
                styles.slotNumber, 
                isWrong && styles.wrongNumber
              ]}>
                {numberList[i]}
              </Text>
            ) : (
              !gameOver && (
                <Text style={styles.emptySlotText}>+</Text>
              )
            )}
          </TouchableOpacity>
        </View>
      );
    }

    return positions;
  };

  if (currentScreen === 'howToPlay') {
    return <HowToPlayScreen onBack={backToMenu} />;
  }

  if (currentScreen === 'menu') {
    return (
      <MainMenu 
        onStartGame={startGame} 
        onHowToPlay={showHowToPlay}
        onSettings={showSettings}
        musicEnabled={musicEnabled}
        onToggleMusic={toggleMusic}
      />
    );
  }

  if (currentScreen === 'howToPlay') {
    return <HowToPlayScreen onBack={backToMenu} />;
  }

  if (currentScreen === 'settings') {
    return (
      <SettingsScreen 
        onBack={backToMenu}
        musicEnabled={musicEnabled}
        onToggleMusic={toggleMusic}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        hapticEnabled={hapticEnabled}
        setHapticEnabled={setHapticEnabled}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        theme={theme}
        setTheme={setTheme}
      />
    );
  }

     return (
     <SafeAreaView style={styles.container}>
       <ExpoLinearGradient
         colors={['#87CEEB', '#98D8E8', '#B0E0E6']}
         style={styles.gameBackground}
       >
         <View style={styles.header}>
           <TouchableOpacity 
             style={styles.backButton} 
             onPress={() => {
               playSound('button');
               backToMenu();
             }}
           >
             <ExpoLinearGradient
               colors={['#FF6B35', '#F7931E', '#FFD700']}
               style={styles.backButtonGradient}
             >
               <Text style={styles.backButtonText}>🏠 Ana Menü</Text>
             </ExpoLinearGradient>
           </TouchableOpacity>
           <View style={styles.headerCenter}>
             <Text style={styles.gameCounter}>🎮 Oyun: {gameCount}</Text>
             {isEasyRound && <Text style={styles.bonusText}>🎉 BONUS TUR! 🎉</Text>}
           </View>
           <TouchableOpacity 
             style={styles.musicToggle} 
             onPress={() => {
               playSound('button');
               toggleMusic();
             }}
           >
             <ExpoLinearGradient
               colors={['#FFD700', '#FFA500', '#FF8C00']}
               style={styles.musicToggleGradient}
             >
               <Text style={styles.musicToggleText}>{musicEnabled ? '🔊' : '🔇'}</Text>
             </ExpoLinearGradient>
           </TouchableOpacity>
         </View>
        
        <View style={styles.gameArea}>
          <View style={styles.leftContainer}>
            <View style={styles.listWrapper}>
              {renderPositions()}
            </View>
          </View>

          <View style={styles.rightContainer}>
            <View style={[styles.chalkboard, isEasyRound && styles.easyChalkboard]}>
              <Text style={styles.mathFormulas}>
                {`∫ dx = x + C    E=mc²
  
f(x) = ax² + bx + c
  
∑ᵢ₌₁ⁿ i = n(n+1)/2
  
lim  f(x) = L
x→a
  
∂f/∂x = f'(x)    ∇·F = div F
  
A = π r²    V = ⁴⁄₃πr³`}
              </Text>
              
              {currentNumber !== null && !gameOver && (
                <Animated.View style={[styles.numberCircle, { transform: [{ scale: scaleAnim }] }]}>
                  <Text style={styles.currentNumber}>{currentNumber}</Text>
                </Animated.View>
              )}
            </View>
            
                       <TouchableOpacity style={styles.scoreButton} disabled>
             <ExpoLinearGradient
               colors={['#FFD700', '#FFA500', '#FF8C00']}
               style={styles.scoreButtonGradient}
             >
               <Text style={styles.scoreButtonText}>🏆 {score}</Text>
             </ExpoLinearGradient>
           </TouchableOpacity>
           
           {gameOver && (
             <View style={styles.buttonContainer}>
               <TouchableOpacity 
                 onPress={() => {
                   playSound('button');
                   initializeGame();
                 }} 
                 style={styles.continueButton}
               >
                 <ExpoLinearGradient
                   colors={['#58D68D', '#27AE60', '#7DCEA0']}
                   style={styles.continueButtonGradient}
                 >
                   <Text style={styles.continueButtonText}>🚀 Devam Et</Text>
                 </ExpoLinearGradient>
               </TouchableOpacity>
               <TouchableOpacity 
                 onPress={() => {
                   playSound('button');
                   resetGame();
                 }} 
                 style={styles.restartButton}
               >
                 <ExpoLinearGradient
                   colors={['#FF4757', '#FF3742', '#FF6B7A']}
                   style={styles.restartButtonGradient}
                 >
                   <Text style={styles.restartButtonText}>🔄 Sıfırla</Text>
                 </ExpoLinearGradient>
               </TouchableOpacity>
             </View>
           )}
          </View>
        </View>
      </ExpoLinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Profesyonel Oyun Menüsü Stilleri
  menuContainer: {
    flex: 1,
  },
  menuBackground: {
    flex: 1,
    position: 'relative',
  },
  cloudsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  cloud: {
    position: 'absolute',
    fontSize: 30,
    opacity: 0.6,
  },
  cloud2: {
    top: 100,
    right: 50,
    fontSize: 25,
  },
  cloud3: {
    top: 200,
    left: 30,
    fontSize: 35,
  },
  sparkleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 20,
  },
  sparkle2: {
    top: 150,
    right: 80,
    fontSize: 25,
  },
  sparkle3: {
    top: 300,
    left: 60,
    fontSize: 18,
  },
  musicButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    borderRadius: 25,
    width: 50,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  musicButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  musicButtonText: {
    fontSize: 24,
  },
  menuContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 100,
    paddingBottom: 50,
    zIndex: 3,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  titleBackground: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 15,
    borderWidth: 4,
    borderColor: '#FFF',
  },
  gameTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  gameSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginTop: 10,
    letterSpacing: 1,
  },
  characterContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  numbersRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberCharacter: {
    fontSize: 35,
    marginHorizontal: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  mainButtonsContainer: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  playButton: {
    borderRadius: 30,
    marginBottom: 15,
    overflow: 'hidden',
    width: '85%',
    shadowColor: '#FF4757',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 15,
  },
  playButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    alignItems: 'center',
    borderRadius: 30,
    position: 'relative',
  },
  buttonShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  playButtonText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  howToPlayButton: {
    borderRadius: 25,
    marginBottom: 15,
    overflow: 'hidden',
    width: '75%',
    shadowColor: '#3498DB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  howToPlayGradient: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    borderRadius: 25,
    position: 'relative',
  },
  howToPlayButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  settingsButton: {
    borderRadius: 25,
    overflow: 'hidden',
    width: '75%',
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  settingsGradient: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    borderRadius: 25,
    position: 'relative',
  },
  settingsButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  bottomIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginTop: 20,
  },
  bottomIcon: {
    borderRadius: 20,
    overflow: 'hidden',
    width: 60,
    height: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomIconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bottomIconText: {
    fontSize: 24,
  },

  // Nasıl Oynanır Sayfası - Mobil Uyumlu
  howToPlayContainer: {
    flex: 1,
  },
  howToPlayGradient: {
    flex: 1,
  },
  howToPlayContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  howToPlayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    marginBottom: 20,
  },
  howToPlayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffd700',
    flex: 1,
    textAlign: 'center',
    marginRight: 60,
  },
  rulesContainer: {
    flex: 1,
    marginBottom: 15,
  },
  ruleItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ffd700',
  },
  ruleIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#ffd700',
  },
  ruleIcon: {
    fontSize: 20,
  },
  ruleContent: {
    flex: 1,
    justifyContent: 'center',
  },
  ruleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00ff88',
    marginBottom: 5,
  },
  ruleText: {
    fontSize: 12,
    color: '#ffffff',
    lineHeight: 16,
    opacity: 0.9,
  },
  exampleContainer: {
    backgroundColor: 'rgba(0, 255, 136, 0.15)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#00ff88',
    alignItems: 'center',
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00ff88',
    marginBottom: 10,
  },
  exampleText: {
    fontSize: 13,
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  exampleArrow: {
    fontSize: 18,
    marginVertical: 5,
  },
  exampleResult: {
    fontSize: 13,
    color: '#ffd700',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  startFromHowToButton: {
    borderRadius: 25,
    overflow: 'hidden',
    alignSelf: 'center',
    marginBottom: 20,
    width: '80%',
  },
  startButtonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    borderRadius: 25,
  },
  startFromHowToButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },

  // Oyun Ekranı - Ana Menü Teması
  container: {
    flex: 1,
  },
  gameBackground: {
    flex: 1,
  },
  header: {
    paddingTop: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  backButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backButtonGradient: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerCenter: {
    alignItems: 'center',
  },
  musicToggle: {
    borderRadius: 20,
    width: 40,
    height: 40,
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  musicToggleGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  musicToggleText: {
    fontSize: 20,
  },
  // Bulut stilleri
  cloudsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  cloud: {
    position: 'absolute',
    fontSize: 30,
    opacity: 0.3,
  },
  cloud2: {
    top: 100,
    right: 50,
    fontSize: 25,
  },
  cloud3: {
    top: 200,
    left: 30,
    fontSize: 35,
  },
  gameCounter: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bonusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#58D68D',
    marginTop: 5,
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  gameArea: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 20,
    zIndex: 10,
  },
  leftContainer: {
    width: 140,
    justifyContent: 'center',
  },
  listWrapper: {
    alignItems: 'center',
  },
  positionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    paddingVertical: 2,
  },
  positionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
    width: 25,
    textAlign: 'center',
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  numberSlot: {
    width: 70,
    height: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 2,
    borderColor: '#FF6B35',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    minHeight: 45,
    minWidth: 70,
  },
  emptySlot: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  easyRoundSlot: {
    borderColor: '#58D68D',
    backgroundColor: 'rgba(88, 214, 141, 0.2)',
  },
  wrongSlot: {
    backgroundColor: '#a4161a',
    borderColor: '#e63946',
  },
  slotNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  wrongNumber: {
    color: '#E74C3C',
  },
  emptySlotText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  rightContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 15,
  },
  chalkboard: {
    width: width * 0.45,
    height: width * 0.45,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: 15,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  easyChalkboard: {
    borderColor: '#58D68D',
    shadowColor: '#58D68D',
  },
  mathFormulas: {
    position: 'absolute',
    top: 15,
    left: 15,
    right: 15,
    bottom: 15,
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.2)',
    lineHeight: 14,
    fontFamily: 'monospace',
  },
  numberCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 107, 53, 0.9)',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  currentNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: '#FF6B35',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  scoreButton: {
    borderRadius: 15,
    marginTop: 20,
    minWidth: 80,
    overflow: 'hidden',
  },
  scoreButtonGradient: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderRadius: 15,
  },
  scoreButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10,
  },
  continueButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#58D68D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonGradient: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  restartButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#FF4757',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  restartButtonGradient: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: 'center',
  },
  restartButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Ayarlar Sayfası Stilleri
  settingsContainer: {
    flex: 1,
  },
  settingsBackground: {
    flex: 1,
    position: 'relative',
  },
  settingsContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    zIndex: 3,
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    justifyContent: 'space-between',
  },
  settingsBackButton: {
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  settingsBackButtonGradient: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  settingsBackButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  settingsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    textAlign: 'center',
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    flex: 1,
  },
  settingsOptionsContainer: {
    flex: 1,
  },
  settingsSection: {
    marginBottom: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  settingLabel: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
  },
  toggleButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    minWidth: 80,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#58D68D',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  difficultyContainer: {
    gap: 10,
  },
  difficultyButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  difficultyButtonActive: {
    shadowColor: '#FF4757',
    shadowOpacity: 0.3,
  },
  difficultyButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
  },
  difficultyLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
  },
  difficultyLabelActive: {
    color: '#FFFFFF',
  },
  difficultyDesc: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
  difficultyDescActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  themeContainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  themeButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  themeButtonActive: {
    shadowOpacity: 0.3,
  },
  themeButtonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  themeLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  themeLabelActive: {
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  saveSettingsButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 30,
    shadowColor: '#58D68D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveSettingsButtonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 20,
    alignItems: 'center',
  },
  saveSettingsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});


