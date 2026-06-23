<script>
    import { onMount } from "svelte";

    onMount(() => {
        // Alihkan halaman dummy /register ke halaman beranda dan buka popup pendaftaran
        window.location.href = "/?register=true";
    });
</script>

<div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #121212; color: #fff; font-family: sans-serif;">
    <p>Mengalihkan ke halaman pendaftaran...</p>
</div>
