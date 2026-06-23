<script>
    import { navigate  } from 'svelte-routing';
    import { onMount } from 'svelte';
    import { fade, scale } from 'svelte/transition';
    import { url } from '../lib/url.svelte.js';
    import { apiFetch } from '../lib/api.js';

    let { open = $bindable(false), google_client_id = import.meta.env.VITE_GOOGLE_CLIENT_ID || '', onSwitchToLogin } = $props();

    // Form fields
    let nama_lengkap = $state('');
    let email        = $state('');
    let password     = $state('');
    let telepon      = $state('');
    /** @type {File|null} */
    let photo        = $state(null);
    let credential   = $state('');

    let showPassword      = $state(false);
    let showGooglePassword = $state(false);
    let googlePassword    = $state('');   // password opsional saat daftar via Google
    /** @type {string|null} */
    let photoPreview  = $state(null);
    let usingGoogle   = $state(false);
    let googlePic     = $state(null);
    let processing    = $state(false);
    /** @type {any} */
    let errors        = $state({});
    // Tampilkan halaman sukses setelah submit email biasa
    let successEmail  = $state('');

    // Google confirm popup
    let showGooglePopup   = $state(false);
    /** @type {any} */
    let pendingGoogleInfo = $state(null);

    function resetForm() {
        nama_lengkap = ''; email = ''; password = ''; telepon = '';
        photo = null; credential = ''; showPassword = false; photoPreview = null;
        usingGoogle = false; googlePic = null; processing = false; errors = {};
        showGooglePopup = false; pendingGoogleInfo = null;
        googlePassword = ''; showGooglePassword = false; successEmail = '';
    }

    function closeModal() {
        open = false;
        resetForm();
    }

    // Lock/unlock body scroll
    $effect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
            /** @type {any} */
            const w = window;
            if (google_client_id && w.google) {
                setTimeout(initGSI, 10);
            }
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    });

    onMount(() => {
        if (!google_client_id) return;
        // @ts-ignore
        if (!window.google) {
            const script = document.createElement('script');
            script.src   = 'https://accounts.google.com/gsi/client';
            script.async = true; script.defer = true;
            script.id    = 'gsi-reg-modal';
            script.onload = initGSI;
            document.head.appendChild(script);
        } else {
            initGSI();
        }
        return () => { document.getElementById('gsi-reg-modal')?.remove(); };
    });

    function initGSI() {
        /** @type {any} */
        const w = window;
        if (!w.google || !google_client_id) return;
        w.google.accounts.id.initialize({
            client_id: google_client_id,
            callback: handleGoogleCallback,
            context: 'signup',
            ux_mode: 'popup',
        });
        const container = document.getElementById('g_id_signin_reg_modal');
        if (container) {
            w.google.accounts.id.renderButton(container, {
                type: 'standard', size: 'medium', theme: 'outline', width: 320
            });
        }
    }

    /** @param {any} response */
    async function handleGoogleCallback(response) {
        try {
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            const data = await apiFetch('/auth/check-email', {
                method: 'POST',
                body: JSON.stringify({ email: payload.email })
            });
            if (data.exists) {
                errors = { general: 'Email ini sudah terdaftar. Silakan login menggunakan akun yang ada.' };
                return;
            }
            pendingGoogleInfo = { name: payload.name||'', email: payload.email||'', picture: payload.picture||'', token: response.credential };
            showGooglePopup = true;
        } catch (e) {
            errors = { general: 'Gagal memproses akun Google. Coba lagi.' };
        }
    }

    function confirmGoogle() {
        if (!pendingGoogleInfo) return;
        credential    = pendingGoogleInfo.token;
        nama_lengkap  = pendingGoogleInfo.name  || nama_lengkap;
        email         = pendingGoogleInfo.email  || email;
        googlePic     = pendingGoogleInfo.picture || null;
        usingGoogle   = true;
        password      = '';       // tidak dipakai untuk submit, googlePassword yang dipakai
        errors        = {};
        showGooglePopup   = false;
        pendingGoogleInfo = null;
    }

    function cancelGoogle() {
        usingGoogle = false; credential = ''; googlePic = null;
        email = ''; nama_lengkap = ''; googlePassword = '';
    }

    /** @param {any} e */
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) { photo = file; photoPreview = URL.createObjectURL(file); }
    };

    /** @param {any} e */
    async function submit(e) {
        e.preventDefault();
        errors = {};

        // Validasi password wajib (baik manual maupun Google)
        const usedPassword = usingGoogle ? googlePassword : password;
        if (!usedPassword || usedPassword.length < 6) {
            errors = { general: 'Kata sandi minimal 6 karakter.' };
            return;
        }

        processing = true;
        const fd = new FormData();
        fd.append('nama_lengkap', nama_lengkap);
        fd.append('email',        email);
        fd.append('telepon',      telepon);
        fd.append('credential',   credential);
        fd.append('password',     usedPassword);
        if (photo) fd.append('photo', photo);

        try {
            await apiFetch('/agent/register', { method: 'POST', body: fd });
            if (usingGoogle) {
                // Google langsung aktif — tutup & redirect
                closeModal();
            } else {
                // Email biasa — tampilkan halaman verifikasi email
                successEmail = email;
            }
        } catch (err) {
            errors = { general: /** @type {any} */(err).message || 'Pendaftaran gagal. Coba lagi.' };
        } finally {
            processing = false;
        }
    }

    /** @param {any} e */
    function handleOverlayKey(e) { if (e.key === 'Escape') closeModal(); }
