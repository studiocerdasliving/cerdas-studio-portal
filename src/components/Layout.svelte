<script>
    import { Link, navigate } from 'svelte-routing';
    import { user } from '../lib/stores/auth.js';
    import { apiFetch } from '../lib/api.js';
    import { onMount } from "svelte";
    import { url } from "../lib/url.svelte.js";
    import RegisterModal from "./RegisterModal.svelte";
    import LoginModal from "./LoginModal.svelte";

    let {
        children,
        title = "Cerdas Living",
        description = "",
        keywords = "",
        ogImage = "",
        ogType = "website",
        forceLoginOpen = false,
        forceRegisterOpen = false
    } = $props();

    let auth = $derived({ user: $user });
    let googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    let userAksesLevel = $derived($user?.akses_level || '');

    let scrolled = $state(false);
    let mobileOpen = $state(false);
    let activeMenu = $state(null);
    /** @type {ReturnType<typeof setTimeout> | null} */
    let hideTimeout = $state(null);

    // Modal state
    let showRegisterModal = $state(forceRegisterOpen);
    let showLoginModal    = $state(forceLoginOpen);
    let intendedRoute     = $state(null);

    let siteConfig = $state({
        namaweb: 'CerdasLiving',
        deskripsi: 'Portal Properti & Lifestyle Premium Indonesia',
        telepon: '',
        email: '',
        alamat: ''
    });

    function openRegister() { showLoginModal = false; showRegisterModal = true; }
    /** @param {string | null | Event} route */
    function openLogin(route = null) { 
        showRegisterModal = false; 
        showLoginModal = true; 
        intendedRoute = typeof route === 'string' ? route : null;
    }

    /** @param {any} menu */
    function showMenu(menu) {
        if (hideTimeout) {
            clearTimeout(hideTimeout);
            hideTimeout = null;
        }
        activeMenu = menu;
    }

    function scheduleHide() {
        hideTimeout = setTimeout(() => {
            activeMenu = null;
        }, 180);
    }

    function cancelHide() {
        if (hideTimeout) {
            clearTimeout(hideTimeout);
            hideTimeout = null;
        }
    }

    onMount(() => {
        const handler = () => {
            scrolled = window.scrollY > 12;
        };
        window.addEventListener("scroll", handler, { passive: true });

        const params = new URLSearchParams(window.location.search);
        if (params.get('login') === 'true') {
            openLogin();
            const urlObj = new URL(window.location.href);
            urlObj.searchParams.delete('login');
            window.history.replaceState({}, '', urlObj);
        } else if (params.get('register') === 'true') {
            openRegister();
            const urlObj = new URL(window.location.href);
            urlObj.searchParams.delete('register');
            window.history.replaceState({}, '', urlObj);
        }

        apiFetch('/config').then(res => {
            if (res && res.namaweb) {
                siteConfig = res;
            } else if (res && res.data) {
                siteConfig = res.data;
            }
        }).catch(e => console.error('Gagal memuat config:', e));

        return () => {
            window.removeEventListener("scroll", handler);
            if (hideTimeout) clearTimeout(hideTimeout);
        };
    });
</script>

<svelte:head>
    <title>{title} — Cerdas Living</title>
    <meta
        name="description"
        content={description ||
            "Cerdas Living – Portal Properti & Lifestyle Premium. Temukan ribuan listing properti terbaik, furnitur premium, dan layanan desain interior profesional di Indonesia."}
    />
    <meta
        name="keywords"
        content={keywords ||
            "properti indonesia, rumah dijual, rumah disewa, furnitur premium, interior design, cerdas living"}
    />
    <meta name="robots" content="index, follow" />
    <!-- Open Graph -->
    <meta property="og:title" content="{title} — Cerdas Living" />
    <meta
        property="og:description"
        content={description || "Portal Properti & Lifestyle Premium Indonesia"}
    />
    <meta property="og:type" content={ogType} />
    <meta property="og:image" content={ogImage || "/images/og-default.jpg"} />
    <meta property="og:site_name" content="Cerdas Living" />
    <meta property="og:locale" content="id_ID" />
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{title} — Cerdas Living" />
    <meta
        name="twitter:description"
        content={description || "Portal Properti & Lifestyle Premium"}
    />
    <meta name="twitter:image" content={ogImage || "/images/og-default.jpg"} />
</svelte:head>

