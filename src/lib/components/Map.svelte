<script lang="ts">
	import { onMount } from 'svelte';
	// import type { Map as LeafletMap, Marker } from 'leaflet';
	import type { MapProps, MapLayer } from '$lib/types';
	import { mapData } from '$lib/data';
	import { LAYER_BUTTONS } from '$lib/types';

	let { activeSection = 'onsen', onMarkerClick, onMapClick }: MapProps = $props();

	let mapContainer: HTMLDivElement;
	// let map: LeafletMap;
	let map: any;
	let L: any;
	// let currentMarkers: Marker[] = [];
	let currentMarkers: any[] = [];
	let activeLayer: MapLayer = $state('onsen');

	const layerButtons = LAYER_BUTTONS;

	onMount(async () => {
		// Temporarily disabled - install leaflet first
		console.log('Map component mounted - Leaflet integration coming soon!');

		// TODO: Uncomment when leaflet is installed
		/*
    // Dynamic import for Leaflet to avoid SSR issues
    L = await import('leaflet');
    
    // Initialize map
    map = L.map(mapContainer).setView([36.7428, 138.4308], 13);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      opacity: 0.8
    }).addTo(map);

    // Handle map clicks
    map.on('click', (e: any) => {
      if (!e.originalEvent.target.closest('.custom-marker')) {
        onMapClick?.();
      }
    });

    // Initialize with current section
    filterMarkers(activeLayer);
    */
	});

	function createCustomMarker(item: any) {
		// Placeholder for now
		console.log('Would create marker for:', item.name);
		return null;

		/* TODO: Uncomment when leaflet is installed
    const markerClass = `marker-${item.type}`;
    const markerHtml = `<div class="custom-marker ${markerClass}"><span>${item.icon}</span></div>`;
    
    const marker = L.marker(item.pos, {
      icon: L.divIcon({
        html: markerHtml,
        className: 'custom-div-icon',
        iconSize: [35, 35],
        iconAnchor: [17, 35]
      })
    });
    
    marker.on('click', () => {
      onMarkerClick?.(item);
    });
    
    return marker;
    */
	}

	function filterMarkers(layer: MapLayer) {
		// Placeholder for now
		console.log('Would filter markers for layer:', layer);

		/* TODO: Uncomment when leaflet is installed
    // Clear existing markers
    currentMarkers.forEach(marker => map.removeLayer(marker));
    currentMarkers = [];

    // Add markers based on filter
    if (layer === 'all') {
      Object.values(mapData).flat().forEach(item => {
        const marker = createCustomMarker(item);
        marker.addTo(map);
        currentMarkers.push(marker);
      });
    } else {
      mapData[layer]?.forEach(item => {
        const marker = createCustomMarker(item);
        marker.addTo(map);
        currentMarkers.push(marker);
      });
    }
    */
	}

	function handleLayerClick(layer: MapLayer) {
		activeLayer = layer;
		filterMarkers(layer);
	}

	// React to section changes from parent
	$effect(() => {
		console.log('Active section changed to:', activeSection);

		/* TODO: Uncomment when leaflet is installed
    if (activeSection && map) {
      const layerMap: Record<string, MapLayer> = {
        onsen: 'onsen',
        ryokan: 'ryokan',
        history: 'spot'
      };
      const newLayer = layerMap[activeSection] || 'onsen';
      activeLayer = newLayer;
      filterMarkers(newLayer);
    }
    */
	});
</script>

<section class="hero-section">
	<div class="map-container">
		<div class="map-controls">
			{#each layerButtons as button}
				<button
					class="map-filter"
					class:active={activeLayer === button.id}
					onclick={() => handleLayerClick(button.id)}
				>
					{button.label}
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
	}

	.map-filter:hover,
	.map-filter.active {
		background: var(--crimson);
		color: white;
		transform: translateY(-2px);
	}

	/* Custom Map Markers - Airbnb style */
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

	:global(.marker-onsen) {
		background: var(--crimson);
	}

	:global(.marker-ryokan) {
		background: #8b4513;
	}

	:global(.marker-spot) {
		background: #2e7d32;
	}

	.ryokan-count {
		background: var(--crimson);
		color: white;
		padding: 2px 6px;
		border-radius: 10px;
		font-size: 0.7rem;
		margin-left: 5px;
	}

	/* Temporary map placeholder styles */
	.map-placeholder {
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, var(--cream), var(--light-crimson));
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		overflow: auto;
	}

	.placeholder-content {
		background: white;
		padding: 30px;
		border-radius: 12px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
		max-width: 80%;
		max-height: 80%;
		overflow: auto;
	}

	.placeholder-content h3 {
		text-align: center;
		color: var(--crimson);
		font-family: 'Shippori Mincho', serif;
		margin-bottom: 10px;
	}

	.placeholder-content p {
		text-align: center;
		color: var(--dark-text);
		margin-bottom: 20px;
	}

	.filter-preview h4 {
		color: var(--crimson);
		font-family: 'Shippori Mincho', serif;
		margin: 15px 0 10px;
		font-size: 1.1rem;
	}

	.active-filters {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
		margin-bottom: 15px;
	}

	.filter-badge {
		background: var(--light-crimson);
		color: var(--dark-text);
		padding: 4px 8px;
		border-radius: 12px;
		font-size: 0.8rem;
		border: 1px solid var(--crimson);
	}

	.ryokan-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
		max-height: 200px;
		overflow-y: auto;
	}

	.ryokan-preview {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 12px;
		background: var(--cream);
		border-radius: 8px;
		border-left: 3px solid var(--crimson);
	}

	.ryokan-icon {
		font-size: 1.2rem;
	}

	.ryokan-name {
		flex: 1;
		font-weight: 500;
	}

	/* Debug styles for testing FilterBar integration */
	.map-placeholder {
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, var(--cream), var(--light-crimson));
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		overflow: auto;
	}

	.placeholder-content {
		background: white;
		padding: 30px;
		border-radius: 12px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
		max-width: 80%;
		max-height: 80%;
		overflow: auto;
	}

	.placeholder-content h3 {
		text-align: center;
		color: var(--crimson);
		font-family: 'Shippori Mincho', serif;
		margin-bottom: 10px;
	}

	.placeholder-content p {
		text-align: center;
		color: var(--dark-text);
		margin-bottom: 20px;
	}

	.placeholder-content h4 {
		color: var(--crimson);
		font-family: 'Shippori Mincho', serif;
		margin: 15px 0 10px;
		font-size: 1.1rem;
	}

	.debug-filters {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
		margin-bottom: 15px;
	}

	.debug-badge {
		background: var(--light-crimson);
		color: var(--dark-text);
		padding: 4px 8px;
		border-radius: 12px;
		font-size: 0.8rem;
		border: 1px solid var(--crimson);
	}

	.debug-results {
		background: var(--cream);
		padding: 15px;
		border-radius: 8px;
		max-height: 200px;
		overflow-y: auto;
	}

	.debug-ryokan {
		padding: 5px 0;
		border-bottom: 1px solid rgba(187, 85, 97, 0.2);
		font-size: 0.9rem;
	}

	.debug-ryokan:last-child {
		border-bottom: none;
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

		.placeholder-content {
			padding: 20px;
			max-width: 95%;
			max-height: 90%;
		}

		.ryokan-preview {
			flex-direction: column;
			align-items: flex-start;
			gap: 5px;
		}
	}
</style>
