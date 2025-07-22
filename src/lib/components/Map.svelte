<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import type { MapLayer } from '$lib/types';
	import type { MicroCMSRyokan } from '$lib/microcms';
	import { LAYER_BUTTONS } from '$lib/types';
	import maplibregl from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';

	// Updated props interface to handle MicroCMSRyokan
	interface MapProps {
		activeSection?: string;
		onMarkerClick?: (ryokan: MicroCMSRyokan) => void;
		onMapClick?: () => void;
	}

	let { activeSection = 'onsen', onMarkerClick, onMapClick }: MapProps = $props();

	let mapContainer: HTMLDivElement;
	let map: maplibregl.Map;
	let currentMarkers: maplibregl.Marker[] = [];
	let activeLayer: MapLayer = $state('onsen');

	const layerButtons = LAYER_BUTTONS;

	// Get ryokan data from SvelteKit load function using Svelte 5 runes
	let ryokans = $derived((page.data.ryokans as MicroCMSRyokan[]) || []);

	// Yamanouchi area coordinates
	const YAMANOUCHI_CENTER: [number, number] = [138.4308, 36.7428];
	const DEFAULT_ZOOM = 13;

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
				center: YAMANOUCHI_CENTER,
				zoom: DEFAULT_ZOOM,
				maxZoom: 18
			});

			// Handle map clicks
			map.on('click', (e) => {
				if (!(e.originalEvent?.target as HTMLElement)?.closest('.custom-marker')) {
					onMapClick?.();
				}
			});

			// Initialize with ryokan markers once data is available
			if (ryokans.length > 0) {
				filterMarkers('ryokan');
			}

			console.log('Map initialized successfully!');
		} catch (error) {
			console.error('Error initializing map:', error);
		}
	});

	function createRyokanMarker(ryokan: MicroCMSRyokan) {
		if (!map) return null;

		// Create marker element
		const markerEl = document.createElement('div');
		markerEl.className = 'custom-marker marker-ryokan';
		markerEl.innerHTML = '🏮';
		markerEl.title = ryokan.name;

		// Handle marker click
		markerEl.addEventListener('click', (e) => {
			e.stopPropagation();
			onMarkerClick?.(ryokan);
		});

		// Create MapLibre marker
		const marker = new maplibregl.Marker(markerEl).setLngLat([ryokan.latitude, ryokan.longitude]);

		return marker;
	}

	function filterMarkers(layer: MapLayer) {
		if (!map) {
			console.log('Map not ready yet, skipping filter');
			return;
		}

		// Clear existing markers
		currentMarkers.forEach((marker) => {
			marker.remove();
		});
		currentMarkers = [];

		// For now, only show ryokans since that's what we have from microCMS
		if (layer === 'ryokan' || layer === 'all') {
			ryokans.forEach((ryokan) => {
				const marker = createRyokanMarker(ryokan);
				if (marker) {
					marker.addTo(map);
					currentMarkers.push(marker);
				}
			});
		}

		console.log(`Showing ${currentMarkers.length} markers for layer: ${layer}`);

		// Fit map to show all markers if there are any
		if (currentMarkers.length > 0) {
			const bounds = new maplibregl.LngLatBounds();
			currentMarkers.forEach((marker) => {
				bounds.extend(marker.getLngLat());
			});
			map.fitBounds(bounds, {
				padding: { top: 50, bottom: 50, left: 50, right: 50 },
				maxZoom: 15
			});
		}
	}

	function handleLayerClick(layer: MapLayer) {
		activeLayer = layer;
		filterMarkers(layer);
	}

	// Re-filter markers when ryokan data changes or loads
	$effect(() => {
		if (!map || ryokans.length === 0) return;

		// Determine the target layer from the parent component's activeSection
		const layerMap: Record<string, MapLayer> = {
			onsen: 'onsen',
			ryokan: 'ryokan',
			history: 'spot'
		};
		const targetLayer = layerMap[activeSection] || 'ryokan';

		// Update the local state and filter the markers
		if (targetLayer !== activeLayer) {
			activeLayer = targetLayer;
		}

		filterMarkers(activeLayer);
	});
</script>

<section class="hero-section">
	<div class="map-container">
		{#if ryokans.length === 0}
			<div class="loading-overlay">
				<div class="loading-spinner">🏮</div>
				<p>温泉旅館を読み込み中...</p>
			</div>
		{/if}

		<div class="map-controls">
			{#each layerButtons as button}
				<button
					class="map-filter"
					class:active={activeLayer === button.id}
					class:disabled={ryokans.length === 0}
					onclick={() => handleLayerClick(button.id)}
				>
					{button.label}
					{#if button.id === 'ryokan'}
						<span class="count">({ryokans.length})</span>
					{/if}
				</button>
			{/each}
		</div>
		<div class="map" bind:this={mapContainer}></div>
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
		background: rgba(255, 248, 240, 0.9);
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
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
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

	.map-filter:hover,
	.map-filter.active {
		background: var(--crimson);
		color: white;
		transform: translateY(-2px);
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

	/* Modern Airbnb-style markers */
	:global(.custom-marker) {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: linear-gradient(135deg, #ff385c 0%, #e61e4d 100%);
		border: 3px solid white;
		box-shadow:
			0 4px 15px rgba(230, 30, 77, 0.4),
			0 2px 8px rgba(0, 0, 0, 0.15);
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.2rem;
		color: white;
		position: relative;
	}

	:global(.custom-marker::before) {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		width: 0;
		height: 0;
		border-left: 8px solid transparent;
		border-right: 8px solid transparent;
		border-top: 8px solid #e61e4d;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
	}

	:global(.custom-marker:hover) {
		transform: translateY(-2px) scale(1.1);
		box-shadow:
			0 8px 25px rgba(230, 30, 77, 0.5),
			0 4px 12px rgba(0, 0, 0, 0.2);
		z-index: 1000;
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
	}
</style>
