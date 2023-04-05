<script>
    import { goto } from '$app/navigation'
    import { fade } from 'svelte/transition'

    import ObjetosStore from '../stores/FormsStore.js'
    import ObjetoStore from '../stores/FormStore'
    import PaginationStore from '../stores/PaginationStore'

    export let filtrar = false

    function select(objeto) {
        ObjetoStore.update( ()=> {
            return objeto
        })
        goto('forms/form')
    }

    function previous() {
        if ($PaginationStore.rango1 - $PaginationStore.incremento < 0) { return }
        $PaginationStore.rango1=$PaginationStore.rango1 - $PaginationStore.incremento
        $PaginationStore.rango2=$PaginationStore.rango2 - $PaginationStore.incremento
        objetosPaginado = objetos.slice($PaginationStore.rango1, $PaginationStore.rango2)
    }

    function next() {
        if ($PaginationStore.rango2 + $PaginationStore.incremento > objetos.length + 3) { return }
        $PaginationStore.rango1=$PaginationStore.rango1 + $PaginationStore.incremento
        $PaginationStore.rango2=$PaginationStore.rango2 + $PaginationStore.incremento
        objetosPaginado = objetos.slice($PaginationStore.rango1, $PaginationStore.rango2)
    }

//init
    let objetos = []
    let objetosPaginado = []

    if (filtrar) {
        console.log('filtrar')
        objetos = $ObjetosStore.filter(function (el) {
            return el.isFavorito == true
        })
        objetosPaginado = [...objetos]
    }else {
        objetos = $ObjetosStore
        objetosPaginado = [...$ObjetosStore]
    }

    objetosPaginado = objetosPaginado.slice($PaginationStore.rangoDefault1, $PaginationStore.rangoDefault2)
    //init fin
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<section class="text-gray-700 body-font mb-10">
    <div class="pt-0 pb-0 container px-5 py-24 mx-auto">
        <div class="flex flex-wrap -m-4 -mt-2">
            <!-- <a sveltekit:prefetch href="/ejemplos/ejemplo" class="inline-flex items-center border-0 py-1 px-3  text-base mt-4 md:mt-0   font-medium text-indigo-700 hover:text-indigo-900 cursor-pointer focus:outline-none focus:border-none">Nuevo</a> -->
            <!-- <a sveltekit:prefetch href="/ejemplos/eliminar" class="inline-flex items-center border-0 py-1 px-3  text-base mt-4 md:mt-0   font-medium text-indigo-700 hover:text-indigo-900 cursor-pointer focus:outline-none focus:border-none">Eliminar</a> -->
            <!-- <a sveltekit:prefetch href="/ejemplos/compartir" class="inline-flex items-center border-0 py-1 px-3  text-base mt-4 md:mt-0   font-medium text-indigo-700 hover:text-indigo-900 cursor-pointer focus:outline-none focus:border-none">Compartir</a> -->
        </div>
    </div>
    {#if $ObjetosStore}
        <div class="pt-0 pb-0 container px-5 py-24 mx-auto">
            <div class="flex flex-wrap -m-4 -mt-2">
                {#each objetosPaginado as objeto}
                   <div
                        transition:fade
                        class="flex justify-center lg:w-1/4 md:w-1/2 p-4 w-full hover:text-indigo-700 hover:text-opacity-120">
                        <button
                            on:click={select(objeto)}
                            class="bg-gray-300 inline-flex py-3 px-5 rounded-lg items-center ml-4 hover:bg-gray-400 focus:outline-none md:mr-5">
                            <span
                                class="ml-4 flex items-start flex-col leading-none">
                                {#if objeto.copa}
                                    <span class="inline-flex items-center justify-center px-1 pt-1 pb-2 text-xs font-bold leading-none text-black-100 bg-yellow-300 rounded-full mb-1">copa</span>
                                {/if}
                                <span class="text-sm mb-1">{objeto.subtitulo}</span>
                                <span class="text-base title-font font-medium">{objeto.titulo}</span>
                            </span>
                        </button>
                    </div>
                {/each}
                {#if objetos.length > $PaginationStore.incremento}
                        <div
                        transition:fade
                        class="flex justify-center justif lg:w-1/4 md:w-1/2 md:pt-20 pt-6 lg:pr-56 md:-pr-16 -pr-16 pb-1 w-full ">
                        <!-- transition:fade
                        class="flex justify-center justif lg:w-1/4 md:w-1/2 md:pt-20 pt-6 pl-6 pr-6 pb-1 w-full "> -->
                        <!-- <div
                        transition:fade
                        class="flex  md:pt-5 md:mr-10 md:pr-96 pt-6 pl-6 pr-6 pb-1 w-full "> -->
                        <span
                            on:click={previous}
                            class="font-medium text-indigo-700 mr-3 inline-flex items-center lg:ml-auto md:ml-0 ml-auto leading-none text-sm pr-3 py-1 box-border md:h-10 w-16 border-r-2 border-gray-200 hover:text-indigo-900 cursor-pointer">
                            Anterior
                        </span>
                        <span
                            on:click={next}
                            class="font-medium text-indigo-700 inline-flex items-center leading-none md:h-10 w-14 text-sm hover:text-indigo-900 cursor-pointer">
                            Siguiente
                        </span>
                    </div>
                {/if}
            </div>
        </div>
    {/if}
</section>
