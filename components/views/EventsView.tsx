import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n';
import { api } from '../../services/api';
import { Icon, Icons, Card } from '../ui';

const { getEvents } = api;

export const EventsView: React.FC = () => {
    const { t, language } = useTranslation();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                const data = await getEvents();
                setEvents(data || []);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch events:', err);
                setError('Failed to load events');
                setEvents([]);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500">{t('loading')}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex items-center justify-center p-6">
                <div className="text-center">
                    <Icon path={Icons.alertCircle} size={48} className="text-red-500 mx-auto mb-4" />
                    <p className="text-slate-500">{error}</p>
                </div>
            </div>
        );
    }

    // Simple calendar generation logic
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return { days, firstDay };
    };

    const { days, firstDay } = getDaysInMonth(selectedDate);
    const dayList = Array.from({ length: days }, (_, i) => i + 1);
    const padding = Array.from({ length: firstDay }, (_, i) => null);

    const getEventForDay = (day: number) => {
        const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const event = events.find(e => {
            // Extract date portion from timestamp (e.g., "2025-12-01 02:12:51..." -> "2025-12-01")
            const eventDate = e.date ? e.date.split('T')[0].split(' ')[0] : '';
            return eventDate === dateStr;
        });
        if (event) {
            const titleKey = `title_${language}` as 'title_en' | 'title_mk' | 'title_sq';
            return {
                type: event.is_holiday ? 'holiday' : 'event',
                title: event[titleKey] || event.title_en || event.title
            };
        }
        return null;
    };

    const selectedEvent = getEventForDay(selectedDate.getDate());

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('events')}</h2>

            <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}>
                        <Icon path={Icons.chevronLeft} />
                    </button>
                    <span className="font-bold text-lg">{t(`month_${selectedDate.getMonth()}`)} {selectedDate.getFullYear()}</span>
                    <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}>
                        <Icon path={Icons.chevronRight} />
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center mb-2">
                    {[0, 1, 2, 3, 4, 5, 6].map(d => <span key={d} className="text-xs text-slate-400 font-medium">{t(`day_${d}`)}</span>)}
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {padding.map((_, i) => <div key={`pad-${i}`} />)}
                    {dayList.map(day => {
                        const evt = getEventForDay(day);
                        const isSelected = selectedDate.getDate() === day;
                        return (
                            <button
                                key={day}
                                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day))}
                                className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                            >
                                <span className="text-sm font-medium">{day}</span>
                                {evt && (
                                    <div className={`w-1.5 h-1.5 rounded-full mt-1 ${evt.type === 'holiday' ? 'bg-rose-500' : 'bg-indigo-400'} ${isSelected ? 'bg-white' : ''}`} />
                                )}
                            </button>
                        )
                    })}
                </div>
            </Card>

            {/* Selected Day Detail */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 min-h-[120px] flex items-center justify-center text-center">
                {selectedEvent ? (
                    <div>
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${selectedEvent.type === 'holiday' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30'}`}>
                            {selectedEvent.type === 'holiday' ? t('national_holiday') : t('municipality_event')}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedEvent.title}</h3>
                    </div>
                ) : (
                    <p className="text-slate-400">{t('no_events_today')}</p>
                )}
            </div>
        </div>
    );
};
