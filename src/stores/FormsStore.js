import { writable } from "svelte/store"
import { browser } from "$app/env";

const FormsStore = writable([])

if (browser){
  FormsStore.update( ()=> {
    const array = localStorage.getItem('forms')
    if(array==null){
      return []
    }else{
      return JSON.parse(array)
    }
  })

  FormsStore.subscribe((value) => localStorage.setItem('forms', JSON.stringify(value)))
}

export default FormsStore
