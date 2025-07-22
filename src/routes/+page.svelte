<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import Navbar from '$lib/components/Navbar.svelte';
	import Map from '$lib/components/Map.svelte';
	import InfoCard from '$lib/components/InfoCard.svelte';
	import Column from '$lib/components/Column.svelte';
	import { transformMicroCMSRyokanForInfoCard, type MicroCMSRyokan } from '$lib/microcms';

	type Section = 'onsen' | 'ryokan' | 'history';
	type Language = 'ja' | 'zh' | 'en';

	interface MapItem {
		name: string;
		pos: [number, number];
		type: 'onsen' | 'ryokan' | 'spot';
		icon: string;
		description: string;
		details: string;
		image: string;
	}

	// Get current section from URL, default to 'onsen'
	let activeSection: Section = $state('onsen');
	let activeLanguage: Language = $state('ja');
	let selectedItem: MapItem | null = $state(null);
	let showInfoCard: boolean = $state(false);

	// Get ryokan data from microCMS (loaded server-side)
	let ryokans = $derived((page.data.ryokans as MicroCMSRyokan[]) || []);

	// Reactive statement to update section from URL
	$effect(() => {
		if (typeof window !== 'undefined') {
			const url = new URL(window.location.href);
			const urlSection = url.searchParams.get('section') as Section;
			if (urlSection && ['onsen', 'ryokan', 'history'].includes(urlSection)) {
				activeSection = urlSection;
			} else {
				activeSection = 'onsen';
			}
		}
	});

	function handleSectionChange(section: Section) {
		// Update URL with new section
		const url = new URL(window.location.href);
		url.searchParams.set('section', section);

		// Navigate to new URL (this will update browser history)
		goto(url, {
			noScroll: false, // Allow scrolling to show section change
			keepFocus: true, // Maintain focus for accessibility
			replaceState: false // Create new history entry (enables back/forward)
		});

		// Hide info card when section changes
		showInfoCard = false;
		selectedItem = null;

		// Smooth scroll to appropriate section
		setTimeout(() => scrollToSection(section), 100);
	}

	function handleLanguageChange(language: Language) {
		activeLanguage = language;
		// Here you could implement language switching logic
		// Could also update URL if you want language persistence
	}

	// Updated to handle MicroCMS ryokan data
	function handleMarkerClick(ryokan: MicroCMSRyokan) {
		console.log('Marker clicked:', ryokan);

		// Transform microCMS data to MapItem format for InfoCard
		selectedItem = transformMicroCMSRyokanForInfoCard(ryokan);
		showInfoCard = true;
	}

	function handleMapClick() {
		showInfoCard = false;
		selectedItem = null;
	}

	function handleDetailsClick() {
		if (selectedItem) {
			// Navigate to detailed ryokan page
			// You can use the ryokan slug or name for the URL
			const ryokanSlug = selectedItem.name; // or get slug from original data
			goto(`/ryokan/${encodeURIComponent(ryokanSlug)}`);
		} else {
			// Fallback: scroll to content section
			scrollToContentSection();
		}
	}

	function handlePhotosClick() {
		if (selectedItem) {
			console.log('Photos clicked for:', selectedItem.name);
			// Navigate to photo gallery or open modal
			const ryokanSlug = selectedItem.name;
			goto(`/ryokan/${encodeURIComponent(ryokanSlug)}/photos`);
		}
	}

	function scrollToSection(section: Section) {
		if (section === 'onsen' || section === 'ryokan') {
			// Scroll to map for interactive sections
			const mapSection = document.querySelector('.map-section');
			if (mapSection) {
				mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		} else {
			// Scroll to content for history section
			scrollToContentSection();
		}
	}

	function scrollToContentSection() {
		const contentSection = document.querySelector('.content-section');
		if (contentSection) {
			contentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	// Initialize section from URL on mount
	onMount(() => {
		const url = new URL(window.location.href);
		const urlSection = url.searchParams.get('section') as Section;
		if (urlSection && ['onsen', 'ryokan', 'history'].includes(urlSection)) {
			activeSection = urlSection;
			// Scroll to appropriate section on initial load
			setTimeout(() => scrollToSection(urlSection), 100);
		}
	});

	// Generate page title based on active section
	let pageTitle = $derived(() => {
		switch (activeSection) {
			case 'onsen':
				return '山ノ内町 温泉探訪 - 湯場めぐり';
			case 'ryokan':
				return '山ノ内町 温泉探訪 - 宿の案内';
			case 'history':
				return '山ノ内町 温泉探訪 - 歴史の記憶';
			default:
				return '山ノ内町 温泉探訪';
		}
	});

	// Debug: Log ryokan data when it loads
	$effect(() => {
		if (ryokans.length > 0) {
			console.log(`Loaded ${ryokans.length} ryokans from microCMS:`, ryokans);
		}
	});
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta
		name="description"
		content="山ノ内町の温泉、旅館、歴史スポットをインタラクティブマップで探索"
	/>
	<link
		href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;600;800&family=Noto+Serif+JP:wght@400;500;700&display=swap"
		rel="stylesheet"
	/>
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css" />
</svelte:head>

<main>
	<Navbar
		bind:activeSection
		bind:activeLanguage
		onSectionChange={handleSectionChange}
		onLanguageChange={handleLanguageChange}
	/>

	<div class="map-section">
		<!-- Pass activeSection as string to match Map component expectations -->
		<Map {activeSection} onMarkerClick={handleMarkerClick} onMapClick={handleMapClick} />

		<InfoCard
			isVisible={showInfoCard}
			item={selectedItem}
			onDetailsClick={handleDetailsClick}
			onPhotosClick={handlePhotosClick}
		/>
	</div>

	<Column {activeSection} />
</main>

<style>
	:global(*) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	:global(:root) {
		--crimson: #bb5561;
		--cream: #feecd2;
		--dark-text: #2c1810;
		--light-crimson: rgba(187, 85, 97, 0.1);
		--shadow-soft: rgba(187, 85, 97, 0.15);
		--bg-white: #fefefe;
	}

	:global(body) {
		font-family: 'Noto Serif JP', serif;
		background: var(--bg-white);
		color: var(--dark-text);
		line-height: 1.6;
	}

	main {
		min-height: 100vh;
	}

	.map-section {
		position: relative;
	}

	/* Ensure Leaflet styles are properly loaded */
	:global(.leaflet-container) {
		font-family: 'Noto Serif JP', serif;
	}

	/* Global responsive adjustments */
	@media (max-width: 768px) {
		main {
			font-size: 0.9rem;
		}
	}
</style>