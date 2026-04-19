import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { initAnalyticsClickDelegation, trackPageView } from "@/lib/analytics";

/**
 * Mount inside BrowserRouter: enables data-analytics delegation and page_view on route change.
 */
const AnalyticsBootstrap = () => {
  const location = useLocation();

  useEffect(() => {
    initAnalyticsClickDelegation();
  }, []);

  useEffect(() => {
    trackPageView(`${location.pathname}${location.search}`);
  }, [location.pathname, location.search]);

  return null;
};

export default AnalyticsBootstrap;
