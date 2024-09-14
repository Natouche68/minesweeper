<script lang="ts">
	import Game from "$lib/Game.svelte";
	import { fade } from "svelte/transition";

	let gameStarted = false;
	let gridWidth = 10;
	let gridHeight = 20;
	let bombNumber = 35;
	let gridScale = 100;

	function startEasyGame() {
		gridWidth = 6;
		gridHeight = 12;
		bombNumber = 10;
		gridScale = 180;
		gameStarted = true;
	}

	function startMediumGame() {
		gridWidth = 10;
		gridHeight = 20;
		bombNumber = 35;
		gridScale = 140;
		gameStarted = true;
	}

	function startHardGame() {
		gridWidth = 14;
		gridHeight = 28;
		bombNumber = 75;
		gridScale = 100;
		gameStarted = true;
	}
</script>

{#if gameStarted}
	<Game
		{gridWidth}
		{gridHeight}
		{bombNumber}
		{gridScale}
		on:newGame={() => (gameStarted = false)}
	/>
{:else}
	<div
		class="h-dvh flex flex-col justify-around items-center"
		in:fade={{ duration: 500, delay: 1000 }}
		out:fade={{ duration: 500 }}
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
