<script>
    import { onMount } from 'svelte';
    import { apiFetch } from '../lib/api.js';
    import { user, logout } from '../lib/stores/auth.js';
    import { navigate } from 'svelte-routing';

    function handleLogout() {
        logout();
        navigate('/');
    }

    let projectCount = 0;
    let objectCount = 0;

    onMount(async () => {
        try {
            const [projects, elements] = await Promise.all([
                apiFetch('/projects'),
                apiFetch('/elements')
            ]);
            
            projectCount = Array.isArray(projects) ? projects.length : 0;
            // Endpoint /elements returns an array of objects
            objectCount = Array.isArray(elements) ? elements.length : 0;
        } catch (err) {
            console.error('Gagal mengambil statistik:', err);
        }
    });
</script>

<svelte:head>
    <title>Studio Baik - Dashboard</title>
    <!-- Using CDN for fonts/icons since local vendor files might not exist in Svelte project yet -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</svelte:head>

<div class="topbar">
    <div class="topbar-brand">
        <i class="fa-solid fa-cube" style="color:#7c3aed;"></i> Studio Baik
    </div>
    <div class="topbar-user">
        <a href="/studio/profil" style="color:white; text-decoration:none; display:flex; align-items:center; gap:8px;">
            <i class="fa-regular fa-user"></i> {$user?.name || 'Guest'}
        </a>
        <button class="btn-logout" on:click={handleLogout}>Logout</button>
    </div>
</div>

<div class="container">
    <!-- Placeholder for success flash message -->
    <!-- 
    <div class="alert">
        <i class="fa-solid fa-check-circle"></i> Berhasil login!
    </div> 
    -->

    <div class="header-section">
        <h1>Selamat Datang, {$user?.name || 'Guest'}</h1>
        <p>Pilih aksi di bawah ini untuk memulai kreativitas Anda di Studio.</p>
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-icon"><i class="fa-solid fa-folder-open"></i></div>
            <div class="stat-info">
                <h3>{projectCount}</h3>
                <p>Total Proyek Disimpan</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon"><i class="fa-solid fa-cubes"></i></div>
            <div class="stat-info">
                <h3>{objectCount}</h3>
                <p>Objek 3D Kustom</p>
            </div>
        </div>
    </div>

    <div class="action-grid">
        <a href="/studio/proyek" class="action-card">
            <div class="action-icon"><i class="fa-solid fa-folder-open"></i></div>
            <h2>Proyek Saya</h2>
            <p>Lihat dan kelola daftar semua desain ruangan 3D yang telah Anda buat dan simpan.</p>
        </a>

        <a href="/studio/design" class="action-card">
            <div class="action-icon"><i class="fa-solid fa-gamepad"></i></div>
            <h2>Masuk ke Studio</h2>
            <p>Buka 3D Editor untuk mulai mendesain tata letak ruangan, menambahkan furnitur, dan merender mahakarya Anda.</p>
        </a>

        <a href="/studio/upload" class="action-card">
            <div class="action-icon"><i class="fa-solid fa-cloud-arrow-up"></i></div>
            <h2>Upload Object 3D</h2>
            <p>Unggah file model 3D kustom Anda (.obj / .glb) beserta material PBR-nya untuk digunakan di dalam Studio.</p>
        </a>
    </div>
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
    .topbar-brand {
        font-size: 20px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 12px;
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
    }
    .header-section {
        margin-bottom: 40px;
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
    
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 40px;
    }
    .stat-card {
        background-color: #1e1e1e;
        padding: 24px;
        border-radius: 12px;
        border: 1px solid #333;
        display: flex;
        align-items: center;
        gap: 20px;
    }
    .stat-icon {
        font-size: 32px;
        color: #7c3aed;
    }
    .stat-info h3 {
        margin: 0;
        font-size: 24px;
    }
    .stat-info p {
        margin: 4px 0 0 0;
        color: #888;
        font-size: 14px;
    }

    .action-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 24px;
    }
    .action-card {
        background: linear-gradient(145deg, #2a2a35, #1e1e24);
        border: 1px solid #444;
        border-radius: 16px;
        padding: 32px;
        text-align: center;
        cursor: pointer;
        transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
        text-decoration: none;
        color: white;
        display: block;
    }
    .action-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(99, 102, 241, 0.2);
        border-color: #7c3aed;
    }
    .action-icon {
        font-size: 48px;
        margin-bottom: 20px;
        color: #7c3aed;
    }
    .action-card h2 {
        margin: 0 0 12px 0;
        font-size: 20px;
    }
    .action-card p {
        color: #a0a0a0;
        font-size: 14px;
        line-height: 1.5;
        margin: 0;
    }
    

</style>
