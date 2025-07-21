<script lang="ts">
	import type { RyokanFilters } from '$lib/types';

	interface Props {
		filters?: RyokanFilters;
		resultCount?: number;
		onFiltersChange?: (filters: RyokanFilters) => void;
	}

	let {
		filters = $bindable({
			priceRange: null,
			facilities: [],
			dining: [],
			hasLanguageService: false,
			tattooFriendly: false,
			dailyUse: false
		}),
		resultCount = 0,
		onFiltersChange
	}: Props = $props();

	// Filter options
	const priceRanges = [
		{ id: 'budget', label: 'Budget (¥8-12K)', min: 8000, max: 12000 },
		{ id: 'midrange', label: 'Mid-range (¥12-20K)', min: 12000, max: 20000 },
		{ id: 'luxury', label: 'Luxury (¥20K+)', min: 20000, max: 999999 }
	];

	const facilityOptions = [
		{ id: 'wifi', label: 'Wi-Fi', icon: '📶' },
		{ id: 'parking', label: '駐車場', icon: '🅿️' },
		{ id: 'elevator', label: 'エレベーター', icon: '🛗' },
		{ id: 'wheelchair', label: '車椅子対応', icon: '♿' },
		{ id: 'onsen_room', label: '温泉付客室', icon: '♨️' },
		{ id: 'private_bath', label: '貸切風呂', icon: '🛁' }
	];

	const diningOptions = [
		{ id: 'no_meals', label: '素泊まり', icon: '🏠' },
		{ id: 'breakfast_only', label: '朝食のみ', icon: '🥐' },
		{ id: 'breakfast_buffet', label: '朝食バイキング', icon: '🍽️' },
		{ id: 'room_dining', label: '部屋食', icon: '🍱' },
		{ id: 'allergy_friendly', label: 'アレルギー対応', icon: '⚠️' }
	];

	let showMobileFilters = $state(false);
	let selectedPriceRange = $state<string | null>(null);

	// Handle price range selection
	function handlePriceChange(rangeId: string) {
		if (selectedPriceRange === rangeId) {
			selectedPriceRange = null;
			filters.priceRange = null;
		} else {
			selectedPriceRange = rangeId;
			const range = priceRanges.find((r) => r.id === rangeId);
			if (range) {
				filters.priceRange = { min: range.min, max: range.max };
			}
		}
		onFiltersChange?.(filters);
	}

	// Handle facility toggle
	function toggleFacility(facilityId: string) {
		if (filters.facilities.includes(facilityId)) {
			filters.facilities = filters.facilities.filter((f) => f !== facilityId);
		} else {
			filters.facilities = [...filters.facilities, facilityId];
		}
		onFiltersChange?.(filters);
	}

	// Handle dining toggle
	function toggleDining(diningId: string) {
		if (filters.dining.includes(diningId)) {
			filters.dining = filters.dining.filter((d) => d !== diningId);
		} else {
			filters.dining = [...filters.dining, diningId];
		}
		onFiltersChange?.(filters);
	}

	// Handle language service toggle
	function toggleLanguageService() {
		filters.hasLanguageService = !filters.hasLanguageService;
		onFiltersChange?.(filters);
	}

	// Handle tattoo friendly toggle
	function toggleTattooFriendly() {
		filters.tattooFriendly = !filters.tattooFriendly;
		onFiltersChange?.(filters);
	}

	// Handle daily use toggle
	function toggleDailyUse() {
		filters.dailyUse = !filters.dailyUse;
		onFiltersChange?.(filters);
	}

	// Clear all filters
	function clearAllFilters() {
		selectedPriceRange = null;
		filters = {
			priceRange: null,
			facilities: [],
			dining: [],
			hasLanguageService: false,
			tattooFriendly: false,
			dailyUse: false
		};
		onFiltersChange?.(filters);
	}

	// Count active filters
	let activeFilterCount = $derived(
		(filters.priceRange ? 1 : 0) +
			filters.facilities.length +
			filters.dining.length +
			(filters.hasLanguageService ? 1 : 0) +
			(filters.tattooFriendly ? 1 : 0) +
			(filters.dailyUse ? 1 : 0)
	);
</script>

