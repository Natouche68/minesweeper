<script lang="ts">
	import { scale, fly, slide } from "svelte/transition";
	import Dialog from "$lib/Dialog.svelte";
	import { Confetti } from "svelte-confetti";
	import { createEventDispatcher } from "svelte";
	import type { Cell } from "$lib/utils";

	export let gridWidth: number;
	export let gridHeight: number;
	export let bombNumber: number;
	export let gridScale: number;

	let grid: Cell[][] = Array(gridWidth).fill(
		Array(gridHeight).fill({ content: 0, state: "hidden" })
	);
	let gameStarted = false;
	let isGameOver = false;
	let currentTool: "flag" | "dig" = "flag";
	let time = 0;
	let timerInterval: number;
	let bombs = 0;
	let hasWon = false;
	let finalDialogOpen = false;

	const dispatch = createEventDispatcher();

	function generateGrid(touchX: number, touchY: number) {
		grid = [];
		bombs = 0;

		for (let i = 0; i < gridWidth; i++) {
			grid.push([]);
			for (let j = 0; j < gridHeight; j++) {
				grid[i].push({ content: 0, state: "hidden" });
			}
		}

		while (bombs < bombNumber) {
			const x = Math.floor(Math.random() * gridWidth);
			const y = Math.floor(Math.random() * gridHeight);

			if (grid[x][y].content !== "bomb" && !cellNearby(x, y, touchX, touchY)) {
				grid[x][y].content = "bomb";
				bombs++;

				if (x > 0 && y > 0 && grid[x - 1][y - 1].content !== "bomb")
					grid[x - 1][y - 1].content =
						(grid[x - 1][y - 1].content as number) + 1;
				if (x > 0 && grid[x - 1][y].content !== "bomb")
					grid[x - 1][y].content = (grid[x - 1][y].content as number) + 1;
				if (
					x > 0 &&
					y < grid[0].length - 1 &&
					grid[x - 1][y + 1].content !== "bomb"
				)
					grid[x - 1][y + 1].content =
						(grid[x - 1][y + 1].content as number) + 1;
				if (y > 0 && grid[x][y - 1].content !== "bomb")
					grid[x][y - 1].content = (grid[x][y - 1].content as number) + 1;
				if (y < grid[0].length - 1 && grid[x][y + 1].content !== "bomb")
					grid[x][y + 1].content = (grid[x][y + 1].content as number) + 1;
				if (
					x < grid.length - 1 &&
					y > 0 &&
					grid[x + 1][y - 1].content !== "bomb"
				)
					grid[x + 1][y - 1].content =
						(grid[x + 1][y - 1].content as number) + 1;
				if (x < grid.length - 1 && grid[x + 1][y].content !== "bomb")
					grid[x + 1][y].content = (grid[x + 1][y].content as number) + 1;
				if (
					x < grid.length - 1 &&
					y < grid[0].length - 1 &&
					grid[x + 1][y + 1].content !== "bomb"
				)
					grid[x + 1][y + 1].content =
						(grid[x + 1][y + 1].content as number) + 1;
			}
		}
	}

	function cellNearby(x1: number, y1: number, x2: number, y2: number): boolean {
		if (x1 - 1 === x2 && y1 - 1 === y2) return true;
		if (x1 - 1 === x2 && y1 === y2) return true;
		if (x1 - 1 === x2 && y1 + 1 === y2) return true;
		if (x1 === x2 && y1 - 1 === y2) return true;
		if (x1 === x2 && y1 === y2) return true;
		if (x1 === x2 && y1 + 1 === y2) return true;
		if (x1 + 1 === x2 && y1 - 1 === y2) return true;
		if (x1 + 1 === x2 && y1 === y2) return true;
		if (x1 + 1 === x2 && y1 + 1 === y2) return true;
		return false;
	}

	function handleClick(x: number, y: number) {
		if (!gameStarted) {
			generateGrid(x, y);

			revealCell(x, y);

			gameStarted = true;
			timerInterval = setInterval(() => time++, 1000);
		} else if (!isGameOver) {
			if (currentTool === "flag" && bombs > 0) {
				if (grid[x][y].state === "hidden") {
					grid[x][y].state = "flagged";
					bombs--;
				} else if (grid[x][y].state === "flagged") {
					grid[x][y].state = "hidden";
					bombs++;
				}
			} else {
				if (grid[x][y].state === "hidden") {
					revealCell(x, y);
				} else if (
					grid[x][y].state === "visible" &&
					getNearbyFlags(x, y) === grid[x][y].content
				) {
					revealNearbyCells(x, y);
				}
			}
		}
	}

	function revealCell(x: number, y: number) {
		if (grid[x][y].state !== "hidden") return;

		grid[x][y].state = "visible";

		if (grid[x][y].content === "bomb") {
			gameOver();
		}

		grid = grid;

		if (grid[x][y].content === 0) {
			revealNearbyCells(x, y);
		}

		if (gameStarted) {
			checkWin();
		}
	}

	function revealNearbyCells(x: number, y: number) {
		if (x > 0 && y > 0 && grid[x - 1][y - 1].state === "hidden")
			revealCell(x - 1, y - 1);
		if (x > 0 && grid[x - 1][y].state === "hidden") revealCell(x - 1, y);
		if (
			x > 0 &&
			y < grid[0].length - 1 &&
			grid[x - 1][y + 1].state === "hidden"
		)
			revealCell(x - 1, y + 1);
		if (y > 0 && grid[x][y - 1].state === "hidden") revealCell(x, y - 1);
		if (y < grid[0].length - 1 && grid[x][y + 1].state === "hidden")
			revealCell(x, y + 1);
		if (x < grid.length - 1 && y > 0 && grid[x + 1][y - 1].state === "hidden")
			revealCell(x + 1, y - 1);
		if (x < grid.length - 1 && grid[x + 1][y].state === "hidden")
			revealCell(x + 1, y);
		if (
			x < grid.length - 1 &&
			y < grid[0].length - 1 &&
			grid[x + 1][y + 1].state === "hidden"
		)
			revealCell(x + 1, y + 1);
	}

	function checkWin() {
		let win = true;
		grid.forEach((col) => {
			col.forEach((cell) => {
				if (cell.content !== "bomb" && cell.state === "hidden") {
					win = false;
				}
			});
		});

		if (win) {
			hasWon = true;
			isGameOver = true;
			clearInterval(timerInterval);

			setTimeout(() => {
				finalDialogOpen = true;
			}, 500);
		}
	}

	function gameOver() {
		isGameOver = true;
		clearInterval(timerInterval);

		grid.forEach((col) => {
			col.forEach(async (cell) => {
				if (cell.content === "bomb" && cell.state === "hidden") {
					cell.state = "visible";
				} else if (cell.state === "flagged" && cell.content !== "bomb") {
					cell.state = "visible";
				}
			});
		});

		setTimeout(() => {
			finalDialogOpen = true;
		}, 2000);
	}

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

	function getNearbyFlags(x: number, y: number): number {
		let nearbyFlags = 0;

		if (x > 0 && y > 0 && grid[x - 1][y - 1].state === "flagged") nearbyFlags++;
		if (x > 0 && grid[x - 1][y].state === "flagged") nearbyFlags++;
		if (
			x > 0 &&
			y < grid[0].length - 1 &&
			grid[x - 1][y + 1].state === "flagged"
		)
			nearbyFlags++;
		if (y > 0 && grid[x][y - 1].state === "flagged") nearbyFlags++;
		if (y < grid[0].length - 1 && grid[x][y + 1].state === "flagged")
			nearbyFlags++;
		if (x < grid.length - 1 && y > 0 && grid[x + 1][y - 1].state === "flagged")
			nearbyFlags++;
		if (x < grid.length - 1 && grid[x + 1][y].state === "flagged")
			nearbyFlags++;
		if (
			x < grid.length - 1 &&
			y < grid[0].length - 1 &&
			grid[x + 1][y + 1].state === "flagged"
		)
			nearbyFlags++;

		return nearbyFlags;
	}
