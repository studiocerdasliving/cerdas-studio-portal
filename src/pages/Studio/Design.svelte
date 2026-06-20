<script>
    import { onMount } from 'svelte';
    import { get } from 'svelte/store';
    import { token } from '../../lib/stores/auth.js';
    import { navigate } from 'svelte-routing';
    
    // URL ke React app Studio Design Tactical
    let designUrl = import.meta.env.VITE_STUDIODESIGN_URL;
    if (!designUrl) {
        console.error("VITE_STUDIODESIGN_URL is not set in .env");
    }

    onMount(() => {
        const currentToken = get(token);
        
        if (!currentToken) {
            navigate('/studio/login');
            return;
        }

        // Ambil query parameter jika ada (misal: ?project=1)
        const urlParams = new URLSearchParams(window.location.search);
        
        // Alihkan langsung ke React App, gunakan fragment untuk token agar tidak terekam di server logs/referrers
        const queryStr = urlParams.toString();
        const finalUrl = `${designUrl}${designUrl.endsWith('/') ? '' : '/'}${queryStr ? '?' + queryStr : ''}#token=${currentToken}`;
        window.location.href = finalUrl;
    });
</script>

<svelte:head>
    <title>Membuka Studio Design...</title>
</svelte:head>

<div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; background-color:#121212; color:#ffffff; font-family: 'Inter', sans-serif;">
    <i class="fa-solid fa-spinner fa-spin" style="font-size: 48px; color: #7c3aed; margin-bottom: 24px;"></i>
    <h2>Membuka Editor 3D...</h2>
    <p style="color: #a0a0a0;">Anda sedang dialihkan ke Cerdas Studio Design.</p>
</div>
