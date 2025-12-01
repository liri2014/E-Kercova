-- Migration: Add North Macedonia Public Holidays (COMPLETE)
-- All official national holidays from November 2025 to May 2027
-- Translations in EN, MK, SQ
-- Types: holiday (national), orthodox, catholic, islamic
-- Run this in Supabase SQL Editor

-- First, delete any existing holidays to avoid duplicates
DELETE FROM public.events WHERE is_holiday = true;

-- Insert North Macedonia National Holidays
INSERT INTO public.events (
    title, title_en, title_mk, title_sq,
    description, description_en, description_mk, description_sq,
    date, type, is_holiday
) VALUES

-- ==================== LATE 2025 HOLIDAYS ====================

-- Day of Macedonian Revolutionary Struggle (October 23, 2025) - NATIONAL
('Day of Macedonian Revolutionary Struggle',
 'Day of Macedonian Revolutionary Struggle',
 'Ден на македонската револуционерна борба',
 'Dita e Luftës Revolucionare Maqedonase',
 'Commemorating the Ilinden Uprising of 1903',
 'Commemorating the Ilinden Uprising of 1903',
 'Комеморација на Илинденското востание од 1903',
 'Përkujtimi i Kryengritjes së Ilindenit të vitit 1903',
 '2025-10-23', 'holiday', true),

-- St. Clement of Ohrid Day (December 8, 2025) - ORTHODOX
('St. Clement of Ohrid Day',
 'St. Clement of Ohrid Day',
 'Св. Климент Охридски',
 'Dita e Shën Klementit të Ohrit',
 'Honoring the patron saint of North Macedonia',
 'Honoring the patron saint of North Macedonia',
 'Почитување на заштитникот на Северна Македонија',
 'Nderimi i shenjtit mbrojtës të Maqedonisë së Veriut',
 '2025-12-08', 'orthodox', true),

-- Catholic Christmas 2025 - CATHOLIC
('Catholic Christmas',
 'Catholic Christmas',
 'Католички Божиќ',
 'Krishtlindjet Katolike',
 'Catholic Christian celebration of the birth of Jesus Christ',
 'Catholic Christian celebration of the birth of Jesus Christ',
 'Католички христијански празник за раѓањето на Исус Христос',
 'Kremtimi i krishterë katolik i lindjes së Jezu Krishtit',
 '2025-12-25', 'catholic', true),

-- ==================== 2026 HOLIDAYS ====================

-- New Year's Day 2026 - NATIONAL
('New Year''s Day',
 'New Year''s Day',
 'Нова Година',
 'Viti i Ri',
 'National holiday celebrating the start of the new year',
 'National holiday celebrating the start of the new year',
 'Национален празник за почеток на новата година',
 'Festë kombëtare për fillimin e vitit të ri',
 '2026-01-01', 'holiday', true),

-- Second Day of New Year 2026 - NATIONAL
('Second Day of New Year',
 'Second Day of New Year',
 'Втор ден на Нова Година',
 'Dita e Dytë e Vitit të Ri',
 'Second day of New Year celebrations',
 'Second day of New Year celebrations',
 'Втор ден од новогодишните празници',
 'Dita e dytë e festimeve të Vitit të Ri',
 '2026-01-02', 'holiday', true),

-- Orthodox Christmas 2026 - ORTHODOX
('Orthodox Christmas',
 'Orthodox Christmas',
 'Божик',
 'Krishtlindjet Ortodokse',
 'Orthodox Christian celebration of the birth of Jesus Christ',
 'Orthodox Christian celebration of the birth of Jesus Christ',
 'Православен христијански празник за раѓањето на Исус Христос',
 'Kremtimi i krishterë ortodoks i lindjes së Jezu Krishtit',
 '2026-01-07', 'orthodox', true),

-- International Women's Day 2026 - NATIONAL
('International Women''s Day',
 'International Women''s Day',
 'Меѓународен ден на жената',
 'Dita Ndërkombëtare e Gruas',
 'Celebrating women''s achievements and rights',
 'Celebrating women''s achievements and rights',
 'Славење на достигнувањата и правата на жените',
 'Festimi i arritjeve dhe të drejtave të grave',
 '2026-03-08', 'holiday', true),

