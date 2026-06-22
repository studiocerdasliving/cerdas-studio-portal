<script>
    import { apiFetch } from '../lib/api.js';
    import { navigate, Link } from 'svelte-routing';
    import fpPromise from '@fingerprintjs/fingerprintjs';

    let username = '';
    let password = '';
    let errorMsg = '';
    let isRegistering = false;

    async function getFpHash() {
        try {
            const fp = await fpPromise.load();
            const result = await fp.get();
            localStorage.setItem('fp_hash', result.visitorId);
            return result.visitorId;
        } catch(e) {
            return "unknown";
        }
    }

    async function handleRegister() {
        errorMsg = '';
        isRegistering = true;
        try {
            const fp_hash = await getFpHash();
            // Placeholder: map to Rust API endpoint for registration
            await apiFetch('/register', {
                method: 'POST',
                body: JSON.stringify({ username, password, fp_hash })
            });
            
            // Navigate to login after successful register
            navigate('/studio/login');
        } catch (err) {
            errorMsg = (err instanceof Error ? err.message : String(err)) || 'Registrasi gagal';
        } finally {
            isRegistering = false;
        }
    }
</script>

<svelte:head>
    <title>Studio Baik - Register</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
</svelte:head>

<div class="login-container">
    <div class="login-card">
        <h2>Daftar Studio Baik</h2>
        
        {#if errorMsg}
            <div class="alert">
                {errorMsg}
            </div>
        {/if}

        <form on:submit|preventDefault={handleRegister}>
            <div class="input-group">
                <label for="username">Username</label>
                <input type="text" id="username" bind:value={username} required placeholder="Pilih username unik">
            </div>
            <div class="input-group">
                <label for="password">Password</label>
                <input type="password" id="password" bind:value={password} required placeholder="Minimal 8 karakter">
            </div>
            <button type="submit" class="btn btn-primary" disabled={isRegistering}>
                {isRegistering ? 'Mendaftar...' : 'Daftar Akun'}
            </button>
        </form>

        <div class="footer-link">
            Sudah punya akun? <Link to="/studio/login">Login di sini</Link>
        </div>
    </div>
</div>

<style>
    :global(body) {
        font-family: 'Inter', sans-serif;
        background-color: #121212;
        color: #ffffff;
    }
    .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
    }
    .login-card {
        background-color: #1e1e1e;
        padding: 40px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        width: 100%;
        max-width: 400px;
        text-align: center;
    }
    .login-card h2 {
        margin-top: 0;
        margin-bottom: 24px;
        font-weight: 600;
    }
    .input-group {
        margin-bottom: 16px;
        text-align: left;
    }
    .input-group label {
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
        color: #a0a0a0;
    }
    .input-group input {
        width: 100%;
        padding: 12px;
        border-radius: 8px;
        border: 1px solid #333;
        background-color: #2a2a35;
        color: #fff;
        font-size: 16px;
        box-sizing: border-box;
        transition: border-color 0.3s;
    }
    .input-group input:focus {
        outline: none;
        border-color: #7c3aed;
    }
    .btn {
        width: 100%;
        padding: 12px;
        border-radius: 8px;
        border: none;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.3s, transform 0.1s;
        margin-bottom: 12px;
    }
    .btn:active {
        transform: scale(0.98);
    }
    .btn-primary {
        background-color: #7c3aed;
        color: white;
    }
    .btn-primary:hover:not(:disabled) {
        background-color: #4f46e5;
    }
    .btn-primary:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
    
    .alert {
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 16px;
        background-color: rgba(239, 68, 68, 0.2);
        color: #ef4444;
        border: 1px solid #ef4444;
        font-size: 14px;
    }
    .footer-link {
        margin-top: 20px;
        font-size: 14px;
        color: #a0a0a0;
    }
    :global(.footer-link a) {
        color: #7c3aed;
        text-decoration: none;
    }
    :global(.footer-link a:hover) {
        text-decoration: underline;
    }
</style>
