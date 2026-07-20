import React, { useEffect, useState, useRef } from "react";
import FeedbackPopup from "./FeedbackPopup";

export default function VisitorAnalytics() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pagesCount, setPagesCount] = useState<number>(0);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  
  const startTimeRef = useRef<number>(Date.now());
  const scrollMaxPercentRef = useRef<number>(0);
  const currentUrlRef = useRef<string>(window.location.pathname + window.location.hash);

  // Initialize Session once on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        // Simple User Agent Parsing
        const ua = navigator.userAgent;
        let browser = "Other";
        if (ua.includes("Firefox")) browser = "Firefox";
        else if (ua.includes("Chrome")) browser = "Chrome";
        else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
        else if (ua.includes("Edge")) browser = "Edge";

        let os = "Other";
        if (ua.includes("Windows")) os = "Windows";
        else if (ua.includes("Macintosh")) os = "macOS";
        else if (ua.includes("Linux")) os = "Linux";
        else if (ua.includes("Android")) os = "Android";
        else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

        const device = /Mobile|Android|iPhone|iPad/i.test(ua) ? "Mobile" : "Desktop";

        // Query UTM params from URL
        const urlParams = new URLSearchParams(window.location.search);
        const utm_source = urlParams.get("utm_source") || "";
        const utm_medium = urlParams.get("utm_medium") || "";
        const utm_campaign = urlParams.get("utm_campaign") || "";

        // Send session initialization
        const res = await fetch("/api/analytics/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            visitor_id: localStorage.getItem("visitor_id") || (() => {
              const newId = "v_" + Math.random().toString(36).substring(2, 11);
              localStorage.setItem("visitor_id", newId);
              return newId;
            })(),
            landing_page: window.location.pathname + window.location.hash,
            referral_source: document.referrer || "Direct",
            device,
            browser,
            os,
            language: navigator.language || "en",
            utm_source,
            utm_medium,
            utm_campaign
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.session_id) {
            setSessionId(data.session_id);
            sessionStorage.setItem("analytics_session_id", data.session_id);
          }
        }
      } catch (err) {
        console.warn("Analytics session init failed", err);
      }
    };

    initSession();
  }, []);

  // Track page views and engagement times
  useEffect(() => {
    if (!sessionId) return;

    const trackPageView = async () => {
      const url = window.location.pathname + window.location.hash;
      const title = document.title;
      
      try {
        await fetch("/api/analytics/view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            url,
            title,
            referrer: currentUrlRef.current,
            scroll_percentage: scrollMaxPercentRef.current,
            time_spent: Math.round((Date.now() - startTimeRef.current) / 1000)
          })
        });
      } catch (e) {
        // Silent catch
      }

      // Reset values for new page view
      startTimeRef.current = Date.now();
      scrollMaxPercentRef.current = 0;
      currentUrlRef.current = url;
      setPagesCount(prev => {
        const nextCount = prev + 1;
        // Intelligently open feedback popups if page views count reaches 3
        if (nextCount === 3) {
          setTimeout(() => {
            setIsFeedbackOpen(true);
          }, 4000); // Wait 4 seconds to not startle
        }
        return nextCount;
      });
    };

    // Trigger initially and on hashchange
    trackPageView();
    
    const handleHashChange = () => {
      trackPageView();
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [sessionId]);

  // Track overall session time criteria for feedback popup (e.g. 45 seconds on page)
  useEffect(() => {
    const feedbackTimeout = setTimeout(() => {
      try {
        const alreadyShown = sessionStorage.getItem("feedback_prompted") === "true";
        if (!alreadyShown) {
          setIsFeedbackOpen(true);
          sessionStorage.setItem("feedback_prompted", "true");
        }
      } catch (e) {
        console.warn("sessionStorage access denied in timer:", e);
      }
    }, 45000); // 45 seconds

    return () => clearTimeout(feedbackTimeout);
  }, []);

  // Track Scroll Depth and click events
  useEffect(() => {
    if (!sessionId) return;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);
      if (scrollPercent > scrollMaxPercentRef.current) {
        scrollMaxPercentRef.current = scrollPercent;
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const element_id = target.id || "";
      const element_class = target.className || "";
      const text = target.innerText?.substring(0, 50).trim() || "";

      fetch("/api/analytics/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          element_id,
          element_class: typeof element_class === "string" ? element_class : "",
          text,
          x: e.clientX,
          y: e.clientY
        })
      }).catch(() => {});
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("click", handleClick);
    };
  }, [sessionId]);

  return (
    <FeedbackPopup
      isOpen={isFeedbackOpen}
      onClose={() => setIsFeedbackOpen(false)}
    />
  );
}
