<script lang="ts">
	import { scale, fly } from "svelte/transition";
	import Dialog from "$lib/Dialog.svelte";
	import type { Cell } from "$lib/utils";

	let grid: Cell[][] = Array(10).fill(
		Array(20).fill({ content: 0, state: "hidden" })
	);
	let gameStarted = false;
	let isGameOver = false;
	let currentTool: "flag" | "dig" = "flag";
	let time = 0;
	let timerInterval: number;
	let bombs = 0;
	let hasWon = false;
	let finalDialogOpen = false;

	function generateGrid(touchX: number, touchY: number) {
		grid = [];
		bombs = 0;

		for (let i = 0; i < 10; i++) {
			grid.push([]);
			for (let j = 0; j < 20; j++) {
				grid[i].push({ content: 0, state: "hidden" });
			}
		}

		while (bombs < 35) {
			const x = Math.floor(Math.random() * 10);
			const y = Math.floor(Math.random() * 20);

			if (grid[x][y].content !== "bomb" && !cellNearby(x, y, touchX, touchY)) {
				grid[x][y].content = "bomb";
				bombs++;
			}
		}

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
			gameStarted = true;

			revealCell(x, y);

			timerInterval = setInterval(() => time++, 1000);
		} else if (!isGameOver) {
			if (currentTool === "flag") {
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
				} else if (grid[x][y].state === "visible") {
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

		if (grid[x][y].content === 0) {
			if (x > 0 && y > 0) revealCell(x - 1, y - 1);
			if (x > 0) revealCell(x - 1, y);
			if (x > 0 && y < grid[0].length - 1) revealCell(x - 1, y + 1);
			if (y > 0) revealCell(x, y - 1);
			if (y < grid[0].length - 1) revealCell(x, y + 1);
			if (x < grid.length - 1 && y > 0) revealCell(x + 1, y - 1);
			if (x < grid.length - 1) revealCell(x + 1, y);
			if (x < grid.length - 1 && y < grid[0].length - 1)
				revealCell(x + 1, y + 1);
		}

		grid = grid;

		checkWin();
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
</script>

<div class="h-full flex flex-col justify-between items-center">
	<div
		class="w-full p-4 flex flex-row justify-center items-center gap-4 font-bold text-2xl bg-mantle"
	>
		<div>
			⏳{time}
		</div>
		<div>
			🚩{bombs}
		</div>
	</div>

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

					<button
						class="relative
							w-8
              h-8
              flex
              justify-center
              items-center
              text-xl
              font-bold
              {(i + j) % 2 === 0 ? 'bg-mantle' : 'bg-crust'}
              {getCellColor(cell)}
              border-none
              outline-none"
						on:click={() => handleClick(i, j)}
					>
						{cell.content === "bomb" ? "💣" : cell.content}

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
									<div in:scale out:fly={{ y: 10, x: Math.random() * 10 - 5 }}>
										🚩
									</div>
								{/if}
							</div>
						{/if}
					</button>
				{/each}
			</div>
		{/each}
	</div>

	<div class="p-4 flex flex-row gap-4">
		<button
			class="p-4
				text-4xl
				{currentTool === 'flag' ? 'bg-crust' : 'bg-mantle'}
				rounded-2xl
				transition
				duration-500"
			on:click={() => (currentTool = "flag")}
		>
			<span
				class="{currentTool === 'flag' ? '' : 'grayscale'}
					transition
					duration-500"
			>
				🚩
			</span>
		</button>
		<button
			class="p-4
				text-4xl
				{currentTool === 'dig' ? 'bg-crust' : 'bg-mantle'}
				rounded-2xl
				transition
				duration-500"
			on:click={() => (currentTool = "dig")}
		>
			<span
				class="{currentTool === 'dig' ? '' : 'grayscale'}
					transition
					duration-500"
			>
				⛏️
			</span>
		</button>
	</div>

	<Dialog isOpen={finalDialogOpen}>
		<div class="flex flex-col items-center gap-2">
			{#if hasWon}
				<div class="text-6xl">⏳</div>
				<div class="text-3xl font-bold">{time}</div>
			{:else}
				<div class="text-6xl">💣</div>
				<div class="text-3xl font-bold">Game Over !</div>
			{/if}
			<button
				class="mt-2 p-4 text-3xl bg-crust rounded-2xl"
				on:click={() => window.location.reload()}
			>
				<span class="grayscale"> 🏠 </span>
			</button>
		</div>
	</Dialog>
</div>
