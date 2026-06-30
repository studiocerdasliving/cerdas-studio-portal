<script>
    let studioUrl = import.meta.env.VITE_STUDIODESIGN_URL || 'https://studio.cerdasliving.com';
  import { navigate } from 'svelte-routing'
  import { url } from '../lib/url.svelte.js'
  import { logout, user } from '../lib/stores/auth.js'

  let {
    title = 'Studio Hub',
    children,
  } = $props()

  let sidebarOpen = $state(false)

  const userName = $derived($user?.name || $user?.nama || $user?.username || 'Team Development')
  const userRole = $derived($user?.role || $user?.akses_level || 'Studio Pro')
  const userInitials = $derived(
    userName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'CL'
  )

  const primaryMenu = [
    { href: '/studio/hub', icon: 'space_dashboard', label: 'Dashboard', external: false },
    { href: '/studio/proyek', icon: 'folder_open', label: 'Proyek Saya', external: false },
    { href: studioUrl + '/', icon: 'grid_view', label: 'Template Design', external: true },
    { href: studioUrl + '/', icon: 'calculate', label: 'Estimasi Biaya', external: true },
    { href: studioUrl + '/', icon: 'person_search', label: 'Cari Designer', external: true },
    { href: studioUrl + '/', icon: 'engineering', label: 'Cari Kontraktor', external: true },
    { href: studioUrl + '/', icon: 'inventory_2', label: 'Asset Library', external: true },
    { href: '/studio/upload', icon: 'cloud_upload', label: 'Upload Asset', external: false },
    { href: studioUrl + '/', icon: 'movie', label: 'Render', external: true },
  ]

  const secondaryMenu = [
    { href: '/studio/profil', icon: 'account_circle', label: 'Profil Saya' },
    { href: '/studio/profil', icon: 'settings', label: 'Pengaturan' },
    { href: '/kontak', icon: 'help', label: 'Bantuan' },
  ]

  function isActive(href) {
    if (typeof window === 'undefined') return false
    const path = window.location.pathname
    if (href === '/studio/hub') return path === href
    return path.startsWith(href)
  }

  async function handleLogout(event) {
    event.preventDefault()
    await logout()
    window.location.href = 'http://localhost:5173/'
  }

  function closeSidebar() {
    sidebarOpen = false
  }
</script>

<svelte:head>
  <title>{title} - CerdasLiving Studio</title>
</svelte:head>

