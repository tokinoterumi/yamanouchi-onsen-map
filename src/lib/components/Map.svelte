<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import type { MapLayer } from '$lib/types';
	import type { MicroCMSRyokan } from '$lib/microcms';
	import { LAYER_BUTTONS } from '$lib/types';
	import maplibregl from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';

	// Enhanced props interface
	interface MapProps {
		activeSection?: string;
		onMarkerClick?: (ryokan: MicroCMSRyokan) => void;
		onMapClick?: () => void;
		initialCenter?: [number, number];
		initialZoom?: number;
	}

	let { 
		activeSection = 'onsen', 
		onMarkerClick, 
		onMapClick,
		initialCenter = [138.4308, 36.7428], // Yamanouchi area coordinates
		initialZoom = 13
	}: MapProps = $props();

	// State variables
	let mapContainer: HTMLDivElement;
	let map: maplibregl.Map | null = null;
	let currentMarkers: maplibregl.Marker[] = [];
	let activeLayer: MapLayer = $state('onsen');
	let activeRyokanId: string | undefined = $state();
	let isMapLoaded = $state(false);
	let loadingError = $state(false);

	const layerButtons = LAYER_BUTTONS;

	// Get ryokan data from SvelteKit load function
	let ryokans = $derived((page.data.ryokans as MicroCMSRyokan[]) || []);

	// Debounce utility function
	function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
		let timeout: NodeJS.Timeout;
		return ((...args: any[]) => {
			clearTimeout(timeout);
			timeout = setTimeout(() => func(...args), wait);
		}) as T;
	}

	// Debounced filter function
	const debouncedFilterMarkers = debounce(filterMarkers, 150);

	onMount(async () => {
		try {
			// Initialize MapLibre GL map
			map = new maplibregl.Map({
				container: mapContainer,
				style: {
					version: 8,
					sources: {
						'osm-tiles': {
							type: 'raster',
							tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
							tileSize: 256,
							attribution: '© OpenStreetMap contributors'
						}
					},
					layers: [
						{
							id: 'osm-tiles',
							type: 'raster',
							source: 'osm-tiles'
						}
					]
				},
				center: initialCenter,
				zoom: initialZoom,
				maxZoom: 18
			});

			// Handle map load event
			map.on('load', () => {
				isMapLoaded = true;
				if (ryokans.length > 0) {
					filterMarkers(activeLayer);
				}
				console.log('Map loaded successfully!');
			});

			// Handle map errors
			map.on('error', (e) => {
				console.error('Map error:', e);
				loadingError = true;
			});

			// Handle map clicks
			map.on('click', (e) => {
				const target = e.originalEvent?.target as HTMLElement;
				if (!target?.closest('.custom-marker')) {
					activeRyokanId = undefined;
					onMapClick?.();
				}
			});

		} catch (error) {
			console.error('Error initializing map:', error);
			loadingError = true;
		}

		// Cleanup function
		return () => {
			if (map) {
				map.remove();
				map = null;
			}
		};
	});

	function createRyokanMarker(ryokan: MicroCMSRyokan): maplibregl.Marker | null {
		if (!map) return null;

		const isActive = ryokan.id === activeRyokanId;
		const markerElement = document.createElement('div');
		markerElement.className = `custom-marker ${isActive ? 'active' : ''}`;
		markerElement.innerHTML = '<span>🏮</span>';
		markerElement.setAttribute('role', 'button');
		markerElement.setAttribute('tabindex', '0');
		markerElement.setAttribute('aria-label', `${ryokan.name}を選択`);

		const marker = new maplibregl.Marker({
			element: markerElement,
			anchor: 'bottom'
		}).setLngLat([ryokan.longitude, ryokan.latitude]);

		// Handle marker clicks
		const handleClick = (e: Event) => {
			e.stopPropagation();
			handleMarkerClick(ryokan);
		};

		// Handle keyboard interactions
		const handleKeydown = (e: KeyboardEvent) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				handleMarkerClick(ryokan);
			}
		};

		markerElement.addEventListener('click', handleClick);
		markerElement.addEventListener('keydown', handleKeydown);

		return marker;
	}

	function handleMarkerClick(ryokan: MicroCMSRyokan) {
		activeRyokanId = ryokan.id;
		onMarkerClick?.(ryokan);

		// Update marker styles
		updateMarkerStyles();

		// Center map on selected marker
		if (map) {
			map.flyTo({
				center: [ryokan.longitude, ryokan.latitude],
				zoom: Math.max(map.getZoom(), 15),
				duration: 1000
			});
		}
	}

	function updateMarkerStyles() {
		currentMarkers.forEach(marker => {
			const element = marker.getElement();
			const lngLat = marker.getLngLat();
			const ryokan = ryokans.find(r => 
				Math.abs(r.longitude - lngLat.lng) < 0.0001 && 
				Math.abs(r.latitude - lngLat.lat) < 0.0001
			);
			
			if (ryokan) {
				element.className = `custom-marker ${ryokan.id === activeRyokanId ? 'active' : ''}`;
			}
		});
	}

	function addRyokanMarkers() {
		ryokans.forEach((ryokan) => {
			if (ryokan.latitude && ryokan.longitude) {
				const marker = createRyokanMarker(ryokan);
				if (marker) {
					marker.addTo(map!);
					currentMarkers.push(marker);
				}
			} else {
				console.warn(`Skipping marker for '${ryokan.name}' due to missing coordinates.`);
			}
		});
	}

	function clearMarkers() {
		currentMarkers.forEach(marker => marker.remove());
		currentMarkers = [];
	}

	function fitMapToBounds() {
		if (currentMarkers.length > 0 && map) {
			const bounds = new maplibregl.LngLatBounds();
			currentMarkers.forEach(marker => {
				bounds.extend(marker.getLngLat());
			});
			
			map.fitBounds(bounds, {
				padding: { top: 50, bottom: 50, left: 50, right: 50 },
				maxZoom: 15,
				duration: 1000
			});
		}
	}

	function filterMarkers(layer: MapLayer) {
		if (!map || !isMapLoaded) {
			console.log('Map not ready yet, skipping filter');
			return;
		}

		// Clear existing markers
		clearMarkers();

		// Add markers based on layer
		switch (layer) {
			case 'ryokan':
			case 'all':
				addRyokanMarkers();
				break;
			case 'onsen':
				// Future: add onsen-specific markers
				// For now, show ryokans as they often have onsen
				addRyokanMarkers();
				break;
			case 'spot':
				// Future: add historical spot markers
				console.log('Historical spots layer not yet implemented');
				break;
			default:
				console.warn(`Unknown layer: ${layer}`);
		}

		console.log(`Showing ${currentMarkers.length} markers for layer: ${layer}`);

		// Fit map to show all markers
		if (currentMarkers.length > 0) {
			fitMapToBounds();
		}
	}

	function handleLayerClick(layer: MapLayer) {
		if (ryokans.length === 0) return;
		activeLayer = layer;
		activeRyokanId = undefined; // Clear selection when changing layers
	}

	// Effect to handle filtering when activeLayer or ryokans change
	$effect(() => {
		if (!map || !isMapLoaded || !ryokans) return;
		debouncedFilterMarkers(activeLayer);
	});

	// Effect to handle activeRyokanId changes
	$effect(() => {
		updateMarkerStyles();
	});

	// Effect to handle parent section changes and map resize
	$effect(() => {
		if (!map) return;
		
		// Resize map when container changes
		setTimeout(() => map?.resize(), 100);

		// Map activeSection to layer
		const layerMap: Record<string, MapLayer> = {
			onsen: 'onsen',
			ryokan: 'ryokan',
			history: 'spot'
		};
		
		const newLayer = layerMap[activeSection] || 'ryokan';
		if (newLayer !== activeLayer) {
			activeLayer = newLayer;
		}
	});
