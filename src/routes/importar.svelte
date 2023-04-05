<script>
	import { fade } from 'svelte/transition'
    import { goto } from '$app/navigation'

    import notifications from '../stores/notifications.js' //Toast.svelte

    import ObjetosStore from '../stores/FormsStore.js'

    let codigo = '' //959978561557774336

    function guardar(json){
        //guardar
        try {
            //eliminar
            const arrTmp = $ObjetosStore.filter(
                (item) =>
                    item.titulo != json.titulo
            )
            $ObjetosStore = arrTmp
            //guardar
            const array = JSON.parse(localStorage.getItem('forms'))
            array.unshift(json)
            $ObjetosStore = [...array]
            notifications.success('Importado', 2500)
            goto('/')
        } catch (error) {
            notifications.danger('Error - No importado', 2500)
        }
    }

	async function importar() {
        if (codigo.trim() == '') { return }
		const res = await fetch('https://jsonblob.com/api/jsonBlob/' + codigo)
		const json = await res.json()

		if (res.ok) {
            guardar(json)
			return JSON.stringify(json, undefined, 2)
		} else {
			throw new Error(json)
		}
	}

	let promise

	function handleClick() {
		promise = importar()
	}
</script>

<svelte:head>
	<title>Info</title>
</svelte:head>

<div class=" bg-white" transition:fade>
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div class="lg:w-1/2 md:w-2/3 mx-auto  mt-4">
            <div class="flex flex-wrap -m-2">
                <div class="p-2 w-full">
                    <div class="relative">
                        <input type="text" placeholder="Ingresa el código de importación" bind:value={codigo} 
                        class="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-2
                        focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out">
                    </div>
                </div>
            </div>
        </div>
        <div class="lg:w-1/2 md:w-2/3 mx-auto  mt-4">
            <nav class="flex flex-wrap  list-none">
                <li class="mb-4">
                    <button on:click={handleClick}
                        class=" font-medium text-indigo-700 hover:text-indigo-900 cursor-pointer  focus:outline-none focus:border-none"
                        >Importar</button>
                </li>
            </nav>
        </div>
       {#if promise != null}
            {#await promise}
                <p>...cargando</p>
            {:then objetoJson}
                <pre>{objetoJson}</pre>
            {:catch error}
                <p style="color: red">{error.message}</p>
            {/await}
        {/if}
    </div>
</div>