{#if sidebarOpen}
  <button
    class="studio-shell-overlay"
    type="button"
    aria-label="Tutup menu"
    onclick={closeSidebar}
  ></button>
{/if}

<div class="studio-shell">
  <aside class:open={sidebarOpen} class="studio-sidebar">
    <div class="brand-block">
      <a href={url('/')} class="brand-link" onclick={closeSidebar}>
        <img src={url('/images/logo-new.png')} alt="CerdasLiving" class="brand-logo" />
        <div class="brand-copy">
          <strong>CerdasLiving</strong>
          <span>Studio</span>
        </div>
      </a>
    </div>

    <nav class="sidebar-nav">
      <div class="sidebar-group">
        {#each primaryMenu as item}
          {#if item.external}
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              class="sidebar-link"
              onclick={closeSidebar}
            >
              <span class="material-symbols-rounded sidebar-link-icon">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          {:else}
            <a
              href={url(item.href)}
              class:active={isActive(item.href)}
              class="sidebar-link"
              onclick={closeSidebar}
            >
              <span class="material-symbols-rounded sidebar-link-icon">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          {/if}
        {/each}
      </div>

      <div class="sidebar-spacer"></div>

      <div class="sidebar-group sidebar-group-secondary">
        {#each secondaryMenu as item}
          <a
            href={url(item.href)}
            class:active={isActive(item.href)}
            class="sidebar-link secondary"
            onclick={closeSidebar}
          >
            <span class="material-symbols-rounded sidebar-link-icon">{item.icon}</span>
            <span>{item.label}</span>
          </a>
        {/each}

        <a href="/" class="sidebar-link sidebar-link-danger" onclick={handleLogout}>
          <span class="material-symbols-rounded sidebar-link-icon">logout</span>
          <span>Keluar</span>
        </a>
      </div>
    </nav>
  </aside>

  <div class="studio-main">


    <main class="studio-content">
      {@render children()}
    </main>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    min-height: 100vh;
    background:
      radial-gradient(circle at top left, rgba(201, 168, 76, 0.12), transparent 30%),
      linear-gradient(180deg, #fffdfa 0%, #f8f3ea 100%);
    color: #171717;
  }

  .studio-shell {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 240px minmax(0, 1fr);
  }

  .studio-shell-overlay {
    position: fixed;
    inset: 0;
    z-index: 39;
    border: 0;
    background: rgba(39, 30, 12, 0.28);
  }

  .studio-sidebar {
    position: sticky;
    top: 0;
    height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 16px 12px 16px;
    background: rgba(255, 255, 255, 0.92);
    border-right: 1px solid rgba(210, 198, 181, 0.6);
    box-shadow: 18px 0 48px rgba(82, 60, 25, 0.05);
    backdrop-filter: blur(24px);
    z-index: 40;
  }

  .brand-block {
    padding: 2px 2px 16px;
  }

  .brand-link {
    display: flex;
    align-items: center;
    gap: 9px;
    text-decoration: none;
    color: inherit;
  }

  .brand-logo {
    width: 34px;
    height: 34px;
    object-fit: contain;
    border-radius: 11px;
    box-shadow: 0 4px 14px rgba(201, 168, 76, 0.12);
  }

  .brand-copy {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .brand-copy strong {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 0.82rem;
    line-height: 1.1;
    letter-spacing: -0.03em;
  }

  .brand-copy span {
    color: #777065;
    font-size: 0.74rem;
    font-weight: 500;
  }

  .sidebar-nav {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
  }

  .sidebar-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .sidebar-spacer {
    flex: 1;
    min-height: 16px;
  }

  .sidebar-group-secondary {
    padding-top: 12px;
    border-top: 1px solid rgba(222, 212, 196, 0.8);
  }

  .sidebar-link {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 42px;
    padding: 9px 12px;
    border: 1px solid transparent;
    border-radius: 13px;
    color: #5f5b53;
    text-decoration: none;
    font-size: 0.84rem;
    font-weight: 500;
    transition:
      border-color 0.2s ease,
      background-color 0.2s ease,
      color 0.2s ease,
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }

  .sidebar-link:hover {
    color: #161616;
    background: rgba(255, 248, 234, 0.72);
    border-color: rgba(214, 190, 144, 0.38);
    transform: translateX(2px);
  }

  .sidebar-link.active {
    color: #946c1e;
    background: linear-gradient(180deg, #fff8ea 0%, #fff2d8 100%);
    border-color: rgba(214, 190, 144, 0.82);
    box-shadow: 0 10px 26px rgba(201, 168, 76, 0.12);
  }

  .sidebar-link.secondary {
    font-size: 0.82rem;
  }

  .sidebar-link-danger {
    color: #dc5f45;
    background: linear-gradient(180deg, rgba(255, 241, 238, 0.95) 0%, rgba(255, 248, 246, 0.95) 100%);
  }

  .sidebar-link-danger:hover {
    color: #b4432e;
    border-color: rgba(220, 95, 69, 0.24);
    background: rgba(255, 241, 238, 1);
  }

  .sidebar-link-icon {
    font-size: 1rem;
    color: inherit;
    font-variation-settings: 'FILL' 0, 'wght' 450;
  }

  .studio-main {
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .studio-topbar {
    position: sticky;
    top: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 24px 8px;
    background: transparent;
  }

  .topbar-left,
  .topbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .topbar-menu {
    display: none;
    width: 38px;
    height: 38px;
    border: 1px solid rgba(212, 201, 185, 0.8);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.88);
    color: #2a2723;
    cursor: pointer;
  }

  .topbar-menu .material-symbols-rounded {
    font-size: 1.2rem;
  }

  .icon-badge {
    position: relative;
    width: 36px;
    height: 36px;
    border: 0;
    border-radius: 12px;
    background: transparent;
    color: #272727;
    cursor: pointer;
  }

  .icon-badge .material-symbols-rounded {
    font-size: 1.15rem;
  }

  .icon-badge-count {
    position: absolute;
    top: 4px;
    right: 4px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #ef4444;
    color: #fff;
    font-size: 0.64rem;
    font-weight: 700;
  }

  .user-pill {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 4px 8px 4px 4px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.84);
    color: inherit;
    text-decoration: none;
    box-shadow: 0 10px 26px rgba(82, 60, 25, 0.08);
    border: 1px solid rgba(224, 215, 201, 0.84);
  }

  .user-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #1c1c1c 0%, #615237 100%);
    color: #fff;
    font-weight: 700;
    letter-spacing: 0.04em;
  }
  
  .user-avatar-img {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    object-fit: cover;
  }

  .user-copy {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .user-copy strong {
    font-size: 0.84rem;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-copy span {
    color: #b18125;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .user-pill-caret {
    color: #59544b;
    font-size: 1.2rem;
  }

  .studio-content {
    padding: 6px 20px 24px;
  }

  .studio-content :global(.hub-page) {
    max-width: 1180px;
    margin: 0 auto;
  }

  @media (max-width: 1220px) {
    .studio-shell {
      grid-template-columns: 220px minmax(0, 1fr);
    }

    .studio-topbar,
    .studio-content {
      padding-left: 16px;
      padding-right: 16px;
    }
  }

  @media (max-width: 1024px) {
    .studio-shell {
      display: block;
    }

    .studio-sidebar {
      position: fixed;
      inset: 0 auto 0 0;
      width: min(82vw, 312px);
      transform: translateX(-100%);
      transition: transform 0.28s ease;
    }

    .studio-sidebar.open {
      transform: translateX(0);
    }

    .topbar-menu {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  }

  @media (max-width: 720px) {
    .studio-topbar {
      padding: 16px 16px 8px;
    }

    .studio-content {
      padding: 8px 16px 22px;
    }

    .topbar-right {
      gap: 10px;
    }

    .user-pill {
      gap: 10px;
      padding-right: 8px;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      font-size: 0.82rem;
    }

    .user-copy strong {
      max-width: 116px;
      font-size: 0.92rem;
    }

    .user-copy span {
      font-size: 0.78rem;
    }
  }

  @media (max-width: 520px) {
    .icon-badge {
      width: 38px;
      height: 38px;
    }

    .user-pill {
      min-width: 0;
    }

    .user-copy {
      display: none;
    }

    .user-pill-caret {
      display: none;
    }
  }
</style>
