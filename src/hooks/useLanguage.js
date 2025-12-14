import { useContext } from "react";
import { LanguageContext } from "../pages/LanguageProvider";
import { translations } from "../pages/translations";

const useLanguage = () => {
  const { language, setLanguage } = useContext(LanguageContext);

  const t = (key, vars = {}) => {
    let str = translations[language][key] || key;
    Object.keys(vars).forEach(k => {
      str = str.replace(`{${k}}`, vars[k]);
    });
    return str;
  };

  return { language, setLanguage, t };
};

export default useLanguage;