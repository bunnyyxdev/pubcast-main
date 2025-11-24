"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  username: string;
  points: number;
  isCurrentUser?: boolean;
}

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<'points' | 'revenue'>('points');

  useEffect(() => {
    loadLeaderboard();
  }, [type]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/gamification/leaderboard?type=${type}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-orange-400" />;
    return <span className="text-gray-500 font-bold">#{rank}</span>;
  };

  return (
    <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          อันดับผู้ใช้
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setType('points')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              type === 'points'
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            คะแนน
          </button>
          <button
            onClick={() => setType('revenue')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              type === 'revenue'
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            รายได้
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">กำลังโหลด...</div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-8 text-gray-400">ยังไม่มีข้อมูล</div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center justify-between p-3 rounded-lg ${
                entry.isCurrentUser
                  ? 'bg-purple-500/20 border border-purple-500/30'
                  : 'bg-white/5 border border-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                {getRankIcon(entry.rank)}
                <span className={`font-semibold ${entry.isCurrentUser ? 'text-purple-400' : 'text-white'}`}>
                  {entry.username}
                </span>
              </div>
              <span className="text-yellow-400 font-bold">
                {type === 'points' ? `${entry.points.toLocaleString()} คะแนน` : `${entry.points.toLocaleString()} ฿`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

