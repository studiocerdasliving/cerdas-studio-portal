<script>
    let studioUrl = import.meta.env.VITE_STUDIODESIGN_URL || 'https://studio.cerdasliving.com';
    import { navigate  } from 'svelte-routing';
    import { onMount } from 'svelte';
    import { url } from '../../lib/url.svelte.js';
    import { apiFetch } from '../../lib/api.js';

    let { google_client_id = import.meta.env.VITE_GOOGLE_CLIENT_ID || '', captcha_image, flash, flash_type, errors = {} } = $props();

    let email = $state('');
    let password = $state('');
    let captcha = $state('');
    let showPass = $state(false);
    // svelte-ignore state_referenced_locally
    let captchaImg = $state(captcha_image);
    let refreshing = $state(false);
    let processing = $state(false);

    // Google popup confirmation state
    let showGooglePopup = $state(false);
    /** @type {{name: string, email: string, picture: string} | null} */
    let googleAccountInfo = $state(null);
    let pendingCredential = $state('');
    let googleProcessing = $state(false);

    function initGSI() {
        // @ts-ignore
        if (window.google) {
            // @ts-ignore
            window.google.accounts.id.initialize({
                client_id: google_client_id,
                callback: handleGoogleCallback,
                context: 'signin',
                ux_mode: 'popup',
            });
            const container = document.getElementById('gsi-hidden-public-btn');
            if (container) {
                // @ts-ignore
                window.google.accounts.id.renderButton(container, {
                    type: 'standard', size: 'medium', theme: 'outline', width: 320
                });
            }
        }
    }

    onMount(() => {
        if (!google_client_id) return;

        // @ts-ignore
        if (!window.google) {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.id = 'google-gsi-public-login';
            script.onload = initGSI;
            document.head.appendChild(script);
        } else {
            initGSI();
        }

        return () => {
            const el = document.getElementById('google-gsi-public-login');
            if (el) document.head.removeChild(el);
        };
    });



    /** @param {any} response */
    function handleGoogleCallback(response) {
        try {
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            pendingCredential = response.credential;
            googleAccountInfo = {
                name: payload.name || '',
                email: payload.email || '',
                picture: payload.picture || '',
            };
            showGooglePopup = true;
        } catch (err) {
            console.error('Google decode error:', err);
            alert('Gagal membaca data Google. Silakan coba lagi.');
        }
    }

    async function confirmGoogleLogin() {
        if (!pendingCredential || googleProcessing) return;
        googleProcessing = true;
        try {
            const res = await apiFetch('/auth/google', {
                method: 'POST',
                body: JSON.stringify({ token: pendingCredential })
            });

            if (res.token) {
                login(res.token, res.user);
                if (res.user?.akses_level === 'Agent' || res.user?.id_staff) {
                    window.location.href = url('/agent/dashboard');
                } else {
                    window.location.href = studioUrl + '/studio/hub?token=' + res.token;
                }
            } else {
                cancelGoogleLogin();
                alert('Login Google gagal.');
            }
        } catch (err) {
            console.error('Google login error:', err);
            cancelGoogleLogin();
            alert('Terjadi kesalahan jaringan.');
        } finally {
            googleProcessing = false;
        }
    }

    function cancelGoogleLogin() {
        showGooglePopup    = false;
        googleAccountInfo  = null;
        pendingCredential  = '';
        googleProcessing   = false;
    }

    let expectedCaptcha = '';

    function generateCaptchaImage(text) {
        const canvas = document.createElement('canvas');
        canvas.width = 120;
        canvas.height = 48;
        const ctx = canvas.getContext('2d');
        if (!ctx) return '';
        
        // Background
        ctx.fillStyle = '#f0ede8';
        ctx.fillRect(0, 0, 120, 48);
        
        // Noise lines
        for (let i = 0; i < 5; i++) {
            ctx.strokeStyle = ['#C9A84C', '#9c9080', '#e2e8f0'][Math.floor(Math.random()*3)];
            ctx.beginPath();
            ctx.moveTo(Math.random() * 120, Math.random() * 48);
            ctx.lineTo(Math.random() * 120, Math.random() * 48);
            ctx.stroke();
        }
        
        // Text
        ctx.font = 'bold 24px monospace';
        ctx.fillStyle = '#4A4A4A';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw characters with slight rotation
        for (let i = 0; i < text.length; i++) {
            ctx.save();
            ctx.translate(20 + i * 20, 24);
            ctx.rotate((Math.random() - 0.5) * 0.4);
            ctx.fillText(text[i], 0, 0);
            ctx.restore();
        }
        
        return canvas.toDataURL('image/png');
    }

    async function refreshCaptcha() {
        refreshing = true;
        
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let text = '';
        for (let i = 0; i < 5; i++) {
            text += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        expectedCaptcha = text;
        captchaImg = generateCaptchaImage(text);
        
        captcha = '';
        errors.captcha = null;
        setTimeout(() => refreshing = false, 300);
    }

    onMount(() => {
        refreshCaptcha();
    });

    /** @param {Event} e */
    function handleSubmit(e) {
        e.preventDefault();
        errors = {};
        
        if (!email || !password || !captcha) {
            errors = { global: "Harap isi email, password, dan captcha" };
            return;
        }

        if (captcha.toUpperCase() !== expectedCaptcha) {
            errors.captcha = "Kode verifikasi tidak sesuai";
            refreshCaptcha();
            return;
        }

        processing = true;
        apiFetch('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        }).then(data => {
            if (data.token) {
                localStorage.setItem('auth_token', data.token);
                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                    if (data.user.role === 'admin') {
                        navigate('/admin/dashboard');
                    } else if (data.user.akses_level === 'Agent' || data.user.id_staff) {
                        navigate('/agent/dashboard');
                    } else {
                        window.location.href = studioUrl + '/studio/hub?token=' + data.token;
                    }
                } else {
                    window.location.href = studioUrl + '/studio/hub?token=' + data.token;
                }
            } else {
                errors = { global: "Gagal memproses login" };
            }
        }).catch(errs => {
            errors = errs;
        }).finally(() => {
            processing = false;
        });
    }
