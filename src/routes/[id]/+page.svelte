<script lang="ts">
	import type { PageData } from './$types';

	// This receives the `ryokan` object from your `load` function
	let { data }: PageData = $props();
</script>

{#if data.ryokan}
	<article class="ryokan-detail">
		<a href="/">← Back to Map</a>

		<h1>{data.ryokan.name}</h1>

		{#if data.ryokan.heroImage}
			<img src={data.ryokan.heroImage.url} alt={data.ryokan.name} />
		{/if}

		<div class="content">
			{@html data.ryokan.description}
		</div>
	</article>
{:else}
	<h1>Ryokan Not Found</h1>
	<p>Sorry, we couldn't find the page you were looking for.</p>
	<a href="/">← Back to Map</a>
{/if}

<style>
	.ryokan-detail {
		max-width: 800px;
		margin: 2rem auto;
		padding: 1rem;
	}
	img {
		width: 100%;
		height: auto;
		border-radius: 8px;
		margin-bottom: 2rem;
	}
	.content {
		line-height: 1.7;
	}
</style>
