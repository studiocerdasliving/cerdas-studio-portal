<script>
    import { user, logout } from '../lib/stores/auth.js';
    import { apiFetch } from '../lib/api.js';
    import { navigate, Link } from 'svelte-routing';

    let newPassword = '';
    let successMsg = '';
    let errorMsg = '';
    let isSaving = false;

    function handleLogout() {
        logout();
        navigate('/');
    }

    async function handleUpdatePassword() {
        if (!newPassword || newPassword.length < 6) {
            errorMsg = "Password minimal 6 karakter";
            return;
        }
        
        isSaving = true;
        successMsg = '';
        errorMsg = '';
        
        try {
            await apiFetch('/profil', {
                method: 'POST',
                body: JSON.stringify({ password: newPassword })
            });
            successMsg = "Password berhasil diubah!";
            newPassword = '';
        } catch(err) {
            errorMsg = (err instanceof Error ? err.message : String(err)) || "Gagal mengubah password";
        } finally {
            isSaving = false;
        }
    }
</script>

<svelte:head>
    <title>Studio Baik - Profil</title>
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

    {#if successMsg}
        <div class="alert">
            <i class="fa-solid fa-check-circle"></i> {successMsg}
        </div>
    {/if}
    
    {#if errorMsg}
        <div class="alert alert-error">
            <i class="fa-solid fa-exclamation-circle"></i> {errorMsg}
        </div>
    {/if}

    <div class="header-section">
        <h1>Profil Akun</h1>
        <p>Kelola informasi akun Studio Anda.</p>
    </div>

    <div class="card">
        <div class="form-group">
            <label for="username">Username</label>
            <input type="text" id="username" value={$user?.username || ''} readonly style="background-color: #1a1a1a; cursor: not-allowed; color: #888;">
            <small style="color: #666; display: block; margin-top: 4px;">Username tidak dapat diubah.</small>
        </div>

        <hr style="border-color: #333; margin: 24px 0;">
        
        <h3 style="margin-top: 0;">Ubah Password</h3>
        <form on:submit|preventDefault={handleUpdatePassword}>
            <div class="form-group">
                <label for="password">Password Baru</label>
                <input type="password" id="password" bind:value={newPassword} required placeholder="Minimal 6 karakter">
            </div>
            <button type="submit" class="btn-primary" disabled={isSaving}>
                {isSaving ? 'Menyimpan...' : 'Simpan Password'}
            </button>
        </form>
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
        max-width: 600px;
        margin: 40px auto;
        padding: 0 20px;
        flex: 1;
        width: 100%;
        box-sizing: border-box;
    }
    .header-section {
        margin-bottom: 30px;
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
    .card {
        background-color: #1e1e1e;
        padding: 32px;
        border-radius: 12px;
        border: 1px solid #333;
    }
    .form-group {
        margin-bottom: 20px;
    }
    .form-group label {
        display: block;
        margin-bottom: 8px;
        color: #a0a0a0;
        font-size: 14px;
    }
    .form-group input {
        width: 100%;
        padding: 12px;
        border-radius: 8px;
        border: 1px solid #444;
        background-color: #2a2a35;
        color: white;
        font-family: inherit;
        box-sizing: border-box;
    }
    .form-group input:focus {
        outline: none;
        border-color: #7c3aed;
    }
    .btn-primary {
        background-color: #7c3aed;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        width: 100%;
        font-size: 16px;
    }
    .btn-primary:hover:not(:disabled) {
        background-color: #4f46e5;
    }
    .btn-primary:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
    .alert {
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 24px;
        background-color: rgba(34, 197, 94, 0.2);
        color: #4ade80;
        border: 1px solid #4ade80;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .alert-error {
        background-color: rgba(239, 68, 68, 0.2);
        color: #ef4444;
        border-color: #ef4444;
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
</style>
