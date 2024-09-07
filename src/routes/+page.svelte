<script lang="ts">
	import type { Cell } from "$lib/utils";
	import { onMount } from "svelte";

	const grid: Cell[][] = [];
	let bombs = 0;

	onMount(() => {
		for (let i = 0; i < 10; i++) {
			grid.push([]);
			for (let j = 0; j < 20; j++) {
				grid[i].push({ content: 0, state: "visible" });
			}
		}

		for (let i = 0; i < 35; i++) {
			const x = Math.floor(Math.random() * 10);
			const y = Math.floor(Math.random() * 20);

			if (grid[x][y].content !== "bomb") {
				grid[x][y].content = "bomb";
				bombs++;
			}
		}

		console.log(bombs);

		grid.forEach((col, i) => {
			col.forEach((cell, j) => {
				if (cell.content !== "bomb") {
					let nearbyBombs = 0;

					if (i > 0 && j > 0 && grid[i - 1][j - 1].content === "bomb")
						nearbyBombs++;
					if (i > 0 && grid[i - 1][j].content === "bomb") nearbyBombs++;
					if (
						i > 0 &&
						j < grid[0].length - 1 &&
						grid[i - 1][j + 1].content === "bomb"
					)
						nearbyBombs++;
					if (j > 0 && grid[i][j - 1].content === "bomb") nearbyBombs++;
					if (j < grid[0].length - 1 && grid[i][j + 1].content === "bomb")
						nearbyBombs++;
					if (
						i < grid.length - 1 &&
						j > 0 &&
						grid[i + 1][j - 1].content === "bomb"
					)
						nearbyBombs++;
					if (i < grid.length - 1 && grid[i + 1][j].content === "bomb")
						nearbyBombs++;
					if (
						i < grid.length - 1 &&
						j < grid[0].length - 1 &&
						grid[i + 1][j + 1].content === "bomb"
					)
						nearbyBombs++;

					cell.content = nearbyBombs;
				}
			});
		});
	});

	function getCellColor(cell: Cell): string {
		switch (cell.content) {
			case "bomb":
				return "text-text";
			case 0:
				return "text-transparent";
			case 1:
				return "text-sapphire";
			case 2:
				return "text-green";
			case 3:
				return "text-maroon";
			case 4:
				return "text-mauve";
			case 5:
				return "text-blue";
			case 6:
				return "text-teal";
			case 7:
				return "text-peach";
			case 8:
				return "text-pink";
			default:
				return "text-text";
		}
	}
</script>

<div class="h-dvh flex justify-center items-center bg-base text-text">
	<div class="flex flex-row">
		{#each grid as col, i}
			<div class="flex flex-col">
				{#each col as cell, j}
					{@const bgColor =
						cell.state === "visible"
							? (i + j) % 2 === 0
								? "bg-mantle"
								: "bg-crust"
							: (i + j) % 2 === 0
								? "bg-surface0"
								: "bg-surface1"}
					{@const textColor = getCellColor(cell)}

					<div
						class="w-8 h-8 flex justify-center items-center text-xl font-bold {bgColor} {textColor}"
					>
						{#if cell.state === "visible"}
							{cell.content === "bomb" ? "💣" : cell.content}
						{/if}
					</div>
				{/each}
			</div>
		{/each}
	</div>
</div>