-- Eid al-Fitr 2026 - ISLAMIC
('Eid al-Fitr',
 'Eid al-Fitr',
 'Рамазан Бајрам',
 'Fitër Bajrami',
 'Islamic holiday marking the end of Ramadan',
 'Islamic holiday marking the end of Ramadan',
 'Исламски празник за крајот на Рамазанот',
 'Festë islame që shënon fundin e Ramazanit',
 '2026-03-20', 'islamic', true),

-- Catholic Easter 2026 - CATHOLIC
('Catholic Easter',
 'Catholic Easter',
 'Католички Велигден',
 'Pashkët Katolike',
 'Catholic Christian celebration of the resurrection of Jesus Christ',
 'Catholic Christian celebration of the resurrection of Jesus Christ',
 'Католички христијански празник за воскресението на Исус Христос',
 'Kremtimi i krishterë katolik i ringjalljes së Jezu Krishtit',
 '2026-04-05', 'catholic', true),

-- Orthodox Good Friday 2026 - ORTHODOX
('Orthodox Good Friday',
 'Orthodox Good Friday',
 'Велики Петок',
 'E Premtja e Madhe Ortodokse',
 'Orthodox Christian observance of the crucifixion of Jesus Christ',
 'Orthodox Christian observance of the crucifixion of Jesus Christ',
 'Православно христијанско одбележување на распнувањето на Исус Христос',
 'Përkujtimi i krishterë ortodoks i kryqëzimit të Jezu Krishtit',
 '2026-04-10', 'orthodox', true),

-- Orthodox Easter 2026 - ORTHODOX
('Orthodox Easter',
 'Orthodox Easter',
 'Велигден',
 'Pashkët Ortodokse',
 'Orthodox Christian celebration of the resurrection of Jesus Christ',
 'Orthodox Christian celebration of the resurrection of Jesus Christ',
 'Православен христијански празник за воскресението на Исус Христос',
 'Kremtimi i krishterë ortodoks i ringjalljes së Jezu Krishtit',
 '2026-04-12', 'orthodox', true),

-- Orthodox Easter Monday 2026 - ORTHODOX
('Orthodox Easter Monday',
 'Orthodox Easter Monday',
 'Велигденски Понеделник',
 'E Hëna e Pashkëve Ortodokse',
 'Second day of Orthodox Easter celebrations',
 'Second day of Orthodox Easter celebrations',
 'Втор ден од православните велигденски празници',
 'Dita e dytë e festimeve të Pashkëve Ortodokse',
 '2026-04-13', 'orthodox', true),

-- Labour Day 2026 - NATIONAL
('Labour Day',
 'Labour Day',
 'Ден на трудот',
 'Dita e Punës',
 'International Workers'' Day celebrating labor movements',
 'International Workers'' Day celebrating labor movements',
 'Меѓународен ден на работниците',
 'Dita Ndërkombëtare e Punëtorëve',
 '2026-05-01', 'holiday', true),

-- Saints Cyril and Methodius Day 2026 - NATIONAL
('Saints Cyril and Methodius Day',
 'Saints Cyril and Methodius Day',
 'Ден на Св. Кирил и Методиј',
 'Dita e Shën Qirilit dhe Metodit',
 'Honoring the creators of the Slavic alphabet',
 'Honoring the creators of the Slavic alphabet',
 'Почитување на создавачите на словенската азбука',
 'Nderimi i krijuesve të alfabetit sllav',
 '2026-05-24', 'holiday', true),

-- Eid al-Adha 2026 - ISLAMIC
('Eid al-Adha',
 'Eid al-Adha',
 'Курбан Бајрам',
 'Kurban Bajrami',
 'Islamic Feast of Sacrifice',
 'Islamic Feast of Sacrifice',
 'Исламски празник на жртвата',
 'Festa Islame e Kurbanit',
 '2026-05-27', 'islamic', true),

-- Republic Day 2026 - NATIONAL
('Republic Day',
 'Republic Day',
 'Ден на Републиката',
 'Dita e Republikës',
 'Celebrating the Anti-Fascist Assembly of National Liberation of Macedonia (ASNOM)',
 'Celebrating the Anti-Fascist Assembly of National Liberation of Macedonia (ASNOM)',
 'Славење на АСНОМ - Антифашистичко собрание на народното ослободување на Македонија',
 'Festimi i KAÇKM - Këshilli Antifashist i Çlirimit Kombëtar të Maqedonisë',
 '2026-08-02', 'holiday', true),

