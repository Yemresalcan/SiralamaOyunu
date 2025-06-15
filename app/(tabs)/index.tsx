import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Animated, SafeAreaView, Dimensions, LinearGradient } from 'react-native';
import { Audio } from 'expo-av';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';


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

// Yükleme Ekranı
const LoadingScreen = ({ onLoadingComplete }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // İlk animasyonlar
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Progress bar animasyonu
    const progressAnimation = Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    });

    progressAnimation.start(() => {
      // Yükleme tamamlandığında ana menüye geç
      setTimeout(() => {
        onLoadingComplete();
      }, 500);
    });

    return () => {
      progressAnimation.stop();
    };
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.loadingContainer}>
      <ExpoLinearGradient
        colors={['#87CEEB', '#98D8E8', '#B0E0E6']}
        style={styles.loadingBackground}
      >
        {/* Arka Plan Bulutları */}
        <View style={styles.cloudsContainer}>
          <Text style={styles.cloud}>☁️</Text>
          <Text style={[styles.cloud, styles.cloud2]}>☁️</Text>
          <Text style={[styles.cloud, styles.cloud3]}>☁️</Text>
        </View>

        <Animated.View style={[
          styles.loadingContent,
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}>
          {/* Sadece Uygulama İkonu */}
          <View style={styles.iconContainer}>
        <Image
              source={require('../../assets/images/icon.png')}
              style={styles.loadingIcon}
              resizeMode="contain"
            />
          </View>

          {/* Progress Bar Container */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <Animated.View 
                style={[
                  styles.progressBar,
                  { width: progressWidth }
                ]}
              />
            </View>
          </View>
        </Animated.View>
      </ExpoLinearGradient>
    </View>
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
  buttonSound
}) => {
  const slideAnim = useRef(new Animated.Value(width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Ayarlar sayfası için ses fonksiyonu
  const playSound = async (type) => {
    try {
      if (type === 'button') {
        // Buton ses efekti çal
        if (soundEnabled && buttonSound) {
          await buttonSound.replayAsync();
          console.log('🔊 Ayarlar buton ses efekti çalındı');
        }
        
        // Haptic feedback
        if (hapticEnabled) {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          console.log('📳 Ayarlar buton haptic feedback');
        }
      }
    } catch (error) {
      console.log('Ayarlar ses/haptic feedback çalınamadı:', error);
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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleBack = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onBack());
  };

     return (
     <View style={styles.howToPlayContainer}>
       <ExpoLinearGradient
         colors={['#87CEEB', '#98D8E8', '#B0E0E6']}
         style={styles.howToPlayGradient}
       >
         {/* Bulut efektleri */}
         <View style={styles.cloudsContainer}>
           <Text style={[styles.cloud, { top: 80, left: 30 }]}>☁️</Text>
           <Text style={[styles.cloud, styles.cloud2]}>☁️</Text>
           <Text style={[styles.cloud, styles.cloud3]}>☁️</Text>
         </View>

         {/* Üst Header - Geri Butonu */}
         <View style={styles.howToPlayTopHeader}>
           <TouchableOpacity 
             style={styles.howToPlayBackButton} 
             onPress={() => {
               console.log('Geri butonu basıldı!');
               handleBack();
             }}
             activeOpacity={0.7}
           >
             <ExpoLinearGradient
               colors={['#FF6B35', '#F7931E', '#FFD700']}
               style={styles.howToPlayBackButtonGradient}
             >
               <Text style={styles.howToPlayBackButtonText}>← GERİ</Text>
             </ExpoLinearGradient>
           </TouchableOpacity>
           <Text style={styles.howToPlayHeaderTitle}>📚 NASIL OYNANIR?</Text>
           <View style={styles.headerSpacer} />
         </View>

        <View style={styles.howToPlayContent}>


          {/* Scrollable Content */}
          <Animated.ScrollView 
            style={[
              styles.scrollContent,
              { 
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
          >

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
                    transform: [{ scale: scaleAnim }]
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


          </Animated.ScrollView>
        </View>
       </ExpoLinearGradient>
     </View>
  );
};

// Profesyonel Oyun Menüsü
const MainMenu = ({ onStartGame, onHowToPlay, onSettings, musicEnabled, onToggleMusic, buttonSound, soundEnabled, hapticEnabled }) => {
  const titleBounce = useRef(new Animated.Value(1)).current;
  const buttonFloat = useRef(new Animated.Value(0)).current;
  const characterBounce = useRef(new Animated.Value(1)).current;
  const sparkleRotate = useRef(new Animated.Value(0)).current;

  // Ana menü için ses fonksiyonu - Gerçek ses efektleri + Haptic feedback
  const playSound = async (type) => {
    try {
      if (type === 'button') {
        // Buton ses efekti çal
        if (soundEnabled && buttonSound) {
          await buttonSound.replayAsync();
          console.log('🔊 Ana menü buton ses efekti çalındı');
        }
        
        // Haptic feedback
        if (hapticEnabled) {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          console.log('📳 Ana menü buton haptic feedback');
        }
      }
    } catch (error) {
      console.log('Ana menü ses/haptic feedback çalınamadı:', error);
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
               <Text style={styles.gameTitle}>ORDIX</Text>
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
               onPress={() => {
                 playSound('button');
                 onHowToPlay();
               }}
             >
               <ExpoLinearGradient
                 colors={['#FFB347', '#FF8C00', '#FFA500']}
                 style={styles.bottomIconGradient}
               >
                 <Text style={styles.bottomIconText}>📚</Text>
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

           {/* Versiyon Bilgisi */}
           <View style={styles.versionContainer}>
             <Text style={styles.versionText}>Versiyon Beta</Text>
           </View>
         </View>
       </ExpoLinearGradient>
     </View>
   );
};

export default function GameScreen() {
  const [currentScreen, setCurrentScreen] = useState('loading'); // 'loading', 'menu', 'game', 'howToPlay', 'settings'
  const [numberList, setNumberList] = useState([]);
  const [numbersToPlace, setNumbersToPlace] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [wronglyPlaced, setWronglyPlaced] = useState(null);
  const [gameCount, setGameCount] = useState(0);
  const [isEasyRound, setIsEasyRound] = useState(false);
  const [backgroundMusic, setBackgroundMusic] = useState(null);
  const [buttonSound, setButtonSound] = useState(null);
  const [musicEnabled, setMusicEnabled] = useState(true);
  
  // Ayarlar state'leri
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);

  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadSounds();
    return () => {
      if (backgroundMusic) {
        backgroundMusic.unloadAsync();
      }
      if (buttonSound) {
        buttonSound.unloadAsync();
      }
    };
  }, []);

  const loadSounds = async () => {
    try {
      console.log('🎵 Ses dosyaları yükleniyor...');
      
      // Arka plan müziği yükle
      const { sound: bgMusic } = await Audio.Sound.createAsync(
        require('../../assets/music/start.mp3'),
        { 
          isLooping: true,
          volume: 0.3,
        }
      );
      setBackgroundMusic(bgMusic);
      
      // Buton ses efekti yükle
      const { sound: btnSound } = await Audio.Sound.createAsync(
        require('../../assets/music/buton_efect.mp3'),
        { 
          volume: 0.5,
        }
      );
      setButtonSound(btnSound);
      
      console.log('✅ Ses dosyaları başarıyla yüklendi');
      
      // Müzik açıksa arka plan müziğini başlat
      if (musicEnabled) {
        await bgMusic.playAsync();
        console.log('🎵 Arka plan müziği başlatıldı');
      }
      
    } catch (error) {
      console.log('❌ Ses dosyaları yüklenemedi:', error);
    }
  };

  const toggleMusic = async () => {
    const newMusicState = !musicEnabled;
    setMusicEnabled(newMusicState);
    
    try {
      if (backgroundMusic) {
        if (newMusicState) {
          await backgroundMusic.playAsync();
          console.log('🎵 Arka plan müziği açıldı');
        } else {
          await backgroundMusic.pauseAsync();
          console.log('🔇 Arka plan müziği kapatıldı');
        }
      }
    } catch (error) {
      console.log('Müzik toggle hatası:', error);
    }
  };

  // Oyun ekranı için ses fonksiyonu - Gerçek ses efektleri + Haptic feedback
  const playSound = async (type) => {
    try {
      if (type === 'button') {
        // Buton ses efekti çal
        if (soundEnabled && buttonSound) {
          await buttonSound.replayAsync();
          console.log('🔊 Buton ses efekti çalındı');
        }
        
        // Haptic feedback
        if (hapticEnabled) {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          console.log('📳 Buton haptic feedback');
        }
      } else if (type === 'correct') {
        if (hapticEnabled) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          console.log('✅ Doğru yerleştirme haptic feedback');
        }
      } else if (type === 'wrong') {
        if (hapticEnabled) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          console.log('❌ Yanlış yerleştirme haptic feedback');
        }
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

    // Slot'a sayı yerleştirme ses efekti
    playSound('button');
    
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

  if (currentScreen === 'loading') {
    return <LoadingScreen onLoadingComplete={() => setCurrentScreen('menu')} />;
  }

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
        buttonSound={buttonSound}
        soundEnabled={soundEnabled}
        hapticEnabled={hapticEnabled}
      />
    );
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
        buttonSound={buttonSound}
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
    paddingTop: 60,
    paddingBottom: 30,
    zIndex: 3,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
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
    marginBottom: 25,
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
    marginBottom: 20,
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
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
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
  versionContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  versionText: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.14)',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.58)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  // Yükleme Ekranı Stilleri
  loadingContainer: {
    flex: 1,
  },
  loadingBackground: {
    flex: 1,
    position: 'relative',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    zIndex: 3,
  },
  iconContainer: {
    marginBottom: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
  },
  loadingIcon: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  loadingTitleBackground: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 50,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  progressBarBackground: {
    width: '90%',
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  loadingVersion: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '400',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  // Nasıl Oynanır Sayfası - Mobil Uyumlu
  howToPlayContainer: {
    flex: 1,
  },
  howToPlayGradient: {
    flex: 1,
    position: 'relative',
  },
  howToPlayContent: {
    flex: 1,
    paddingHorizontal: 0,
    zIndex: 3,
  },
  howToPlayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'space-between',
  },
  howToPlayTopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 1000,
  },
  howToPlayBackButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  howToPlayBackButtonGradient: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  howToPlayBackButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  howToPlayHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF8C00',
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  headerSpacer: {
    width: 80, // Geri buton ile aynı genişlik
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  howToPlayTitleContainer: {
    alignItems: 'center',
  },
  howToPlayTitleBackground: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  howToPlayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  rulesContainer: {
    marginBottom: 15,
  },
  ruleItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB347',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  ruleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 179, 71, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#FFB347',
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  ruleIcon: {
    fontSize: 18,
  },
  ruleContent: {
    flex: 1,
    justifyContent: 'center',
  },
  ruleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF8C00',
    marginBottom: 5,
  },
  ruleText: {
    fontSize: 12,
    color: '#333333',
    lineHeight: 16,
    opacity: 1,
  },
  exampleContainer: {
    backgroundColor: 'rgba(255, 179, 71, 0.8)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FFB347',
    alignItems: 'center',
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF8C00',
    marginBottom: 10,
  },
  exampleText: {
    fontSize: 13,
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
    opacity: 1,
  },
  exampleArrow: {
    fontSize: 18,
    marginVertical: 5,
    color: '#FF8C00',
  },
  exampleResult: {
    fontSize: 13,
    color: '#FF6B35',
    fontWeight: 'bold',
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


