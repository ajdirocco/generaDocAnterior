<script>
//imports
	import { onMount, onDestroy, tick } from 'svelte'
	import { fade, slide } from 'svelte/transition'
	import { goto } from '$app/navigation'

	import InPlaceEdit from '$lib/InPlaceEdit.svelte'
	import { marked } from 'marked'

	import notifications from '../../stores/notifications.js' //Toast.svelte
	import ObjetosStore from '../../stores/FormsStore.js'
	import ObjetoStore from '../../stores/FormStore'
	//imports - end

//variables
	const gistToken = import.meta.env.VITE_APP_GIST_TOKEN
	const gistBaseUrl = 'https://api.github.com/gists/'
	let isEdicion = false
	let showInfo = false
	let showSnippets = false
	let infoGral = 'Genera un texto usando Markdown y tags especiales'
	let promiseExportar
	let isFavorito = false
	let canShare = false
	try {
		if (navigator.canShare) {
			canShare = true;
		}
	} catch (error) {
		console.log('generaForm - navegator - error (server)')
	}
	//variables -end

//InPlaceEdit
	function submit(field) {
		return ({ detail: { newValue, oldValue } }) => {
			// IRL: POST value to server here

			switch (field) {
				case 'objeto.subtitulo':
					if (!newValue) {
						objeto.subtitulo = 'Subtitulo';
					} else if (newValue.trim() === '') {
						objeto.subtitulo = 'Subtitulo';
					} else {
						objeto.subtitulo = objeto.subtitulo.substring(0, 39);
					}
					break;
				case 'objeto.titulo':
					if (!newValue) {
						objeto.titulo = 'Titulo';
					} else if (newValue.trim() === '') {
						objeto.titulo = 'Titulo';
					} else {
						objeto.titulo = objeto.titulo.substring(0, 39);
					}
					break;
				case 'objeto.info':
					objeto.info = objeto.info.substring(0, 60);
					break;
			}
		};
	}
	//InPlaceEdit - end

