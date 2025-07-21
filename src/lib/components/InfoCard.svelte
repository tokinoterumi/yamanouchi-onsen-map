<script lang="ts">
	interface MapItem {
		name: string;
		pos: [number, number];
		type: 'onsen' | 'ryokan' | 'spot';
		icon: string;
		description: string;
		details: string;
		image: string;
	}

	interface Props {
		isVisible?: boolean;
		item?: MapItem | null;
		onDetailsClick?: () => void;
		onPhotosClick?: () => void;
	}

	let { isVisible = false, item = null, onDetailsClick, onPhotosClick }: Props = $props();

	function handleDetailsClick() {
		onDetailsClick?.();
	}

	function handlePhotosClick() {
		onPhotosClick?.();
	}
</script>

{#if item}
	<div class="info-card" class:active={isVisible}>
		<div
			class="info-card-image"
			style="background-image: linear-gradient(45deg, var(--light-crimson), rgba(187, 85, 97, 0.05));"
		>
			{item.image}
		</div>
		<div class="info-card-content">
			<div class="info-card-header">
				<div class="info-card-icon">{item.icon}</div>
				<div class="info-card-title">{item.name}</div>
			</div>
			<div class="info-card-description">
				{item.description}
			</div>
			<div class="info-card-details">
				{@html item.details}
			</div>
			<div class="info-card-actions">
				<button class="card-btn primary" onclick={handleDetailsClick}> 詳細を見る </button>
				<button class="card-btn" onclick={handlePhotosClick}> 写真 </button>
			</div>
		</div>
	</div>
{/if}

<style>
	.info-card {
		position: absolute;
		bottom: 30px;
		left: 30px;
		width: 400px;
		background: var(--cream);
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 15px 50px rgba(0, 0, 0, 0.2);
		transform: translateY(100px);
		opacity: 0;
		transition: all 0.4s ease;
		z-index: 1000;
		border-left: 4px solid var(--crimson);
	}

	.info-card.active {
		transform: translateY(0);
		opacity: 1;
	}

	.info-card-image {
		width: 100%;
		height: 150px;
		background: linear-gradient(45deg, var(--light-crimson), rgba(187, 85, 97, 0.05));
		background-size: cover;
		background-position: center;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 3rem;
		opacity: 0.7;
	}

	.info-card-content {
		padding: 25px;
	}

	.info-card-header {
		display: flex;
		align-items: center;
		margin-bottom: 15px;
	}

	.info-card-icon {
		width: 40px;
		height: 40px;
		background: var(--crimson);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 1.2rem;
		margin-right: 15px;
	}

	.info-card-title {
		font-family: 'Shippori Mincho', serif;
		font-size: 1.3rem;
		font-weight: 600;
		color: var(--crimson);
	}

	.info-card-description {
		font-size: 0.95rem;
		margin-bottom: 15px;
		line-height: 1.7;
	}

	.info-card-details {
		font-size: 0.85rem;
		color: rgba(44, 24, 16, 0.7);
		margin-bottom: 15px;
	}

	.info-card-actions {
		display: flex;
		gap: 10px;
	}

	.card-btn {
		padding: 8px 16px;
		border: 1px solid var(--crimson);
		background: transparent;
		color: var(--crimson);
		border-radius: 20px;
		font-size: 0.85rem;
		cursor: pointer;
		transition: all 0.3s ease;
		font-family: 'Noto Serif JP', serif;
	}

	.card-btn:hover {
		background: var(--crimson);
		color: white;
	}

	.card-btn.primary {
		background: var(--crimson);
		color: white;
	}

	.card-btn.primary:hover {
		background: rgba(187, 85, 97, 0.8);
	}

	@media (max-width: 768px) {
		.info-card {
			width: calc(100% - 40px);
			left: 20px;
			right: 20px;
		}
	}
</style>
