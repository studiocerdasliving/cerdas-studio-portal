<script>
    import Layout from '../components/Layout.svelte';
</script>

<Layout>
    <div class="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20 px-6">
        <div class="max-w-5xl mx-auto">
            <!-- Header Section -->
            <div class="text-center mb-16 animate-fade-in-up">
                <h1 class="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#031B4D] to-blue-600 mb-6 tracking-tight">
                    Mengenal Cerdas Living
                </h1>
                <p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    Masa depan desain interior dan arsitektur yang interaktif, cerdas, dan terjangkau untuk semua orang.
                </p>
            </div>

            <!-- Content Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
                <!-- Card 1 -->
                <div class="bg-white rounded-3xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-1">
                    <div class="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                        <span class="material-symbols text-3xl text-blue-600">architecture</span>
                    </div>
                    <h2 class="text-2xl font-bold text-[#031B4D] mb-4">Revolusi Desain 3D</h2>
                    <p class="text-gray-600 leading-relaxed">
                        Cerdas Living menghadirkan <strong>Studio 3D Builder</strong> langsung di peramban Anda. Tanpa perlu mengunduh aplikasi berat, Anda bisa merancang rumah, mengatur furnitur, dan memvisualisasikan ruangan impian secara seketika (real-time).
                    </p>
                </div>

                <!-- Card 2 -->
                <div class="bg-white rounded-3xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-1">
                    <div class="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-6">
                        <span class="material-symbols text-3xl text-amber-500">smart_toy</span>
                    </div>
                    <h2 class="text-2xl font-bold text-[#031B4D] mb-4">Didukung Kecerdasan Buatan (AI)</h2>
                    <p class="text-gray-600 leading-relaxed">
                        Desain menjadi lebih pintar. Cerdas Living dilengkapi dengan Asisten AI yang siap membantu memberikan rekomendasi gaya, tata letak, hingga pemilihan material bangunan yang paling sesuai dengan anggaran Anda.
                    </p>
                </div>

                <!-- Card 3 -->
                <div class="bg-white rounded-3xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-1 md:col-span-2">
                    <div class="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
                        <span class="material-symbols text-3xl text-emerald-600">public</span>
                    </div>
                    <h2 class="text-2xl font-bold text-[#031B4D] mb-4">Ekosistem Terintegrasi</h2>
                    <p class="text-gray-600 leading-relaxed">
                        Kami bukan sekadar alat gambar. Cerdas Living mengintegrasikan dunia desain dengan realitas konstruksi. Temukan furnitur asli dari vendor lokal, hubungi agen properti, hingga dapatkan estimasi biaya bahan bangunan (RAB) langsung dari desain yang Anda buat.
                    </p>
                </div>
            </div>
        </div>
    </div>
</Layout>

<style>
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
        animation: fadeInUp 0.8s ease-out forwards;
    }
</style>
