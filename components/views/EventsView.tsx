import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n';
import { api } from '../../services/api';
import { Icon, Icons } from '../ui';

const { getEvents } = api;

const TYPE_LABELS: Record<string, { en: string; mk: string; sq: string; color: string }> = {
    holiday: { en: 'National', mk: 'Национален', sq: 'Kombëtar', color: 'bg-amber-500' },
    orthodox: { en: 'Orthodox', mk: 'Православен', sq: 'Ortodoks', color: 'bg-blue-500' },
    catholic: { en: 'Catholic', mk: 'Католички', sq: 'Katolik', color: 'bg-purple-500' },
    islamic: { en: 'Islamic', mk: 'Исламски', sq: 'Islamik', color: 'bg-emerald-500' },
    municipal: { en: 'Municipal', mk: 'Општински', sq: 'Komunal', color: 'bg-indigo-500' },
    cultural: { en: 'Cultural', mk: 'Културен', sq: 'Kulturor', color: 'bg-pink-500' },
    sports: { en: 'Sports', mk: 'Спортски', sq: 'Sportiv', color: 'bg-orange-500' },
};

export const EventsView: React.FC = () => {
    const { t, language } = useTranslation();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                const data = await getEvents();
                setEvents(data || []);
            } catch (err) {
                console.error('Failed to fetch events:', err);
                setEvents([]);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    // Calendar logic
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

    const getEventsForDay = (day: number) => {
        const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return events.filter(e => {
            const eventDate = e.date ? e.date.split('T')[0].split(' ')[0] : '';
            return eventDate === dateStr;
        });
    };

    const getEventTitle = (event: any) => {
        const titleKey = `title_${language}` as 'title_en' | 'title_mk' | 'title_sq';
        return event[titleKey] || event.title_en || event.title;
    };

    const getTypeLabel = (type: string) => {
        const labels = TYPE_LABELS[type];
        if (!labels) return type;
        return labels[language as keyof typeof labels] || labels.en;
    };

    const getTypeColor = (type: string) => {
        return TYPE_LABELS[type]?.color || 'bg-slate-500';
    };

    // Get real upcoming event (next event from today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingEvent = events
        .filter(e => new Date(e.date) >= today)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] || null;

    // Get events for selected month
    const monthEvents = events
        .filter(e => {
            const eventDate = new Date(e.date);
            return eventDate.getMonth() === selectedDate.getMonth() && eventDate.getFullYear() === selectedDate.getFullYear();
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate days until upcoming event
    const daysUntil = upcomingEvent 
        ? Math.ceil((new Date(upcomingEvent.date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-5 pb-24">
            {/* Header */}
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('events') || 'Events'}</h1>

            {/* Upcoming Event Card - Simpler Design */}
            {upcomingEvent && (
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-4 text-white">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(upcomingEvent.type)} bg-opacity-80`}>
                                    {getTypeLabel(upcomingEvent.type)}
                                </span>
                                <span className="text-indigo-200 text-xs">
                                    {daysUntil === 0 ? t('today') || 'Today' : 
                                     daysUntil === 1 ? t('tomorrow') || 'Tomorrow' : 
                                     `${daysUntil} ${t('days_away') || 'days away'}`}
                                </span>
                            </div>
                            <h2 className="text-lg font-bold mb-1">{getEventTitle(upcomingEvent)}</h2>
                            <p className="text-indigo-200 text-sm">
                                {new Date(upcomingEvent.date).toLocaleDateString(language === 'mk' ? 'mk-MK' : language === 'sq' ? 'sq-AL' : 'en-US', { 
                                    weekday: 'long',
                                    month: 'long', 
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </p>
                        </div>
                        <div className="bg-white/20 rounded-xl p-3 text-center min-w-[60px]">
                            <span className="text-2xl font-bold">{new Date(upcomingEvent.date).getDate()}</span>
                            <p className="text-xs uppercase">{new Date(upcomingEvent.date).toLocaleDateString(language === 'mk' ? 'mk-MK' : 'en', { month: 'short' })}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Calendar Widget - Cleaner Design */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                        {selectedDate.toLocaleDateString(language === 'mk' ? 'mk-MK' : language === 'sq' ? 'sq-AL' : 'en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <div className="flex gap-1">
                        <button 
                            onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))} 
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <Icon path={Icons.chevronLeft} size={18} className="text-slate-600 dark:text-slate-400" />
                        </button>
                        <button 
                            onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))} 
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <Icon path={Icons.chevronRight} size={18} className="text-slate-600 dark:text-slate-400" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <span key={i} className="text-xs text-slate-400 font-medium py-1">{d}</span>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {padding.map((_, i) => <div key={`pad-${i}`} className="aspect-square" />)}
                    {dayList.map(day => {
                        const dayEvents = getEventsForDay(day);
                        const isToday = new Date().getDate() === day && 
                                        new Date().getMonth() === selectedDate.getMonth() && 
                                        new Date().getFullYear() === selectedDate.getFullYear();
                        const isSelected = selectedDate.getDate() === day;
                        const hasEvents = dayEvents.length > 0;

                        return (
                            <button
                                key={day}
                                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day))}
                                className={`aspect-square flex flex-col items-center justify-center relative rounded-lg transition-all text-sm
                                    ${isSelected ? 'bg-indigo-600 text-white font-semibold' : 
                                      isToday ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold' :
                                      'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}
                                `}
                            >
                                {day}
                                {hasEvents && (
                                    <div className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-500'}`}></div>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Events List */}
            <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                    {t('events_for') || 'Events for'} {selectedDate.toLocaleDateString(language === 'mk' ? 'mk-MK' : language === 'sq' ? 'sq-AL' : 'en-US', { month: 'long', year: 'numeric' })}
                </h3>

                <div className="space-y-2">
                    {monthEvents.length > 0 ? (
                        monthEvents.map((event, index) => {
                            const date = new Date(event.date);
                            const isSelectedDay = date.getDate() === selectedDate.getDate();
                            return (
                                <div 
                                    key={index} 
                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                                        isSelectedDay 
                                            ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' 
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                    }`}
                                >
                                    <div className="flex-shrink-0 w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl flex flex-col items-center justify-center">
                                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase">
                                            {date.toLocaleDateString(language === 'mk' ? 'mk-MK' : 'en', { month: 'short' })}
                                        </span>
                                        <span className="text-lg font-bold text-slate-900 dark:text-white leading-none">{date.getDate()}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                                            {getEventTitle(event)}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={`w-2 h-2 rounded-full ${getTypeColor(event.type)}`}></span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                {getTypeLabel(event.type)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-8 text-slate-400">
                            <Icon path={Icons.calendar} size={40} className="mx-auto mb-2 opacity-50" />
                            <p>{t('no_events_month') || 'No events this month'}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
