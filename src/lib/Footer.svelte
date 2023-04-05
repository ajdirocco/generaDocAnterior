<script>
    let appNombre = import.meta.env.VITE_APP_NAME_CAPTION
    let appFecha = import.meta.env.VITE_APP_YEAR
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<footer class="container flex flex-wrap px-5  mx-auto mb-4 justify-center">
    <p class=" text-sm text-gray-800">
        ©{appFecha}
        <a  href="/"
            class="font-medium text-indigo-700  hover:text-indigo-900 focus:outline-none focus:border-none"
            rel="noopener noreferrer">
            {appNombre} - 0.1.7
        </a>
    </p>
</footer>