<section class="filter-bar">
	<!-- Mobile Filter Toggle -->
	<div class="mobile-filter-toggle">
		<button class="mobile-toggle-btn" onclick={() => (showMobileFilters = !showMobileFilters)}>
			🔍 フィルター
			{#if activeFilterCount > 0}
				<span class="filter-count">({activeFilterCount})</span>
			{/if}
			<span class="toggle-icon" class:rotated={showMobileFilters}>▼</span>
		</button>
	</div>

	<!-- Filter Content -->
	<div class="filter-content" class:mobile-hidden={!showMobileFilters}>
		<!-- Price Range Filter -->
		<div class="filter-group">
			<label class="filter-label">💰 料金</label>
			<div class="filter-options price-options">
				{#each priceRanges as range}
					<button
						class="filter-chip"
						class:active={selectedPriceRange === range.id}
						onclick={() => handlePriceChange(range.id)}
					>
						{range.label}
					</button>
				{/each}
			</div>
		</div>

		<!-- Facilities Filter -->
		<div class="filter-group">
			<label class="filter-label">🏠 設備</label>
			<div class="filter-options">
				{#each facilityOptions as facility}
					<button
						class="filter-chip"
						class:active={filters.facilities.includes(facility.id)}
						onclick={() => toggleFacility(facility.id)}
					>
						{facility.icon}
						{facility.label}
					</button>
				{/each}
			</div>
		</div>

		<!-- Dining Options Filter -->
		<div class="filter-group">
			<label class="filter-label">🍽️ 食事</label>
			<div class="filter-options">
				{#each diningOptions as dining}
					<button
						class="filter-chip"
						class:active={filters.dining.includes(dining.id)}
						onclick={() => toggleDining(dining.id)}
					>
						{dining.icon}
						{dining.label}
					</button>
				{/each}
			</div>
		</div>

		<!-- Special Options -->
		<div class="filter-group">
			<label class="filter-label">🌐 サービス</label>
			<div class="filter-options special-options">
				<button
					class="filter-chip toggle-chip"
					class:active={filters.hasLanguageService}
					onclick={toggleLanguageService}
				>
					🌐 多言語対応
				</button>

				<button
					class="filter-chip toggle-chip"
					class:active={filters.tattooFriendly}
					onclick={toggleTattooFriendly}
				>
					♨️ タトゥーOK
				</button>

				<button
					class="filter-chip toggle-chip"
					class:active={filters.dailyUse}
					onclick={toggleDailyUse}
				>
					📅 日帰り入浴
				</button>
			</div>
		</div>

		<!-- Filter Actions -->
		<div class="filter-actions">
			<button class="clear-btn" onclick={clearAllFilters}> 🔄 リセット </button>
			<div class="result-count">
				<span class="count-number">{resultCount}</span>
				<span class="count-text">件の宿</span>
			</div>
		</div>
	</div>
</section>

<style>
	.filter-bar {
		background: var(--bg-white);
		border-bottom: 1px solid rgba(187, 85, 97, 0.2);
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
		position: sticky;
		top: 70px; /* Below navbar */
		z-index: 900;
	}

	.mobile-filter-toggle {
		display: none;
		padding: 15px 20px;
		border-bottom: 1px solid rgba(187, 85, 97, 0.1);
	}

	.mobile-toggle-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		padding: 12px 16px;
		background: var(--cream);
		border: 1px solid var(--crimson);
		border-radius: 25px;
		font-family: 'Noto Serif JP', serif;
		font-size: 1rem;
		color: var(--dark-text);
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.mobile-toggle-btn:hover {
		background: var(--light-crimson);
	}

	.filter-count {
		background: var(--crimson);
		color: white;
		padding: 2px 8px;
		border-radius: 12px;
		font-size: 0.8rem;
		font-weight: bold;
	}

	.toggle-icon {
		margin-left: auto;
		transition: transform 0.3s ease;
	}

	.toggle-icon.rotated {
		transform: rotate(180deg);
	}

	.filter-content {
		padding: 20px 30px;
		max-width: 1400px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: 1fr;
		gap: 20px;
	}

	.mobile-hidden {
		display: none;
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.filter-label {
		font-family: 'Shippori Mincho', serif;
		font-size: 1rem;
		font-weight: 600;
		color: var(--crimson);
		margin-bottom: 5px;
	}

	.filter-options {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.filter-chip {
		padding: 8px 16px;
		border: 1px solid rgba(187, 85, 97, 0.3);
		background: var(--bg-white);
		color: var(--dark-text);
		border-radius: 20px;
		font-family: 'Noto Serif JP', serif;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.3s ease;
		white-space: nowrap;
	}

	.filter-chip:hover {
		border-color: var(--crimson);
		background: var(--light-crimson);
	}

	.filter-chip.active {
		background: var(--crimson);
		color: white;
		border-color: var(--crimson);
	}

	.price-options {
		display: flex;
		gap: 12px;
	}

	.special-options {
		display: flex;
		gap: 12px;
	}

	.filter-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 10px;
		border-top: 1px solid rgba(187, 85, 97, 0.1);
	}

	.clear-btn {
		padding: 10px 20px;
		background: transparent;
		border: 1px solid rgba(187, 85, 97, 0.3);
		color: var(--crimson);
		border-radius: 20px;
		font-family: 'Noto Serif JP', serif;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.clear-btn:hover {
		background: var(--light-crimson);
	}

	.result-count {
		display: flex;
		align-items: center;
		gap: 5px;
		font-family: 'Shippori Mincho', serif;
	}

	.count-number {
		font-size: 1.5rem;
		font-weight: bold;
		color: var(--crimson);
	}

	.count-text {
		font-size: 1rem;
		color: var(--dark-text);
	}

	/* Desktop Layout */
	@media (min-width: 1024px) {
		.filter-content {
			display: grid;
			grid-template-columns: repeat(4, 1fr) auto;
			gap: 30px;
			align-items: start;
		}

		.filter-group {
			min-width: 200px;
		}

		.filter-actions {
			padding-top: 0;
			border-top: none;
			flex-direction: column;
			gap: 15px;
			min-width: 120px;
		}

		.special-options {
			flex-direction: column;
			align-items: flex-start;
		}
	}

	/* Tablet Layout */
	@media (min-width: 768px) and (max-width: 1023px) {
		.filter-content {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 20px;
		}

		.filter-actions {
			grid-column: span 2;
		}
	}

	/* Mobile Layout */
	@media (max-width: 767px) {
		.mobile-filter-toggle {
			display: block;
		}

		.filter-content.mobile-hidden {
			display: none;
		}

		.filter-content {
			padding: 15px 20px;
			gap: 15px;
		}

		.filter-options {
			gap: 6px;
		}

		.filter-chip {
			padding: 6px 12px;
			font-size: 0.8rem;
		}

		.price-options,
		.special-options {
			flex-direction: column;
			align-items: flex-start;
		}

		.filter-actions {
			flex-direction: column;
			gap: 10px;
			align-items: stretch;
		}

		.clear-btn {
			width: 100%;
			text-align: center;
		}

		.result-count {
			justify-content: center;
		}
	}
</style>