</script>



{#if open}
<!-- Google Confirm Sub-Modal -->
{#if showGooglePopup && pendingGoogleInfo}
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
            <h3>Daftar dengan Google?</h3>
            <p>Data dari akun berikut akan digunakan untuk mengisi formulir.</p>
            <div class="g-confirm-account">
                {#if pendingGoogleInfo.picture}
                    <img src={pendingGoogleInfo.picture} alt="" referrerpolicy="no-referrer" />
                {:else}
                    <div class="g-confirm-avatar-ph"></div>
                {/if}
                <div>
                    <span class="g-confirm-name">{pendingGoogleInfo.name}</span>
                    <span class="g-confirm-email">{pendingGoogleInfo.email}</span>
                </div>
            </div>
            <div class="g-confirm-btns">
                <button class="g-btn-cancel" onclick={() => { showGooglePopup = false; pendingGoogleInfo = null; }}>Batal</button>
                <button class="g-btn-ok" onclick={confirmGoogle}>Ya, Gunakan Akun Ini</button>
            </div>
        </div>
    </div>
{/if}

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="modal-overlay" onclick={closeModal} onkeydown={handleOverlayKey} role="presentation" transition:fade={{ duration:200 }}>
    <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
    <div class="modal-box" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="reg-modal-title" transition:scale={{ duration:250, start:0.96 }}>

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
                <div class="modal-left-headline">
                    Pasang Iklan <br/><span>Properti Gratis</span>
                </div>
                <div class="modal-left-desc">
                    Bergabung bersama ribuan agen profesional dan jangkau jutaan pencari properti di seluruh Indonesia.
                </div>
                <div class="modal-left-features">
                    <div class="lf-item"><span class="material-symbols-rounded">check_circle</span> Gratis tanpa biaya</div>
                    <div class="lf-item"><span class="material-symbols-rounded">check_circle</span> Jangkauan jutaan pembeli</div>
                    <div class="lf-item"><span class="material-symbols-rounded">check_circle</span> AI Property Analytics</div>
                    <div class="lf-item"><span class="material-symbols-rounded">check_circle</span> Dashboard agen profesional</div>
                </div>
                <!-- Decorative illustration -->
                <div class="modal-left-deco">
                    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="20" y="70" width="60" height="70" rx="4" fill="rgba(255,255,255,0.15)"/>
                        <rect x="30" y="55" width="40" height="20" rx="4" fill="rgba(255,255,255,0.1)"/>
                        <polygon points="50,35 80,55 20,55" fill="rgba(255,255,255,0.2)"/>
                        <rect x="90" y="50" width="80" height="90" rx="4" fill="rgba(255,255,255,0.15)"/>
                        <rect x="105" y="30" width="50" height="25" rx="4" fill="rgba(255,255,255,0.1)"/>
                        <polygon points="130,10 170,30 90,30" fill="rgba(255,255,255,0.2)"/>
                        <rect x="35" y="100" width="12" height="40" rx="2" fill="rgba(255,255,255,0.25)"/>
                        <rect x="53" y="100" width="12" height="40" rx="2" fill="rgba(255,255,255,0.25)"/>
                        <rect x="110" y="80" width="15" height="60" rx="2" fill="rgba(255,255,255,0.25)"/>
                        <rect x="135" y="80" width="15" height="60" rx="2" fill="rgba(255,255,255,0.25)"/>
                        <circle cx="160" cy="30" r="15" fill="rgba(255,220,80,0.3)" stroke="rgba(255,220,80,0.5)" stroke-width="2"/>
                        <circle cx="20" cy="20" r="8" fill="rgba(255,255,255,0.15)"/>
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
                <h2 id="reg-modal-title">Daftar Akun Baru</h2>
                <p class="modal-subtitle">Bergabunglah sebagai agen properti CerdasLiving</p>

                {#if errors.general}
                    <div class="form-alert">
                        <span class="material-symbols-rounded">error</span>
                        {errors.general}
                    </div>
                {/if}

                {#if successEmail}
                    <!-- Halaman sukses: cek email verifikasi -->
                    <div class="verify-success">
                        <div class="verify-icon">
                            <span class="material-symbols-rounded">mark_email_read</span>
                        </div>
                        <h3>Cek Email Anda!</h3>
                        <p>Link verifikasi telah dikirim ke:</p>
                        <div class="verify-email-box">{successEmail}</div>
                        <p class="verify-hint">Silakan buka email Anda dan klik link verifikasi untuk mengaktifkan akun. Periksa juga folder <strong>Spam</strong> jika email tidak ditemukan.</p>
                        <button type="button" class="btn-submit" onclick={closeModal}>
                            <span class="material-symbols-rounded">check_circle</span>
                            Mengerti
                        </button>
                    </div>
                {:else}
                <form onsubmit={submit}>
                    <!-- Google Section -->
                    {#if !usingGoogle}
                        {#if google_client_id}
                            <div id="g_id_signin_reg_modal" style="display:flex; justify-content:center; margin-bottom: 16px;"></div>
                            <div class="form-divider"><span>atau daftar dengan email</span></div>
                        {/if}
                    {:else}
                        <div class="google-badge">
                            <div class="google-badge-left">
                                {#if googlePic}
                                    <img src={googlePic} alt="" class="google-badge-pic" referrerpolicy="no-referrer"/>
                                {:else}
                                    <div class="google-badge-ph"><span class="material-symbols-rounded">person</span></div>
                                {/if}
                                <div>
                                    <div class="google-badge-lbl">
                                        <svg viewBox="0 0 16 16" width="12" height="12"><path fill="#4285F4" d="M15.04 8.17c0-.52-.05-1.02-.13-1.5H8v2.84h3.94c-.17.91-.69 1.68-1.47 2.2v1.85h2.38c1.39-1.28 2.19-3.16 2.19-5.39z"/><path fill="#34A853" d="M8 16c1.98 0 3.64-.66 4.85-1.78l-2.38-1.85c-.66.44-1.49.7-2.47.7-1.9 0-3.51-1.28-4.09-3.01H1.46v1.91C2.66 14.17 5.15 16 8 16z"/><path fill="#FBBC05" d="M3.91 9.06c-.15-.44-.23-.91-.23-1.4s.08-.96.23-1.4V4.35H1.46C.97 5.31.7 6.38.7 7.5s.27 2.19.76 3.15l2.45-1.59z"/><path fill="#EA4335" d="M8 3.18c1.07 0 2.03.37 2.79 1.09l2.09-2.09C11.64.97 9.98.18 8 .18 5.15.18 2.66 2 1.46 4.53l2.45 1.59C4.49 4.47 6.1 3.18 8 3.18z"/></svg>
                                        Terkoneksi Google
                                    </div>
                                    <div class="google-badge-email">{email}</div>
                                </div>
                            </div>
                            <button type="button" class="google-badge-x" onclick={cancelGoogle} aria-label="Hapus"><span class="material-symbols-rounded">close</span></button>
                        </div>
                    {/if}

                    <!-- Row 1: Nama Lengkap saja -->
                    <div class="form-group">
                        <label for="rm-nama">Nama Lengkap <span class="req">*</span></label>
                        <input id="rm-nama" type="text" placeholder="Nama lengkap Anda" bind:value={nama_lengkap} required class={errors.nama_lengkap ? 'err' : ''} />
                        {#if errors.nama_lengkap}<span class="err-msg">{errors.nama_lengkap}</span>{/if}
                    </div>

                    <!-- Email -->
                    <div class="form-group">
                        <label for="rm-email">Alamat Email <span class="req">*</span></label>
                        <div class="input-icon-wrap">
                            <span class="material-symbols-rounded i-ico">mail</span>
                            <input id="rm-email" type="email" placeholder="nama@email.com" bind:value={email} required disabled={usingGoogle} class="{errors.email ? 'err' : ''} {usingGoogle ? 'disabled' : ''} has-icon" />
                            {#if usingGoogle}<span class="verified-ico"><span class="material-symbols-rounded">verified</span></span>{/if}
                        </div>
                        {#if errors.email}<span class="err-msg">{errors.email}</span>{/if}
                    </div>

                    <!-- Telepon -->
                    <div class="form-group">
                        <label for="rm-telp">No. WhatsApp / Telepon <span class="req">*</span></label>
                        <div class="input-icon-wrap">
                            <span class="material-symbols-rounded i-ico">phone_iphone</span>
                            <input id="rm-telp" type="text" placeholder="Cth: 081234567890" bind:value={telepon} required class="{errors.telepon ? 'err' : ''} has-icon" />
                        </div>
                        {#if errors.telepon}<span class="err-msg">{errors.telepon}</span>{/if}
                    </div>

                    <!-- Password -->
                    {#if !usingGoogle}
                        <!-- Manual register: password wajib -->
                        <div class="form-group">
                            <label for="rm-pass">Kata Sandi <span class="req">*</span></label>
                            <div class="input-icon-wrap">
                                <span class="material-symbols-rounded i-ico">lock</span>
                                <input id="rm-pass" type={showPassword ? 'text' : 'password'} placeholder="Minimal 6 karakter" bind:value={password} required class="{errors.password ? 'err' : ''} has-icon has-right-ico" />
                                <button type="button" class="pass-eye" onclick={() => showPassword = !showPassword} aria-label="Tampilkan kata sandi">
                                    <span class="material-symbols-rounded">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                            {#if errors.password}<span class="err-msg">{errors.password}</span>{/if}
                        </div>
                    {:else}
                        <!-- Google register: password opsional untuk login via email juga -->
                        <div class="form-group">
                            <label for="rm-gpass">
                                Buat Kata Sandi <span class="req">*</span>
                                <span class="pass-hint-badge">Untuk login via email & password</span>
                            </label>
                            <div class="input-icon-wrap">
                                <span class="material-symbols-rounded i-ico">lock</span>
                                <input id="rm-gpass" type={showGooglePassword ? 'text' : 'password'} placeholder="Minimal 6 karakter" bind:value={googlePassword} class="{errors.password ? 'err' : ''} has-icon has-right-ico" />
                                <button type="button" class="pass-eye" onclick={() => showGooglePassword = !showGooglePassword} aria-label="Tampilkan kata sandi">
                                    <span class="material-symbols-rounded">{showGooglePassword ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                            <span class="pass-privacy-note"><span class="material-symbols-rounded" style="font-size:13px">security</span> Ini memungkinkan Anda login dengan email & password tanpa Google.</span>
                            {#if errors.password}<span class="err-msg">{errors.password}</span>{/if}
                        </div>
                    {/if}

                    <!-- Foto Profil -->
                    <div class="form-group">
                        <label for="rm-photo">Foto Profil {#if !usingGoogle || !googlePic}<span class="req">*</span>{/if}</label>
                        <div class="photo-row">
                            <div class="photo-preview">
                                {#if photoPreview}
                                    <img src={photoPreview} alt="Preview" />
                                {:else if usingGoogle && googlePic}
                                    <img src={googlePic} alt="Google" referrerpolicy="no-referrer" />
                                {:else}
                                    <span class="material-symbols-rounded">person_add</span>
                                {/if}
                            </div>
                            <label class="photo-btn">
                                <span class="material-symbols-rounded">cloud_upload</span>
                                {photo ? photo.name.substring(0, 20) + '...' : 'Pilih Foto'}
                                <input type="file" accept="image/jpeg,image/png,image/jpg" onchange={handlePhotoChange} style="display:none" />
                            </label>
                            {#if usingGoogle && googlePic && !photoPreview}
                                <span class="photo-hint">Foto Google digunakan</span>
                            {:else}
                                <span class="photo-hint">JPG/PNG maks 5MB</span>
                            {/if}
                        </div>
                        {#if errors.photo}<span class="err-msg">{errors.photo}</span>{/if}
                    </div>

                    <!-- Submit -->
                    <button type="submit" class="btn-submit" disabled={processing}>
                        {#if processing}
                            <span class="material-symbols-rounded spin">refresh</span> Menyimpan...
                        {:else if usingGoogle}
                            Daftar Sekarang &amp; Pasang Iklan
                            <span class="material-symbols-rounded">arrow_forward</span>
                        {:else}
                            <span class="material-symbols-rounded">mark_email_read</span>
                            Kirim Email Verifikasi
                        {/if}
                    </button>

                    <p class="login-cta">
                        Sudah punya akun?
                        <button type="button" class="link-btn" onclick={() => { closeModal(); onSwitchToLogin?.(); }}>Masuk sekarang</button>
                    </p>
                    <p class="tos-note">Dengan mendaftar, Anda menyetujui <a href={url('/syarat-ketentuan')} target="_blank">Syarat &amp; Ketentuan</a> CerdasLiving.</p>
                </form>
                {/if}
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
    .g-confirm-account img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; flex-shrink:0; }
    .g-confirm-avatar-ph { width:40px; height:40px; border-radius:50%; background:#e8eaed; flex-shrink:0; }
    .g-confirm-account div { display: flex; flex-direction: column; gap: 2px; min-width:0; }
    .g-confirm-name  { font-size: 0.88rem; font-weight: 600; color: #1a1a1a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .g-confirm-email { font-size: 0.76rem; color: #6B6B6B; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .g-confirm-btns  { display: flex; gap: 10px; }
    .g-btn-cancel {
        flex:1; padding: 10px; border: 1.5px solid #E8E0D0; border-radius: 10px;
        background: #fff; color: #6B6B6B; font-size: 0.86rem; font-weight: 600; cursor: pointer;
        font-family: inherit; transition: all 0.2s;
    }
    .g-btn-cancel:hover { background: #f5f5f5; }
    .g-btn-ok {
        flex:2; padding: 10px; border: none; border-radius: 10px;
        background: linear-gradient(135deg, #C9A84C, #E0B850);
        color: white; font-size: 0.86rem; font-weight: 700; cursor: pointer;
        font-family: inherit; transition: all 0.2s;
        box-shadow: 0 4px 12px rgba(201,168,76,0.35);
    }
    .g-btn-ok:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(201,168,76,0.45); }

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
        width: 100%; max-width: 840px;
        max-height: 92vh;
        background: #fff;
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 32px 80px rgba(26,22,17,0.30), 0 8px 24px rgba(26,22,17,0.12);
        position: relative;
    }

    /* ─── Left Decorative Panel ─── */
    .modal-left {
        width: 300px; flex-shrink: 0;
        background: linear-gradient(155deg, #1A1611 0%, #3D2B1A 40%, #C0553A 75%, #C9A84C 100%);
        position: relative;
        display: flex; flex-direction: column;
    }

    .modal-left-inner {
        padding: 32px 28px;
        display: flex; flex-direction: column;
        height: 100%;
        position: relative; z-index: 2;
    }

    .modal-brand {
        display: flex; align-items: center; gap: 10px;
        text-decoration: none; margin-bottom: 32px;
    }

    .modal-logo {
        width: 52px; height: 52px; object-fit: contain;
        background: rgba(255,255,255,0.15);
        border-radius: 12px; padding: 4px;
    }

    .modal-brand-name {
        font-family: 'Playfair Display', serif;
        font-size: 1.2rem; font-weight: 800;
        color: #fff; line-height: 1.1;
    }

    .modal-brand-tag {
        font-size: 0.65rem; font-weight: 700;
        color: rgba(255,255,255,0.7);
        text-transform: uppercase; letter-spacing: 1px;
    }

    .modal-left-headline {
        font-size: 1.6rem; font-weight: 800;
        color: #fff; line-height: 1.2; margin-bottom: 12px;
    }

    .modal-left-headline span { color: #FFD66B; }

    .modal-left-desc {
        font-size: 0.82rem; color: rgba(255,255,255,0.8);
        line-height: 1.6; margin-bottom: 24px;
    }

    .modal-left-features { display: flex; flex-direction: column; gap: 10px; }

    .lf-item {
        display: flex; align-items: center; gap: 8px;
        font-size: 0.82rem; color: rgba(255,255,255,0.9); font-weight: 500;
    }

    .lf-item .material-symbols-rounded { font-size: 18px; color: #FFD66B; flex-shrink: 0; }

    .modal-left-deco {
        margin-top: auto; opacity: 0.5;
        display: flex; justify-content: center;
    }

    /* ─── Right Form Panel ─── */
    .modal-right {
        flex: 1; overflow-y: auto;
        display: flex; flex-direction: column;
        position: relative;
        background: #fff;
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
        padding: 32px 36px 32px;
        display: flex; flex-direction: column; gap: 0;
        flex: 1;
    }

    .modal-form-wrap h2 {
        font-size: 1.5rem; font-weight: 800; color: #1a1611;
        margin: 0 0 4px;
        font-family: 'Playfair Display', serif;
    }

    .modal-subtitle { font-size: 0.84rem; color: #9c9080; margin: 0 0 20px; }

    .form-alert {
        display: flex; align-items: center; gap: 8px;
        background: #FEF2F2; border: 1px solid #FECACA; color: #B91C1C;
        border-radius: 10px; padding: 10px 14px;
        font-size: 0.83rem; font-weight: 500; margin-bottom: 16px;
    }
    .form-alert .material-symbols-rounded { font-size: 18px; flex-shrink: 0; }

    /* Google button CSS removed (unused) */

    .form-divider {
        display: flex; align-items: center; gap: 12px;
        margin-bottom: 16px;
    }
    .form-divider::before,.form-divider::after { content:''; flex:1; height:1px; background:#ebe8e1; }
    .form-divider span { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 600; white-space: nowrap; }

    /* Google badge */
    .google-badge {
        display: flex; align-items: center; justify-content: space-between;
        gap: 12px; background: rgba(201,168,76,0.07);
        border: 1.5px solid rgba(201,168,76,0.28); border-radius: 12px;
        padding: 10px 14px; margin-bottom: 16px;
    }
    .google-badge-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
    .google-badge-pic { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
    .google-badge-ph {
        width: 36px; height: 36px; border-radius: 50%; background: #F5E6BE;
        display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .google-badge-ph .material-symbols-rounded { font-size: 18px; color: #C9A84C; }
    .google-badge-lbl {
        display: flex; align-items: center; gap: 4px;
        font-size: 0.75rem; font-weight: 700; color: #9C6914;
    }
    .google-badge-email { font-size: 0.78rem; color: #7A5010; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .google-badge-x {
        background: none; border: 1px solid rgba(201,168,76,0.25); border-radius: 8px;
        width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
        cursor: pointer; color: #C9A84C; transition: all 0.2s; flex-shrink: 0;
    }
    .google-badge-x:hover { background: rgba(192,85,58,0.08); border-color: rgba(192,85,58,0.3); color: #C0553A; }
    .google-badge-x .material-symbols-rounded { font-size: 14px; }

    /* Form */
    .form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; }
    .form-group label { font-size: 0.78rem; font-weight: 600; color: #4A4A4A; }
    .req { color: #ef4444; }

    .form-group input {
        width: 100%; padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px;
        font-family: inherit; font-size: 0.88rem; color: #1e293b; background: #fff;
        outline: none; transition: all 0.2s; box-sizing: border-box;
    }
    .form-group input:focus { border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(201,168,76,0.12); }
    .form-group input.err { border-color: #ef4444; }
    .form-group input.disabled { background: #f8f8f8; color: #6B6B6B; cursor: not-allowed; }

    .input-icon-wrap { position: relative; }
    .i-ico {
        position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
        font-size: 17px; color: #B8A882; pointer-events: none;
    }
    .input-icon-wrap input.has-icon { padding-left: 38px; }
    .input-icon-wrap input.has-right-ico { padding-right: 40px; }
    .verified-ico { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: #10b981; }
    .verified-ico .material-symbols-rounded { font-size: 17px; }

    .pass-eye {
        position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
        background: none; border: none; cursor: pointer; color: #B8A882; padding: 4px;
    }
    .pass-eye:hover { color: #1a1611; }
    .pass-eye .material-symbols-rounded { font-size: 17px; }

    .err-msg { font-size: 0.75rem; color: #dc2626; font-weight: 500; }

    /* Photo */
    .photo-row { display: flex; align-items: center; gap: 14px; }
    .photo-preview {
        width: 58px; height: 58px; border-radius: 50%; border: 2px dashed #cbd5e1;
        display: flex; align-items: center; justify-content: center;
        overflow: hidden; background: #f8fafc; flex-shrink: 0;
    }
    .photo-preview img { width: 100%; height: 100%; object-fit: cover; }
    .photo-preview .material-symbols-rounded { font-size: 1.5rem; color: #94a3b8; }
    .photo-btn {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 8px 14px; border-radius: 10px; cursor: pointer;
        background: #f1f5f9; border: 1.5px solid #e2e8f0;
        color: #475569; font-size: 0.78rem; font-weight: 600;
        transition: all 0.2s; font-family: inherit; white-space: nowrap;
    }
    .photo-btn:hover { background: #e2e8f0; }
    .photo-btn .material-symbols-rounded { font-size: 16px; }
    .photo-hint { font-size: 0.7rem; color: #94a3b8; }

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

    .login-cta {
        text-align: center; font-size: 0.84rem; color: #64748b; margin-top: 14px; margin-bottom: 4px;
    }
    .link-btn {
        background: none; border: none; cursor: pointer;
        color: #C9A84C; font-size: 0.84rem; font-weight: 700;
        font-family: inherit; padding: 0;
    }
    .link-btn:hover { text-decoration: underline; }

    .tos-note {
        text-align: center; font-size: 0.72rem; color: #94a3b8;
        line-height: 1.5; margin: 0;
    }
    .tos-note a { color: #C9A84C; text-decoration: none; font-weight: 600; }
    .tos-note a:hover { text-decoration: underline; }

    @keyframes spin { to { transform: rotate(360deg); } }
    .spin { animation: spin 0.9s linear infinite; }

    /* Password hint elements */
    .form-group label { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    .pass-hint-badge {
        display: inline-block;
        background: rgba(201,168,76,0.12); border: 1px solid rgba(201,168,76,0.3);
        color: #9C6914; font-size: 0.67rem; font-weight: 600;
        padding: 2px 7px; border-radius: 999px; text-transform: none; letter-spacing: 0;
    }
    .pass-privacy-note {
        display: flex; align-items: center; gap: 4px;
        font-size: 0.72rem; color: #7c6b4e; background: rgba(201,168,76,0.06);
        border: 1px solid rgba(201,168,76,0.18); border-radius: 8px;
        padding: 6px 10px; margin-top: 4px;
    }
    .pass-privacy-note .material-symbols-rounded { color: #C9A84C; flex-shrink: 0; }

    /* Email Verification Success Screen */
    .verify-success {
        display: flex; flex-direction: column; align-items: center;
        text-align: center; padding: 20px 8px; gap: 12px;
    }
    .verify-icon {
        width: 70px; height: 70px; border-radius: 50%;
        background: linear-gradient(135deg, rgba(201,168,76,0.15), rgba(224,184,80,0.2));
        border: 2px solid rgba(201,168,76,0.3);
        display: flex; align-items: center; justify-content: center;
    }
    .verify-icon .material-symbols-rounded {
        font-size: 34px; color: #C9A84C;
    }
    .verify-success h3 { font-size: 1.2rem; font-weight: 800; color: #1a1611; margin: 0; }
    .verify-success p { font-size: 0.84rem; color: #64748b; margin: 0; }
    .verify-email-box {
        background: #f8f5ee; border: 1.5px solid #e2d5b5; border-radius: 10px;
        padding: 8px 18px; font-size: 0.88rem; font-weight: 700; color: #1a1611;
    }
    .verify-hint {
        font-size: 0.8rem !important; color: #9c9080 !important;
        line-height: 1.5; max-width: 300px;
    }

    /* Responsive */
    @media (max-width: 700px) {
        .modal-left { display: none; }
        .modal-form-wrap { padding: 24px 20px 28px; }
    }
</style>
