<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import type { MapLayer } from '$lib/types';
	import type { MicroCMSRyokan } from '$lib/microcms';
	import { LAYER_BUTTONS } from '$lib/types';

	// Updated props interface to handle MicroCMSRyokan
	interface MapProps {
		activeSection?: string;
		onMarkerClick?: (ryokan: MicroCMSRyokan) => void;
		onMapClick?: () => void;
	}

	let { activeSection = 'onsen', onMarkerClick, onMapClick }: MapProps = $props();

	let mapContainer: HTMLDivElement;
	let map: any;
	let L: any;
	let currentMarkers: any[] = [];
	let activeLayer: MapLayer = $state('onsen');

	const layerButtons = LAYER_BUTTONS;

	// Get ryokan data from SvelteKit load function using Svelte 5 runes
	let ryokans = $derived((page.data.ryokans as MicroCMSRyokan[]) || []);

	// Yamanouchi area coordinates
	const YAMANOUCHI_CENTER: [number, number] = [36.7428, 138.4308];
	const DEFAULT_ZOOM = 13;

	onMount(async () => {
		try {
			// Dynamic import for Leaflet to avoid SSR issues
			L = await import('leaflet');

			// Fix for default markers in Vite/SvelteKit
			delete (L.Icon.Default.prototype as any)._getIconUrl;
			L.Icon.Default.mergeOptions({
				iconRetinaUrl:
					'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
				iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
				shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
			});

			// Initialize map
			map = L.map(mapContainer, {
				center: YAMANOUCHI_CENTER,
				zoom: DEFAULT_ZOOM,
				zoomControl: true,
				scrollWheelZoom: true
			});

			// Add tile layer
			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution:
					'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
				opacity: 0.8,
				maxZoom: 18
			}).addTo(map);

			// Handle map clicks
			map.on('click', (e: any) => {
				if (!e.originalEvent.target.closest('.custom-marker')) {
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
		if (!L || !map) return null;

		const markerHtml = `
			<div class="custom-marker marker-ryokan" 
				 style="background-color: #8b4513;" 
				 title="${ryokan.name}">
				<span>🏮</span>
			</div>
		`;

		const marker = L.marker([ryokan.latitude, ryokan.longitude], {
			icon: L.divIcon({
				html: markerHtml,
				className: 'custom-div-icon',
				iconSize: [35, 35],
				iconAnchor: [17, 35]
			}),
			title: ryokan.name
		});

		// Handle marker click - pass raw MicroCMSRyokan data
		marker.on('click', () => {
			onMarkerClick?.(ryokan);
		});

		return marker;
	}

	function filterMarkers(layer: MapLayer) {
		if (!map || !L) {
			console.log('Map not ready yet, skipping filter');
			return;
		}

		// Clear existing markers
		currentMarkers.forEach((marker) => {
			map.removeLayer(marker);
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
			const group = L.featureGroup(currentMarkers);
			map.fitBounds(group.getBounds().pad(0.1), {
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

	/* Airbnb-style markers */
	:global(.custom-marker) {
		width: 35px;
		height: 35px;
		border-radius: 50% 50% 50% 0;
		border: 3px solid white;
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
		cursor: pointer;
		transition: all 0.3s ease;
		transform: rotate(-45deg);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	:global(.custom-marker span) {
		transform: rotate(45deg);
		font-size: 1rem;
	}

	:global(.custom-marker:hover) {
		transform: rotate(-45deg) scale(1.2);
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