</script>

<div class="h-full flex flex-col justify-between items-center">
	<div
		class="w-full p-4 flex flex-row justify-center items-center gap-4 font-bold text-2xl bg-mantle"
		transition:slide={{ duration: 500, delay: 500 }}
	>
		<div class="flex flex-row gap-1">
			<img src="/timer.png" alt="⏳" class="h-8 w-8" />
			{time}
		</div>
		<div class="flex flex-row gap-1">
			<img src="/flag.png" alt="🚩" class="w-8 h-8" />
			{bombs}
		</div>
	</div>

	<div
		class="flex flex-row"
		style="scale: {gridScale}%;"
		transition:scale={{ duration: 500, delay: 500 }}
	>
		{#each grid as col, i}
			<div class="flex flex-col">
				{#each col as cell, j}
					<button
						class="relative
							w-[1.4rem]
              h-[1.4rem]
							aspect-square
              flex
              justify-center
              items-center
              {getNearbyFlags(i, j) === cell.content
							? 'font-medium'
							: 'font-bold'}
              {(i + j) % 2 === 0 ? 'bg-mantle' : 'bg-crust'}
              {getCellColor(cell)}
              border-none
              outline-none
							transition-all
							duration-500"
						on:click={() => handleClick(i, j)}
					>
						{#if cell.content === "bomb"}
							<img src="/bomb.png" alt="💣" class="h-5/6 w-5/6" />
						{:else}
							{cell.content}
						{/if}

						{#if cell.state !== "visible"}
							<div
								class="absolute
								z-20
								top-0
								left-0
								w-full
								h-full
								{(i + j) % 2 === 0 ? 'bg-surface0' : 'bg-surface1'}"
								out:fly={{
									x: Math.random() * 50 - 25,
									y: Math.random() * 50 - 25,
									duration: 800,
									delay: cell.content === "bomb" ? Math.random() * 2000 : 0,
								}}
							>
								{#if cell.state === "flagged"}
									<div
										class="text-text"
										in:scale
										out:fly={{ y: 10, x: Math.random() * 10 - 5 }}
									>
										<img src="/flag.png" alt="🚩" class="w-full h-full" />
									</div>
								{/if}
							</div>
						{/if}
					</button>
				{/each}
			</div>
		{/each}
	</div>

	<div
		class="p-4 flex flex-row gap-4"
		transition:slide={{ duration: 500, delay: 500 }}
	>
		<button
			class="p-4
				{currentTool === 'flag' ? 'bg-crust' : 'bg-mantle'}
				rounded-2xl
				{currentTool === 'flag' ? 'scale-100' : 'scale-75'}
				transition
				duration-500"
			on:click={() => (currentTool = "flag")}
		>
			<span
				class="{currentTool === 'flag' ? '' : 'grayscale'}
					transition
					duration-500"
			>
				<img src="/flag.png" alt="🚩" class="w-12 h-12" />
			</span>
		</button>
		<button
			class="p-4
				{currentTool === 'dig' ? 'bg-crust' : 'bg-mantle'}
				rounded-2xl
				{currentTool === 'dig' ? 'scale-100' : 'scale-75'}
				transition
				duration-500"
			on:click={() => (currentTool = "dig")}
		>
			<span
				class="{currentTool === 'dig' ? '' : 'grayscale'}
					transition
					duration-500"
			>
				<img src="/pickaxe.png" alt="⛏️" class="w-12 h-12" />
			</span>
		</button>
	</div>

	<Dialog isOpen={finalDialogOpen}>
		<div class="flex flex-col items-center gap-2">
			{#if hasWon}
				<img src="/timer.png" alt="⏳" class="h-28 w-28" />
				<div class="text-3xl font-bold">{time}</div>
			{:else}
				<img src="/bomb.png" alt="💣" class="h-28 w-28" />
				<div class="text-3xl font-bold">Game Over !</div>
			{/if}
			<button
				class="mt-2 p-4 bg-crust rounded-2xl"
				on:click={() => {
					finalDialogOpen = false;
					dispatch("newGame");
				}}
			>
				<img src="/home.png" alt="🏠" class="w-14 h-14" />
			</button>
		</div>

		{#if finalDialogOpen && hasWon}
			<div class="fixed -top-[50vh] left-1/2 -translate-x-1/2">
				<Confetti
					delay={[500, 1500]}
					x={[-2, 2]}
					y={[0, -1]}
					amount={100}
					xSpread={0}
					size={8}
					infinite
				/>
			</div>
			<div class="fixed -bottom-[50vh] left-1/2 -translate-x-1/2">
				<Confetti
					delay={[500, 1500]}
					x={[-1, 1]}
					y={[1, 2]}
					amount={150}
					cone
					infinite
				/>
			</div>
		{/if}
	</Dialog>
</div>