</script>

<section class="hero-section">
	<div class="map-container">
		{#if ryokans.length === 0 || !isMapLoaded}
			<div class="loading-overlay">
				<div class="loading-spinner">🏮</div>
				{#if loadingError}
					<p class="error">エラーが発生しました。ページを再読み込みしてください。</p>
				{:else}
					<p>温泉旅館を読み込み中...</p>
				{/if}
			</div>
		{/if}

		<div class="map-controls">
			{#each layerButtons as button}
				<button
					class="map-filter"
					class:active={activeLayer === button.id}
					class:disabled={ryokans.length === 0}
					onclick={() => handleLayerClick(button.id)}
					aria-pressed={activeLayer === button.id}
					aria-label={`${button.label}を表示`}
				>
					{button.label}
					{#if button.id === 'ryokan'}
						<span class="count">({ryokans.length})</span>
					{/if}
				</button>
			{/each}
		</div>
		
		<div class="map" bind:this={mapContainer} role="application" aria-label="インタラクティブマップ"></div>
	</div>
</section>

<style>
	.hero-section {
		height: 70vh;
		position: relative;
		background: var(--cream);
	}

	.map-container {
		width: 100%;
		height: 100%;
		position: relative;
	}

	.map {
		width: 100%;
		height: 100%;
	}

	.loading-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(255, 248, 240, 0.95);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		font-family: 'Noto Serif JP', serif;
	}

	.loading-spinner {
		font-size: 3rem;
		animation: spin 2s linear infinite;
		margin-bottom: 1rem;
	}

	.error {
		color: var(--crimson);
		font-weight: 600;
		text-align: center;
		margin-top: 1rem;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.map-controls {
		position: absolute;
		top: 20px;
		right: 20px;
		z-index: 1000;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.map-filter {
		background: white;
		border: none;
		padding: 12px 20px;
		border-radius: 25px;
		font-family: 'Noto Serif JP', serif;
		font-size: 0.9rem;
		cursor: pointer;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
		transition: all 0.3s ease;
		color: var(--dark-text);
		min-width: 120px;
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 5px;
	}

	.map-filter:hover:not(.disabled),
	.map-filter.active {
		background: var(--crimson);
		color: white;
		transform: translateY(-2px);
	}

	.map-filter:focus {
		outline: 2px solid var(--crimson);
		outline-offset: 2px;
	}

	.map-filter.disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.count {
		background: rgba(0, 0, 0, 0.2);
		color: white;
		padding: 2px 6px;
		border-radius: 10px;
		font-size: 0.7rem;
	}

	.map-filter.active .count {
		background: rgba(255, 255, 255, 0.3);
	}

	/* Custom marker styles */
	:global(.custom-marker) {
		width: 38px;
		height: 38px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--crimson);
		color: white;
		border: 3px solid white;
		border-radius: 50% 50% 50% 0;
		box-shadow: 0 6px 15px rgba(0, 0, 0, 0.25);
		font-size: 1.2rem;
		cursor: pointer;
		transform: rotate(45deg);
		transition: all 0.2s ease-out;
	}

	:global(.custom-marker:hover),
	:global(.custom-marker:focus) {
		transform: rotate(45deg) scale(1.1);
		outline: none;
	}

	:global(.custom-marker.active) {
		transform: rotate(45deg) scale(1.15);
		border-color: #ffc107;
		z-index: 1000;
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
	}

	:global(.custom-marker span) {
		transform: rotate(-45deg);
		pointer-events: none;
	}

	@media (max-width: 768px) {
		.hero-section {
			height: 60vh;
		}

		.map-controls {
			right: 10px;
			top: 10px;
		}

		.map-filter {
			min-width: 100px;
			padding: 10px 15px;
			font-size: 0.8rem;
		}

		:global(.custom-marker) {
			width: 32px;
			height: 32px;
			font-size: 1rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.loading-spinner {
			animation: none;
		}
		
		:global(.custom-marker) {
			transition: none;
		}
	}
</style>