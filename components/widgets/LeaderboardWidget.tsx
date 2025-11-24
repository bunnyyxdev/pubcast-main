"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Award, Crown } from "lucide-react";

interface LeaderboardUser {
  rank: number;
  username: string;
  score: number;
  avatar?: string;
}

export function LeaderboardWidget() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate leaderboard data
    const fetchLeaderboard = async () => {
      try {
        // TODO: Replace with real API endpoint
        // const response = await fetch('/api/leaderboard');
        // const data = await response.json();
        
        // Simulated data
        setTimeout(() => {
          setUsers([
            { rank: 1, username: "champion_user", score: 1250 },
            { rank: 2, username: "silver_king", score: 980 },
            { rank: 3, username: "bronze_hero", score: 750 },
            { rank: 4, username: "player_four", score: 620 },
            { rank: 5, username: "top_five", score: 580 },
          ]);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
        setLoading(false);
      }
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return Crown;
      case 2:
        return Trophy;
      case 3:
        return Medal;
      default:
        return Award;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "from-yellow-500 to-amber-500";
      case 2:
        return "from-gray-400 to-gray-500";
      case 3:
        return "from-orange-600 to-orange-700";
      default:
        return "from-purple-500 to-pink-500";
    }
  };

  if (loading) {
    return (
      <div className="bg-white/5 rounded-2xl p-4 border border-white/10 animate-pulse">
        <div className="h-4 w-32 bg-white/10 rounded mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-white/10 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-400" />
        <h3 className="text-sm font-bold text-white">อันดับผู้ใช้</h3>
      </div>
      <div className="space-y-2">
        {users.map((user) => {
          const RankIcon = getRankIcon(user.rank);
          return (
            <div
              key={user.rank}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getRankColor(user.rank)} flex items-center justify-center flex-shrink-0`}>
                {user.rank <= 3 ? (
                  <RankIcon className="w-4 h-4 text-white" />
                ) : (
                  <span className="text-xs font-bold text-white">{user.rank}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{user.username}</p>
                <p className="text-xs text-gray-400">{user.score.toLocaleString()} คะแนน</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