</script>

<svelte:head>
    <title>Masuk Akun — Cerdas Living</title>
</svelte:head>


<!-- Google Confirmation Popup Modal -->
{#if showGooglePopup && googleAccountInfo}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="google-modal-overlay" onclick={cancelGoogleLogin} onkeydown={(e) => e.key === 'Escape' && cancelGoogleLogin()} role="presentation">
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div class="google-modal" tabindex="-1" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-title-public">
      <div class="google-modal-icon">
        <svg viewBox="0 0 24 24" class="g-logo">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      </div>
      <h3 class="google-modal-title" id="modal-title-public">Konfirmasi Login Google</h3>
      <p class="google-modal-desc">Apakah Anda ingin masuk ke Cerdas Living menggunakan akun Google berikut?</p>

      <div class="google-account-card">
        {#if googleAccountInfo.picture}
          <img src={googleAccountInfo.picture} alt="Foto Profil" class="google-avatar" referrerpolicy="no-referrer" />
        {:else}
          <div class="google-avatar-placeholder">
            <span class="material-symbols-rounded">person</span>
          </div>
        {/if}
        <div class="google-account-info">
          <span class="google-account-name">{googleAccountInfo.name}</span>
          <span class="google-account-email">{googleAccountInfo.email}</span>
        </div>
      </div>

      <div class="google-modal-actions">
        <button class="btn-modal-cancel" onclick={cancelGoogleLogin} disabled={googleProcessing}>
          Batal
        </button>
        <button class="btn-modal-confirm" onclick={confirmGoogleLogin} disabled={googleProcessing}>
          {#if googleProcessing}
            <span class="material-symbols-rounded spinning">refresh</span>
            Memproses...
          {:else}
            <span class="material-symbols-rounded">login</span>
            Ya, Masuk Sekarang
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<div class="login-wrapper">
    <div class="login-container">
        <div class="login-header">
            <a href={url('/')} class="login-brand">
                <img
                    src={url('/images/logo-new.png')}
                    alt="CerdasLiving Logo"
                    class="login-logo-img"
                />
                <div class="login-brand-text">
                    <span class="login-brand-name">CerdasLiving</span>
                    <span class="login-brand-tagline">Smart Property, Better Living</span>
                </div>
            </a>
            <p class="login-brand-desc">Masuk ke portal properti &amp; lifestyle</p>
        </div>

        <div class="login-body">
            <!-- Flash Alert -->
            {#if flash}
                <div class="alert {flash_type === 'error' ? 'alert-danger' : 'alert-success'} animate-in">
                    <span class="material-symbols-rounded">{flash_type === 'error' ? 'error' : 'check_circle'}</span>
                    <span>{flash}</span>
                </div>
            {/if}

            <!-- Custom Google Login Button -->
            {#if google_client_id}
                <div class="google-login-area">
                    <div id="gsi-hidden-public-btn" style="display:flex; justify-content:center; margin-bottom: 16px;"></div>
                    {#if errors.google}
                        <p class="error-msg text-center">{errors.google}</p>
                    {/if}
                </div>

                <div class="divider-row">
                    <span class="divider-line"></span>
                    <span class="divider-text">Atau Gunakan Email</span>
                    <span class="divider-line"></span>
                </div>
            {/if}

            <!-- Login Form -->
            <form onsubmit={handleSubmit} class="login-form animate-in">
                    <div class="form-group">
                        <label for="email">Alamat Email</label>
                        <div class="input-wrap">
                            <span class="material-symbols-rounded input-icon">mail</span>
                            <input
                                id="email"
                                type="email"
                                placeholder="nama@email.com"
                                bind:value={email}
                                required
                            />
                        </div>
                        {#if errors.email}
                            <span class="error-msg">{errors.email}</span>
                        {/if}
                    </div>

                    <div class="form-group">
                        <label for="password">Kata Sandi</label>
                        <div class="input-wrap">
                            <span class="material-symbols-rounded input-icon">lock</span>
                            <input
                                id="password"
                                type={showPass ? 'text' : 'password'}
                                placeholder="••••••••"
                                bind:value={password}
                                required
                            />
                            <button
                                type="button"
                                class="pass-toggle"
                                onclick={() => showPass = !showPass}
                            >
                                <span class="material-symbols-rounded">
                                    {showPass ? 'visibility_off' : 'visibility'}
                                </span>
                            </button>
                        </div>
                        {#if errors.password}
                            <span class="error-msg">{errors.password}</span>
                        {/if}
                    </div>

                    <!-- CAPTCHA -->
                    <div class="form-group">
                        <label for="captcha">Kode Verifikasi (CAPTCHA)</label>
                        <div class="captcha-row">
                            {#if captchaImg}
                                <img src={captchaImg} alt="CAPTCHA" class="captcha-img" />
                            {:else}
                                <div class="captcha-placeholder"></div>
                            {/if}
                            <button
                                type="button"
                                onclick={refreshCaptcha}
                                disabled={refreshing}
                                class="btn-refresh"
                                title="Perbarui Captcha"
                            >
                                <span class="material-symbols-rounded {refreshing ? 'spinning' : ''}">refresh</span>
                            </button>
                        </div>
                        <div class="input-wrap">
                            <span class="material-symbols-rounded input-icon">key</span>
                            <input
                                id="captcha"
                                type="text"
                                placeholder="Masukkan kode di atas"
                                bind:value={captcha}
                                maxlength="6"
                                required
                                style="text-transform: uppercase; font-family: monospace; letter-spacing: 2px;"
                            />
                        </div>
                        {#if errors.captcha}
                            <span class="error-msg">{errors.captcha}</span>
                        {/if}
                    </div>

                    <button type="submit" class="btn btn-gold btn-full btn-submit" disabled={processing}>
                        {#if processing}
                            <span class="material-symbols-rounded spinning">refresh</span>
                            <span>Memproses...</span>
                        {:else}
                            <span>Masuk Sekarang</span>
                            <span class="material-symbols-rounded">arrow_forward</span>
                        {/if}
                    </button>
            </form>
        </div>

        <div class="login-footer">
            <p>Kembali ke <a href={url('/')}>Beranda Cerdas Living</a></p>
        </div>
    </div>
</div>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

    /* ─── Google Modal ─── */
    .google-modal-overlay {
        position: fixed;
        inset: 0;
        z-index: 9999;
        background: rgba(0,0,0,0.45);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        animation: fadeIn 0.2s ease;
    }

    .google-modal {
        background: #ffffff;
        border-radius: 20px;
        padding: 32px 28px 28px;
        max-width: 380px;
        width: 100%;
        box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08);
        text-align: center;
        animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .google-modal-icon {
        width: 56px;
        height: 56px;
        background: #f8f9fa;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 16px;
        border: 1px solid #e8eaed;
    }

    .g-logo { width: 28px; height: 28px; }

    .google-modal-title {
        font-size: 1.15rem;
        font-weight: 700;
        color: #1a1a1a;
        margin: 0 0 8px;
        font-family: 'Inter', sans-serif;
    }

    .google-modal-desc {
        font-size: 0.84rem;
        color: #6B6B6B;
        margin: 0 0 20px;
        line-height: 1.5;
    }

    .google-account-card {
        display: flex;
        align-items: center;
        gap: 12px;
        background: #f8f9fa;
        border: 1.5px solid #e8eaed;
        border-radius: 14px;
        padding: 12px 16px;
        margin-bottom: 24px;
        text-align: left;
    }

    .google-avatar {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid #e8eaed;
        flex-shrink: 0;
    }

    .google-avatar-placeholder {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: #e8eaed;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .google-avatar-placeholder .material-symbols-rounded { font-size: 22px; color: #6B6B6B; }

    .google-account-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
    }

    .google-account-name {
        font-size: 0.9rem;
        font-weight: 600;
        color: #1a1a1a;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .google-account-email {
        font-size: 0.78rem;
        color: #6B6B6B;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .google-modal-actions {
        display: flex;
        gap: 10px;
    }

    .btn-modal-cancel {
        flex: 1;
        padding: 11px 16px;
        border: 1.5px solid #e8eaed;
        border-radius: 12px;
        background: #ffffff;
        color: #6B6B6B;
        font-size: 0.88rem;
        font-weight: 600;
        cursor: pointer;
        font-family: 'Inter', sans-serif;
        transition: all 0.2s;
    }

    .btn-modal-cancel:hover:not(:disabled) { background: #f5f5f5; }
    .btn-modal-cancel:disabled { opacity: 0.6; cursor: not-allowed; }

    .btn-modal-confirm {
        flex: 2;
        padding: 11px 16px;
        border: none;
        border-radius: 12px;
        background: linear-gradient(135deg, #C9A84C, #E0B850);
        color: white;
        font-size: 0.88rem;
        font-weight: 700;
        cursor: pointer;
        font-family: 'Inter', sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.2s;
        box-shadow: 0 4px 12px rgba(201,168,76,0.35);
    }

    .btn-modal-confirm:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 6px 18px rgba(201,168,76,0.45);
    }

    .btn-modal-confirm:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
    .btn-modal-confirm .material-symbols-rounded { font-size: 17px; }

    /* ─── Page ─── */
    .login-wrapper {
        min-height: 100vh;
        background: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        position: relative;
        overflow: hidden;
        color: #1e293b;
        font-family: 'Inter', sans-serif;
    }

    .login-container {
        width: 100%;
        max-width: 440px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
        overflow: hidden;
        position: relative;
        z-index: 10;
        animation: fadeInUp 0.5s ease-out;
    }

    .login-header {
        text-align: center;
        padding: 28px 24px 20px;
        border-bottom: 1px solid #f0ede6;
    }

    .login-brand {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;
        margin-bottom: 10px;
    }

    .login-logo-img {
        width: 60px;
        height: 60px;
        object-fit: contain;
        mix-blend-mode: multiply;
    }

    .login-brand-text {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 1px;
    }

    .login-brand-name {
        font-family: 'Playfair Display', serif;
        font-size: 1.45rem;
        font-weight: 800;
        color: #1a1611;
        letter-spacing: -0.3px;
        line-height: 1.1;
    }

    .login-brand-tagline {
        font-size: 0.7rem;
        font-weight: 600;
        color: #c9a84c;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .login-brand-desc {
        font-size: 0.85rem;
        color: #9c9080;
        margin: 0;
    }

    .login-header p { color: #9c9080; font-size: 0.85rem; }

    .login-body { padding: 24px 32px; }

    .alert {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 16px;
        border-radius: 12px;
        font-size: 0.85rem;
        font-weight: 500;
        margin-bottom: 20px;
        border: 1px solid transparent;
    }

    .alert .material-symbols-rounded { font-size: 18px; flex-shrink: 0; }

    .alert-danger {
        background: rgba(239, 68, 68, 0.08);
        border-color: rgba(239, 68, 68, 0.2);
        color: #dc2626;
    }

    .alert-success {
        background: rgba(16, 185, 129, 0.08);
        border-color: rgba(16, 185, 129, 0.2);
        color: #166534;
    }

    /* Custom Google button */
    .google-login-area { margin-bottom: 0; }

    /* Divider */
    .divider-row {
        display: flex;
        align-items: center;
        margin: 20px 0;
    }

    .divider-line {
        flex: 1;
        height: 1px;
        background: #e2e8f0;
    }

    .divider-text {
        padding: 0 16px;
        font-size: 0.78rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #94a3b8;
        font-weight: 600;
        white-space: nowrap;
    }

    .login-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .form-group label {
        font-size: 0.8rem;
        font-weight: 600;
        color: #5c5347;
        letter-spacing: 0.2px;
    }

    .input-wrap { position: relative; }

    .input-icon {
        position: absolute;
        left: 14px;
        top: 50%;
        transform: translateY(-50%);
        color: #b8a882;
        font-size: 1.1rem;
    }

    .input-wrap input {
        width: 100%;
        background: #ffffff;
        border: 1px solid #cbd5e1;
        border-radius: 12px;
        padding: 11px 16px 11px 40px;
        color: #1e293b;
        font-size: 0.9rem;
        outline: none;
        transition: all 0.2s;
        box-sizing: border-box;
        font-family: 'Inter', sans-serif;
    }

    .input-wrap input:focus {
        border-color: #c9a84c;
        background: #ffffff;
        box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.15);
    }

    .pass-toggle {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        background: transparent;
        border: none;
        color: #b8a882;
        cursor: pointer;
        padding: 4px;
    }

    .pass-toggle:hover { color: #1a1611; }
    .pass-toggle .material-symbols-rounded { font-size: 18px; }

    .captcha-row {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
    }

    .captcha-img {
        height: 52px;
        background: #ffffff;
        border: 1px solid #cbd5e1;
        border-radius: 12px;
        object-fit: contain;
        padding: 2px 8px;
        flex: 1;
    }

    .captcha-placeholder {
        height: 52px;
        background: #f1f5f9;
        border: 1px solid #cbd5e1;
        border-radius: 12px;
        flex: 1;
        animation: pulse 1.5s infinite;
    }

    .btn-refresh {
        width: 52px;
        height: 52px;
        border-radius: 12px;
        background: #f5f3ef;
        border: 1.5px solid #e8e4da;
        color: #9c9080;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-refresh:hover {
        color: #c9a84c;
        border-color: rgba(201, 168, 76, 0.4);
        background: rgba(201, 168, 76, 0.06);
    }

    .error-msg {
        font-size: 0.78rem;
        color: #dc2626;
        font-weight: 500;
        margin-top: 2px;
        padding-left: 4px;
    }

    /* Gold button */
    .btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px 20px;
        border: none;
        border-radius: 12px;
        font-family: 'Inter', sans-serif;
        font-size: 0.95rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-gold {
        background: linear-gradient(135deg, #C9A84C, #E0B850);
        color: white;
        box-shadow: 0 4px 14px rgba(201,168,76,0.35);
    }

    .btn-gold:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(201,168,76,0.5);
    }

    .btn-gold:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

    .btn-full { width: 100%; }

    .btn-submit {
        height: 48px;
        margin-top: 12px;
    }

    .btn-submit .material-symbols-rounded { font-size: 18px; }

    .spinning { animation: spin 1s linear infinite; }

    .login-footer {
        text-align: center;
        padding: 16px 24px 28px;
        border-top: 1px solid #f0ede6;
        font-size: 0.8rem;
        color: #9c9080;
    }

    .login-footer a {
        color: #c9a84c;
        text-decoration: none;
        font-weight: 600;
    }

    .login-footer a:hover { text-decoration: underline; }

    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px) scale(0.97); }
        to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    @keyframes pulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 0.3; }
    }

    .animate-in { animation: fadeIn 0.3s ease-out; }
</style>
