<script>
//imports
	import { onMount, onDestroy, tick } from 'svelte'
	import { fade, slide } from 'svelte/transition'
	import { goto } from '$app/navigation'

	import InPlaceEdit from '$lib/InPlaceEdit.svelte'

	import notifications from '../../stores/notifications.js' //Toast.svelte
	import ObjetosStore from '../../stores/FormsStore.js'
	import ObjetoStore from '../../stores/FormStore'

	//docs
	import EjMdsvex from '$lib/doc/EjMdsvex.md'

	let component = EjMdsvex //lo setearia desde el store que tiene el form seleccionado

	//imports - end

//variables
	const gistToken = import.meta.env.VITE_APP_GIST_TOKEN
	const gistBaseUrl = 'https://api.github.com/gists/'
	let isEdicion = false
	let showInfo = false
	let infoGral = 'Genera un texto usando Markdown y tags especiales'
	let isFavorito = false
	let canShare = false
	try {
		if (navigator.canShare) {
			canShare = true;
		}
	} catch (error) {
		console.log('generaDoc - navegator - error (server)')
	}
	//variables -end

//objeto nuevo
	export const newObjeto = (newObjeto, isGuardarComo = false) => {
		try {
			let titulo = ''
			let subtitulo = ''
			let info = '' //infoGral
			let source = ''
			let data = ''

			if (newObjeto != null) {
				//? las dos siguientes lineas estaban asi: (titulo = newObjeto.titulo), (subtitulo = newObjeto.subtitulo)
				titulo = newObjeto.titulo
				subtitulo = newObjeto.subtitulo
				info = newObjeto.info
				source = newObjeto.source
				data = newObjeto.data
			} else {
				titulo = ''
				subtitulo = ''
			}

			let objeto = {
				titulo: titulo,
				subtitulo: subtitulo,
				info: info,
				isFavorito: isFavorito,
				source: source,
				data: data
			}

			return objeto
		} catch (error) {
			console.error(error)
		}
	};
	//objeto nuevo - end

//botonera
	function toggleInfo() {
		showInfo = !showInfo;
	}

	function toggleFavorito() {
		isFavorito = !isFavorito;
		objeto.isFavorito = isFavorito;
	}

	function guardarComo() {
		let rta = 'Se hará una nueva copia.';
		if (!confirm(rta) == true) {
			return;
		}

		//CRUD (DOM) - set datos del form
		let data = new FormData(document.forms[0]);
		objeto.data = Object.fromEntries(data.entries());

		let objetoCopia = newObjeto({ ...objeto }, true);
		//setear nombre
		objetoCopia.titulo = objetoCopia.titulo + ' (copia)';
		//guardar
		const array = JSON.parse(localStorage.getItem('forms'));
		array.unshift(objetoCopia);
		$ObjetosStore = [...array];
		//isEdicion = true}
		goto('/');
	}

	function eliminar() {
		try {
			let rta = '¿Está seguro de eliminar\n' + objeto.titulo;
			if (!confirm(rta) == true) {
				return;
			}
			//guardar(false);
			save(false)
			const arrTmp = $ObjetosStore.filter((item) => item.titulo != objeto.titulo);
			$ObjetosStore = arrTmp;
			notifications.success('Eliminado', 2500);
			goto('/');
		} catch (error) {
			notifications.danger('Error - No eliminado', 2500);
		}
	}
	//botonera - end

