<script>
	import { createEventDispatcher } from 'svelte'
	import { fade } from 'svelte/transition'

	const dispatch = createEventDispatcher();

	function compartirApp() {
		navigator.share({
			title: '📄 Genera Form',
			url: 'https://generaform.netlify.app/',
			text: `📄 Genera Form`
		});
	}

	let canShare = false;
	if (navigator.canShare) {
		canShare = true;
	}
</script>

<svelte:head>
	<title>Info</title>
</svelte:head>

<section class="text-gray-600 body-font relative" transition:fade>
	<div class="container px-5 mx-auto flex sm:flex-nowrap flex-wrap">
		<div class=" md:w-screen md:pr-12 md:py-8 mb-8 pb-10 border-b border-gray-200">
			<div class="bg-white relative flex flex-wrap">
				<div class="lg:w-1/2 px-6">
					<!-- opcion 1 -->
					<h2 class="title-font font-semibold text-gray-900 tracking-widest text-xm">
						Genera Form
					</h2>
					<p class="mt-2 inline-flex items-center text-base">
						Version Semilla 🌱. Sin registro ni costo.
					</p>
					{#if canShare}
						<button
							class="mt-4 inline-flex items-center py-1 text-indigo-700  hover:text-indigo-900  text-base md:mt-0 cursor-pointer focus:outline-none focus:border-none"
							on:click={compartirApp}
						>
							Compartila con tus amigos.
						</button>
					{:else}
						<p class="mt-2 inline-flex items-center text-base">
							Copia el link y compartilo con tus amigos:
						</p>
						<p class="mt-2 inline-flex items-center text-base">
							<code>https://generaform.netlify.app/</code>
						</p>
					{/if}
					<p class="mt-5 inline-flex items-center text-base">Muchas gracias!</p>
					<!-- opcion 2 -->
					<h2 class="mt-8 title-font font-semibold text-gray-900 tracking-widest text-xm">
						Genera Aplicaciones
					</h2>
					<p class="mt-2 inline-flex items-center text-base">
						Quizás te interesen estas otras aplicaciones:
					</p>
					<a
						href="https://generaaplicaciones.netlify.app/"
						class="mt-4 inline-flex items-center py-1 text-indigo-700  hover:text-indigo-900  text-base md:mt-0 cursor-pointer focus:outline-none focus:border-none"
						rel="noopener noreferrer"
						target="_blank"
					>
						Genera Aplicaciones.
					</a>
					<!-- opcion 3 -->
					<h2 class="mt-8 title-font font-semibold text-gray-900 tracking-widest text-xm">
						Contacto
					</h2>
					<p class="mt-2 inline-flex items-center text-base">
						generaaplicaciones@gamil.com
					</p>
					<!-- opcion 4 -->
					<h2 class="mt-8 title-font font-semibold text-gray-900 tracking-widest text-xm">
						Ayuda
					</h2>
					<a
						href="https://generaformdoc.netlify.app/"
						class="mt-4 inline-flex items-center py-1 text-indigo-700  hover:text-indigo-900  text-base md:mt-0 cursor-pointer focus:outline-none focus:border-none"
						rel="noopener noreferrer"
						target="_blank"
					>
						Documentación Genera Form.
					</a>					
				</div>
			</div>
		</div>
	</div>
</section>

