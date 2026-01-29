import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { http } from "@/services/http";

const TRACKING_ENDPOINT = "/track"; // http service prepends /api or uses baseURL

const PageTracker = () => {
    const location = useLocation();

    useEffect(() => {
        // 1. Generate or retrieve sessionId
        let sessionId = localStorage.getItem("tracking_session_id");
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            localStorage.setItem("tracking_session_id", sessionId);
        }

        // 2. Identify if it's a public page
        // We exclude admin, client, engineer, and company dashboard routes
        const isPublicPage = !location.pathname.startsWith("/admin/dashboard") &&
            !location.pathname.startsWith("/client/dashboard") &&
            !location.pathname.startsWith("/engineer/dashboard") &&
            !location.pathname.startsWith("/company/dashboard") &&
            // Also exclude other internal-only paths if any
            !location.pathname.includes("/messages") &&
            !location.pathname.includes("/notifications") &&
            !location.pathname.includes("/projects") &&
            !location.pathname.includes("/portfolio") &&
            !location.pathname.includes("/profile") &&
            !location.pathname.includes("/settings");

        // The requirement says "all public pages without modifying any admin or backend code".
        // Usually, public pages are landing pages, login pages, etc.
        // Let's be more specific: if it's NOT a dashboard/protected route, it's public.
        // However, the user said "all public pages". 
        // Let's check the App.tsx again to see what's truly public.
        // Public: /, /platform, /auth/:role, /forgot-password, /reset-password, /admin/login, /client/login, /engineer/login, /company/login.

        const publicPaths = [
            "/",
            "/platform",
            "/forgot-password",
            "/reset-password",
            "/admin/login",
            "/client/login",
            "/engineer/login",
            "/company/login"
        ];

        const isExplicitlyPublic = publicPaths.includes(location.pathname) || location.pathname.startsWith("/auth/");

        if (isExplicitlyPublic) {
            console.log("📊 Tracking page view:", location.pathname);
            http.post(TRACKING_ENDPOINT, {
                event: "page_view",
                page: location.pathname,
                sessionId: sessionId,
            }).catch(err => {
                console.error("Failed to send tracking data:", err);
            });
        }
    }, [location.pathname]);

    return null;
};

export default PageTracker;
