"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Component to track user activity across all pages
 * Updates user's last_seen timestamp when they visit any page
 */
export function UserActivityTracker() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Update activity immediately
    const updateActivity = async () => {
      try {
        await fetch("/api/user/activity", {
          method: "POST",
          credentials: "include",
        });
      } catch (error) {
        // Silently fail - don't break user experience
        console.error("Failed to update activity:", error);
      }
    };

    updateActivity();

    // Update activity every 30 seconds while user is on the page
    const interval = setInterval(updateActivity, 30000);

    // Also update on page visibility change (when user switches tabs)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateActivity();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user]);

  return null; // This component doesn't render anything
}

