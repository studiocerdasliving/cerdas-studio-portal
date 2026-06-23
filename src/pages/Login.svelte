<script>
    import { onMount } from "svelte";

    onMount(() => {
        // Alihkan halaman dummy /login ke halaman beranda dan buka popup login
        window.location.href = "/?login=true";
    });
</script>

<div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #121212; color: #fff; font-family: sans-serif;">
    <p>Mengalihkan ke halaman login...</p>
</div>