//objeto nuevo
	export const newObjeto = (newObjeto, isGuardarComo = false) => {
		try {
			let titulo = ''
			let subtitulo = ''
			let info = '' //infoGral
			let source = `---
	
<center><h1 style="margin-top:10px;margin-bottom:0px;">Forms</h1></center>
<center><h2 style="margin-top:10px;margin-bottom:0px;">Markdown + Forms dinámicos</h2></center>
<center><p style="margin-top:10px;margin-bottom:0px;">Escriba Markdown con algunos tags especiales.</p></center>

---

### Markdown
Genere el texto utilizando Markdown y HTML.
*Nota: Puede que no todos los elementos de la sintaxis extendida de Markdown funcionan en este previsualizador.*

<a href="https://www.markdownguide.org/cheat-sheet/" target="_blank">Guía Markdown</a>

<a href="https://developer.mozilla.org/es/docs/Web/HTML/Element" target="_blank">Guía HTML</a>

### Doc
Guía de snippets, data-* attribute y classes para marcar el HTML y generar forms dinámicos con persistencia.

<a href="https://generaformdoc.netlify.app/ " target="_blank">Documentación</a>

---`
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

			//? no hay codigo
			// if (newObjeto != null && isGuardarComo) {
			// } else {
			// }

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

//snippets
	//resumen
		/*
			Inputbox			s.inputbox[Hola mundo:]						/(.select\[)(.*[^]?)(?=\s*\])/g
			Textarea			s.textarea[Hola mundo:]						/(.textarea\[)(.*[^]?)(?=\s*\])/g
			Select				s.select[Hola:,,Mundo,Como va]				/(.select\[)(.*[^]?)(?=\s*\])/g
			Checkbox			s.checkbox[Hola,Mundo]						/(.checkbox\[)(.*[^]?)(?=\s*\])/g
			Radiobox			s.radiobox[radiobox,Hola,Mundo]				/(.radiobox\[)(.*[^]?)(?=\s*\])/g
			Link				s.a[https://google.com Google]				/(.a\[http)(.*[^]?)(?=\s*\])/g
			Linkblank			s.a.b[https://google.com Google (new tab)]	/(.a.b\[http)(.*[^]?)(?=\s*\])/g
			Section				s.section[hola-mundo,Hola mundo]			/(.section\[)(.*[^]?)(?=\s*\])/g
			Table (Markdown)	s.table.m
			Table (HTML)		s.table.h
			Center				s.center[h1, Hola mundo] (h1...h6 - p)		/(.center\[)(.*[^]?)(?=\s*\])/g
			Comment				s.comment
			Form				s.form										nota: es .form mas un espacio para que no vuelva a detectar el selector en document.form...
			Button				s.button
			Date				s.date
			Time				s.time
			Color				s.color
		*/

	async function handleKeyup(event) {
		//console.log('handleKeyup')
		let { selectionStart, selectionEnd, value } = this;
		let selection = '';
		let replacement = '';
		let encontrado = false;


		//---------------------------
		//inputbox - s.inputbox[Ingrese un texto:]
		//https://tailwind-to-css.vercel.app/ - class="border-2 border-opacity-70 border-gray-800 rounded"
		//---------------------------
		const ruleInputBox = /(s.inputbox\[)(.*[^]?)(?=\s*\])/g
		const matchInputBox = ruleInputBox.exec(objeto.source)
		if (matchInputBox) {
			//console.log('matchInputBox:', matchInputBox)
			let index = matchInputBox[0].indexOf("[") + 1
			let str = '<label for="inputbox">' + matchInputBox[0].substring(index) + '&nbsp;</label><input type="text" id="inputbox" name="inputbox" style="border-radius:0.25rem;border-width:1px;border-color:black"><br>'
			selection = matchInputBox[0] + ']'
			replacement = str
			encontrado = true
		}


		//---------------------------
		//textarea - s.textarea[Ingrese un texto:]
		//---------------------------
		const ruleTextArea = /(s.textarea\[)(.*[^]?)(?=\s*\])/g
		const matchTextArea = ruleTextArea.exec(objeto.source)
		if (matchTextArea) {
			//console.log('matchTextArea:', matchTextArea)
			let index = matchTextArea[0].indexOf("[") + 1
			let str = '<label for="textarea">' + matchTextArea[0].substring(index) + '&nbsp;</label><textarea id="textarea" name="textarea" style="resize:both;border-radius:0.25rem;border-width:1px;border-color:black" style="resize: both;"></textarea><br>'
			selection = matchTextArea[0] + ']'
			replacement = str
			encontrado = true
		}


		//---------------------------
		//select - s.select[hola,,mundo,como,va] (no funciona con espacio inicial: s.select [hola,,mundo,como,va] )
		//https://tailwind-to-css.vercel.app/ - class="border-2 border-opacity-70 border-gray-800 rounded"
		//'<p><select style="border-radius:0.25rem;border-width:2px;border-color:#1F2937;border-opacity: 0.7;">\n'
		//---------------------------
		const ruleSelect = /(s.select\[)(.*[^]?)(?=\s*\])/g
		const matchSelect = ruleSelect.exec(objeto.source)
		if (matchSelect) {
			//console.log('tMatchSelect:', matchSelect)
			let str =
				'<p><label for="select">' + matchSelect[2].split(',')[0] + '</label>\n<select style="border-radius:0.25rem;border-width:1px;border-color:black">\n'
			matchSelect[2]
				.split(',')
				.forEach((elem, i) => {
					if ( i > 0 ) {
						str = str + '<option value="' + elem + '">' + elem + '</option>\n'
					}
				});
			str = str + '</select></p>\n'
			//console.log('str:', str)
			selection = matchSelect[0] + ']'
			replacement = str
			encontrado = true
		}


		//---------------------------
		//checkbox - s.checkbox[a,b,c]
		//https://tailwind-to-css.vercel.app/
		//	label class="flex items-center"
		//	span class="ml-2"
		//---------------------------
		const tRuleCheckBox = /(s.checkbox\[)(.*[^]?)(?=\s*\])/g
		const tMatchCheckBox = tRuleCheckBox.exec(objeto.source)
		if (tMatchCheckBox) {
			//console.log('tMatchCheckBox:', tMatchCheckBox)
			let str = ''
			tMatchCheckBox[0]
				.replace('s.checkbox[', '')
				.trim()
				.split(',')
				.forEach((elem) => {
					str = str + '<label style="display:flex;align-items:center;"> <input type="checkbox"><span style="margin-left:0.5rem;">' + elem + '</span> </label>';
				});
			selection = tMatchCheckBox[0] + ']';
			replacement = str;
			encontrado = true;
		}


		//---------------------------
		//radiobox - s.radiobox[nombre,a,b,c]
		//https://tailwind-to-css.vercel.app/
		//	label class="flex items-center"
		//	span class="ml-2"
		//---------------------------
		const tRuleRadioBox = /(s.radiobox\[)(.*[^]?)(?=\s*\])/g
		const tMatchRadioBox = tRuleRadioBox.exec(objeto.source)
		if (tMatchRadioBox) {
			//console.log('tMatchRadioBox:', tMatchRadioBox)
			let str = ''
			tMatchRadioBox[0]
				.replace('s.radiobox[', '')
				.trim()
				.split(',')
				.forEach((elem, i) => {
					if ( i > 0 ) {
						str = str + '<label style="display:flex;align-items:center;"> <input type="radio" name="' + tMatchRadioBox[0].replace('.radiobox[', '').trim().split(',')[0] + '"> <span style="margin-left:0.5rem;">' + elem + '</span> </label>';
					}
				});
			selection = tMatchRadioBox[0] + ']';
			replacement = str;
			encontrado = true;
		}


		//---------------------------
		//link - s.a[https://google.com Google]
		//---------------------------
		const ruleLink = /(s.a\[http)(.*[^]?)(?=\s*\])/g
		const matchLink = ruleLink.exec(objeto.source)
		if (matchLink) {
			//console.log('matchLink:', matchLink)
			let index = matchLink[0].indexOf(" ") + 1
			let str = '<a href="' + matchLink[0].substring(3, index) + '">' + matchLink[0].substring(index) + '</a>\n'
			selection = matchLink[0] + ']'
			replacement = str
			encontrado = true
		}


		//---------------------------
		//linkBlank - s.a.b[https://google.com Google (new Tab)]
		//---------------------------
		const ruleLinkBlank = /(s.a.b\[http)(.*[^]?)(?=\s*\])/g
		const matchLinkBlank = ruleLinkBlank.exec(objeto.source)
		if (matchLinkBlank) {
			//console.log('matchLinkBlank:', matchLinkBlank)
			let index = matchLinkBlank[0].indexOf(" ") + 1
			let str = '<a href="' + matchLinkBlank[0].substring(5, index) + '" target="_blank">' + matchLinkBlank[0].substring(index) + '</a>\n'
			selection = matchLinkBlank[0] + ']'
			replacement = str
			encontrado = true
		}


		//---------------------------
		//section - s.section[section_name,sectionLabel]
		//---------------------------
		const tRuleSection = /(s.section\[)(.*[^]?)(?=\s*\])/g
		const tMatchSection = tRuleSection.exec(objeto.source)
		if (tMatchSection) {
			//console.log('tMatchSection:', tMatchSection)
			let str = ''
			str = str + '### <a name="' + tMatchSection[0].replace('.section[', '').trim().split(',')[0] + '"></a>' + tMatchSection[0].replace('.section[', '').trim().split(',')[1] + '\n ...y volvemos a ['
				+ tMatchSection[0].replace('.section[', '').trim().split(',')[1] + '](#' + tMatchSection[0].replace('.section[', '').trim().split(',')[0] + '), desde cualquier lugar.'
			selection = tMatchSection[0] + ']'
			replacement = str
			encontrado = true
		}


		//---------------------------
		//table markdown - s.table.m
		//---------------------------
		if (objeto.source.includes('s.table.m') === true) {
			selection = 's.table.m'
			replacement = `| Columna 1 | Columna 2 |
| ----------- | ----------- |
| hola | mundo |
| como | va |`
			encontrado = true
		}

		//---------------------------
		//table html - s.table.h
		//---------------------------
		if (objeto.source.includes('s.table.h') === true) {
			selection = 's.table.h'
			replacement = `<table>
  <tr>
    <th>Columna 1</th>
    <th>Columna 2</th>
    <th>Columna 3</th>
  </tr>
  <tr>
    <td>hola</td>
    <td>mundo</td>
    <td>como va</td>
  </tr>
  <tr>
    <td>todo</td>
    <td>muy</td>
    <td>bien</td>
  </tr>
</table>`
			encontrado = true
		}


		//---------------------------
		//center - s.center - s.center[h1, Hola mundo] (h1...h6 - p)
		//---------------------------
		const ruleCenter = /(s.center\[)(.*[^]?)(?=\s*\])/g
		const matchCenter = ruleCenter.exec(objeto.source)
		if (matchCenter) {
			//console.log('matchCenter:', matchCenter)
			let str = '<center><' + matchCenter[2].split(',')[0] + ' style="margin-top:10px;margin-bottom:0px;">' + matchCenter[2].split(',')[1] + '</' + matchCenter[2].split(',')[0] + '></center>'
			selection = matchCenter[0] + ']'
			replacement = str
			encontrado = true
		}


		//---------------------------
		//comment - s.comment
		//---------------------------
		if (objeto.source.includes("s.comment") === true) {
			selection = 's.comment'
			replacement = `[//]: # (comment)\n`
			encontrado = true
		}


		//---------------------------
		//form - s.form
		//---------------------------
		if (objeto.source.includes("s.form ") === true) {
			selection = 's.form'
			replacement = `<form>
<fieldset>
<button type="button"
style="border-radius:0.25rem;border-width:1px;border-color:black;padding-left:5px;padding-right:5px;"
onclick="let data = new FormData(document.forms[0]);console.log(Object.fromEntries(data.entries()));">Datos</button>
</fieldset>
</form>
`
			encontrado = true
		}


		//---------------------------
		//button - s.button
		//---------------------------
		if (objeto.source.includes("s.button") === true) {
			selection = 's.button'
			replacement = `<button type="button" style="border-radius:0.25rem;border-width:1px;border-color:black;padding-left:5px;padding-right:5px;" onclick="console.log('Hola mundo');">Button</button>`
			encontrado = true
		}


		//---------------------------
		//date - s.date
		//---------------------------
		if (objeto.source.includes("s.date") === true) {
			selection = 's.date'
			replacement = `<input type="date" style="border-radius:0.25rem;border-width:1px;border-color:black;">`
			encontrado = true
		}

		//---------------------------
		//time - s.time
		//---------------------------
		if (objeto.source.includes("s.time") === true) {
			selection = 's.time'
			replacement = `<input type="time" style="border-radius:0.25rem;border-width:1px;border-color:black;">`
			encontrado = true
		}


		//---------------------------
		//color - s.color
		//---------------------------
		if (objeto.source.includes("s.color") === true) {
			selection = 's.color'
			replacement = `<input type="color" value="#ff0000" style="border-radius:0.25rem;border-width:1px;border-color:black;">`
			encontrado = true
		}

		objeto.source = value.replace(selection, replacement)

		await tick()
		if (encontrado) {
			this.selectionStart = selectionStart + (replacement.length - selection.length)
			this.selectionEnd = this.selectionStart
		} else {
			this.selectionStart = selectionStart
			this.selectionEnd = selectionEnd
		}
	}
	//snippets end

//botonera
	function toggleSnippets() {
		showSnippets = !showSnippets
	}

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

		//Set Titulo
		// if (objeto.titulo.trim() == '') {
		// 	objeto.titulo = 'Form ' + parseInt($ObjetosStore.length);
		// }

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

	async function exportar() {
		const res = await fetch('https://jsonblob.com/api/jsonBlob', {
			method: 'POST',
			body: JSON.stringify(objeto),
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json'
			}
		});
		const json = await res.json();

		if (res.ok) {
			const location = await res.headers.get('Location');
			let str = location;
			let indice = str.indexOf('jsonBlob/');
			str = str.substring(indice + 9);

			if (canShare) {
				navigator.share({
					title: '📄 Genera Form',
					url: `https://generaform.netlify.app`,
					text: `📄 Genera Form - Importar form:\n ${json.titulo}\n Codigo:\n${str}`
				});
			} else {
				notifications.info('Su navegador no permite compartir', 2500);
			}
			return str;
		} else {
			throw new Error(json);
		}
	}

	function handleExportarClick() {
		promiseExportar = exportar();
	}

	function handleRefrescarClick() {
		//TODO
	}

	function copyClipboard(str, msg){
		navigator.clipboard.writeText(str)
		.then(() => {
			notifications.success(msg, 2500);
		})
		.catch(() => {
			console.log('generaform - copyClipboard - error')
		});
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
	function changeName(input, nextIndex){
		let id = ''
		let name = ''
		//id
		if (input.id) {
			id = input.id
		} else {
			id = input.type
		}
		//name
		if (input.name) {
			name = input.name
		} else {
			name = input.type
		}
		//set id and name
		input.setAttribute('id', id + nextIndex)
		input.setAttribute('name', name + nextIndex)	
	}

	function insertAfter(e,i){
		if(e.nextSibling){
			e.parentNode.insertBefore(i,e.nextSibling)
		} else {
			e.parentNode.appendChild(i)
		}
	}

	function handleClick(event) {
		//console.log("event - handleClick:", event.target.nodeName, event.target.getAttribute('name'), event.target.value, event.target, event)
		//console.log("event - handleClick - event.target.classList:", event.target.classList)
		
		if (event.target.classList.contains('gxTrigger')) {
			const crudType = event.target.getAttribute("data-gx-type")
			const crudTarget = event.target.getAttribute("data-gx-target")
			const cloneType = event.target.getAttribute("data-gx-insert")

			//index to apply in id and name
			let lastIndex = event.target.getAttribute("data-gx-last-index")
			let nextIndex = 0
			if(!lastIndex){
				lastIndex = 0
			} 
			nextIndex = parseInt(lastIndex) + 1
			event.target.setAttribute("data-gx-last-index", nextIndex)
			//index to apply in id and name - end

			const node = document.getElementById(crudTarget)
	
			if (crudType == "clone" || crudType == "clone-clean") {
				const clone = node.cloneNode(true)
	
				//set inputs id, name
				let inputs = clone.querySelectorAll('input')
				inputs.forEach((input) => {
					if (input.type == 'radio') {
						const parent = input.parentElement.nodeName
						if (parent.classList.contains('gxChangeName')) {
							changeName(input, nextIndex)
						}
					} else {
						changeName(input, nextIndex)
					}
				})
				//set inputs id, name  - end

				//set (clean) input value
				if (crudType == "clone-clean") {
					try {
						clone.querySelector('input').value =''
					} catch (error) {
					}
				}
				//set (clean) input value - end

				//insert clone
				if (cloneType == "before") {
					node.insertBefore(clone)
				} else if (cloneType == "after") {
					insertAfter(node,clone)
				}else {
					node.appendChild(clone)
				}
				//insert clone - end

			} else if (crudType == "remove") {
				let parent = node.parentElement
				parent.removeChild(node)
			}		
		}
		
	}//CRUD (DOM) - core - end	
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

<svelte:head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="stylesheet" href="form.css">
	<script src="https://cdn.tailwindcss.com"></script>
	<!-- <script defer src="https://unpkg.com/@alpinejs/persist@3.x.x/dist/cdn.min.js"></script> -->
	<script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
</svelte:head>

<section class="mt-2 md:mb-7 text-gray-600 body-font" transition:fade>
	<!-- titulo y botonera -->
	<div class="container flex flex-wrap px-5 mx-auto">
		<!-- titulo -->
		<div
			class="w-full md:w-1/2 md:pr-12 md:pt-0 md:border-r-2 md:border-b-0 mb-0 md:mb-0 pb-0  border-gray-200"
		>
			<div class="mb-3 leading-relaxed text-xl font-bold text-center">
				<input
					class="w-full h-10 border-2 border-opacity-70 border-indigo-500 border-dashed focus:outline-none focus:border-green-500 focus:border-opacity-70 text-center"
					bind:value={objeto.subtitulo}
					placeholder="Subtitulo"
				/>				
			</div>
			<div class="sm:text-3xl text-2xl font-medium text-center">
				<!-- <InPlaceEdit
					bind:value={objeto.titulo}
					placeholderText="Titulo"
					textCenter="text-center"
					on:submit={submit('objeto.titulo')}
				/> -->
				<input
					class="w-full h-10 border-2 border-opacity-70 border-indigo-500 border-dashed focus:outline-none focus:border-green-500 focus:border-opacity-70 text-center"
					bind:value={objeto.titulo}
					placeholder="Titulo"
				/>				
			</div>
			<br />
			<button
				class="font-medium text-indigo-700 hover:text-indigo-900 cursor-pointer  inline-flex items-center mt-2  focus:outline-none focus:border-none"
				on:click={toggleInfo}
				>Info
			</button>
			<br />
			{#if showInfo}
				<p class="pt-2" transition:slide={{ duration: 500 }}>
					<InPlaceEdit
						type="textarea"
						bind:value={objeto.info}
						placeholderText={infoGral}
						on:submit={submit('objeto.info')}
					/>
				</p>
			{/if}
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
					<button
						on:click={guardarComo}
						class=" font-medium text-indigo-700 hover:text-indigo-900 cursor-pointer  focus:outline-none focus:border-none"
						>Copiar</button
					>
				</li>
				<li class="lg:w-1/3 mb-4 w-1/3">
					<button
						on:click={eliminar}
						class="font-medium text-indigo-700 hover:text-indigo-900 cursor-pointer  focus:outline-none focus:border-none"
						>Eliminar</button
					>
				</li>
			</nav>
			<nav class="flex flex-wrap list-none -mb-1 mt-5">
				<li class="lg:w-1/3 mb-4 w-1/3">
					<button
						on:click={handleRefrescarClick}
						class=" font-medium text-indigo-700 hover:text-indigo-900 cursor-pointer  focus:outline-none focus:border-none"
						>Refrescar</button
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
				<li class="lg:w-1/3 mb-4 w-1/3">
					<button
						on:click={handleExportarClick}
						class=" font-medium text-indigo-700 hover:text-indigo-900 cursor-pointer  focus:outline-none focus:border-none"
						>Exportar</button
					>
				</li>
			</nav>
			{#if promiseExportar != null}
				{#await promiseExportar}
					<p>...exportando</p>
				{:then codigo}
					<p class="mt-4 mb-2 text-gray-800">Código de exportación:</p>
					<p class="text-gray-800">{codigo}</p>
				{:catch error}
					<p style="color: red">{error.message}</p>
				{/await}
			{/if}
		</div>
	</div>
	<!-- editor menu -->
	<button
		class=" font-medium text-indigo-700 hover:text-indigo-900 cursor-pointer  focus:outline-none focus:border-none mt-2 container flex flex-wrap px-5 mx-auto"
		on:click={toggleSnippets}
		>Snippets</button>
	{#if showSnippets}
		<nav aria-label="Breadcrumb" class="container flex flex-wrap px-5 py-2 mx-auto" transition:slide={{ duration: 500 }}>
			<ol class="flex items-center space-x-2 text-sm text-gray-500">
				<li>
					<button class="block transition-colors hover:text-gray-700"
					on:click={ () => {copyClipboard('s.inputbox[Ingrese un texto:]','Inputbox copiado')} }>Inputbox</button>
				</li>
				<li>
					<span class="block transition-colors hover:text-gray-700">|</span>
				</li>
				<li>
					<button class="block transition-colors hover:text-gray-700"
					on:click={ () => {copyClipboard('s.textarea[Hola mundo:]','Textarea copiado')} }>Textarea</button>
				</li>
				<li>
					<span class="block transition-colors hover:text-gray-700">|</span>
				</li>
				<li>
					<button class="block transition-colors hover:text-gray-700"
					on:click={ () => {copyClipboard('s.select[Hola:,,Mundo,Como va]','Select copiado')} }>Select</button>
				</li>
				<li>
					<span class="block transition-colors hover:text-gray-700">|</span>
				</li>
				<li>
					<button class="block transition-colors hover:text-gray-700"
					on:click={ () => {copyClipboard('s.checkbox[Hola,Mundo]','Checkbox copiado')} }>Checkbox</button>
				</li>
				<li>
					<span class="block transition-colors hover:text-gray-700">|</span>
				</li>
				<li>
					<button class="block transition-colors hover:text-gray-700"
					on:click={ () => {copyClipboard('s.radiobox[radiobox,Hola,Mundo]','Radiobox copiado')} }>Radiobox</button>
				</li>
			</ol>
		</nav>
		<nav aria-label="Breadcrumb" class="container flex flex-wrap px-5 py-2 mx-auto" transition:slide={{ duration: 500 }}>
			<ol class="flex items-center space-x-2 text-sm text-gray-500">
				<li>
					<button class="block transition-colors hover:text-gray-700"
					on:click={ () => {copyClipboard('s.section[hola-mundo,Hola mundo]','Section copiado')} }>Section</button>
				</li>
				<li>
					<span class="block transition-colors hover:text-gray-700">|</span>
				</li>
				<li>
					<button class="block transition-colors hover:text-gray-700"
					on:click={ () => {copyClipboard('s.a[https://google.com Google]','Link copiado')} }>Link</button>
				</li>
				<li>
					<span class="block transition-colors hover:text-gray-700">|</span>
				</li>
				<li>
					<button class="block transition-colors hover:text-gray-700"
					on:click={ () => {copyClipboard('s.a.b[https://google.com Google (new tab)]','Linkblank copiado')} }>Linkblank</button>
				</li>
				<li>
					<span class="block transition-colors hover:text-gray-700">|</span>
				</li>
				<li>
					<button class="block transition-colors hover:text-gray-700"
					on:click={ () => {copyClipboard('s.table.m','Table copiado')} }>Table </button>
				</li>
				<li>
					<span class="block transition-colors hover:text-gray-700">|</span>
				</li>
				<li>
					<button class="block transition-colors hover:text-gray-700"
					on:click={ () => {copyClipboard('s.table.h','Table HTML copiado')} }>Table HTML </button>
				</li>
			</ol>
		</nav>
		<nav aria-label="Breadcrumb" class="container flex flex-wrap px-5 py-2 mx-auto" transition:slide={{ duration: 500 }}>
			<ol class="flex items-center space-x-2 text-sm text-gray-500">
				<li>
					<button class="block transition-colors hover:text-gray-700"
					on:click={ () => {copyClipboard('s.date','Date copiado')} }>Date </button>
				</li>
				<li>
					<span class="block transition-colors hover:text-gray-700">|</span>
				</li>
				<li>
					<button class="block transition-colors hover:text-gray-700"
					on:click={ () => {copyClipboard('s.color','Color copiado')} }>Color </button>
				</li>
				<li>
					<span class="block transition-colors hover:text-gray-700">|</span>
				</li>
				<li>
					<button class="block transition-colors hover:text-gray-700"
					on:click={ () => {copyClipboard('s.center[h1, Hola mundo]','Center copiado')} }>Center </button>
				</li>
				<li>
					<span class="block transition-colors hover:text-gray-700">|</span>
				</li>
				<li>
					<button class="block transition-colors hover:text-gray-700"
					on:click={ () => {copyClipboard('s.comment','Comment copiado')} }>Comment </button>
				</li>
				<li>
					<span class="block transition-colors hover:text-gray-700">|</span>
				</li>
				<li>
					<button class="block transition-colors hover:text-gray-700"
					on:click={ () => {copyClipboard('s.button','Button copiado')} }>Button </button>
				</li>
				<li>
					<span class="block transition-colors hover:text-gray-700">|</span>
				</li>
				<li>
					<button class="block transition-colors hover:text-gray-700"
					on:click={ () => {copyClipboard('s.form','Form copiado')} }>Form </button>
				</li>
			</ol>
		</nav>
	{/if}
	<div class="items-center gap-4 mt-4 md:mt-2 container flex flex-wrap px-5 mx-auto mb-0">
		<button
		on:click={ () => {copyClipboard(objeto.source,'Texto copiado')} }
		class=" font-medium text-indigo-700 hover:text-indigo-900 cursor-pointer  focus:outline-none focus:border-none"
		>Copiar</button>
	</div>
	<!-- code editor - visualizador -->
	<div class="mt-2 md:mt-2 container flex flex-wrap px-5 mx-auto">
		<div class="w-full md:w-1/2 md:pr-12 md:pt-0 md:border-r-2 md:border-b-0 mb-0 md:mb-0 pb-0 border-gray-200">
			<textarea
				class="w-full h-full border-2 border-opacity-70 border-indigo-500 border-dashed focus:outline-none focus:border-green-500 focus:border-opacity-70 font text-sm font-mono"
				rows="15"
				bind:value={objeto.source}
				on:keyup={handleKeyup}
				placeholder="Ingrese el texto (Markdown + .Tags)"
			/>
		</div>
		<!-- svelte-ignore a11y-mouse-events-have-key-events -->
		<div
			on:click={handleClick}
			class="flex flex-col w-full md:w-1/2 md:pl-12 md:border-b-0 mb-2 md:mb-0 pb-0 border-gray-200"
		>
			<article class="w-full prose max-w-none prose-a:text-indigo-500 prose-a:no-underline prose-pre:text-pink-200">
				{@html marked.parse(objeto.source)}
			</article>
		</div>
	</div>
</section>

<style>
.disabledbutton {
	pointer-events: none;
	opacity: 0.4;
}
</style>