<div class="app-shell">
    <!-- NAVBAR -->
    <nav class="navbar {scrolled ? 'scrolled' : ''}">
        <div class="container">
            <Link to={url("/")} class="navbar-brand">
                <img
                    src={url("/images/logo-new.png")}
                    alt="Logo"
                    style="width:66px; height:66px; object-fit:contain; mix-blend-mode:multiply;"
                />
                <div class="brand-text-wrap">
                    <span class="brand-name">CerdasLiving</span>
                    <span class="brand-tagline"
                        >Smart Property, Better Living</span
                    >
                </div>
            </Link>

            <div class="navbar-links" style="align-items: center;">
                <!-- Property -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div
                    class="mega-trigger"
                    onmouseenter={() => showMenu("property")}
                    onmouseleave={scheduleHide}
                >
                    <Link
                        to={url("/properti")}
                        class="nav-link mega-nav-link {activeMenu === 'property'
                            ? 'active-cerdashover'
                            : ''}"
                        style="font-weight:600; font-size:0.95rem; padding: 8px 16px;"
                    >
                        Property
                    </Link>
                </div>

                <!-- Studio Design -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div
                    class="mega-trigger"
                    onmouseenter={() => showMenu("studio")}
                    onmouseleave={scheduleHide}
                >
                    <a
                        href={url("/studio/hub")}
                        onclick={(e) => { if (!auth?.user) { e.preventDefault(); openLogin('/studio/hub'); } }}
                        class="nav-link mega-nav-link {activeMenu === 'studio'
                            ? 'active-cerdashover'
                            : ''}"
                        style="font-weight:600; font-size:0.95rem; padding: 8px 16px;"
                    >
                        Studio Design
                    </a>
                </div>

                <!-- E-Jasa -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div
                    class="mega-trigger"
                    onmouseenter={() => showMenu("ejasa")}
                    onmouseleave={scheduleHide}
                >
                    <a
                        href="http://localhost:5175"
                        class="nav-link mega-nav-link {activeMenu === 'ejasa' ? 'active-cerdashover' : ''}"
                        style="font-weight:600; font-size:0.95rem; padding: 8px 16px;"
                    >
                        E-Jasa
                    </a>
                </div>

                <!-- AI Insight -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div
                    class="mega-trigger"
                    onmouseenter={() => showMenu("ai")}
                    onmouseleave={scheduleHide}
                >
                    <Link
                        to={url("/ai/assistant")}
                        class="nav-link mega-nav-link {activeMenu === 'ai'
                            ? 'active-cerdashover'
                            : ''}"
                        style="font-weight:600; font-size:0.95rem; padding: 8px 16px;"
                    >
                        AI Insight
                    </Link>
                </div>

                <span class="nav-divider" style="margin: 0 16px;"></span>

                <!-- Right Side -->
                <div style="display:flex; align-items:center; gap:12px;">
                    <button
                        type="button"
                        class="btn-elegant-login"
                        onclick={() => openLogin()}
                    >
                        <span class="material-symbols-rounded" style="font-size: 1.1rem;">login</span>
                        Login
                    </button>

                    <button
                        type="button"
                        class="nav-cta"
                        style="cursor:pointer;"
                        onclick={openRegister}
                    >
                        Pasang Iklan
                    </button>
                </div>
            </div>

            <!-- Hamburger Mobile -->
            <button
                class="btn btn-ghost btn-sm"
                style="display:none"
                onclick={() => (mobileOpen = !mobileOpen)}
                aria-label="Menu"
                id="nav-hamburger"
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    <line x1="3" y1="6" x2="21" y2="6" /><line
                        x1="3"
                        y1="12"
                        x2="21"
                        y2="12"
                    /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
            </button>
        </div>

        <!-- ======== MEGA-MENU DROPDOWNS ======== -->

        <!-- E-Jasa Mega Menu -->
        {#if activeMenu === "ejasa"}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
                class="mega-menu-wrapper"
                onmouseenter={cancelHide}
                onmouseleave={scheduleHide}
            >
                <div class="mega-menu">
                    <div class="mega-grid mega-grid-3">
                        <!-- Col 1: Kategori Jasa -->
                        <div class="mega-col">
                            <div class="mega-heading">KATEGORI JASA</div>
                            <a href="http://localhost:5175/kategori/desain" class="mega-item">
                                <span style="font-size:1.2rem;width:24px;text-align:center;">🛋️</span>
                                <span class="mega-label">Desain Interior</span>
                            </a>
                            <a href="http://localhost:5175/kategori/kontraktor" class="mega-item">
                                <span style="font-size:1.2rem;width:24px;text-align:center;">🏗️</span>
                                <span class="mega-label">Kontraktor</span>
                            </a>
                            <a href="http://localhost:5175/kategori/tukang" class="mega-item">
                                <span style="font-size:1.2rem;width:24px;text-align:center;">🧱</span>
                                <span class="mega-label">Tukang Bangun</span>
                            </a>
                            <a href="http://localhost:5175/kategori/ac" class="mega-item">
                                <span style="font-size:1.2rem;width:24px;text-align:center;">❄️</span>
                                <span class="mega-label">AC & Utilities</span>
                            </a>
                            <a href="http://localhost:5175/kategori/cleaning" class="mega-item">
                                <span style="font-size:1.2rem;width:24px;text-align:center;">🧹</span>
                                <span class="mega-label">Cleaning Service</span>
                            </a>
                            <a href="http://localhost:5175/kategori" class="mega-item">
                                <span style="font-size:1.2rem;width:24px;text-align:center;">⚙️</span>
                                <span class="mega-label">Lainnya</span>
                            </a>
                        </div>

                        <!-- Col 2: Lokasi Populer -->
                        <div class="mega-col">
                            <div class="mega-heading">LOKASI POPULER</div>
                            <a href="http://localhost:5175/?lokasi=Jakarta+Selatan" class="mega-item">
                                <span class="mega-icon material-symbols-rounded">location_on</span>
                                <span class="mega-label">Jakarta Selatan</span>
                            </a>
                            <a href="http://localhost:5175/?lokasi=Jakarta+Barat" class="mega-item">
                                <span class="mega-icon material-symbols-rounded">location_on</span>
                                <span class="mega-label">Jakarta Barat</span>
                            </a>
                            <a href="http://localhost:5175/?lokasi=Tangerang" class="mega-item">
                                <span class="mega-icon material-symbols-rounded">location_on</span>
                                <span class="mega-label">Tangerang</span>
                            </a>
                            <a href="http://localhost:5175/?lokasi=Bekasi" class="mega-item">
                                <span class="mega-icon material-symbols-rounded">location_on</span>
                                <span class="mega-label">Bekasi</span>
                            </a>
                            <a href="http://localhost:5175/?lokasi=Depok" class="mega-item">
                                <span class="mega-icon material-symbols-rounded">location_on</span>
                                <span class="mega-label">Depok</span>
                            </a>
                            <a href="http://localhost:5175/?lokasi=Bogor" class="mega-item">
                                <span class="mega-icon material-symbols-rounded">location_on</span>
                                <span class="mega-label">Bogor</span>
                            </a>
                        </div>

                        <!-- Col 3: Fitur -->
                        <div class="mega-col">
                            <div class="mega-heading">FITUR</div>
                            <a href="http://localhost:5175/profesional" class="mega-item">
                                <span class="mega-icon material-symbols-rounded">search</span>
                                <div>
                                    <span class="mega-label">Cari Profesional</span>
                                    <span class="mega-desc">Temukan jasa terpercaya</span>
                                </div>
                            </a>
                            <a href="http://localhost:5175/pasang-iklan" class="mega-item">
                                <span class="mega-icon material-symbols-rounded">campaign</span>
                                <div>
                                    <span class="mega-label">Pasang Iklan</span>
                                    <span class="mega-desc">Promosikan bisnis Anda</span>
                                </div>
                            </a>
                            <a href="http://localhost:5175/jadi-profesional" class="mega-item">
                                <span class="mega-icon material-symbols-rounded">verified</span>
                                <div>
                                    <span class="mega-label">Jadi Profesional</span>
                                    <span class="mega-desc">Daftarkan layanan Anda</span>
                                </div>
                            </a>
                            <a href="http://localhost:5175/paket" class="mega-item">
                                <span class="mega-icon material-symbols-rounded">workspace_premium</span>
                                <div>
                                    <span class="mega-label">Pilih Paket</span>
                                    <span class="mega-desc">Mulai dari Rp 10.000/bulan</span>
                                </div>
                            </a>
                        </div>
                    </div>
                    <!-- Footer bar -->
                    <div class="mega-footer">
                        <a href="http://localhost:5175" class="mega-footer-link">
                            <span class="material-symbols-rounded" style="font-size:1.1rem; vertical-align:middle; margin-right:4px;">handyman</span>
                            Profesional Terbaik · <strong>Lihat semua jasa →</strong>
                        </a>
                    </div>
                </div>
            </div>
        {/if}

        <!-- Property Mega Menu -->
        {#if activeMenu === "property"}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
                class="mega-menu-wrapper"
                onmouseenter={cancelHide}
                onmouseleave={scheduleHide}
            >
                <div class="mega-menu">
                    <div class="mega-grid mega-grid-3">
                        <!-- Col 1: Tipe Properti -->
                        <div class="mega-col">
                            <div class="mega-heading">TIPE PROPERTI</div>
                            <a
                                href={url("/properti?kategori=rumah")}
                                class="mega-item"
                            >
                                <span class="mega-icon material-symbols-rounded"
                                    >home</span
                                >
                                <span class="mega-label">Rumah</span>
                            </a>
                            <a
                                href={url("/properti?kategori=apartemen")}
                                class="mega-item"
                            >
                                <span class="mega-icon material-symbols-rounded"
                                    >domain</span
                                >
                                <span class="mega-label">Apartemen</span>
                            </a>
                            <a
                                href={url("/properti?kategori=ruko")}
                                class="mega-item"
                            >
                                <span class="mega-icon material-symbols-rounded"
                                    >storefront</span
                                >
                                <span class="mega-label">Ruko</span>
                            </a>
                            <a
                                href={url("/properti?kategori=tanah")}
                                class="mega-item"
                            >
                                <span class="mega-icon material-symbols-rounded"
                                    >forest</span
                                >
                                <span class="mega-label">Tanah</span>
                            </a>
                            <a
                                href={url("/properti?kategori=komersial")}
                                class="mega-item"
                            >
                                <span class="mega-icon material-symbols-rounded"
                                    >architecture</span
                                >
                                <span class="mega-label">Komersial</span>
                            </a>
                        </div>

                        <!-- Col 2: Lokasi Populer -->
                        <div class="mega-col">
                            <div class="mega-heading">LOKASI POPULER</div>
                            <a
                                href={url("/properti?lokasi=Jakarta")}
                                class="mega-item"
                            >
                                <span class="mega-icon material-symbols-rounded"
                                    >location_on</span
                                >
                                <span class="mega-label">Jakarta</span>
                            </a>
                            <a
                                href={url("/properti?lokasi=Bandung")}
                                class="mega-item"
                            >
                                <span class="mega-icon material-symbols-rounded"
                                    >location_on</span
                                >
                                <span class="mega-label">Bandung</span>
                            </a>
                            <a
                                href={url("/properti?lokasi=Surabaya")}
                                class="mega-item"
                            >
                                <span class="mega-icon material-symbols-rounded"
                                    >location_on</span
                                >
                                <span class="mega-label">Surabaya</span>
                            </a>
                            <a
                                href={url("/properti?lokasi=Bogor")}
                                class="mega-item"
                            >
                                <span class="mega-icon material-symbols-rounded"
                                    >location_on</span
                                >
                                <span class="mega-label">Bogor</span>
                            </a>
                            <a
                                href={url("/properti?lokasi=Depok")}
                                class="mega-item"
                            >
                                <span class="mega-icon material-symbols-rounded"
                                    >location_on</span
                                >
                                <span class="mega-label">Depok</span>
                            </a>
                            <a
                                href={url("/properti?lokasi=Tangerang")}
                                class="mega-item"
                            >
                                <span class="mega-icon material-symbols-rounded"
                                    >location_on</span
                                >
                                <span class="mega-label">Tangerang</span>
                            </a>
                        </div>

                        <!-- Col 3: Fitur -->
                        <div class="mega-col">
                            <div class="mega-heading">FITUR</div>
                            <a href={url("/properti")} class="mega-item">
                                <span class="mega-icon material-symbols-rounded"
                                    >search</span
                                >
                                <div>
                                    <span class="mega-label">Cari Properti</span
                                    >
                                    <span class="mega-desc"
                                        >Jelajahi semua listing</span
                                    >
                                </div>
                            </a>
                            <a
                                href={url("/kpr-calculator")}
                                class="mega-item"
                            >
                                <span class="mega-icon material-symbols-rounded"
                                    >calculate</span
                                >
                                <div>
                                    <span class="mega-label"
                                        >Kalkulator KPR</span
                                    >
                                    <span class="mega-desc"
                                        >Simulasi cicilan rumah</span
                                    >
                                </div>
                            </a>
                        </div>
                    </div>
                    <!-- Footer bar -->
                    <div class="mega-footer">
                        <a href={url("/properti")} class="mega-footer-link">
                            <span
                                class="material-symbols-rounded"
                                style="font-size:1.1rem; vertical-align:middle; margin-right:4px;"
                                >local_fire_department</span
                            >
                            Properti Terbaru ·
                            <strong>Lihat semua properti →</strong>
                        </a>
                    </div>
                </div>
            </div>
        {/if}

        <!-- Studio Design Mega Menu -->
        {#if activeMenu === "studio"}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
                class="mega-menu-wrapper"
                onmouseenter={cancelHide}
                onmouseleave={scheduleHide}
            >
                <div class="mega-menu">
                    <div class="mega-grid mega-grid-3">
                        <!-- Col 1: Desain AI -->
                        <div class="mega-col">
                            <div class="mega-heading">DESAIN AI</div>
                            <a href={url("/studio/hub")} class="mega-item" onclick={(e) => { if (!auth?.user) { e.preventDefault(); openLogin('/studio/hub'); } }}>
                                <span class="mega-icon material-symbols-rounded"
                                    >account_balance</span
                                >
                                <div>
                                    <span class="mega-label"
                                        >AI Architecture</span
                                    >
                                    <span class="mega-desc"
                                        >Desain eksterior otomatis</span
                                    >
                                </div>
                            </a>
                            <a href={url("/studio/hub")} class="mega-item" onclick={(e) => { if (!auth?.user) { e.preventDefault(); openLogin('/studio/hub'); } }}>
                                <span class="mega-icon material-symbols-rounded"
                                    >chair</span
                                >
                                <div>
                                    <span class="mega-label">AI Interior</span>
                                    <span class="mega-desc"
                                        >Dekorasi & tata ruang AI</span
                                    >
                                </div>
                            </a>
                            <a href={url("/studio/hub")} class="mega-item" onclick={(e) => { if (!auth?.user) { e.preventDefault(); openLogin('/studio/hub'); } }}>
                                <span class="mega-icon material-symbols-rounded"
                                    >square_foot</span
                                >
                                <div>
                                    <span class="mega-label">AI Floorplan</span>
                                    <span class="mega-desc"
                                        >Denah lantai cerdas</span
                                    >
                                </div>
                            </a>
                            <a href={url("/studio/hub")} class="mega-item" onclick={(e) => { if (!auth?.user) { e.preventDefault(); openLogin('/studio/hub'); } }}>
                                <span class="mega-icon material-symbols-rounded"
                                    >park</span
                                >
                                <div>
                                    <span class="mega-label">AI Landscape</span>
                                    <span class="mega-desc"
                                        >Taman & lanskap AI</span
                                    >
                                </div>
                            </a>
                            <a href={url("/studio/hub")} class="mega-item" onclick={(e) => { if (!auth?.user) { e.preventDefault(); openLogin('/studio/hub'); } }}>
                                <span class="mega-icon material-symbols-rounded"
                                    >bar_chart</span
                                >
                                <div>
                                    <span class="mega-label"
                                        >RAB & Estimasi</span
                                    >
                                    <span class="mega-desc"
                                        >Rencana anggaran biaya</span
                                    >
                                </div>
                            </a>
                        </div>

                        <!-- Col 2: Tools -->
                        <div class="mega-col">
                            <div class="mega-heading">TOOLS</div>
                            {#if auth?.user}
                                {#if userAksesLevel === 'Agent' || (auth.user && auth.user.id_staff)}
                                    <a href={url('/agent/dashboard')} class="btn-dashboard">Dashboard</a>
                                {:else if userAksesLevel === 'Admin'}
                                    <a href={url('/admin/dashboard')} class="btn-dashboard">Admin Panel</a>
                                {/if}
                            {/if}
                            <a href={url("/studio/design")} class="mega-item">
                                <span class="mega-icon material-symbols-rounded"
                                    >design_services</span
                                >
                                <div>
                                    <span class="mega-label">3D Editor</span>
                                    <span class="mega-desc"
                                        >Editor 3D interaktif</span
                                    >
                                </div>
                            </a>
                            <a href={url("/studio/hub")} class="mega-item" onclick={(e) => { if (!auth?.user) { e.preventDefault(); openLogin('/studio/hub'); } }}>
                                <span class="mega-icon material-symbols-rounded"
                                    >texture</span
                                >
                                <div>
                                    <span class="mega-label"
                                        >Material Library</span
                                    >
                                    <span class="mega-desc"
                                        >Koleksi material & tekstur</span
                                    >
                                </div>
                            </a>
                            <Link to={url("/gallery")} class="mega-item">
                                <span class="mega-icon material-symbols-rounded"
                                    >lightbulb</span
                                >
                                <div>
                                    <span class="mega-label"
                                        >Inspirasi Desain</span
                                    >
                                    <span class="mega-desc"
                                        >Galeri ide & referensi</span
                                    >
                                </div>
                            </Link>
                        </div>

                        <!-- Col 3: Mulai -->
                        <div class="mega-col mega-col-cta">
                            <div class="mega-heading">MULAI</div>
                            <div class="mega-cta-block">
                                <p class="mega-cta-text">
                                    Buat desain rumah impian Anda dengan
                                    teknologi AI terkini.
                                </p>
                                <a
                                    href={url("/studio/hub")}
                                    onclick={(e) => { if (!auth?.user) { e.preventDefault(); openLogin('/studio/hub'); } }}
                                    class="mega-cta-btn"
                                >
                                    Mulai Studio Design →
                                </a>
                                <span class="mega-cta-sub"
                                    >Gratis untuk semua user</span
                                >
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        {/if}

        <!-- AI Insight Mega Menu -->
        {#if activeMenu === "ai"}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
                class="mega-menu-wrapper"
                onmouseenter={cancelHide}
                onmouseleave={scheduleHide}
            >
                <div class="mega-menu">
                    <div class="mega-grid mega-grid-3">
                        <!-- Col 1: Analisa Properti -->
                        <div class="mega-col">
                            <div class="mega-heading">ANALISA PROPERTI</div>
                            <a href={url("/ai/assistant")} class="mega-item">
                                <span class="mega-icon material-symbols-rounded"
                                    >trending_up</span
                                >
                                <div>
                                    <span class="mega-label"
                                        >AI Investment Score</span
                                    >
                                    <span class="mega-desc"
                                        >Skor investasi & analisis</span
                                    >
                                </div>
                            </a>
                            <a href={url("/ai/assistant")} class="mega-item">
                                <span class="mega-icon material-symbols-rounded"
                                    >bar_chart</span
                                >
                                <div>
                                    <span class="mega-label">Trend Harga</span>
                                    <span class="mega-desc"
                                        >Kenaikan harga & potensi ROI</span
                                    >
                                </div>
                            </a>
                            <a href={url("/ai/assistant")} class="mega-item">
                                <span class="mega-icon material-symbols-rounded"
                                    >smart_toy</span
                                >
                                <div>
                                    <span class="mega-label"
                                        >AI Chat Assistant</span
                                    >
                                    <span class="mega-desc"
                                        >Tanya seputar properti</span
                                    >
                                </div>
                            </a>
                        </div>

                        <!-- Col 2: Data & Peta -->
                        <div class="mega-col">
                            <div class="mega-heading">DATA & PETA</div>
                            <a href={url("/ai/assistant")} class="mega-item">
                                <span class="mega-icon material-symbols-rounded"
                                    >school</span
                                >
                                <div>
                                    <span class="mega-label"
                                        >Fasilitas Sekitar</span
                                    >
                                    <span class="mega-desc"
                                        >Sekolah, RS, mall, transport</span
                                    >
                                </div>
                            </a>
                            <a href={url("/ai/assistant")} class="mega-item">
                                <span class="mega-icon material-symbols-rounded"
                                    >map</span
                                >
                                <div>
                                    <span class="mega-label">Peta Lokasi</span>
                                    <span class="mega-desc"
                                        >Peta interaktif Google Maps</span
                                    >
                                </div>
                            </a>
                            <a href={url("/ai/assistant")} class="mega-item">
                                <span class="mega-icon material-symbols-rounded"
                                    >assignment</span
                                >
                                <div>
                                    <span class="mega-label">Analisa Area</span>
                                    <span class="mega-desc"
                                        >Potensi & risiko wilayah</span
                                    >
                                </div>
                            </a>
                        </div>

                        <!-- Col 3: Kalkulator -->
                        <div class="mega-col">
                            <div class="mega-heading">KALKULATOR</div>
                            <a
                                href={url("/kpr-calculator")}
                                class="mega-item"
                            >
                                <span class="mega-icon material-symbols-rounded"
                                    >calculate</span
                                >
                                <div>
                                    <span class="mega-label"
                                        >KPR Kalkulator</span
                                    >
                                    <span class="mega-desc"
                                        >Simulasi cicilan</span
                                    >
                                </div>
                            </a>
                        </div>
                    </div>
                    <!-- Footer bar -->
                    <div class="mega-footer">
                        <a
                            href={url("/ai/assistant")}
                            class="mega-footer-link"
                        >
                            <span
                                class="material-symbols-rounded"
                                style="font-size:1.1rem; vertical-align:middle; margin-right:4px;"
                                >auto_awesome</span
                            >
                            Powered by Google Gemini ·
                            <strong>Mulai analisis →</strong>
                        </a>
                    </div>
                </div>
            </div>
        {/if}
    </nav>

    <!-- Auth Modals -->
    <RegisterModal bind:open={showRegisterModal} google_client_id={googleClientId} onSwitchToLogin={() => openLogin()} />
    <LoginModal    bind:open={showLoginModal}    google_client_id={googleClientId} onSwitchToRegister={openRegister} intendedRoute={intendedRoute} />

    <!-- MOBILE OVERLAY -->
    {#if mobileOpen}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div class="mobile-overlay" onclick={() => (mobileOpen = false)}>
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <div class="mobile-menu" onclick={(e) => e.stopPropagation()}>
                <div class="mobile-menu-header">
                    <Link
                        to={url("/")}
                        class="navbar-brand"
                        onclick={() => (mobileOpen = false)}
                    >
                        <img
                            src={url("/images/logo-new.png")}
                            alt="Logo"
                            style="width:40px; height:40px; object-fit:contain; mix-blend-mode:multiply;"
                        />
                        <div class="brand-text-wrap">
                            <span class="brand-name" style="font-size:1.1rem;"
                                >CerdasLiving</span
                            >
                            <span class="brand-tagline"
                                >Smart Property, Better Living</span
                            >
                        </div>
                    </Link>
                    <button
                        class="btn btn-ghost btn-sm"
                        onclick={() => (mobileOpen = false)}
                        aria-label="Close"
                    >
                        <span
                            class="material-symbols-rounded"
                            style="font-size:1.5rem;">close</span
                        >
                    </button>
                </div>

                <div class="mobile-menu-body">
                    <div class="mobile-section-label">PROPERTI</div>
                    <Link
                        to={url("/properti")}
                        class="mobile-link"
                        onclick={() => (mobileOpen = false)}
                    >
                        <span class="mega-icon">🏠</span> Cari Properti
                    </Link>
                    <Link
                        to={url("/properti?kategori=rumah")}
                        class="mobile-link"
                        onclick={() => (mobileOpen = false)}
                    >
                        <span class="mega-icon">🏡</span> Rumah
                    </Link>
                    <Link
                        to={url("/properti?kategori=apartemen")}
                        class="mobile-link"
                        onclick={() => (mobileOpen = false)}
                    >
                        <span class="mega-icon">🏢</span> Apartemen
                    </Link>
                    <Link
                        to={url("/properti?kategori=ruko")}
                        class="mobile-link"
                        onclick={() => (mobileOpen = false)}
                    >
                        <span class="mega-icon">🏪</span> Ruko
                    </Link>
                    <Link
                        to={url("/properti?kategori=tanah")}
                        class="mobile-link"
                        onclick={() => (mobileOpen = false)}
                    >
                        <span class="mega-icon">🌿</span> Tanah
                    </Link>
                    <Link
                        to={url("/kpr-calculator")}
                        class="mobile-link"
                        onclick={() => (mobileOpen = false)}
                    >
                        <span class="mega-icon">🧮</span> Kalkulator KPR
                    </Link>

                    <div class="mobile-section-label" style="margin-top:16px;">
                        STUDIO DESIGN
                    </div>
                    <a
                        href={url("/studio/login")}
                        class="mobile-link"
                        onclick={() => (mobileOpen = false)}
                    >
                        <span class="mega-icon">🏛️</span> AI Architecture
                    </a>
                    <a
                        href={url("/studio/login")}
                        class="mobile-link"
                        onclick={() => (mobileOpen = false)}
                    >
                        <span class="mega-icon">🛋️</span> AI Interior
                    </a>
                    <a
                        href={url("/studio/login")}
                        class="mobile-link"
                        onclick={() => (mobileOpen = false)}
                    >
                        <span class="mega-icon">📐</span> AI Floorplan
                    </a>
                    <a
                        href={url("/studio/design")}
                        class="mobile-link"
                        onclick={() => (mobileOpen = false)}
                    >
                        <span class="mega-icon">🎨</span> 3D Editor
                    </a>
                    <Link
                        to={url("/gallery")}
                        class="mobile-link"
                        onclick={() => (mobileOpen = false)}
                    >
                        <span class="mega-icon">💡</span> Inspirasi Desain
                    </Link>

                    <div class="mobile-section-label" style="margin-top:16px;">
                        AI INSIGHT
                    </div>
                    <Link
                        to={url("/ai/assistant")}
                        class="mobile-link"
                        onclick={() => (mobileOpen = false)}
                    >
                        <span class="mega-icon">🤖</span> AI Chat Assistant
                    </Link>
                    <Link
                        to={url("/ai/assistant")}
                        class="mobile-link"
                        onclick={() => (mobileOpen = false)}
                    >
                        <span class="mega-icon">📈</span> AI Investment Score
                    </Link>
                    <Link
                        to={url("/ai/assistant")}
                        class="mobile-link"
                        onclick={() => (mobileOpen = false)}
                    >
                        <span class="mega-icon">📊</span> Trend Harga
                    </Link>
                    <Link
                        to={url("/kpr-calculator")}
                        class="mobile-link"
                        onclick={() => (mobileOpen = false)}
                    >
                        <span class="mega-icon">🧮</span> KPR Kalkulator
                    </Link>
                </div>

                <div class="mobile-menu-footer">
                    <button
                        type="button"
                        class="nav-cta"
                        style="position:relative; width:100%; text-align:center; display:block; cursor:pointer; border:none; font-family:inherit;"
                        onclick={() => { mobileOpen = false; openRegister(); }}
                    >
                        Pasang Iklan
                        <span class="free-badge">FREE</span>
                    </button>
                </div>
            </div>
        </div>
    {/if}

    <!-- MAIN -->
    <main>
        {@render children()}
    </main>

    <!-- FOOTER -->
    <footer class="footer">
        <div class="container" style="padding-top: 40px;">
            <div class="grid-5 footer-grid">
                <!-- Col 1 -->
                <div>
                    <div
                        class="footer-brand"
                        style="display:flex; align-items:center; gap:8px;"
                    >
                        <img
                            src={url("/images/logo-new.png")}
                            alt="Logo"
                            style="width:60px; height:60px; object-fit:contain; mix-blend-mode:screen;"
                        />
                        <div class="brand-text-wrap">
                            <div class="brand-name" style="color:var(--gold);">
                                CerdasLiving
                            </div>
                            <div
                                class="brand-tagline"
                                style="color:var(--text-3); font-weight: 500;"
                            >
                                Smart Property, Better Living
                            </div>
                        </div>
                    </div>
                    <p
                        class="footer-tagline"
                        style="margin-top:20px; font-size:0.8rem;"
                    >
                        {siteConfig.deskripsi || 'Platform properti dan pembangunan berbasis AI pertama terintegrasi yang menggabungkan teknologi, data, dan profesional untuk mewujudkan hunian impian Anda.'}
                    </p>
                </div>

                <!-- Col 2 -->
                <div>
                    <div class="footer-heading">PRODUK</div>
                    <Link to={url("/properti")} class="footer-link"
                        >Property</Link
                    >
                    <Link to={url("/ai/assistant")} class="footer-link"
                        >AI Insight</Link
                    >
                    <a href={url("/studio/login")} class="footer-link"
                        >Studio Design</a
                    >
                </div>

                <!-- Col 3 -->
                <div>
                    <div class="footer-heading">PERUSAHAAN</div>
                    <Link to={url("/tentang")} class="footer-link"
                        >Tentang Cerdas Living</Link
                    >
                    <Link to={url("/karir")} class="footer-link">Karir</Link>
                    <Link to={url("/syarat")} class="footer-link"
                        >Syarat & Ketentuan</Link
                    >
                    <Link to={url("/privasi")} class="footer-link"
                        >Kebijakan Privasi</Link
                    >
                </div>

                <!-- Col 4 -->
                <div>
                    <div class="footer-heading">HUBUNGI KAMI</div>
                    {#if siteConfig.telepon}
                        <a href="tel:{siteConfig.telepon}" class="footer-link" style="display:flex;align-items:center;gap:6px;">
                            <span class="material-symbols-rounded" style="font-size:1rem;">call</span>
                            {siteConfig.telepon}
                        </a>
                    {/if}
                    {#if siteConfig.email}
                        <a href="mailto:{siteConfig.email}" class="footer-link" style="display:flex;align-items:center;gap:6px;">
                            <span class="material-symbols-rounded" style="font-size:1rem;">mail</span>
                            {siteConfig.email}
                        </a>
                    {/if}
                    {#if siteConfig.alamat}
                        <div class="footer-link" style="display:flex;align-items:flex-start;gap:6px;line-height:1.4;">
                            <span class="material-symbols-rounded" style="font-size:1rem;margin-top:2px;">location_on</span>
                            <span>{siteConfig.alamat}</span>
                        </div>
                    {/if}
                    <Link to={url("/bantuan")} class="footer-link" style="margin-top:12px;">Pusat Bantuan</Link>
                </div>

                <!-- Col 5 -->
                <div>
                    <div
                        class="footer-heading"
                        style="color:var(--text-1); font-weight:700; margin-bottom:8px;"
                    >
                        Dapatkan Update Terbaru
                    </div>
                    <p
                        style="font-size:0.8rem; color:var(--text-3); margin-bottom:16px;"
                    >
                        Berlangganan newsletter kami untuk mendapatkan informasi
                        properti dan promo terbaru.
                    </p>
                    <div style="display:flex; gap:8px;">
                        <input
                            type="email"
                            placeholder="Masukkan email Anda"
                            style="flex:1; padding:8px 12px; border-radius:8px; border:1px solid var(--border); background:rgba(255,255,255,0.05); color:var(--text-1); font-size:0.8rem;"
                        />
                        <button
                            class="btn"
                            style="background:var(--gold); color:#fff; padding:8px 16px; border-radius:8px; border:none; font-size:0.8rem; font-weight:600;"
                            >Berlangganan</button
                        >
                    </div>
                    <div style="display:flex;gap:16px;margin-top:24px">
                        <a href="/" style="color:var(--text-2);"
                            ><span
                                class="material-symbols-rounded"
                                style="font-size:1.2rem;">photo_camera</span
                            ></a
                        >
                        <a href="/" style="color:var(--text-2);"
                            ><span
                                class="material-symbols-rounded"
                                style="font-size:1.2rem;">facebook</span
                            ></a
                        >
                        <a href="/" style="color:var(--text-2);"
                            ><span
                                class="material-symbols-rounded"
                                style="font-size:1.2rem;">play_circle</span
                            ></a
                        >
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <span>© 2026 Cerdas Living. All rights reserved.</span>
            </div>
        </div>
    </footer>
</div>

<style>
    /* ===== MOBILE HAMBURGER ===== */
    @media (max-width: 992px) {
        .navbar-links {
            display: none !important;
        }
        #nav-hamburger {
            display: flex !important;
        }
    }

    /* ===== MEGA TRIGGER ===== */
    .mega-trigger {
        position: relative;
    }

    :global(.mega-nav-link) {
        display: flex !important;
        align-items: center;
        border-radius: 9999px; /* Pill shape */
        transition:
            background 0.2s ease,
            color 0.2s ease;
        color: var(--text-1);
        position: relative;
    }

    :global(.mega-nav-link:hover),
    :global(.mega-nav-link.active-cerdashover) {
        background: #f5f0e8;
        color: #c8653a !important; /* Coklat Emas text */
    }

    /* ===== MEGA MENU WRAPPER ===== */
    .mega-menu-wrapper {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
        padding: 8px 24px 0;
        z-index: 1000;
        animation: megaSlideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes megaSlideDown {
        from {
            opacity: 0;
            transform: translateY(-8px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* ===== MEGA MENU PANEL ===== */
    .mega-menu {
        width: 100%;
        max-width: 900px;
        background: #f5f0e8; /* Solid Light Pure Steel Grey */
        backdrop-filter: blur(32px);
        -webkit-backdrop-filter: blur(32px);
        border-radius: 16px;
        box-shadow:
            0 20px 50px rgba(0, 0, 0, 0.15),
            inset 0 1px 3px rgba(255, 255, 255, 0.9),
            inset 0 -1px 3px rgba(0, 0, 0, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.8);
        overflow: hidden;
        position: relative;
    }

    .mega-menu::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(
            90deg,
            transparent,
            rgba(180, 83, 9, 0.4),
            transparent
        );
    }

    .mega-grid {
        display: grid;
        gap: 0;
    }

    .mega-grid-3 {
        grid-template-columns: 1fr 1fr 1fr;
    }

    .mega-col {
        padding: 28px 24px;
        border-right: 1px solid rgba(0, 0, 0, 0.08);
    }

    .mega-col:last-child {
        border-right: none;
    }

    .mega-heading {
        font-size: 0.65rem;
        font-weight: 800;
        letter-spacing: 0.15em;
        color: #c8653a;
        margin-bottom: 16px;
        text-transform: uppercase;
        text-shadow: 0 0 8px rgba(146, 64, 14, 0.2);
    }

    /* ===== MEGA ITEM ===== */
    :global(.mega-item) {
        display: flex !important;
        align-items: center;
        gap: 12px;
        padding: 8px 10px;
        border-radius: 10px;
        text-decoration: none;
        color: rgba(44, 38, 42, 0.86);
        transition: all 0.2s ease;
        margin-bottom: 2px;
        border-left: 2px solid transparent;
    }

    :global(.mega-item:hover) {
        background: linear-gradient(
            90deg,
            rgba(180, 83, 9, 0.08) 0%,
            transparent 100%
        );
        transform: translateX(4px);
    }

    .mega-icon {
        font-size: 1.3rem;
        flex-shrink: 0;
        line-height: 1.4;
        color: #c8653a; /* Coklat Emas  */
    }

    :global(.mega-item:hover) .mega-icon {
        color: #c8653a;
    }

    .mega-label {
        font-size: 0.85rem;
        font-weight: 700;
        color: #0f172a;
        display: block;
        line-height: 1.4;
    }

    .mega-desc {
        font-size: 0.72rem;
        color: rgba(44, 38, 42, 0.86);
        display: block;
        line-height: 1.3;
        margin-top: 1px;
    }

    /* ===== MEGA FOOTER ===== */
    .mega-footer {
        background: rgba(255, 255, 255, 0.4);
        border-top: 1px solid rgba(0, 0, 0, 0.08);
        padding: 12px 24px;
        text-align: center;
    }

    :global(.mega-footer-link) {
        font-size: 0.82rem;
        color: rgba(44, 38, 42, 0.86);
        text-decoration: none;
        transition: all 0.2s ease;
    }

    :global(.mega-footer-link:hover) {
        color: #c8653a;
        text-shadow: 0 0 8px rgba(180, 83, 9, 0.3);
    }

    :global(.mega-footer-link strong) {
        color: #c8653a;
        font-weight: 800;
    }

    /* ===== MEGA CTA BLOCK (Studio) ===== */
    .mega-col-cta {
        background: linear-gradient(
            135deg,
            rgba(180, 83, 9, 0.05),
            rgba(180, 83, 9, 0.01)
        );
        border-left: 1px solid rgba(0, 0, 0, 0.08);
    }

    .mega-cta-block {
        text-align: center;
        padding: 16px 8px;
    }

    .mega-cta-text {
        font-size: 0.82rem;
        color: rgba(44, 38, 42, 0.86);
        margin-bottom: 20px;
        line-height: 1.5;
    }

    .mega-cta-btn {
        display: inline-block;
        background: linear-gradient(135deg, #d97706, #b45309);
        color: #fff;
        font-size: 0.85rem;
        font-weight: 700;
        padding: 10px 24px;
        border-radius: 10px;
        text-decoration: none;
        box-shadow: 0 4px 16px rgba(180, 83, 9, 0.25);
        transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
    }

    .mega-cta-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 24px rgba(180, 83, 9, 0.4);
    }

    .mega-cta-sub {
        display: block;
        font-size: 0.7rem;
        color: rgba(44, 38, 42, 0.86);
        margin-top: 10px;
    }

    /* ===== FREE BADGE ===== */
    .free-badge {
        position: absolute;
        top: -10px;
        right: -10px;
        background: linear-gradient(135deg, #ff6b6b, #e53935);
        color: white;
        font-size: 0.6rem;
        font-weight: 800;
        padding: 2px 6px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(229, 57, 53, 0.4);
        animation: freePulse 2s infinite ease-in-out;
        z-index: 10;
    }

    @keyframes freePulse {
        0%,
        100% {
            transform: scale(1);
            box-shadow: 0 4px 12px rgba(229, 57, 53, 0.4);
        }
        50% {
            transform: scale(1.2) rotate(3deg);
            box-shadow: 0 6px 20px rgba(229, 57, 53, 0.6);
        }
    }

    /* ===== MOBILE OVERLAY ===== */
    .mobile-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        z-index: 9999;
        animation: fadeIn 0.2s ease forwards;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    .mobile-menu {
        position: absolute;
        top: 0;
        right: 0;
        width: 320px;
        max-width: 90vw;
        height: 100%;
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(20px);
        display: flex;
        flex-direction: column;
        animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        overflow-y: auto;
    }

    @keyframes slideInRight {
        from {
            transform: translateX(100%);
        }
        to {
            transform: translateX(0);
        }
    }

    .mobile-menu-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    }

    .mobile-menu-body {
        flex: 1;
        padding: 16px 20px;
        overflow-y: auto;
    }

    .mobile-section-label {
        font-size: 0.65rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        color: #9ca3af;
        margin-bottom: 8px;
        text-transform: uppercase;
    }

    :global(.mobile-link) {
        display: flex !important;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 10px;
        text-decoration: none;
        color: #1f2937;
        font-size: 0.9rem;
        font-weight: 500;
        transition: background 0.15s ease;
        width: 100%;
        box-sizing: border-box;
    }

    :global(.mobile-link:hover) {
        background: rgba(212, 175, 55, 0.08);
    }

    .mobile-menu-footer {
        padding: 16px 20px;
        border-top: 1px solid rgba(0, 0, 0, 0.06);
    }

    /* ===== HIDE MEGA ON MOBILE ===== */
    @media (max-width: 768px) {
        .mega-menu-wrapper {
            display: none;
        }
    }

    /* ===== RESPONSIVE FOOTER ===== */
    .footer-grid {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr 2fr;
        gap: 48px;
        align-items: start;
    }

    @media (max-width: 1024px) {
        .footer-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 32px;
        }
        /* Make the last column span full width on tablet */
        .footer-grid > div:last-child {
            grid-column: 1 / -1;
        }
    }

    @media (max-width: 768px) {
        .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 24px;
        }
        /* Make the first column (brand) span full width on mobile */
        .footer-grid > div:first-child {
            grid-column: 1 / -1;
        }
    }

    @media (max-width: 480px) {
        .footer-grid {
            grid-template-columns: 1fr;
            text-align: center;
        }
        .footer-brand {
            justify-content: center;
        }
        .footer-grid > div > div[style*="display:flex; gap:8px;"] {
            justify-content: center;
        }
        .footer-grid > div > div[style*="display:flex;gap:16px;"] {
            justify-content: center;
        }
    }
</style>
