<script>
    import { onMount } from 'svelte';
    import { get } from 'svelte/store';
    import { user } from '../../lib/stores/auth.js';
    
    // URL ke React app Studio Design Tactical
    let designUrl = import.meta.env.VITE_STUDIODESIGN_URL;
    if (!designUrl) {
        console.error("VITE_STUDIODESIGN_URL is not set in .env");
    }

    onMount(() => {
        const currentUser = get(user);
        
        if (!currentUser) {
            window.location.href = '/?login=true';
            return;
        }

        // Ambil query parameter jika ada (misal: ?project=1)
        const urlParams = new URLSearchParams(window.location.search);
        
        // Alihkan langsung ke React App
        // Karena sistem sekarang menggunakan HttpOnly cookie, token tidak lagi ditransfer lewat hash URL
        const queryStr = urlParams.toString();
        const finalUrl = `${designUrl}${designUrl.endsWith('/') ? '' : '/'}${queryStr ? '?' + queryStr : ''}`;
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
