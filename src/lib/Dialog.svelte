<script lang="ts">
	export let isOpen = false;

	let dialog: HTMLDialogElement | null = null;

	$: {
		if (isOpen) {
			dialog?.showModal();
		} else {
			dialog?.close();
		}
	}
</script>

<dialog
	bind:this={dialog}
	class="w-72
    p-6
    text-xl
    bg-mantle
    text-text
    rounded-2xl
    shadow-lg
    backdrop:backdrop-blur-sm
		{isOpen ? 'scale-100' : 'scale-0'}
		transition
		duration-500"
>
	<slot />
</dialog>
