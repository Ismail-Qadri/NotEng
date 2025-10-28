import { useContext } from "react";
import { LanguageContext } from "../components/LanguageProvider";
import { translations } from "../components/translations";

const useLanguage = () => {
  const { language, setLanguage } = useContext(LanguageContext);

  // Updated t function to support variables
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