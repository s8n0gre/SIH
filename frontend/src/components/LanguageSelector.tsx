import React, { useState } from 'react';
import { i18n } from '../services/i18n';
const LanguageSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const languages = i18n.getLanguages();
  const currentLanguage = i18n.getCurrentLanguage();

  const handleLanguageChange = (languageCode: string) => {
    i18n.setLanguage(languageCode);
    setIsOpen(false);
    window.location.reload(); // Reload to apply translations
  };

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 shadow-sm"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
        title={currentLang?.nativeName}
      >
        <span className="text-[11px] font-bold uppercase">{currentLanguage}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 rounded-xl shadow-2xl z-[100] overflow-hidden animate-scale-in" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-strong)' }}>
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className="w-full text-left px-3 py-2 text-xs font-semibold transition-colors flex items-center justify-between"
                style={{
                  color: currentLanguage === language.code ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: currentLanguage === language.code ? 'var(--bg-elevated)' : 'transparent'
                }}
                onMouseEnter={e => { if (currentLanguage !== language.code) e.currentTarget.style.background = 'var(--bg-subtle)' }}
                onMouseLeave={e => { if (currentLanguage !== language.code) e.currentTarget.style.background = 'transparent' }}
              >
                <span>{language.nativeName}</span>
                {currentLanguage === language.code && <span style={{ color: 'var(--accent)' }}>•</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;