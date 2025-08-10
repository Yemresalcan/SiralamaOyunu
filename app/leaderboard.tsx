import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { LeaderboardScreen } from './screens/leaderboard-screen';
import leaderboardService from './services/leaderboard-service';

export default function LeaderboardRoute() {
  useLocalSearchParams();
  const router = useRouter();
  const [username, setUsername] = useState<string | undefined>(undefined);

  useEffect(() => {
    leaderboardService.getUserData().then((data) => setUsername(data?.username));
  }, []);

  return <LeaderboardScreen onClose={router.back} currentUsername={username} />;
}

