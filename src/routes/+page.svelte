<script lang="ts">
	import Game from "$lib/Game.svelte";
	import { fade } from "svelte/transition";

	let gameStarted = false;

	function startEasyGame() {
		gameStarted = true;
	}

	function startMediumGame() {
		gameStarted = true;
	}

	function startHardGame() {
		gameStarted = true;
	}
</script>

{#if gameStarted}
	<Game />
{:else}
	<div
		class="h-dvh flex flex-col justify-around items-center"
		transition:fade={{ duration: 500 }}
	>
		<div
			class="flex flex-col items-center gap-4 font-bold text-5xl text-center text-blue tracking-wide uppercase"
		>
			<img src="favicon.png" alt="Icon" class="w-24 h-24" />
			Minesweeper
		</div>
		<div class="w-1/3 flex flex-col items-center gap-4">
			<button
				class="w-full p-4 font-semibold text-2xl bg-mantle rounded-2xl"
				on:click={startEasyGame}
			>
				Easy
			</button>
			<button
				class="w-full p-4 font-semibold text-2xl bg-mantle rounded-2xl"
				on:click={startMediumGame}
			>
				Medium
			</button>
			<button
				class="w-full p-4 font-semibold text-2xl bg-mantle rounded-2xl"
				on:click={startHardGame}
			>
				Hard
			</button>
		</div>
		<div class="italic text-overlay1">Made with ❤ by Natouche68</div>
	</div>
{/if}
