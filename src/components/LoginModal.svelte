<script>
    import { navigate  } from 'svelte-routing';
    import { onMount } from 'svelte';
    import { fade, scale } from 'svelte/transition';
    import { url } from '../lib/url.svelte.js';
    import { apiFetch } from '../lib/api.js';

    let { open = $bindable(false), google_client_id = import.meta.env.VITE_GOOGLE_CLIENT_ID || '', onSwitchToRegister, intendedRoute = null } = $props();

    let email       = $state('');
    let password    = $state('');
    let captcha     = $state('');
    let captchaImg  = $state('');
    let showPass    = $state(false);
    let refreshing  = $state(false);
    let processing  = $state(false);
    /** @type {any} */
    let errors      = $state({});

    // Google confirm popup
    let showGooglePopup   = $state(false);
    /** @type {any} */
    let googleAccountInfo = $state(null);
    let pendingCredential = $state('');
    let googleProcessing  = $state(false);

    function resetForm() {
        email = ''; password = ''; captcha = ''; showPass = false;
        processing = false; errors = {};
        showGooglePopup = false; googleAccountInfo = null;
        pendingCredential = ''; googleProcessing = false;
    }

    function closeModal() {
        open = false;
        resetForm();
    }

    // Lock/unlock scroll + fetch captcha when opened
    $effect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
            if (!captchaImg) fetchCaptcha();
            if (google_client_id) {
                const el = document.getElementById('gsi-login-modal-script');
                if (el) initLoginGSI();
            }
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    });

    onMount(() => {
        if (!google_client_id) return;
        if (!(/** @type {any} */ (window)).google) {
            const script = document.createElement('script');
            script.src   = 'https://accounts.google.com/gsi/client';
            script.async = true; script.defer = true;
            script.id    = 'gsi-login-modal-script';
            script.onload = initLoginGSI;
            document.head.appendChild(script);
        } else {
            initLoginGSI();
        }
        return () => { document.getElementById('gsi-login-modal-script')?.remove(); };
    });

    function initLoginGSI() {
        /** @type {any} */
        const w = window;
        if (!w.google || !google_client_id) return;
        w.google.accounts.id.initialize({
            client_id: google_client_id,
            callback: handleGoogleCallback,
            context: 'signin',
            ux_mode: 'popup',
        });
        const container = document.getElementById('g_id_signin_login_modal');
        if (container) {
            w.google.accounts.id.renderButton(container, {
                type: 'standard', size: 'medium', theme: 'outline', width: 320
            });
        }
    }

    /** @param {any} response */
    function handleGoogleCallback(response) {
        try {
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            pendingCredential  = response.credential;
            googleAccountInfo  = { name: payload.name||'', email: payload.email||'', picture: payload.picture||'' };
            showGooglePopup    = true;
        } catch {
            errors = { google: 'Gagal memproses akun Google. Coba lagi.' };
        }
    }

    async function confirmGoogleLogin() {
        if (!pendingCredential || googleProcessing) return;
        googleProcessing = true;
        try {
            const res = await fetch(url('/api/auth/google'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ credential: pendingCredential }),
            });

            if (res.status === 409) {
                window.location.href = res.headers.get('X-Inertia-Location') || url('/');
                return;
            }
            if (res.ok) {
                window.location.reload();
            } else {
                const json = await res.json().catch(() => ({}));
                errors = { google: json?.errors?.google ?? json?.message ?? 'Login Google gagal.' };
                showGooglePopup = false;
            }
        } catch {
            errors = { google: 'Terjadi kesalahan jaringan.' };
            showGooglePopup = false;
        } finally {
            googleProcessing = false;
        }
    }

    function cancelGoogleLogin() {
        showGooglePopup = false; googleAccountInfo = null;
        pendingCredential = ''; googleProcessing = false;
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

    async function fetchCaptcha() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let text = '';
        for (let i = 0; i < 5; i++) {
            text += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        expectedCaptcha = text;
        captchaImg = generateCaptchaImage(text);
    }

    async function refreshCaptcha() {
        refreshing = true;
        await fetchCaptcha();
        captcha = '';
        setTimeout(() => refreshing = false, 300);
    }

    import { login } from '../lib/stores/auth.js';

    /** @param {any} e */
    function handleSubmit(e) {
        e.preventDefault();
        errors = {};
        
        if (captcha.toUpperCase() !== expectedCaptcha) {
            errors.captcha = 'Kode verifikasi tidak sesuai';
            refreshCaptcha();
            return;
        }
        
        processing = true;
        apiFetch('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        })
        .then(data => {
            if (data.token) {
                login(data.token, data.user);
                closeModal();
                if (intendedRoute) {
                    navigate(intendedRoute);
                } else if (data.user?.akses_level === 'Agent' || data.user?.id_staff) {
                    navigate('/agent/dashboard');
                } else {
                    window.location.reload();
                }
            } else {
                errors = { general: 'Gagal memproses login' };
            }
        })
        .catch(err => { errors = { general: err.message || 'Login gagal' }; })
        .finally(() => { processing = false; });
    }

    /** @param {any} e */
    function handleOverlayKey(e) { if (e.key === 'Escape') closeModal(); }
</script>



{#if open}
<!-- Google Confirm Sub-Modal -->
{#if showGooglePopup && googleAccountInfo}
    <div class="g-confirm-overlay" transition:fade={{ duration:150 }}>
        <div class="g-confirm-box" transition:scale={{ duration:200, start:0.95 }}>
            <div class="g-confirm-icon">
                <svg viewBox="0 0 24 24" width="28" height="28">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
            </div>
            <h3>Konfirmasi Login Google</h3>
            <p>Apakah Anda ingin masuk menggunakan akun Google berikut?</p>
            <div class="g-confirm-account">
                {#if googleAccountInfo.picture}
                    <img src={googleAccountInfo.picture} alt="" referrerpolicy="no-referrer" />
                {:else}
                    <div class="g-confirm-avatar-ph"></div>
                {/if}
                <div>
                    <span class="g-confirm-name">{googleAccountInfo.name}</span>
                    <span class="g-confirm-email">{googleAccountInfo.email}</span>
                </div>
            </div>
            <div class="g-confirm-btns">
                <button class="g-btn-cancel" onclick={cancelGoogleLogin} disabled={googleProcessing}>Batal</button>
                <button class="g-btn-ok" onclick={confirmGoogleLogin} disabled={googleProcessing}>
                    {#if googleProcessing}<span class="spin material-symbols-rounded">refresh</span> Memproses...
                    {:else}<span class="material-symbols-rounded">login</span> Ya, Masuk Sekarang{/if}
                </button>
            </div>
        </div>
    </div>
{/if}

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="modal-overlay" onclick={closeModal} onkeydown={handleOverlayKey} role="presentation" transition:fade={{ duration:200 }}>
    <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
    <div class="modal-box" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="login-modal-title" transition:scale={{ duration:250, start:0.96 }}>

        <!-- LEFT DECORATIVE PANEL -->
        <div class="modal-left">
            <div class="modal-left-inner">
                <a href={url('/')} class="modal-brand">
                    <img src={url('/images/logo-new.png')} alt="CerdasLiving" class="modal-logo" />
                    <div>
                        <div class="modal-brand-name">CerdasLiving</div>
                        <div class="modal-brand-tag">Smart Property, Better Living</div>
                    </div>
                </a>

                {#if intendedRoute === '/studio/hub'}
                <div class="modal-left-headline">Studio <span>Design</span> AI</div>
                <div class="modal-left-desc">Wujudkan rumah impian Anda dalam hitungan menit dengan dukungan teknologi kecerdasan buatan.</div>

                <div class="modal-left-features">
                    <div class="lf-item"><span class="material-symbols-rounded">account_balance</span> Desain Arsitektur Cerdas</div>
                    <div class="lf-item"><span class="material-symbols-rounded">chair</span> AI Interior Otomatis</div>
                    <div class="lf-item"><span class="material-symbols-rounded">square_foot</span> Denah Lantai Presisi</div>
                    <div class="lf-item"><span class="material-symbols-rounded">texture</span> Koleksi Material Premium</div>
                </div>
                {:else}
                <div class="modal-left-headline">Selamat <span>Datang</span> Kembali!</div>
                <div class="modal-left-desc">Masuk ke akun Anda untuk mengakses semua fitur platform properti terlengkap di Indonesia.</div>

                <div class="modal-left-features">
                    <div class="lf-item"><span class="material-symbols-rounded">real_estate_agent</span> Kelola listing properti Anda</div>
                    <div class="lf-item"><span class="material-symbols-rounded">insights</span> AI Property Analytics</div>
                    <div class="lf-item"><span class="material-symbols-rounded">favorite</span> Properti favorit tersimpan</div>
                    <div class="lf-item"><span class="material-symbols-rounded">support_agent</span> Hubungi agen profesional</div>
                </div>
                {/if}

                <!-- Decorative SVG -->
                <div class="modal-left-deco">
                    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="100" cy="80" r="60" stroke="rgba(255,255,255,0.1)" stroke-width="20" fill="none"/>
                        <circle cx="100" cy="80" r="35" stroke="rgba(255,255,255,0.15)" stroke-width="10" fill="none"/>
                        <circle cx="100" cy="80" r="15" fill="rgba(255,220,80,0.3)"/>
                        <line x1="100" y1="20" x2="100" y2="140" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
                        <line x1="40" y1="80" x2="160" y2="80" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
                        <rect x="25" y="60" width="20" height="40" rx="3" fill="rgba(255,255,255,0.1)"/>
                        <rect x="155" y="55" width="20" height="50" rx="3" fill="rgba(255,255,255,0.1)"/>
                        <polygon points="100,30 115,45 85,45" fill="rgba(255,220,80,0.25)"/>
                    </svg>
                </div>
            </div>
        </div>

        <!-- RIGHT FORM PANEL -->
        <div class="modal-right">
            <button class="modal-close" onclick={closeModal} aria-label="Tutup">
                <span class="material-symbols-rounded">close</span>
            </button>

            <div class="modal-form-wrap">
                <h2 id="login-modal-title" style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                    Masuk Akun
                    {#if intendedRoute === '/studio/hub'}
                        <span style="font-size:0.95rem; color:#C9A84C; font-weight:600; padding:4px 10px; background:rgba(201,168,76,0.1); border-radius:8px;">Studio Design</span>
                    {:else if intendedRoute === '/agent/dashboard'}
                        <span style="font-size:0.95rem; color:#C9A84C; font-weight:600; padding:4px 10px; background:rgba(201,168,76,0.1); border-radius:8px;">Agent Dashboard</span>
                    {/if}
                </h2>
                <p class="modal-subtitle">Akses portal properti &amp; lifestyle terbaik</p>

                {#if errors.google || errors.general}
                    <div class="form-alert alert-danger">
                        <span class="material-symbols-rounded">error</span> {errors.google || errors.general}
                    </div>
                {/if}

                <!-- Google Login -->
                {#if google_client_id}
                    <div id="g_id_signin_login_modal" style="display:flex; justify-content:center; margin-bottom: 16px;"></div>
                    <div class="form-divider"><span>atau gunakan email</span></div>
                {/if}

                <!-- Login Form -->
                <form onsubmit={handleSubmit}>
                    <div class="form-group">
                        <label for="lm-email">Email / Username</label>
                        <div class="input-icon-wrap">
                            <span class="material-symbols-rounded i-ico">person</span>
                            <input id="lm-email" type="text" placeholder="email@domain.com" bind:value={email} required class="{errors.email ? 'err' : ''} has-icon" autocomplete="username" />
                        </div>
                        {#if errors.email}<span class="err-msg">{errors.email}</span>{/if}
                    </div>

                    <div class="form-group">
                        <label for="lm-pass">Kata Sandi</label>
                        <div class="input-icon-wrap">
                            <span class="material-symbols-rounded i-ico">lock</span>
                            <input id="lm-pass" type={showPass ? 'text' : 'password'} placeholder="••••••••" bind:value={password} required class="{errors.password ? 'err' : ''} has-icon has-right-ico" autocomplete="current-password" />
                            <button type="button" class="pass-eye" onclick={() => showPass = !showPass} aria-label="Tampilkan kata sandi">
                                <span class="material-symbols-rounded">{showPass ? 'visibility_off' : 'visibility'}</span>
                            </button>
                        </div>
                        {#if errors.password}<span class="err-msg">{errors.password}</span>{/if}
                    </div>

                    <!-- CAPTCHA -->
                    <div class="form-group">
                        <label for="lm-captcha">Kode Verifikasi</label>
                        <div class="captcha-row">
                            {#if captchaImg}
                                <img src={captchaImg} alt="CAPTCHA" class="captcha-img" />
                            {:else}
                                <div class="captcha-ph"></div>
                            {/if}
                            <button type="button" class="captcha-refresh" onclick={refreshCaptcha} disabled={refreshing} aria-label="Perbarui CAPTCHA">
                                <span class="material-symbols-rounded {refreshing ? 'spin' : ''}">refresh</span>
                            </button>
                        </div>
                        <div class="input-icon-wrap" style="margin-top:8px">
                            <span class="material-symbols-rounded i-ico">key</span>
                            <input id="lm-captcha" type="text" placeholder="Ketik kode di atas" bind:value={captcha} required maxlength="6" class="{errors.captcha ? 'err' : ''} has-icon captcha-input" oninput={(e) => captcha = /** @type {HTMLInputElement} */ (e.target).value.toUpperCase()} autocomplete="off" />
                        </div>
                        {#if errors.captcha}<span class="err-msg">{errors.captcha}</span>{/if}
                    </div>

                    <button type="submit" class="btn-submit" disabled={processing}>
                        {#if processing}
                            <span class="material-symbols-rounded spin">refresh</span> Memproses...
                        {:else}
                            <span class="material-symbols-rounded">login</span> Masuk Sekarang
                        {/if}
                    </button>

                    <p class="switch-cta">
                        Belum punya akun?
                        <button type="button" class="link-btn" onclick={() => { closeModal(); onSwitchToRegister?.(); }}>Daftar gratis</button>
                    </p>
                </form>
            </div>
        </div>
    </div>
</div>
{/if}

<style>
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

    /* ─── Google confirm sub-modal ─── */
    .g-confirm-overlay {
        position: fixed; inset: 0; z-index: 10100;
        background: rgba(0,0,0,0.5);
        display: flex; align-items: center; justify-content: center; padding: 16px;
    }
    .g-confirm-box {
        background: #fff; border-radius: 20px; padding: 28px 24px 24px;
        max-width: 360px; width: 100%; text-align: center;
        box-shadow: 0 20px 60px rgba(0,0,0,0.18);
    }
    .g-confirm-icon {
        width: 52px; height: 52px; background: #f8f9fa; border-radius: 14px;
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 14px; border: 1px solid #e8eaed;
    }
    .g-confirm-box h3 { font-size: 1.1rem; font-weight: 700; color: #1a1a1a; margin: 0 0 6px; }
    .g-confirm-box p  { font-size: 0.82rem; color: #6B6B6B; margin: 0 0 16px; line-height: 1.5; }
    .g-confirm-account {
        display: flex; align-items: center; gap: 10px;
        background: #FAF8F5; border: 1.5px solid #E8E0D0; border-radius: 12px;
        padding: 10px 14px; margin-bottom: 20px; text-align: left;
    }
    .g-confirm-account img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
    .g-confirm-avatar-ph { width: 40px; height: 40px; border-radius: 50%; background: #e8eaed; flex-shrink: 0; }
    .g-confirm-account div { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .g-confirm-name  { font-size: 0.88rem; font-weight: 600; color: #1a1a1a; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .g-confirm-email { font-size: 0.76rem; color: #6B6B6B; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .g-confirm-btns  { display: flex; gap: 10px; }
    .g-btn-cancel {
        flex: 1; padding: 10px; border: 1.5px solid #E8E0D0; border-radius: 10px;
        background: #fff; color: #6B6B6B; font-size: 0.86rem; font-weight: 600; cursor: pointer;
        font-family: inherit; transition: all 0.2s;
    }
    .g-btn-cancel:hover:not(:disabled) { background: #f5f5f5; }
    .g-btn-cancel:disabled { opacity: 0.6; cursor: not-allowed; }
    .g-btn-ok {
        flex: 2; padding: 10px; border: none; border-radius: 10px;
        background: linear-gradient(135deg, #C9A84C, #E0B850);
        color: white; font-size: 0.86rem; font-weight: 700; cursor: pointer;
        font-family: inherit; display: flex; align-items: center; justify-content: center; gap: 6px;
        transition: all 0.2s; box-shadow: 0 4px 12px rgba(201,168,76,0.35);
    }
    .g-btn-ok:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(201,168,76,0.45); }
    .g-btn-ok:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
    .g-btn-ok .material-symbols-rounded { font-size: 16px; }

    /* ─── Main Modal ─── */
    .modal-overlay {
        position: fixed; inset: 0; z-index: 10000;
        background: rgba(15,10,5,0.6);
        backdrop-filter: blur(6px);
        display: flex; align-items: center; justify-content: center;
        padding: 16px;
    }

    .modal-box {
        display: flex;
        width: 100%; max-width: 720px;
        max-height: 92vh;
        background: #fff;
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 32px 80px rgba(26,22,17,0.30), 0 8px 24px rgba(26,22,17,0.12);
        position: relative;
    }

    /* ─── Left Decorative Panel ─── */
    .modal-left {
        width: 280px; flex-shrink: 0;
        background: linear-gradient(155deg, #1A1611 0%, #2C1A0E 35%, #B8472C 70%, #E0B850 100%);
        position: relative; display: flex; flex-direction: column;
    }

    .modal-left-inner {
        padding: 32px 24px;
        display: flex; flex-direction: column; height: 100%;
        position: relative; z-index: 2;
    }

    .modal-brand {
        display: flex; align-items: center; gap: 10px;
        text-decoration: none; margin-bottom: 32px;
    }

    .modal-logo {
        width: 48px; height: 48px; object-fit: contain;
        background: rgba(255,255,255,0.15); border-radius: 12px; padding: 4px;
    }

    .modal-brand-name {
        font-family: 'Playfair Display', serif;
        font-size: 1.1rem; font-weight: 800;
        color: #fff; line-height: 1.1;
    }

    .modal-brand-tag {
        font-size: 0.62rem; font-weight: 700;
        color: rgba(255,255,255,0.7);
        text-transform: uppercase; letter-spacing: 1px;
    }

    .modal-left-headline {
        font-size: 1.5rem; font-weight: 800;
        color: #fff; line-height: 1.2; margin-bottom: 12px;
    }

    .modal-left-headline span { color: #FFD66B; }

    .modal-left-desc {
        font-size: 0.8rem; color: rgba(255,255,255,0.8);
        line-height: 1.6; margin-bottom: 24px;
    }

    .modal-left-features { display: flex; flex-direction: column; gap: 10px; }

    .lf-item {
        display: flex; align-items: center; gap: 8px;
        font-size: 0.8rem; color: rgba(255,255,255,0.9); font-weight: 500;
    }

    .lf-item .material-symbols-rounded { font-size: 17px; color: #FFD66B; flex-shrink: 0; }

    .modal-left-deco {
        margin-top: auto; opacity: 0.4;
        display: flex; justify-content: center;
    }

    /* ─── Right Form Panel ─── */
    .modal-right {
        flex: 1; overflow-y: auto;
        display: flex; flex-direction: column;
        position: relative; background: #fff;
    }

    .modal-close {
        position: absolute; top: 16px; right: 16px;
        width: 36px; height: 36px;
        background: #f5f5f5; border: none; border-radius: 10px;
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        color: #6B6B6B; z-index: 10; transition: all 0.2s;
    }
    .modal-close:hover { background: #fee2e2; color: #dc2626; }
    .modal-close .material-symbols-rounded { font-size: 18px; }

    .modal-form-wrap {
        padding: 32px 32px 28px;
        display: flex; flex-direction: column; gap: 0; flex: 1;
    }

    .modal-form-wrap h2 {
        font-size: 1.5rem; font-weight: 800; color: #1a1611; margin: 0 0 4px;
        font-family: 'Playfair Display', serif;
    }

    .modal-subtitle { font-size: 0.84rem; color: #9c9080; margin: 0 0 20px; }

    .form-alert {
        display: flex; align-items: center; gap: 8px;
        border-radius: 10px; padding: 10px 14px;
        font-size: 0.83rem; font-weight: 500; margin-bottom: 16px;
        border: 1px solid transparent;
    }
    .form-alert .material-symbols-rounded { font-size: 18px; flex-shrink: 0; }
    .alert-danger { background: #FEF2F2; border-color: #FECACA; color: #B91C1C; }


    .form-divider {
        display: flex; align-items: center; gap: 12px; margin-bottom: 16px;
    }
    .form-divider::before,.form-divider::after { content:''; flex:1; height:1px; background:#ebe8e1; }
    .form-divider span { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 600; white-space: nowrap; }

    .form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; }
    .form-group label { font-size: 0.78rem; font-weight: 600; color: #4A4A4A; }

    .form-group input {
        width: 100%; padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px;
        font-family: inherit; font-size: 0.88rem; color: #1e293b; background: #fff;
        outline: none; transition: all 0.2s; box-sizing: border-box;
    }
    .form-group input:focus { border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(201,168,76,0.12); }
    .form-group input.err { border-color: #ef4444; }

    .input-icon-wrap { position: relative; }
    .i-ico {
        position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
        font-size: 17px; color: #B8A882; pointer-events: none;
    }
    .input-icon-wrap input.has-icon { padding-left: 38px; }
    .input-icon-wrap input.has-right-ico { padding-right: 40px; }
    .input-icon-wrap input.captcha-input { font-family: monospace; letter-spacing: 2px; font-size: 0.95rem; }

    .pass-eye {
        position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
        background: none; border: none; cursor: pointer; color: #B8A882; padding: 4px;
    }
    .pass-eye:hover { color: #1a1611; }
    .pass-eye .material-symbols-rounded { font-size: 17px; }

    .err-msg { font-size: 0.75rem; color: #dc2626; font-weight: 500; }

    /* Captcha */
    .captcha-row { display: flex; align-items: center; gap: 8px; }
    .captcha-img {
        height: 48px; flex: 1; border-radius: 10px;
        border: 1.5px solid #e2e8f0; background: #fafafa;
        object-fit: contain; padding: 2px 8px;
    }
    .captcha-ph {
        height: 48px; flex: 1; border-radius: 10px;
        background: #f0ede8; animation: pulse 1.5s infinite;
    }
    .captcha-refresh {
        width: 40px; height: 40px; border-radius: 10px;
        background: #f5f3ef; border: 1.5px solid #e8e4da;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; color: #9c9080; transition: all 0.2s;
    }
    .captcha-refresh:hover { color: #C9A84C; border-color: rgba(201,168,76,0.4); background: rgba(201,168,76,0.06); }
    .captcha-refresh:disabled { opacity: 0.5; cursor: not-allowed; }
    .captcha-refresh .material-symbols-rounded { font-size: 18px; }

    /* Submit */
    .btn-submit {
        width: 100%; display: flex; align-items: center; justify-content: center;
        gap: 8px; padding: 13px; margin-top: 4px;
        background: linear-gradient(135deg, #C9A84C, #E0B850);
        color: white; border: none; border-radius: 12px;
        font-family: inherit; font-size: 0.95rem; font-weight: 700;
        cursor: pointer; transition: all 0.2s;
        box-shadow: 0 4px 14px rgba(201,168,76,0.38);
    }
    .btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(201,168,76,0.48); }
    .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
    .btn-submit .material-symbols-rounded { font-size: 18px; }

    .switch-cta {
        text-align: center; font-size: 0.84rem; color: #64748b;
        margin-top: 14px; margin-bottom: 0;
    }
    .link-btn {
        background: none; border: none; cursor: pointer;
        color: #C9A84C; font-size: 0.84rem; font-weight: 700;
        font-family: inherit; padding: 0;
    }
    .link-btn:hover { text-decoration: underline; }

    @keyframes spin { to { transform: rotate(360deg); } }
    .spin { animation: spin 0.9s linear infinite; display: inline-block; }
    @keyframes pulse { 0%,100% { opacity:0.6; } 50% { opacity:0.3; } }

    @media (max-width: 620px) {
        .modal-left { display: none; }
        .modal-form-wrap { padding: 24px 20px 28px; }
    }
</style>
