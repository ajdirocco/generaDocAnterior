<script>
    import { fade } from 'svelte/transition'

    import Forms from '$lib/Forms.svelte'
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<section class="text-gray-600 body-font" transition:fade>
    <Forms/>
</section>