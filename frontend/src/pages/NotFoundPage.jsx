import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext";

export default function NotFoundPage() {
  const { t } = useI18n();

  return (
    <div>
      <h1>{t("pageNotFoundTitle")}</h1>
      <p className="muted">{t("pageNotFoundBody")}</p>
      <Link to="/">{t("pageNotFoundGoHome")}</Link>
    </div>
  );
}
