<script lang="ts">
	import type { ColumnProps } from '$lib/types';
	import { contentData } from '$lib/data';

	let { activeSection = 'onsen' }: ColumnProps = $props();

	let currentContent = $derived(contentData[activeSection]);

	function handleGalleryClick(index: number) {
		// Add click animation
		const galleryItems = document.querySelectorAll('.gallery-item');
		const item = galleryItems[index] as HTMLElement;
		if (item) {
			item.style.transform = 'scale(1.1)';
			setTimeout(() => {
				item.style.transform = '';
			}, 200);
		}
	}
</script>

<section class="content-section">
	<h2 class="section-title">{currentContent.title}</h2>
	<p class="section-subtitle">{currentContent.subtitle}</p>

	<div class="gallery-section">
		<div class="gallery-grid">
			{#each currentContent.gallery as emoji, index}
				<div
					class="gallery-item"
					class:main={index === 0}
					onclick={() => handleGalleryClick(index)}
					onkeydown={(e) => e.key === 'Enter' && handleGalleryClick(index)}
					role="button"
					tabindex="0"
				>
					{emoji}
				</div>
			{/each}
		</div>
		<div class="gallery-caption">山ノ内町の四季を通じた温泉風景</div>
	</div>

	<div class="article-content">
		{@html currentContent.content}
	</div>

	<div class="article-meta">取材・撮影：山ノ内町観光連盟｜更新日：2025年7月</div>
</section>

<style>
	.content-section {
		max-width: 800px;
		margin: 0 auto;
		padding: 60px 30px;
	}

	.section-title {
		font-family: 'Shippori Mincho', serif;
		font-size: 2.8rem;
		font-weight: 800;
		color: var(--crimson);
		text-align: center;
		margin-bottom: 20px;
		line-height: 1.2;
	}

	.section-subtitle {
		text-align: center;
		font-size: 1.1rem;
		color: rgba(44, 24, 16, 0.7);
		margin-bottom: 50px;
		font-style: italic;
	}

	.gallery-section {
		margin-bottom: 50px;
	}

	.gallery-grid {
		display: grid;
		grid-template-columns: 2fr 1fr 1fr;
		grid-template-rows: 200px 200px;
		gap: 15px;
		margin-bottom: 30px;
	}

	.gallery-item {
		background: linear-gradient(45deg, var(--light-crimson), rgba(187, 85, 97, 0.05));
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2rem;
		opacity: 0.7;
		transition: all 0.3s ease;
		cursor: pointer;
	}

	.gallery-item.main {
		grid-row: span 2;
		font-size: 4rem;
	}

	.gallery-item:hover {
		opacity: 1;
		transform: scale(1.02);
	}

	.gallery-caption {
		text-align: center;
		font-size: 0.9rem;
		color: rgba(44, 24, 16, 0.6);
		font-style: italic;
	}

	.article-content {
		font-size: 1.1rem;
		line-height: 1.8;
		margin-bottom: 30px;
	}

	.article-content :global(p) {
		margin-bottom: 20px;
	}

	.article-content :global(h3) {
		font-family: 'Shippori Mincho', serif;
		font-size: 1.4rem;
		color: var(--crimson);
		margin: 30px 0 15px;
	}

	.article-meta {
		border-top: 1px solid rgba(187, 85, 97, 0.2);
		padding-top: 20px;
		font-size: 0.9rem;
		color: rgba(44, 24, 16, 0.6);
		text-align: center;
	}

	@media (max-width: 768px) {
		.gallery-grid {
			grid-template-columns: 1fr;
			grid-template-rows: repeat(4, 150px);
		}

		.gallery-item.main {
			grid-row: span 1;
			font-size: 2rem;
		}

		.section-title {
			font-size: 2.2rem;
		}
	}
</style>