//Persistencia (Gist - Local)
	//Persistencia Gist
	async function getGist(gist) {
		const res = await fetch(gistBaseUrl + gist)
		const json = await res.json()

		if (res.ok) {
			return json
		} else {
			throw new Error(json);
		}
	}

	//Persistencia Gist (get inputs (pair key-value) from each gists files content)
	async function getGistsContent() {
		let data
		for (let form of document.forms) {
			if (form.hasAttribute("data-gx-gist")) {
				if (form.getAttribute("data-gx-gist").trim()!='') {
					const json = await getGist(form.getAttribute("data-gx-gist").trim())
					data = {...data, ...getGistFilesData(json.files)}
				}
			}
		}
		//console.log("getGistsContent() - data:",data)
		return data
	}

	//Persistencia Gist
	function getContent(container){
		let entries = container.getElementsByTagName("input")
		let obj = {}
		for (let entry of entries) {
			//console.log('entry name and value:',entry.name, entry.value)
			obj[entry.name] = entry.value
		}
		//console.log('obj:', obj)

		return obj
	}

	//Persistencia Gist
	async function saveGist(form) {
		let content
		let objFiles = {}
		let objContent
		//console.log('gistName:', form.getAttribute('data-gx-gist'))
		const gistFiles = form.querySelectorAll('[data-gx-gist-file]')
		let i = 0
		if (form.querySelectorAll('[data-gx-gist-file]').length>0) {
			for (const gistFile of gistFiles) {
				//console.log('gistFileName:', gistFile.getAttribute('data-gx-gist-file'))
				objContent = {}
				content = getContent(gistFile)
				objContent[`content`] = JSON.stringify(content)
				objFiles[`content${i}.json`] = objContent
				gistFile.setAttribute('data-gx-gist-file', `content${i}.json`)
				i+=1
			}
		} else {
			objContent = {}
			content = getContent(form)
			objContent[`content`] = JSON.stringify(content)
			objFiles[`content${i}.json`] = objContent
		}

		let files = {files: Object.assign({},objFiles)}
		//console.log(files);
		//console.log(JSON.stringify(files));

		let req
		if (form.hasAttribute("data-gx-gist")) {
			if (form.getAttribute("data-gx-gist").trim()=='') {
				//insert
				console.log('insert')
				req = await fetch(gistBaseUrl,{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${gistToken}`
					},
					description: 'data-gx-gist',
					'public': false,			
					body: JSON.stringify(files)
				})
			}else {
				//update
				console.log('update', gistBaseUrl + form.getAttribute("data-gx-gist").trim())
				req = await fetch(form.getAttribute("data-gx-gist").trim(), {
					method: 'PATCH',
					headers: {
						Authorization: `Bearer ${gistToken}`
					},
					body: JSON.stringify(files)
				})
			}		
		}

		const json = await req.json()

		if (req.ok) {
			//console.log(json.files)
			form.setAttribute('data-gx-gist', json.id)
			console.log('gist json:', json)
			return json
		} else {
			throw new Error(json)
		}
	}	

	//Persistencia Gist (refresh source)
	async function sourceRefresh() {
		//CRUD (DOM) - actualizar el source con lo nuevo generado
		let article = document.querySelector('article')
		objeto.source = article.innerHTML
	}

	//Persistencia Gist (get content files (inputs key value))
	function getGistFilesData(files){
		let data
		//console.log('files:', files)
		Object.keys(files).forEach(key => {
			//console.log(key, files[key]);
			//console.log(key, JSON.parse(files[key].content))
			data = {...data, ...JSON.parse(files[key].content)}
		})
		return data
	}

	//Persistencia Gist (localStorage)
	function persistLocalStorage(mostrarToast = true) {
		try {
			if (isEdicion) {
				$ObjetosStore = [...$ObjetosStore];
			} else {
				isEdicion = true;
				let array = $ObjetosStore;
				array.unshift(objeto);
				$ObjetosStore = [...array];
			}
			if (mostrarToast) {
				notifications.success('Guardado', 2500);
			}
		} catch (error) {
			if (mostrarToast) {
				notifications.danger('Error - No guardado', 2500);
			}
		}			
	}

	//Persistencia Gist (local)
	function saveLocal(files, mostrarToast) {
		let data

		if (files) {
			data = getGistFilesData(files)
		}

		//Set datos
		if (!data) {
			//CRUD (DOM) - set datos desde el form
			data = new FormData(document.forms[0]);			
			objeto.data = Object.fromEntries(data.entries());
		}
		objeto.data = data

		//Set Titulo
		// if (objeto.titulo.trim() == '') {
		// 	objeto.titulo = 'Form ' + parseInt($ObjetosStore.length);
		// }		

		//Refresh form source y datos
		sourceRefresh().then(
			() => {
				crudDomSetValues()
				persistLocalStorage(mostrarToast)
			})
	}

	//Persistencia Gist
	function save(mostrarToast){
		if (document.forms.length > 0) {
			for (let form of document.forms) {
				if (!form.getAttribute("data-gx-readonly")) {
					if (form.hasAttribute("data-gx-gist")) {
						saveGist(form).then(
							json => {
								saveLocal(json.files, mostrarToast)								
							}
						)
					} else {
						saveLocal(null, mostrarToast)
					}
				}
			}
		} else {
			saveLocal(null, mostrarToast)
		}
	}
	//Persistencia (Gist - Local)

//CRUD (DOM)
	//CRUD (DOM) - set inputs value
	async function crudDomSetValuesInit() {
		const data = await getGistsContent()
		if (data) {
			objeto.data = data
			//persistLocalStorage(false)
			crudDomSetValues()
		} else {
			crudDomSetValues()
		}
	}

	function crudDomSetValues() {
		//console.log("objeto.data:",objeto.data);
		for (const key in objeto.data) {
			//console.log(`${key}: ${objeto.data[key]}`);
			let inputs = document.getElementsByName(key)
			inputs.forEach((input) => {
				if (input.type == 'radio' || input.type == 'checkbox') {
					input.checked = objeto.data[key]
				}else{
					input.value = objeto.data[key]
				}
			})
		}
	}

	//CRUD (DOM) - core
	// function changeName(input, nextIndex){
	// 	let id = ''
	// 	let name = ''
	// 	//id
	// 	if (input.id) {
	// 		id = input.id
	// 	} else {
	// 		id = input.type
	// 	}
	// 	//name
	// 	if (input.name) {
	// 		name = input.name
	// 	} else {
	// 		name = input.type
	// 	}
	// 	//set id and name
	// 	input.setAttribute('id', id + nextIndex)
	// 	input.setAttribute('name', name + nextIndex)	
	// }

	// function insertAfter(e,i){
	// 	if(e.nextSibling){
	// 		e.parentNode.insertBefore(i,e.nextSibling)
	// 	} else {
	// 		e.parentNode.appendChild(i)
	// 	}
	// }

	// function handleClick(event) {
	// 	//console.log("event - handleClick:", event.target.nodeName, event.target.getAttribute('name'), event.target.value, event.target, event)
	// 	//console.log("event - handleClick - event.target.classList:", event.target.classList)
		
	// 	if (event.target.classList.contains('gxTrigger')) {
	// 		const crudType = event.target.getAttribute("data-gx-type")
	// 		const crudTarget = event.target.getAttribute("data-gx-target")
	// 		const cloneType = event.target.getAttribute("data-gx-insert")

	// 		//index to apply in id and name
	// 		let lastIndex = event.target.getAttribute("data-gx-last-index")
	// 		let nextIndex = 0
	// 		if(!lastIndex){
	// 			lastIndex = 0
	// 		} 
	// 		nextIndex = parseInt(lastIndex) + 1
	// 		event.target.setAttribute("data-gx-last-index", nextIndex)
	// 		//index to apply in id and name - end

	// 		const node = document.getElementById(crudTarget)
	
	// 		if (crudType == "clone" || crudType == "clone-clean") {
	// 			const clone = node.cloneNode(true)
	
	// 			//set inputs id, name
	// 			let inputs = clone.querySelectorAll('input')
	// 			inputs.forEach((input) => {
	// 				if (input.type == 'radio') {
	// 					const parent = input.parentElement.nodeName
	// 					if (parent.classList.contains('gxChangeName')) {
	// 						changeName(input, nextIndex)
	// 					}
	// 				} else {
	// 					changeName(input, nextIndex)
	// 				}
	// 			})
	// 			//set inputs id, name  - end

	// 			//set (clean) input value
	// 			if (crudType == "clone-clean") {
	// 				try {
	// 					clone.querySelector('input').value =''
	// 				} catch (error) {
	// 				}
	// 			}
	// 			//set (clean) input value - end

	// 			//insert clone
	// 			if (cloneType == "before") {
	// 				node.insertBefore(clone)
	// 			} else if (cloneType == "after") {
	// 				insertAfter(node,clone)
	// 			}else {
	// 				node.appendChild(clone)
	// 			}
	// 			//insert clone - end

	// 		} else if (crudType == "remove") {
	// 			let parent = node.parentElement
	// 			parent.removeChild(node)
	// 		}		
	// 	}
		
	// }//CRUD (DOM) - core - end	
	//CRUD (DOM) - end

//init
	onMount(() => {
		try {
			//CRUD (DOM) - set inputs value
			crudDomSetValuesInit()
		} catch (error) {
			console.log('form - onMount - error:', error)
		}
	}) //onMount - end

	onDestroy(() => {
		//CRUD (DOM) - actualizar el source con lo nuevo generado
		let article = document.querySelector('article')
		objeto.source = article.innerHTML

		//console.log('onDestroy')
		$ObjetoStore = {}
	}) //onDestroy - end

	let objeto
	if (Object.entries($ObjetoStore).length === 0) {
		objeto = newObjeto()
	} else {
		isEdicion = true
		objeto = $ObjetoStore
		isFavorito = objeto.isFavorito
	}
	//init - end
</script>



<section class="mt-2 md:mb-7 text-gray-600 body-font" transition:fade>
	<!-- titulo y botonera -->
	<div class="container flex flex-wrap px-5 mx-auto">
		<!-- titulo -->
		<div
			class="w-full md:w-1/2 md:pr-12 md:pt-0 md:border-r-2 md:border-b-0 mb-0 md:mb-0 pb-0  border-gray-200"
		>
			<div class="mb-3 leading-relaxed text-xl font-bold text-center">
				<input
					class="w-full h-10 text-center"
					bind:value={objeto.subtitulo}
					placeholder="Subtitulo"
				/>
			</div>
			<div class="mb-3 sm:text-3xl text-2xl font-medium text-center">
				<input
					class="w-full h-10 text-center"
					bind:value={objeto.titulo}
					placeholder="Titulo"
				/>
			</div>
			<div class="leading-relaxed text-sm font-bold text-center">
				<input
					class="w-full h-10 text-center"
					bind:value={objeto.info}
					placeholder={infoGral}
				/>		
			</div>
			<!-- <br />
			<button
				class="font-medium text-indigo-700 hover:text-indigo-900 cursor-pointer  inline-flex items-center mt-2  focus:outline-none focus:border-none"
				on:click={toggleInfo}
				>Descripción
			</button>
			<br />
			{#if showInfo}
				<p class="pt-2" transition:slide={{ duration: 500 }}>
					<input
						class="w-full h-10 border-2 border-opacity-70 border-indigo-500 border-dashed focus:outline-none focus:border-green-500 focus:border-opacity-70 text-center"
						bind:value={objeto.info}
						placeholder={infoGral}
					/>					
				</p>
			{/if} -->
		</div>
		<!-- botonera -->
		<div
			class="flex flex-col w-full md:w-1/2 md:pl-12   md:border-b-0 mb-2 md:mb-0 pb-2  border-gray-200"
		>
			<nav class="flex flex-wrap list-none -mb-1 mt-5">
				<li class="lg:w-1/3 mb-4 w-1/3">
					<button
						on:click={save}
						class=" font-medium text-indigo-700 hover:text-indigo-900 cursor-pointer  focus:outline-none focus:border-none"
						>Guardar</button
					>
				</li>
				<li class="lg:w-1/3 mb-4 w-1/3">
					<!-- <button
						on:click={guardarComo}
						class=" font-medium text-indigo-700 hover:text-indigo-900 cursor-pointer  focus:outline-none focus:border-none"
						>Copiar</button
					> -->
					<button
						on:click={eliminar}
						class="font-medium text-indigo-700 hover:text-indigo-900 cursor-pointer  focus:outline-none focus:border-none"
						>Eliminar</button
					>					
				</li>
				<li class="lg:w-1/3 mb-4 w-1/3">
					<button
						class="rounded-full w-7 h-7 bg-gray-200 p-0 border-0 inline-flex items-center justify-center text-gray-500 ml-4"
						on:click={toggleFavorito}
					>
						<svg
							fill="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							class="rounded-full w-5 h-5 {isFavorito ? 'text-indigo-700' : 'text-gray-500'}"
							viewBox="0 0 24 24"
						>
							<path
								d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
							/>
						</svg>
					</button>					
				</li>
			</nav>
			<nav class="flex flex-wrap list-none -mb-1 mt-5">
				<!-- <li class="lg:w-1/3 mb-4 w-1/3">
					<button
						on:click={handleRefrescarClick}
						class=" font-medium text-indigo-700 hover:text-indigo-900 cursor-pointer  focus:outline-none focus:border-none"
						>Refrescar</button
					>
				</li> -->
				<li class="lg:w-1/3 mb-4 w-1/3">
					<!-- <button
						class="rounded-full w-7 h-7 bg-gray-200 p-0 border-0 inline-flex items-center justify-center text-gray-500 ml-4"
						on:click={toggleFavorito}
					>
						<svg
							fill="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							class="rounded-full w-5 h-5 {isFavorito ? 'text-indigo-700' : 'text-gray-500'}"
							viewBox="0 0 24 24"
						>
							<path
								d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
							/>
						</svg>
					</button> -->
				</li>
				<!-- <li class="lg:w-1/3 mb-4 w-1/3">
					<button
						on:click={handleExportarClick}
						class=" font-medium text-indigo-700 hover:text-indigo-900 cursor-pointer  focus:outline-none focus:border-none"
						>Exportar</button
					>
				</li> -->
			</nav>
		</div>
	</div>
	<!--docs -->
	<div class="mt-2 md:mt-2 container flex flex-wrap px-5 mx-auto">
		<article class="w-full prose max-w-none prose-a:text-indigo-500 prose-a:no-underline prose-pre:text-pink-200">
			<!-- <EjMdsvex/> -->
			<svelte:component this={component} />
		</article>
	</div>
</section>

