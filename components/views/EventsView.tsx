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

    const getEventDescription = (event: any) => {
        const descKey = `description_${language}` as 'description_en' | 'description_mk' | 'description_sq';
        return event[descKey] || event.description_en || event.description;
    };

    // Get upcoming event (first future event)
    const upcomingEvent = events.length > 0 ? events[0] : null; // Simplified for now, ideally sort by date > now

    // Get events for selected month
    const monthEvents = events.filter(e => {
        const eventDate = new Date(e.date);
        return eventDate.getMonth() === selectedDate.getMonth() && eventDate.getFullYear() === selectedDate.getFullYear();
    });

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button className="p-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <Icon path={Icons.chevronLeft} size={20} />
                </button>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Events</h1>
                <div className="w-10"></div> {/* Spacer for centering */}
            </div>

            {/* Upcoming Event Card */}
            {upcomingEvent && (
                <div className="relative h-48 rounded-[2rem] overflow-hidden shadow-xl group cursor-pointer">
                    <img
                        src={upcomingEvent.photo_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80'}
                        alt="Event"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-90"></div>
                    <div className="absolute bottom-0 left-0 p-6 text-white w-full">
                        <p className="text-indigo-300 font-medium text-sm mb-1 uppercase tracking-wider">Upcoming</p>
                        <h2 className="text-2xl font-bold mb-1 leading-tight">{getEventTitle(upcomingEvent)}</h2>
                        <p className="text-slate-300 text-sm flex items-center gap-1">
                            <span className="opacity-80">{new Date(upcomingEvent.date).toLocaleDateString(language, { month: 'long', day: 'numeric' })}</span>
                            <span className="mx-1">•</span>
                            <span className="opacity-80">{upcomingEvent.location || 'City Square'}</span>
                        </p>
                    </div>
                </div>
            )}

            {/* Calendar Widget */}
            <div className="bg-[#1a1f37] dark:bg-slate-900 rounded-[2rem] p-6 text-white shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold">
                        {selectedDate.toLocaleDateString(language, { month: 'long', year: 'numeric' })}
                    </h3>
                    <div className="flex gap-2">
                        <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                            <Icon path={Icons.chevronLeft} size={20} />
                        </button>
                        <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                            <Icon path={Icons.chevronRight} size={20} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-y-4 text-center mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <span key={i} className="text-xs text-slate-400 font-medium">{d}</span>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-y-2">
                    {padding.map((_, i) => <div key={`pad-${i}`} />)}
                    {dayList.map(day => {
                        const dayEvents = getEventsForDay(day);
                        const isSelected = selectedDate.getDate() === day;
                        const hasEvents = dayEvents.length > 0;

                        return (
                            <button
                                key={day}
                                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day))}
                                className={`aspect-square flex flex-col items-center justify-center relative rounded-xl transition-all text-sm font-medium
                                    ${isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-300 hover:bg-white/5'}
                                `}
                            >
                                {day}
                                {hasEvents && !isSelected && (
                                    <div className="w-1 h-1 rounded-full bg-indigo-400 mt-1"></div>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Events List */}
            <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                    Events for {selectedDate.toLocaleDateString(language, { month: 'long' })}
                </h3>

                <div className="space-y-3">
                    {monthEvents.length > 0 ? (
                        monthEvents.map((event, index) => {
                            const date = new Date(event.date);
                            return (
                                <div key={index} className="flex items-center gap-4 p-4 bg-[#1a1f37] dark:bg-slate-900 rounded-[1.5rem] text-white shadow-sm">
                                    <div className="flex-shrink-0 w-14 h-14 bg-indigo-500/10 rounded-2xl flex flex-col items-center justify-center text-indigo-400">
                                        <span className="text-[10px] font-bold uppercase">{date.toLocaleDateString(language, { month: 'short' })}</span>
                                        <span className="text-xl font-bold leading-none">{date.getDate()}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-base truncate">{getEventTitle(event)}</h4>
                                        <p className="text-slate-400 text-xs">
                                            {event.type === 'holiday' ? t('national_holiday') : t('municipality_event')} • {date.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-8 text-slate-400">
                            <p>{t('no_events_month')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
