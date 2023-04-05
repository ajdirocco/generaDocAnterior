<script context="module">
  import emojiLocal from '../stores/emoji.json'
  export async function load( { fetch } ) {
    console.log('generadoc - server - 0.1.7')
      return {
        props: {
          emojis: emojiLocal
        }
      }

  //api
      // const res = await fetch('https://generatorneosapi.netlify.app/emoji.json')
      // const emojis = await res.json()

      // if (res.ok) {
      //   return {
      //     props: {
      //       emojis
      //     }
      //   }
      // } else {
      //   return {
      //     props: {
      //       emojis: emojiLocal
      //     }
      //   }
      // }


      // const res1 = await fetch('https://generatorneosapi.netlify.app/color.json')
      // const colores = await res1.json()

      // if (res.ok && res1.ok) {
      //   return {
      //     props: {
      //       emojis,
      //       colores
      //     }
      //   }
      // }

      // return {
      //   status: res.status,
      //   error: new Error('generaTorneos - could not fetch api data')
      // }
  }
</script>
<script>
  console.log('generadoc - client - 0.1.7')

  import { fade } from 'svelte/transition'

  import Objetos from '$lib/Forms.svelte'

  import EmojiStore from '../stores/EmojiStore.js'
  import ObjetosStore from '../stores/FormsStore.js'

  let tabActual = 'default'

  export let emojis
  //export let colores

  EmojiStore.update( ()=> {
    return emojis
  })

  //init
</script>

<svelte:head>
  <title>Genera Doc</title>
</svelte:head>

<section class="text-gray-600 body-font" transition:fade>
  <nav class="container mx-auto flex pl-5 pt-0 pr-5 md:flex-row items-left text-sm font-medium mb-8">
    <button
      on:click={ () => {tabActual = 'default'}}
      class="pl-0 pt-4 pr-4 -mb-px border-b text-indigo-700 {tabActual == 'default' ? 'border-current' : 'border-transparent'}"
      >Docs</button>
    <button
      on:click={ () => {tabActual = 'favoritos'}}
      class="p-4 pt-8  -mb-px border-b hover:text-indigo-700 {tabActual == 'favoritos' ? 'border-current' : 'border-transparent'}"
      >Favoritos</button>
  </nav>

  {#if tabActual == 'default'}
    {#if $ObjetosStore != 'null'}
      <Objetos/>
    {/if}
  {:else if tabActual = 'favoritos'}
    {#if $ObjetosStore != 'null'}
      <Objetos filtrar={true}/>
    {/if}
  {/if}
</section>
