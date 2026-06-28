<script>
    import { onMount } from 'svelte';
    import { apiFetch } from '../lib/api.js';
    import { user, logout } from '../lib/stores/auth.js';
    import { navigate } from 'svelte-routing';
    import Layout from '../components/Layout.svelte';

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

<Layout title="Studio - Dashboard">
    <div class="studio-container">
        <div class="header-section">
            <h1>Selamat Datang, {$user?.name || $user?.nama || 'Guest'}</h1>
            <p>Pilih aksi di bawah ini untuk memulai kreativitas Anda di Studio CerdasLiving.</p>
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

            <a href="/studio/design" class="action-card primary-action">
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
</Layout>

<style>
    .studio-container {
        max-width: 1000px;
        margin: 60px auto 120px;
        padding: 0 20px;
        flex: 1;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .header-section {
        margin-bottom: 40px;
        text-align: center;
    }
    .header-section h1 {
        font-size: 32px;
        margin: 0 0 10px 0;
        font-weight: 700;
        color: #1f2937;
    }
    .header-section p {
        color: #6b7280;
        font-size: 16px;
        margin: 0;
    }
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
        margin-bottom: 40px;
    }
    .stat-card {
        background: #1e1e1e;
        border: 1px solid #333;
        border-radius: 12px;
        padding: 24px;
        display: flex;
        align-items: center;
        gap: 20px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        transition: transform 0.2s, border-color 0.2s;
        color: white;
    }
    .stat-card:hover {
        transform: translateY(-2px);
        border-color: #7c3aed;
    }
    .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        background: rgba(124, 58, 237, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        color: #7c3aed;
    }
    .stat-info h3 {
        margin: 0 0 4px 0;
        font-size: 28px;
        font-weight: 700;
        color: #ffffff;
    }
    .stat-info p {
        margin: 0;
        color: #a0a0a0;
        font-size: 14px;
        font-weight: 500;
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
        padding: 32px 24px;
        text-decoration: none;
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .action-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(124, 58, 237, 0.2);
        border-color: #7c3aed;
    }
    .action-card.primary-action {
        background: linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%);
        border: none;
    }
    .action-card.primary-action .action-icon {
        background: rgba(255, 255, 255, 0.2);
        color: #ffffff;
    }
    .action-icon {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: rgba(124, 58, 237, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        color: #7c3aed;
        margin-bottom: 20px;
        transition: transform 0.3s;
    }
    .action-card:hover .action-icon {
        transform: scale(1.1);
    }
    .action-card h2 {
        font-size: 20px;
        margin: 0 0 12px 0;
        font-weight: 700;
        color: #ffffff;
    }
    .action-card p {
        margin: 0;
        color: #a0a0a0;
        font-size: 14px;
        line-height: 1.5;
    }
</style>
