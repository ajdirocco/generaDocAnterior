<script>
  import { createEventDispatcher, onMount } from 'svelte'

  export let value,  placeholder='', type='text', min=0, max=100, required = false, textCenter = '', placeholderText = 'Ingrese un texto'

  let inputRef

  const dispatch = createEventDispatcher()
  let editing = false, original

  onMount(() => {
    original = value
  })

  function edit() {
    editing = true
  }

  function submit() {
    dispatch('submit', {newValue : value, oldValue : original})
    editing = false
  }

  function submitOnBlur() {
    if (editing != false) {
      dispatch('submit', {newValue : value, oldValue : original})
      editing = false
    }
  }

  function keydown(event) {
    if (event.key == 'Escape') {
      event.preventDefault()
      value = original
      editing = false
    }
  }

  function focus(element) {
      if (element.type=='textarea') {
        if (element.value=='Edita con un clic cualquier texto entre rayitas.') {
            element.value = ''
        }
      }
      element.focus()
  }

  function preventEnter(event){
    if(event.key == 'Enter') {
      inputRef.blur();
    }
  }
</script>
<style>
[contentEditable=true]:empty:not(:focus):before{
        content:attr(data-text)
    }
</style>
  {#if editing}
    <form on:submit|preventDefault={submit} on:keydown={keydown} class="text-gray-800 block bg-clip-content p-1 border-2 border-green-500 border-opacity-70 border-dashed   ">
      {#if type == 'textarea'}
        <textarea bind:value on:blur={submitOnBlur} placeholder={placeholder} {required} use:focus  class="focus:outline-none w-full h-full" on:keypress={preventEnter} bind:this={inputRef}></textarea>
      {:else if type == 'textareaEnter'}
        <textarea bind:value on:blur={submitOnBlur} placeholder={placeholder} {required} use:focus  class="focus:outline-none w-full h-full" bind:this={inputRef}></textarea>        
      {:else if type == 'number'}
        <input type="number" min={min} max={max} bind:value on:blur={submitOnBlur} {required} use:focus class="focus:outline-none">
      {:else}
        <input bind:value on:blur={submitOnBlur} placeholder={placeholder} {required} use:focus class="focus:outline-none w-full h-full {textCenter}"/>
      {/if}
    </form>
  {:else}
    <div on:click={edit} class=" text-gray-800 block bg-clip-content p-1 border-2 border-indigo-500 border-opacity-70 border-dashed " contentEditable=true data-text={placeholderText}>
      {value}
    </div>
  {/if}

