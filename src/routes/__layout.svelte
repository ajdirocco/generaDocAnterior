<script>
  	import Header from '$lib/Header.svelte'
    import Footer from '$lib/Footer.svelte'
	import '../app.css'
	import Toast from '$lib/Toast.svelte' //notifications.js
</script>

<Header/>
<main>
	<slot />
</main>
<Toast/>
<Footer/>


