import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { http } from "@/services/http";

const TRACKING_ENDPOINT = "/track"; // http service prepends /api

const PageTracker = () => {
    const location = useLocation();

    useEffect(() => {
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

        if (!isIgnored) {
            console.log("📊 Tracking page view:", normalizedPage);
            http.post(TRACKING_ENDPOINT, {
                event: "page_view",
                page: normalizedPage,
                sessionId: sessionId,
            }).catch(err => {
                console.error("Failed to send tracking data:", err);
            });
        }
    }, [location.pathname]);

    return null;
};

export default PageTracker;
