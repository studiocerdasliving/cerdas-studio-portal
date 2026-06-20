<script>
  import Layout from '../../components/Layout.svelte'
  import { apiFetch } from '../../lib/api.js'
  import { Link, navigate } from 'svelte-routing'
  import { url } from '../../lib/url.svelte.js'
  import fpPromise from '@fingerprintjs/fingerprintjs';

  let name = $state('');
  let email = $state('');
  let whatsapp = $state('');
  let password = $state('');

  let isLoading = $state(false);
  let errorMsg = $state('');
  let successMsg = $state('');

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

  /** @param {Event} e */
  async function handleRegister(e) {
    e.preventDefault();
    isLoading = true;
    errorMsg = '';
    successMsg = '';
    
    try {
      const fp_hash = await getFpHash();
      await apiFetch('/agent/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, whatsapp, password, fp_hash })
      });
      successMsg = 'Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.';
      name = ''; email = ''; whatsapp = ''; password = '';
    } catch(error) {
      const err = /** @type {any} */ (error);
      errorMsg = err.message || 'Pendaftaran gagal';
    } finally {
      isLoading = false;
    }
  }
</script>

<Layout title="Pasang Iklan & Daftar Agen">
  <div class="container" style="padding: 60px 0; max-width: 500px;">
    <div class="card" style="padding: 40px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <span class="material-symbols-rounded" style="font-size: 3rem; color: var(--gold);">real_estate_agent</span>
        <h1 style="font-family: 'Playfair Display', serif; font-size: 1.8rem; color: var(--text-1); margin-top: 16px;">Gabung & Pasang Iklan</h1>
        <p style="color: var(--text-3); font-size: 0.9rem;">Daftar sebagai agen/staff dan pasarkan properti Anda ke jutaan pengunjung.</p>
      </div>

      <form onsubmit={handleRegister}>
        {#if errorMsg}
          <div style="background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 12px 16px; border-radius: var(--radius); margin-bottom: 24px; font-size: 0.9rem;">
            {errorMsg}
          </div>
        {/if}
        {#if successMsg}
          <div style="background: rgba(34, 197, 94, 0.1); color: #22c55e; padding: 12px 16px; border-radius: var(--radius); margin-bottom: 24px; font-size: 0.9rem;">
            {successMsg}
          </div>
        {/if}

        <div class="form-group" style="margin-bottom: 20px;">
          <label class="form-label" for="name">Nama Lengkap</label>
          <input class="form-input" id="name" type="text" bind:value={name} required placeholder="Misal: Budi Santoso" />
        </div>

        <div class="form-group" style="margin-bottom: 20px;">
          <label class="form-label" for="email">Email Aktif</label>
          <input class="form-input" id="email" type="email" bind:value={email} required placeholder="budi@example.com" />
        </div>

        <div class="form-group" style="margin-bottom: 20px;">
          <label class="form-label" for="wa">Nomor WhatsApp</label>
          <input class="form-input" id="wa" type="text" bind:value={whatsapp} required placeholder="628123456789" />
          <div style="font-size: 0.75rem; color: var(--text-3); margin-top: 4px;">Gunakan kode negara (misal 62)</div>
        </div>

        <div class="form-group" style="margin-bottom: 32px;">
          <label class="form-label" for="pass">Kata Sandi</label>
          <input class="form-input" id="pass" type="password" bind:value={password} required placeholder="Minimal 6 karakter" minlength="6" />
        </div>

        <button type="submit" class="btn btn-gold btn-full" disabled={isLoading}>
          {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
        </button>

        <div style="text-align: center; margin-top: 24px; font-size: 0.9rem; color: var(--text-2);">
          Sudah punya akun? <Link to={url('/agent/login')} style="color: var(--gold); font-weight: 600;">Login di sini</Link>
        </div>
      </form>
    </div>
  </div>
</Layout>
