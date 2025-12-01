import { describe, it, expect } from 'vitest';

// Mock translations structure
const translations = {
  en: {
    home: 'Home',
    report: 'Report a Problem',
    parking: 'Parking',
    news: 'News',
    settings: 'Settings',
    good_morning: 'Good Morning',
    good_afternoon: 'Good Afternoon',
    good_evening: 'Good Evening',
  },
  mk: {
    home: 'Дома',
    report: 'Пријави Проблем',
    parking: 'Паркинг',
    news: 'Вести',
    settings: 'Поставки',
    good_morning: 'Добро утро',
    good_afternoon: 'Добар ден',
    good_evening: 'Добра вечер',
  },
  sq: {
    home: 'Ballina',
    report: 'Raporto Problem',
    parking: 'Parkimi',
    news: 'Lajme',
    settings: 'Cilësimet',
    good_morning: 'Mirëmëngjes',
    good_afternoon: 'Mirëdita',
    good_evening: 'Mirëmbrëma',
  },
};

type Language = 'en' | 'mk' | 'sq';
type TranslationKey = keyof typeof translations.en;

const t = (key: TranslationKey, lang: Language = 'en'): string => {
  return translations[lang][key] || key;
};

describe('Internationalization', () => {
  describe('Translation function', () => {
    it('should return English translation by default', () => {
      expect(t('home')).toBe('Home');
      expect(t('report')).toBe('Report a Problem');
    });

    it('should return Macedonian translations', () => {
      expect(t('home', 'mk')).toBe('Дома');
      expect(t('parking', 'mk')).toBe('Паркинг');
    });

    it('should return Albanian translations', () => {
      expect(t('home', 'sq')).toBe('Ballina');
      expect(t('news', 'sq')).toBe('Lajme');
    });
  });

  describe('Greeting translations', () => {
    it('should have greetings in all languages', () => {
      expect(t('good_morning', 'en')).toBe('Good Morning');
      expect(t('good_morning', 'mk')).toBe('Добро утро');
      expect(t('good_morning', 'sq')).toBe('Mirëmëngjes');
    });
  });

  describe('All languages have same keys', () => {
    const enKeys = Object.keys(translations.en);
    const mkKeys = Object.keys(translations.mk);
    const sqKeys = Object.keys(translations.sq);

    it('should have same number of keys across all languages', () => {
      expect(enKeys.length).toBe(mkKeys.length);
      expect(mkKeys.length).toBe(sqKeys.length);
    });

    it('should have matching keys in all languages', () => {
      enKeys.forEach((key) => {
        expect(mkKeys).toContain(key);
        expect(sqKeys).toContain(key);
      });
    });
  });
});

describe('Time-based Greeting', () => {
  const getGreetingKey = (hour: number): TranslationKey => {
    if (hour >= 5 && hour < 12) return 'good_morning';
    if (hour >= 12 && hour < 18) return 'good_afternoon';
    return 'good_evening';
  };

  it('should return morning greeting for early hours', () => {
    expect(getGreetingKey(6)).toBe('good_morning');
    expect(getGreetingKey(11)).toBe('good_morning');
  });

  it('should return afternoon greeting for midday', () => {
    expect(getGreetingKey(12)).toBe('good_afternoon');
    expect(getGreetingKey(17)).toBe('good_afternoon');
  });

  it('should return evening greeting for night', () => {
    expect(getGreetingKey(18)).toBe('good_evening');
    expect(getGreetingKey(23)).toBe('good_evening');
    expect(getGreetingKey(4)).toBe('good_evening');
  });
});

