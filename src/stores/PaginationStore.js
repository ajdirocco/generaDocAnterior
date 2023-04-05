import { writable } from "svelte/store"

const rango1 = 0
const rango2 = 3

const PaginationStore = writable({'rangoDefault1': rango1, 'rangoDefault2': rango2, 'rango1': rango1, 'rango2': rango2, 'incremento': 3})

export default PaginationStore