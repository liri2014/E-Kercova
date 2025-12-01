// Lazy-loaded view components for better performance
import { lazy } from 'react';

// Core views - loaded immediately for best UX
export { HomeView } from './HomeView';

// Lazy load less frequently used views
export const MapView = lazy(() => import('./MapView').then(m => ({ default: m.MapView })));
export const ReportView = lazy(() => import('./ReportView').then(m => ({ default: m.ReportView })));
export const ParkingView = lazy(() => import('./ParkingView').then(m => ({ default: m.ParkingView })));
export const EventsView = lazy(() => import('./EventsView').then(m => ({ default: m.EventsView })));
export const NewsView = lazy(() => import('./NewsView').then(m => ({ default: m.NewsView })));
export const WalletView = lazy(() => import('./WalletView').then(m => ({ default: m.WalletView })));
export const HistoryView = lazy(() => import('./HistoryView').then(m => ({ default: m.HistoryView })));
export const MenuHub = lazy(() => import('./MenuHub').then(m => ({ default: m.MenuHub })));
export const CommunityView = lazy(() => import('./CommunityView').then(m => ({ default: m.CommunityView })));
export const ServicesView = lazy(() => import('./ServicesView').then(m => ({ default: m.ServicesView })));
export const SearchView = lazy(() => import('./SearchView').then(m => ({ default: m.SearchView })));

