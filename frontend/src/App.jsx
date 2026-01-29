import "./App.css";
import { useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "./components/AppLayout";
import { I18nProvider } from "./i18n/I18nContext";
import CropRecommendationPage from "./pages/CropRecommendationPage";
import DashboardPage from "./pages/DashboardPage";
import DiseaseDetectionPage from "./pages/DiseaseDetectionPage";
import FertilizerGuidancePage from "./pages/FertilizerGuidancePage";
import NotFoundPage from "./pages/NotFoundPage";
import ProfilePage from "./pages/ProfilePage";
import SoilInputPage from "./pages/SoilInputPage";
import AssistantPage from "./pages/AssistantPage";
import WeatherPage from "./pages/WeatherPage";
import ChatbotPage from "./pages/ChatbotPage";
import LoginPage from "./pages/LoginPage";
import { getAuthToken } from "./api/client";

function RequireAuth({ children }) {
  const token = getAuthToken();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function useLanguageToggle() {
  const [language, setLanguage] = useState("en");

  const api = useMemo(
    () => ({
      language,
      toggle: () => setLanguage((prev) => (prev === "en" ? "pa" : "en")),
    }),
    [language]
  );

  return api;
}

export default function App() {
  const { language, toggle } = useLanguageToggle();

  return (
    <I18nProvider language={language}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          element={
            <RequireAuth>
              <AppLayout language={language} onToggleLanguage={toggle} />
            </RequireAuth>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/soil" element={<SoilInputPage />} />
          <Route path="/crop" element={<CropRecommendationPage />} />
          <Route path="/fertilizer" element={<FertilizerGuidancePage />} />
          <Route path="/disease" element={<DiseaseDetectionPage />} />
          <Route path="/weather" element={<WeatherPage />} />
          <Route path="/assistant" element={<AssistantPage />} />
          <Route path="/chat" element={<ChatbotPage />} />

          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </I18nProvider>
  );
}
