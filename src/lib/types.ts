export type Section = 'onsen' | 'ryokan' | 'history';
export type Language = 'ja' | 'zh' | 'en';
export type MapItemType = 'onsen' | 'ryokan' | 'spot';
export type MapLayer = MapItemType | 'all';

export interface MapItem {
	name: string;
	pos: [number, number];
	type: MapItemType;
	icon: string;
	description: string;
	details: string;
	image: string;
}

export interface ContentData {
	title: string;
	subtitle: string;
	content: string;
	gallery: string[];
}

export interface NavbarProps {
	activeSection?: Section;
	activeLanguage?: Language;
	onSectionChange?: (section: Section) => void;
	onLanguageChange?: (language: Language) => void;
}

export interface MapProps {
	activeSection?: Section;
	onMarkerClick?: (item: MapItem) => void;
	onMapClick?: () => void;
}

export interface InfoCardProps {
	isVisible?: boolean;
	item?: MapItem | null;
	onDetailsClick?: () => void;
	onPhotosClick?: () => void;
}

export interface RyokanFilters {
	priceRange: { min: number; max: number } | null;
	facilities: string[];
	dining: string[];
	hasLanguageService: boolean;
	tattooFriendly: boolean;
	dailyUse: boolean;
}

export interface FilterBarProps {
	filters?: RyokanFilters;
	resultCount?: number;
	onFiltersChange?: (filters: RyokanFilters) => void;
}

// Data constants
export const SECTIONS = [
	{ id: 'onsen' as const, label: '湯場めぐり' },
	{ id: 'ryokan' as const, label: '宿の案内' },
	{ id: 'history' as const, label: '歴史の記憶' }
] as const;

export const LANGUAGES = [
	{ id: 'ja' as const, label: '日本語' },
	{ id: 'zh' as const, label: '中文' },
	{ id: 'en' as const, label: 'EN' }
] as const;

export const LAYER_BUTTONS = [
	{ id: 'onsen' as const, label: '温泉源泉' },
	{ id: 'ryokan' as const, label: '宿泊施設' },
	{ id: 'spot' as const, label: '名所・史跡' },
	{ id: 'all' as const, label: '全て表示' }
] as const;