-- Independence Day 2026 - NATIONAL
('Independence Day',
 'Independence Day',
 'Ден на независноста',
 'Dita e Pavarësisë',
 'Celebrating North Macedonia''s independence from Yugoslavia in 1991',
 'Celebrating North Macedonia''s independence from Yugoslavia in 1991',
 'Славење на независноста на Северна Македонија од Југославија во 1991',
 'Festimi i pavarësisë së Maqedonisë së Veriut nga Jugosllavia në 1991',
 '2026-09-08', 'holiday', true),

-- People's Uprising Day 2026 - NATIONAL
('People''s Uprising Day',
 'People''s Uprising Day',
 'Ден на народното востание',
 'Dita e Kryengritjes Popullore',
 'Commemorating the start of the anti-fascist uprising in 1941',
 'Commemorating the start of the anti-fascist uprising in 1941',
 'Комеморација на почетокот на антифашистичкото востание во 1941',
 'Përkujtimi i fillimit të kryengritjes antifashiste në 1941',
 '2026-10-11', 'holiday', true),

-- Day of Macedonian Revolutionary Struggle 2026 - NATIONAL
('Day of Macedonian Revolutionary Struggle',
 'Day of Macedonian Revolutionary Struggle',
 'Ден на македонската револуционерна борба',
 'Dita e Luftës Revolucionare Maqedonase',
 'Commemorating the Ilinden Uprising of 1903',
 'Commemorating the Ilinden Uprising of 1903',
 'Комеморација на Илинденското востание од 1903',
 'Përkujtimi i Kryengritjes së Ilindenit të vitit 1903',
 '2026-10-23', 'holiday', true),

-- St. Clement of Ohrid Day 2026 - ORTHODOX
('St. Clement of Ohrid Day',
 'St. Clement of Ohrid Day',
 'Св. Климент Охридски',
 'Dita e Shën Klementit të Ohrit',
 'Honoring the patron saint of North Macedonia',
 'Honoring the patron saint of North Macedonia',
 'Почитување на заштитникот на Северна Македонија',
 'Nderimi i shenjtit mbrojtës të Maqedonisë së Veriut',
 '2026-12-08', 'orthodox', true),

-- Catholic Christmas 2026 - CATHOLIC
('Catholic Christmas',
 'Catholic Christmas',
 'Католички Божиќ',
 'Krishtlindjet Katolike',
 'Catholic Christian celebration of the birth of Jesus Christ',
 'Catholic Christian celebration of the birth of Jesus Christ',
 'Католички христијански празник за раѓањето на Исус Христос',
 'Kremtimi i krishterë katolik i lindjes së Jezu Krishtit',
 '2026-12-25', 'catholic', true),

-- ==================== EARLY 2027 HOLIDAYS ====================

-- New Year's Day 2027 - NATIONAL
('New Year''s Day',
 'New Year''s Day',
 'Нова Година',
 'Viti i Ri',
 'National holiday celebrating the start of the new year',
 'National holiday celebrating the start of the new year',
 'Национален празник за почеток на новата година',
 'Festë kombëtare për fillimin e vitit të ri',
 '2027-01-01', 'holiday', true),

-- Second Day of New Year 2027 - NATIONAL
('Second Day of New Year',
 'Second Day of New Year',
 'Втор ден на Нова Година',
 'Dita e Dytë e Vitit të Ri',
 'Second day of New Year celebrations',
 'Second day of New Year celebrations',
 'Втор ден од новогодишните празници',
 'Dita e dytë e festimeve të Vitit të Ri',
 '2027-01-02', 'holiday', true),

-- Orthodox Christmas 2027 - ORTHODOX
('Orthodox Christmas',
 'Orthodox Christmas',
 'Божик',
 'Krishtlindjet Ortodokse',
 'Orthodox Christian celebration of the birth of Jesus Christ',
 'Orthodox Christian celebration of the birth of Jesus Christ',
 'Православен христијански празник за раѓањето на Исус Христос',
 'Kremtimi i krishterë ortodoks i lindjes së Jezu Krishtit',
 '2027-01-07', 'orthodox', true),

