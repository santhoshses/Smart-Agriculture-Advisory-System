import { NavLink, Outlet } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext";

export default function AppLayout({ language, onToggleLanguage }) {
  const { t } = useI18n();

  return (
    <div className="app">
      <header className="appHeader">
        <div className="brand">
          <div className="brandTitle">{t("appTitle")}</div>
          <div className="brandSubtitle">{t("appSubtitle")}</div>
        </div>

        <div className="headerActions">
          <button className="btn btnPrimary" type="button" onClick={onToggleLanguage}>
            {t("languageLabel")}: {language === "en" ? t("languageEnglish") : t("languagePunjabi")}
          </button>
        </div>
      </header>

      <div className="appBody">
        <nav className="sidebar" aria-label="Primary navigation">
          <NavLink to="/" end>
            {t("navDashboard")}
          </NavLink>
          <NavLink to="/profile">{t("navProfile")}</NavLink>
          <NavLink to="/soil">{t("navSoil")}</NavLink>
          <NavLink to="/crop">{t("navCrop")}</NavLink>
          <NavLink to="/fertilizer">{t("navFertilizer")}</NavLink>
          <NavLink to="/disease">{t("navDisease")}</NavLink>
          <NavLink to="/weather">{t("navWeather")}</NavLink>
          <NavLink to="/assistant">{t("navAssistant")}</NavLink>
          <NavLink to="/chat">{t("navChat")}</NavLink>
        </nav>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
