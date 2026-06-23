<script>
    import { user, logout } from '../lib/stores/auth.js';
    import { apiFetch } from '../lib/api.js';
    import { onMount } from 'svelte';
    import { navigate, Link } from 'svelte-routing';

    /** @type {any[]} */
    let projects = [];
    let isLoading = true;

    function handleLogout() {
        logout();
        navigate('/');
    }

    onMount(async () => {
        try {
            // Note: will map to Rust API endpoint for projects later
            projects = await apiFetch('/projects');
        } catch (err) {
            console.error("Gagal memuat proyek", err);
        } finally {
            isLoading = false;
        }
    });

    /** @param {string} dateString */
    function formatDate(dateString) {
        if (!dateString) return '';
        const d = new Date(dateString);
        return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
    }
</script>

<svelte:head>
    <title>Studio Baik - Proyek Saya</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</svelte:head>

<div class="topbar">
    <Link to="/studio/hub" class="topbar-brand">
        <i class="fa-solid fa-cube" style="color:#7c3aed;"></i> Studio Baik
    </Link>
    <div class="topbar-user">
        <span><i class="fa-regular fa-user"></i> {$user?.username || 'Guest'}</span>
        <button class="btn-logout" on:click={handleLogout}>Logout</button>
    </div>
</div>

<div class="container">
    <Link to="/studio/hub" class="btn-back"><i class="fa-solid fa-arrow-left"></i> Kembali ke Dashboard</Link>

    <div class="header-section">
        <div>
            <h1>Proyek Saya</h1>
            <p>Daftar semua desain ruangan 3D yang telah Anda buat.</p>
        </div>
        <Link to="/studio/design" class="btn-primary">
            <i class="fa-solid fa-plus"></i> Buat Proyek Baru
        </Link>
    </div>

    {#if isLoading}
        <div class="empty-state" style="border:none">
            <p>Memuat proyek...</p>
        </div>
    {:else if projects.length > 0}
        <div class="projects-grid">
            {#each projects as project}
            <div class="project-card">
                <div class="project-thumb">
                    <i class="fa-solid fa-image"></i>
                </div>
                <div class="project-info">
                    <h3>{project.name}</h3>
                    <p>Terakhir diedit: {formatDate(project.updated_at)}</p>
                </div>
                <div class="project-actions">
                    <a href={`/studio/design?project=${project.id}`} class="btn-action btn-open">Buka Editor</a>
                </div>
            </div>
            {/each}
        </div>
    {:else}
        <div class="empty-state">
            <i class="fa-solid fa-folder-open"></i>
            <h3>Belum ada proyek</h3>
            <p>Anda belum menyimpan desain ruangan apapun.</p>
            <Link to="/studio/design" class="btn-primary">
                Mulai Desain Sekarang
            </Link>
        </div>
    {/if}
</div>

<style>
    :global(body) {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background-color: #121212;
        color: #ffffff;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }
    .topbar {
        background-color: #1e1e1e;
        padding: 16px 32px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #333;
    }
    :global(.topbar-brand) {
        font-size: 20px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 12px;
        color: white;
        text-decoration: none;
    }
    .topbar-user {
        display: flex;
        align-items: center;
        gap: 16px;
    }
    .btn-logout {
        background-color: transparent;
        border: 1px solid #ef4444;
        color: #ef4444;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s;
    }
    .btn-logout:hover {
        background-color: #ef4444;
        color: white;
    }
    .container {
        max-width: 1000px;
        margin: 40px auto;
        padding: 0 20px;
        flex: 1;
        width: 100%;
        box-sizing: border-box;
    }
    .header-section {
        margin-bottom: 30px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
    }
    .header-section h1 {
        font-size: 32px;
        margin: 0 0 8px 0;
    }
    .header-section p {
        color: #a0a0a0;
        margin: 0;
        font-size: 16px;
    }
    :global(.btn-primary) {
        background-color: #7c3aed;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }
    :global(.btn-primary:hover) {
        background-color: #4f46e5;
    }
    :global(.btn-back) {
        display: inline-block;
        margin-bottom: 20px;
        color: #a0a0a0;
        text-decoration: none;
    }
    :global(.btn-back:hover) {
        color: white;
    }
    .projects-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
    }
    .project-card {
        background-color: #1e1e1e;
        border-radius: 12px;
        border: 1px solid #333;
        overflow: hidden;
        transition: transform 0.2s, box-shadow 0.2s;
        display: flex;
        flex-direction: column;
    }
    .project-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 10px 20px rgba(0,0,0,0.3);
        border-color: #444;
    }
    .project-thumb {
        height: 160px;
        background-color: #2a2a35;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #555;
        font-size: 48px;
    }
    .project-info {
        padding: 20px;
        flex: 1;
    }
    .project-info h3 {
        margin: 0 0 8px 0;
        font-size: 18px;
    }
    .project-info p {
        margin: 0;
        color: #888;
        font-size: 14px;
    }
    .project-actions {
        padding: 16px 20px;
        border-top: 1px solid #333;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
    }
    .btn-action {
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        text-decoration: none;
        cursor: pointer;
        border: 1px solid transparent;
    }
    .btn-open {
        background-color: rgba(99, 102, 241, 0.1);
        color: #818cf8;
        border-color: rgba(99, 102, 241, 0.2);
    }
    .btn-open:hover {
        background-color: #7c3aed;
        color: white;
    }
    .empty-state {
        text-align: center;
        padding: 60px 20px;
        background-color: #1e1e1e;
        border-radius: 12px;
        border: 1px dashed #444;
    }
    .empty-state i {
        font-size: 48px;
        color: #444;
        margin-bottom: 16px;
    }
    .empty-state h3 {
        margin: 0 0 8px 0;
        font-size: 20px;
    }
    .empty-state p {
        color: #888;
        margin-bottom: 24px;
    }
</style>
