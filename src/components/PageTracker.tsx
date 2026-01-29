import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { http } from "@/services/http";

const TRACKING_ENDPOINT = "/track"; // http service prepends /api

const PageTracker = () => {
    const location = useLocation();
    const scrollMarkers = useRef(new Set<number>());

    useEffect(() => {
        // Reset scroll markers on page change
        scrollMarkers.current.clear();

        // 1. Generate or retrieve sessionId
        let sessionId = localStorage.getItem("sessionId");
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            localStorage.setItem("sessionId", sessionId);
        }

        // 2. Normalize page path (lowercase, no trailing slash)
        let normalizedPage = location.pathname.toLowerCase();
        if (normalizedPage.length > 1 && normalizedPage.endsWith("/")) {
            normalizedPage = normalizedPage.slice(0, -1);
        }

        // 3. Ignore /admin and /auth pages
        const isIgnored = normalizedPage.startsWith("/admin") || normalizedPage.startsWith("/auth");
        if (isIgnored) return;

        // Helper to send events
        const sendEvent = (event: string, data: any = {}) => {
            http.post(TRACKING_ENDPOINT, {
                event,
                page: normalizedPage,
                sessionId: sessionId,
                data
            }).catch(err => {
                // Silently fail in production, but log in dev if needed
                if (import.meta.env.DEV) console.error(`Failed to send ${event} tracking data:`, err);
            });
        };

        // 4. Track Page View
        sendEvent("page_view");

        // 5. Click Tracking
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const interactiveElement = target.closest("button, a, [role='button'], input[type='submit']");

            if (interactiveElement) {
                const targetId = (interactiveElement.id || "").toLowerCase();
                const targetClass = (interactiveElement.className || "").toLowerCase();
                const targetText = (interactiveElement.textContent?.trim() || "").toLowerCase();

                // Ignore "Close" buttons
                const isCloseButton =
                    targetId.includes("close") ||
                    targetClass.includes("close") ||
                    targetText === "close" ||
                    targetText === "إغلاق" ||
                    targetText === "x";

                if (isCloseButton) return;

                sendEvent("click", {
                    target: interactiveElement.id || interactiveElement.className.split(' ')[0] || interactiveElement.tagName.toLowerCase(),
                    text: interactiveElement.textContent?.trim().slice(0, 50)
                });
            }
        };

        // 6. Scroll Tracking (Throttled)
        let scrollTimeout: NodeJS.Timeout;
        const handleScroll = () => {
            if (scrollTimeout) return;

            scrollTimeout = setTimeout(() => {
                const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
                if (scrollHeight <= 0) {
                    scrollTimeout = null as any;
                    return;
                }

                const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);
                const markers = [25, 50, 75, 100];

                markers.forEach(marker => {
                    if (scrollPercent >= marker && !scrollMarkers.current.has(marker)) {
                        scrollMarkers.current.add(marker);
                        sendEvent("scroll", { depth: marker });
                    }
                });

                scrollTimeout = null as any;
            }, 500);
        };

        // 7. Section Engagement (IntersectionObserver)
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id || entry.target.getAttribute('data-section') || entry.target.tagName.toLowerCase();
                    sendEvent("section_view", { section: sectionId });
                    // Track each section only once per page load
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        // Observe sections and main content blocks
        const sections = document.querySelectorAll("section, [data-track-section], main > div > div");
        sections.forEach(section => observer.observe(section));

        // Add listeners
        document.addEventListener("click", handleClick);
        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            document.removeEventListener("click", handleClick);
            window.removeEventListener("scroll", handleScroll);
            if (scrollTimeout) clearTimeout(scrollTimeout);
            observer.disconnect();
        };
    }, [location.pathname]);

    return null;
};

export default PageTracker;
