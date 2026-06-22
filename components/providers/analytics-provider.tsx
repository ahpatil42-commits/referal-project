"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface AnalyticsProviderProps {
  children: React.ReactNode;
  userId?: string;
}

export function AnalyticsProvider({ children, userId }: AnalyticsProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Ref to track state without triggering re-renders
  const state = useRef({
    anonymousId: "",
    sessionStartedAt: Date.now(),
    pageVisits: [] as any[],
    interactions: [] as any[],
    lastPathname: pathname,
    lastPathnameTime: Date.now(),
    isFlushing: false
  });

  // Initialize Anonymous ID
  useEffect(() => {
    let anonId = localStorage.getItem("analytics_anonymous_id");
    if (!anonId) {
      anonId = crypto.randomUUID();
      localStorage.setItem("analytics_anonymous_id", anonId);
    }
    state.current.anonymousId = anonId;
    state.current.sessionStartedAt = Date.now();
  }, []);

  // Flush data to backend
  const flushAnalytics = useCallback(async (isUnload = false) => {
    if (state.current.isFlushing || !state.current.anonymousId) return;
    state.current.isFlushing = true;

    // Calculate time spent on current page if unloading
    if (isUnload && state.current.lastPathname) {
       const timeSpent = Math.round((Date.now() - state.current.lastPathnameTime) / 1000);
       state.current.pageVisits.push({
          path: state.current.lastPathname,
          referrer: document.referrer,
          timestamp: new Date(state.current.lastPathnameTime).toISOString(),
          timeSpent
       });
    }

    const payload = {
      session: {
        anonymousId: state.current.anonymousId,
        userId: userId,
        startedAt: new Date(state.current.sessionStartedAt).toISOString(),
        endedAt: isUnload ? new Date().toISOString() : undefined,
        totalTimeSpent: Math.round((Date.now() - state.current.sessionStartedAt) / 1000),
        userAgent: navigator.userAgent,
      },
      pageVisits: [...state.current.pageVisits],
      interactions: [...state.current.interactions],
    };

    try {
      if (isUnload && navigator.sendBeacon) {
        navigator.sendBeacon("/api/analytics/ingest", JSON.stringify(payload));
      } else {
        await fetch("/api/analytics/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      // Clear queues after successful send (unless unloading)
      if (!isUnload) {
        state.current.pageVisits = [];
        state.current.interactions = [];
      }
    } catch (e) {
      console.error("Analytics flush failed", e);
    } finally {
      state.current.isFlushing = false;
    }
  }, [userId]);

  // Track Page Views
  useEffect(() => {
    if (!state.current.anonymousId) return;
    
    // When path changes, record the previous path's time
    if (state.current.lastPathname !== pathname) {
       const timeSpent = Math.round((Date.now() - state.current.lastPathnameTime) / 1000);
       state.current.pageVisits.push({
          path: state.current.lastPathname,
          referrer: document.referrer,
          timestamp: new Date(state.current.lastPathnameTime).toISOString(),
          timeSpent
       });

       state.current.lastPathname = pathname;
       state.current.lastPathnameTime = Date.now();
    }
  }, [pathname, searchParams]);

  // Handle Visibility Change & Unload (Drop-off tracking)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushAnalytics(true);
      }
    };
    
    const handleBeforeUnload = () => {
      flushAnalytics(true);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [flushAnalytics]);

  // Periodic flush every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      flushAnalytics();
    }, 30000);
    return () => clearInterval(interval);
  }, [flushAnalytics]);

  return <>{children}</>;
}
