<script lang="ts">
	import type { Section, Language, NavbarProps } from '$lib/types';
	import { SECTIONS, LANGUAGES } from '$lib/types';

	let {
		activeSection = $bindable('onsen' as Section),
		activeLanguage = $bindable('ja' as Language),
		onSectionChange,
		onLanguageChange
	}: NavbarProps = $props();

	function handleSectionClick(section: Section) {
		activeSection = section;
		onSectionChange?.(section);
	}

	function handleLanguageClick(language: Language) {
		activeLanguage = language;
		onLanguageChange?.(language);
	}
</script>

<nav class="navbar">
	<div class="nav-container">
		<a href="/" class="logo">山ノ内町温泉探訪</a>

		<ul class="nav-menu">
			{#each SECTIONS as section}
				<li class="nav-item">
					<button
						class="nav-link"
						class:active={activeSection === section.id}
						onclick={() => handleSectionClick(section.id)}
					>
						{section.label}
					</button>
				</li>
			{/each}
		</ul>

		<div class="language-toggle">
			{#each LANGUAGES as language}
				<button
					class="lang-btn"
					class:active={activeLanguage === language.id}
					onclick={() => handleLanguageClick(language.id)}
				>
					{language.label}
				</button>
			{/each}
		</div>
	</div>
</nav>

<style>
	:global(:root) {
		--crimson: #bb5561;
		--cream: #feecd2;
		--dark-text: #2c1810;
		--light-crimson: rgba(187, 85, 97, 0.1);
		--shadow-soft: rgba(187, 85, 97, 0.15);
		--bg-white: #fefefe;
	}

	.navbar {
		background: var(--bg-white);
		border-bottom: 1px solid rgba(187, 85, 97, 0.2);
		padding: 0;
		position: sticky;
		top: 0;
		z-index: 1000;
		box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
	}

	.nav-container {
		max-width: 1400px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 30px;
	}

	.logo {
		font-family: 'Shippori Mincho', serif;
		font-size: 1.8rem;
		font-weight: 800;
		color: var(--crimson);
		text-decoration: none;
		padding: 20px 0;
	}

	.nav-menu {
		display: flex;
		list-style: none;
		gap: 0;
		margin: 0;
		padding: 0;
	}

	.nav-item {
		position: relative;
	}

	.nav-link {
		display: block;
		padding: 25px 30px;
		color: var(--dark-text);
		background: none;
		border: none;
		font-family: 'Noto Serif JP', serif;
		font-weight: 500;
		font-size: 1rem;
		transition: all 0.3s ease;
		border-bottom: 3px solid transparent;
		cursor: pointer;
	}

	.nav-link:hover,
	.nav-link.active {
		color: var(--crimson);
		border-bottom-color: var(--crimson);
		background: var(--light-crimson);
	}

	.language-toggle {
		display: flex;
		background: var(--cream);
		border-radius: 25px;
		overflow: hidden;
	}

	.lang-btn {
		padding: 8px 16px;
		border: none;
		background: transparent;
		color: var(--dark-text);
		cursor: pointer;
		font-family: 'Noto Serif JP', serif;
		font-size: 0.9rem;
		transition: all 0.3s ease;
	}

	.lang-btn.active {
		background: var(--crimson);
		color: white;
	}

	@media (max-width: 768px) {
		.nav-menu {
			display: none;
		}

		.nav-container {
			padding: 0 20px;
		}

		.logo {
			font-size: 1.5rem;
		}
	}
</style>