-- International Women's Day 2027 - NATIONAL
('International Women''s Day',
 'International Women''s Day',
 'Меѓународен ден на жената',
 'Dita Ndërkombëtare e Gruas',
 'Celebrating women''s achievements and rights',
 'Celebrating women''s achievements and rights',
 'Славење на достигнувањата и правата на жените',
 'Festimi i arritjeve dhe të drejtave të grave',
 '2027-03-08', 'holiday', true),

-- Eid al-Fitr 2027 - ISLAMIC
('Eid al-Fitr',
 'Eid al-Fitr',
 'Рамазан Бајрам',
 'Fitër Bajrami',
 'Islamic holiday marking the end of Ramadan',
 'Islamic holiday marking the end of Ramadan',
 'Исламски празник за крајот на Рамазанот',
 'Festë islame që shënon fundin e Ramazanit',
 '2027-03-09', 'islamic', true),

-- Catholic Easter 2027 - CATHOLIC
('Catholic Easter',
 'Catholic Easter',
 'Католички Велигден',
 'Pashkët Katolike',
 'Catholic Christian celebration of the resurrection of Jesus Christ',
 'Catholic Christian celebration of the resurrection of Jesus Christ',
 'Католички христијански празник за воскресението на Исус Христос',
 'Kremtimi i krishterë katolik i ringjalljes së Jezu Krishtit',
 '2027-03-28', 'catholic', true),

-- Orthodox Good Friday 2027 - ORTHODOX
('Orthodox Good Friday',
 'Orthodox Good Friday',
 'Велики Петок',
 'E Premtja e Madhe Ortodokse',
 'Orthodox Christian observance of the crucifixion of Jesus Christ',
 'Orthodox Christian observance of the crucifixion of Jesus Christ',
 'Православно христијанско одбележување на распнувањето на Исус Христос',
 'Përkujtimi i krishterë ortodoks i kryqëzimit të Jezu Krishtit',
 '2027-04-30', 'orthodox', true),

-- Labour Day 2027 - NATIONAL
('Labour Day',
 'Labour Day',
 'Ден на трудот',
 'Dita e Punës',
 'International Workers'' Day celebrating labor movements',
 'International Workers'' Day celebrating labor movements',
 'Меѓународен ден на работниците',
 'Dita Ndërkombëtare e Punëtorëve',
 '2027-05-01', 'holiday', true),

-- Orthodox Easter 2027 - ORTHODOX
('Orthodox Easter',
 'Orthodox Easter',
 'Велигден',
 'Pashkët Ortodokse',
 'Orthodox Christian celebration of the resurrection of Jesus Christ',
 'Orthodox Christian celebration of the resurrection of Jesus Christ',
 'Православен христијански празник за воскресението на Исус Христос',
 'Kremtimi i krishterë ortodoks i ringjalljes së Jezu Krishtit',
 '2027-05-02', 'orthodox', true),

-- Orthodox Easter Monday 2027 - ORTHODOX
('Orthodox Easter Monday',
 'Orthodox Easter Monday',
 'Велигденски Понеделник',
 'E Hëna e Pashkëve Ortodokse',
 'Second day of Orthodox Easter celebrations',
 'Second day of Orthodox Easter celebrations',
 'Втор ден од православните велигденски празници',
 'Dita e dytë e festimeve të Pashkëve Ortodokse',
 '2027-05-03', 'orthodox', true),

-- Eid al-Adha 2027 - ISLAMIC
('Eid al-Adha',
 'Eid al-Adha',
 'Курбан Бајрам',
 'Kurban Bajrami',
 'Islamic Feast of Sacrifice',
 'Islamic Feast of Sacrifice',
 'Исламски празник на жртвата',
 'Festa Islame e Kurbanit',
 '2027-05-16', 'islamic', true),

-- Saints Cyril and Methodius Day 2027 - NATIONAL
('Saints Cyril and Methodius Day',
 'Saints Cyril and Methodius Day',
 'Ден на Св. Кирил и Методиј',
 'Dita e Shën Qirilit dhe Metodit',
 'Honoring the creators of the Slavic alphabet',
 'Honoring the creators of the Slavic alphabet',
 'Почитување на создавачите на словенската азбука',
 'Nderimi i krijuesve të alfabetit sllav',
 '2027-05-24', 'holiday', true);

-- Add indexes for faster holiday queries
CREATE INDEX IF NOT EXISTS idx_events_is_holiday ON public.events(is_holiday) WHERE is_holiday = true;
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_events_type ON public.events(type);
