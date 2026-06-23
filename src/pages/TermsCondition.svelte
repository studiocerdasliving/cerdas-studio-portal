<script>
    import Layout from '../components/Layout.svelte';
</script>

<Layout>
    <div class="min-h-screen bg-gray-50 py-16 px-6">
        <div class="max-w-4xl mx-auto">
            <!-- Header -->
            <div class="mb-12">
                <h1 class="text-4xl md:text-5xl font-extrabold text-[#031B4D] mb-4 tracking-tight">Terms & Conditions</h1>
                <p class="text-lg text-gray-500">Syarat dan Ketentuan Penggunaan Layanan Cerdas Living</p>
            </div>

            <!-- Content Container -->
            <div class="bg-white rounded-3xl shadow-xl shadow-gray-200/40 p-8 md:p-12 space-y-10 border border-gray-100">
                
                <section class="space-y-4">
                    <h2 class="text-2xl font-bold text-blue-900 border-b border-gray-100 pb-2">1. Penerimaan Syarat</h2>
                    <p class="text-gray-600 leading-relaxed">
                        Dengan mengakses dan menggunakan platform <strong>Cerdas Living</strong> (termasuk CerdasLiving Studio, 3D Builder, dan layanan AI), Anda menyetujui untuk terikat oleh syarat dan ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun dari syarat ini, Anda dilarang menggunakan platform kami.
                    </p>
                </section>

                <section class="space-y-4">
                    <h2 class="text-2xl font-bold text-blue-900 border-b border-gray-100 pb-2">2. Penggunaan 3D Studio & Aset</h2>
                    <div class="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                        <ul class="list-disc pl-5 space-y-3 text-gray-600">
                            <li><strong>Hak Cipta Aset:</strong> Seluruh model 3D, material, dan komponen arsitektur yang disediakan dalam Studio Cerdas Living adalah milik sah Cerdas Living atau mitra berlisensinya.</li>
                            <li><strong>Penggunaan Desain:</strong> Hasil rancangan (render) yang Anda buat dapat digunakan untuk keperluan komersial maupun pribadi, namun tidak diperkenankan menjual ulang aset 3D mentah kami.</li>
                            <li><strong>Akurasi AI:</strong> Asisten AI kami memberikan saran berbasis algoritma. Keputusan final terkait struktur bangunan harus tetap dikonsultasikan dengan arsitek profesional.</li>
                        </ul>
                    </div>
                </section>

                <section class="space-y-4">
                    <h2 class="text-2xl font-bold text-blue-900 border-b border-gray-100 pb-2">3. Akun Pengguna</h2>
                    <p class="text-gray-600 leading-relaxed">
                        Anda bertanggung jawab untuk menjaga kerahasiaan kata sandi akun Anda. Semua aktivitas proyek desain, unggahan material, dan preferensi yang terjadi di bawah akun Anda adalah tanggung jawab Anda sepenuhnya.
                    </p>
                </section>

                <section class="space-y-4">
                    <h2 class="text-2xl font-bold text-blue-900 border-b border-gray-100 pb-2">4. Batasan Tanggung Jawab</h2>
                    <p class="text-gray-600 leading-relaxed">
                        Cerdas Living menyediakan estimasi biaya (RAB) dan visualisasi ruang sebagai alat bantu perencanaan. Kami tidak bertanggung jawab atas perbedaan harga aktual di lapangan atau kesalahan konstruksi yang terjadi di dunia nyata.
                    </p>
                </section>
                
            </div>
            
            <div class="mt-8 text-center text-gray-500 text-sm">
                Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
        </div>
    </div>
</Layout>
