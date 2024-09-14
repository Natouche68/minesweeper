<script>
	import "../app.css";
</script>

<svelte:head>
	<title>Minesweeper</title>
	<link rel="manifest" href="/manifest.json" />
</svelte:head>

<div class="h-dvh bg-base text-text overflow-hidden">
	<slot />
</div>
