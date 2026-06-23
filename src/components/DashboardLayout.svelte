<script>
  import { Link, navigate  } from 'svelte-routing'
  import { url, propertyImg } from '../lib/url.svelte.js'
  import { logout } from '../lib/stores/auth.js'

  function handleLogout(e) {
      e.preventDefault();
      logout();
      navigate('/');
  }

  let {
    title = 'Dashboard',
    portalName = 'Portal Cerdas Living',
    menuItems = [
      { href: '/profile', icon: 'person', label: 'Profil Saya' }
    ],
    children,
  } = $props()

  let sidebarOpen = $state(false)

  function isActive(href) {
    if (typeof window === 'undefined') return false
    const path = window.location.pathname
    if (href === '/') return path === href
    return path.startsWith(href)
  }
</script>

<svelte:head>
  <title>{title} — {portalName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700;800&display=swap" rel="stylesheet" />
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
</svelte:head>

<!-- Overlay mobile -->
{#if sidebarOpen}
  <div
    class="sidebar-overlay"
    role="button"
    tabindex="-1"
    onclick={() => sidebarOpen = false}
    onkeydown={() => {}}
    aria-label="Tutup sidebar"
  ></div>
{/if}

<div class="agent-layout">
  <!-- ═══════════════ SIDEBAR ═══════════════ -->
  <aside class="agent-sidebar {sidebarOpen ? 'open' : ''}">
    <!-- Logo -->
    <div class="sidebar-logo">
      <a href={url('/')} class="logo-link">
        <img
          src={url('/images/logo-new.png')}
          alt="CerdasLiving"
          class="sidebar-logo-img"
        />
        <div class="logo-text">
          <div class="logo-title">CerdasLiving</div>
          <div class="logo-sub">Smart Property, Better Living</div>
        </div>
      </a>
    </div>

    <!-- Navigasi -->
    <nav class="sidebar-nav">
      {#each menuItems as item}
        <a
          href={url(item.href)}
          class="nav-item {isActive(item.href) ? 'active' : ''}"
          onclick={() => sidebarOpen = false}
        >
          <span class="material-symbols-rounded nav-icon">{item.icon}</span>
          <span class="nav-label">{item.label}</span>
          {#if isActive(item.href)}
            <div class="nav-active-dot"></div>
          {/if}
        </a>
      {/each}
    </nav>

    <!-- Divider -->
    <div class="sidebar-divider"></div>

    <div class="sidebar-bottom">
      <a href={url('/')} class="nav-item nav-item-muted">
        <span class="material-symbols-rounded nav-icon">home</span>
        <span class="nav-label">Kembali ke Beranda</span>
      </a>
      <a href="#" onclick={handleLogout} class="nav-item nav-item-logout">
        <span class="material-symbols-rounded nav-icon">logout</span>
        <span class="nav-label">Keluar</span>
      </a>
    </div>
  </aside>

  <!-- ═══════════════ KONTEN UTAMA ═══════════════ -->
  <div class="agent-main">
    <!-- Header -->
    <header class="agent-header">
      <div class="header-left">
        <button
          class="sidebar-toggle"
          onclick={() => sidebarOpen = !sidebarOpen}
          aria-label="Toggle sidebar"
        >
          <span class="material-symbols-rounded">menu</span>
        </button>
        <div class="header-title">{title}</div>
      </div>
      <div class="header-right">
        <a href={url('/profile')} class="header-avatar" title="Profil Saya">
          <span class="material-symbols-rounded">person</span>
        </a>
      </div>
    </header>

    <!-- Konten halaman -->
    <main class="agent-content">
      {@render children()}
    </main>
  </div>
</div>

<style>
  :global(*) { box-sizing: border-box; }
  :global(body) {
    margin: 0;
    font-family: 'Inter', sans-serif;
    background: #FAF8F5;
    color: #1A1A1A;
  }

  /* ─── Layout ──────────────────────────── */
  .agent-layout {
    display: flex;
    min-height: 100vh;
    background: #FAF8F5;
  }

  /* ─── Sidebar ─────────────────────────── */
  .agent-sidebar {
    width: 260px;
    background: #ffffff;
    border-right: 1px solid #E8E0D0;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 100;
    box-shadow: 2px 0 12px rgba(0,0,0,0.06);
    transition: transform 0.3s ease;
  }

  .sidebar-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.35);
    z-index: 99;
    cursor: pointer;
  }

  /* ─── Logo ───────────────────────────── */
  .sidebar-logo {
    padding: 18px 16px 16px;
    border-bottom: 1px solid #F0E8D8;
  }
  .logo-link {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
  }
  .sidebar-logo-img {
    width: 52px;
    height: 52px;
    object-fit: contain;
    mix-blend-mode: multiply;
    flex-shrink: 0;
  }
  .logo-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.05rem;
    font-weight: 800;
    color: #1A1A1A;
    line-height: 1.2;
    letter-spacing: -0.2px;
  }
  .logo-sub {
    font-size: 0.65rem;
    color: #C9A84C;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
  }

  /* ─── Nav ────────────────────────────── */
  .sidebar-nav {
    flex: 1;
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow-y: auto;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-radius: 12px;
    text-decoration: none;
    color: #6B6B6B;
    font-size: 0.88rem;
    font-weight: 500;
    transition: all 0.2s ease;
    position: relative;
    cursor: pointer;
  }
  .nav-item:hover {
    background: #FAF8F5;
    color: #1A1A1A;
  }
  .nav-item.active {
    background: linear-gradient(135deg, #FDF6E4, #FBF0CC);
    color: #8B6914;
    font-weight: 600;
    border: 1px solid #E8C87A;
  }
  .nav-icon {
    font-size: 20px;
    font-variation-settings: 'FILL' 0, 'wght' 400;
    flex-shrink: 0;
  }
  .nav-item.active .nav-icon {
    font-variation-settings: 'FILL' 1, 'wght' 500;
    color: #C9A84C;
  }
  .nav-active-dot {
    width: 6px;
    height: 6px;
    background: #C9A84C;
    border-radius: 50%;
    margin-left: auto;
  }

  .sidebar-divider {
    height: 1px;
    background: #F0E8D8;
    margin: 0 16px;
  }

  .sidebar-bottom {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .nav-item-muted { color: #9CA3AF; font-size: 0.84rem; }
  .nav-item-muted:hover { color: #6B6B6B; }

  .nav-item-logout { color: #DC2626; }
  .nav-item-logout:hover { background: #FEF2F2; color: #B91C1C; }

  /* ─── Main ───────────────────────────── */
  .agent-main {
    flex: 1;
    margin-left: 260px;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  /* ─── Header ─────────────────────────── */
  .agent-header {
    background: #ffffff;
    border-bottom: 1px solid #E8E0D0;
    padding: 0 28px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 50;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  }
  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .sidebar-toggle {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 6px;
    border-radius: 8px;
    color: #6B6B6B;
    transition: background 0.2s;
  }
  .sidebar-toggle:hover { background: #FAF8F5; }
  .sidebar-toggle .material-symbols-rounded { font-size: 22px; }

  .header-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.05rem;
    font-weight: 700;
    color: #1A1A1A;
  }
  .header-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .header-avatar {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    color: #6B6B6B;
    transition: all 0.2s;
    background: #FAF8F5;
    border: 1px solid #E8E0D0;
  }
  .header-avatar:hover {
    background: #FDF6E4;
    color: #8B6914;
    border-color: #E8C87A;
  }
  .header-avatar .material-symbols-rounded { font-size: 18px; }

  /* ─── Content ────────────────────────── */
  .agent-content {
    padding: 28px;
    flex: 1;
  }

  /* ─── Responsive ─────────────────────── */
  @media (max-width: 1024px) {
    .agent-sidebar {
      transform: translateX(-100%);
    }
    .agent-sidebar.open {
      transform: translateX(0);
    }
    .sidebar-overlay {
      display: block;
    }
    .agent-main {
      margin-left: 0;
    }
    .sidebar-toggle {
      display: flex;
    }
    .agent-content {
      padding: 20px 16px;
    }
  }

  @media (max-width: 640px) {
    .agent-header {
      padding: 0 16px;
    }
  }
</style>
