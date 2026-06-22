<script>
    import { apiFetch } from '../lib/api.js';
    import { login } from '../lib/stores/auth.js';
    import { navigate } from 'svelte-routing';
    import fpPromise from '@fingerprintjs/fingerprintjs';

    let username = '';
    let password = '';
    let errorMsg = '';
    let isLoading = false;

    async function getFpHash() {
        try {
            const fp = await fpPromise.load();
            const result = await fp.get();
            localStorage.setItem('fp_hash', result.visitorId);
            return result.visitorId;
        } catch(e) {
            localStorage.setItem('fp_hash', "unknown");
            return "unknown";
        }
    }

    async function handleLogin() {
        errorMsg = '';
        isLoading = true;
        try {
            const fp_hash = await getFpHash();
            const data = await apiFetch('/login', {
                method: 'POST',
                body: JSON.stringify({ email: username, password, fp_hash })
            });
            
            login(data.token, data.user);
            navigate('/studio/hub');
        } catch (err) {
            errorMsg = (err instanceof Error ? err.message : String(err)) || 'Login failed';
        } finally {
            isLoading = false;
        }
    }
</script>

<svelte:head>
    <title>Studio Baik - Login</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
</svelte:head>

<div class="login-container">
    <div class="login-card">
        <h2>Studio Baik</h2>
        
        {#if errorMsg}
            <div class="alert">
                {errorMsg}
            </div>
        {/if}

        <form on:submit|preventDefault={handleLogin}>
            <div class="input-group">
                <label for="username">Username</label>
                <input type="text" id="username" bind:value={username} required>
            </div>
            <div class="input-group">
                <label for="password">Password</label>
                <input type="password" id="password" bind:value={password} required>
            </div>
            <button type="submit" class="btn btn-primary" disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Login'}
            </button>
        </form>

        <div class="divider">ATAU</div>

        <button type="button" class="btn btn-google" on:click={() => errorMsg = 'Fitur Login Google segera hadir.'}>Login with Google</button>
        <button type="button" class="btn btn-facebook" on:click={() => errorMsg = 'Fitur Login Facebook segera hadir.'}>Login with Facebook</button>
        <button type="button" class="btn btn-whatsapp" on:click={() => errorMsg = 'Fitur Login WhatsApp segera hadir.'}>Login with WhatsApp</button>
        
        <div style="margin-top: 24px; font-size: 14px; color: #a0a0a0;">
            Belum punya akun? <a href="/studio/register" style="color: #7c3aed; text-decoration: none;">Daftar di sini</a>
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
        background-color: #2a2a2a;
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
    .btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
    .btn-primary {
        background-color: #7c3aed;
        color: white;
    }
    .btn-primary:hover {
        background-color: #4f46e5;
    }
    .divider {
        display: flex;
        align-items: center;
        margin: 24px 0;
        color: #666;
        font-size: 14px;
    }
    .divider::before, .divider::after {
        content: "";
        flex: 1;
        border-bottom: 1px solid #333;
    }
    .divider:not(:empty)::before {
        margin-right: .25em;
    }
    .divider:not(:empty)::after {
        margin-left: .25em;
    }
    .btn-google { background-color: #db4437; color: white; }
    .btn-facebook { background-color: #4267B2; color: white; }
    .btn-whatsapp { background-color: #25D366; color: white; }
    
    .alert {
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 16px;
        background-color: rgba(239, 68, 68, 0.2);
        color: #ef4444;
        border: 1px solid #ef4444;
        font-size: 14px;
    }
</style>
