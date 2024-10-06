<script lang="ts">
	export let variant: 'danger' | 'default' = 'default';

	const colors = {
		danger: 'bg-red-500 hover:bg-red-600',
		default: 'bg-violet-500 hover:bg-violet-600'
	};
</script>

<button class="{colors[variant]} transition px-6 py-2 rounded-md text-white text-lg font-medium">
	<slot />
</button>
