<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <style>
        @page {
            margin: 0;
            size: 85.6mm 53.98mm; /* ID Card Standard Size */
        }
        body {
            font-family: 'Helvetica', sans-serif;
            margin: 0;
            padding: 0;
            color: #ffffff;
        }
        .card-front {
            width: 85.6mm;
            height: 53.98mm;
            background: #1a237e; /* primary-container approx */
            position: relative;
            overflow: hidden;
            padding: 10px;
            box-sizing: border-box;
            page-break-after: always;
        }
        .card-back {
            width: 85.6mm;
            height: 53.98mm;
            background: #f8f9fa;
            color: #1a237e;
            position: relative;
            overflow: hidden;
            padding: 12px;
            box-sizing: border-box;
            border: 1px solid #dee2e6;
        }
        .header {
            margin-bottom: 5px;
            border-bottom: 1px solid rgba(255,255,255,0.2);
            padding-bottom: 5px;
        }
        .header-back {
            margin-bottom: 10px;
            border-bottom: 2px solid #1a237e;
            padding-bottom: 5px;
        }
        .logo {
            float: left;
            width: 25px;
            height: 25px;
            background-color: #ffffff;
            border-radius: 50%;
            margin-right: 8px;
            text-align: center;
        }
        .logo img {
            width: 20px;
            height: 20px;
            padding: 2px;
        }
        .title h1 {
            font-size: 8px;
            margin: 0;
            text-transform: uppercase;
            font-weight: 900;
        }
        .title p {
            font-size: 5px;
            margin: 0;
            color: rgba(255,255,255,0.7);
            text-transform: uppercase;
        }
        .title-back h1 {
            font-size: 10px;
            margin: 0;
            text-transform: uppercase;
            font-weight: 900;
        }
        .content {
            clear: both;
            margin-top: 8px;
        }
        .photo-box {
            float: left;
            width: 55px;
            height: 70px;
            background-color: #ffffff;
            border-radius: 4px;
            overflow: hidden;
            border: 1px solid rgba(0,0,0,0.1);
        }
        .photo-box img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .data-box {
            float: left;
            margin-left: 10px;
            width: 150px;
        }
        .data-row {
            margin-bottom: 3px;
        }
        .label {
            font-size: 6px;
            font-weight: bold;
            display: inline-block;
            width: 40px;
        }
        .value {
            font-size: 6px;
            font-weight: bold;
            display: inline-block;
        }
        .regulations {
            margin-top: 5px;
            padding-left: 15px;
        }
        .regulations li {
            font-size: 6px;
            margin-bottom: 4px;
            line-height: 1.2;
            font-weight: bold;
        }
        .footer-text {
            position: absolute; 
            bottom: 8px; 
            right: 10px; 
            font-size: 5px; 
            font-weight: bold;
        }
    </style>
</head>
<body>
    <!-- FRONT SIDE -->
    <div class="card-front">
        <div class="header">
            <div class="logo">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyJfrokhgVJyBQcEYH4eA-vpDrEZIzjv_7bvVahPX7OlpL2JwQvC9rMH5ESTH3cPGpufqZEpMJkfj49dDHewL9NweYUvWTxPMiFYO4LFgyEHfWQrXbs54rCgdDsqzGdVzSqLl1Z_gsTKD8xGBswVZ_ZeRgJqJrtCHh2UspctZprCOEui0yR_BlVpcZzdMN7q9gg_NcQlKKOsAoChqHlVvI6Fj2zHoeKTa_IDFu_uiQJdPuy-aDxpN0ERcL1s12zNUD3ol8WVvm1_g0"/>
            </div>
            <div class="title" style="float:left">
                <h1>Karang Taruna Indonesia</h1>
                <p>Kartu Tanda Anggota</p>
            </div>
            <div style="clear:both"></div>
        </div>

        <div class="content">
            <div class="photo-box">
                @if($user->photo)
                    <img src="{{ public_path('storage/' . $user->photo) }}"/>
                @else
                    <img src="https://ui-avatars.com/api/?name={{ urlencode($user->name) }}&background=E3F2FD&color=1A237E"/>
                @endif
            </div>
            <div class="data-box">
                <div class="data-row">
                    <span class="label">Nama</span>
                    <span class="value">: {{ strtoupper($user->name) }}</span>
                </div>
                <div class="data-row">
                    <span class="label">NIA</span>
                    <span class="value">: {{ $user->member_number ?? 'BELUM TERSEDIA' }}</span>
                </div>
                <div class="data-row">
                    <span class="label">Alamat</span>
                    <span class="value">: {{ $user->district ?? '-' }}, {{ $user->city ?? '-' }}</span>
                </div>
                <div class="data-row">
                    <span class="label">Jabatan</span>
                    <span class="value">: {{ strtoupper($user->position->name ?? 'ANGGOTA') }}</span>
                </div>
            </div>
            <div style="clear:both"></div>
        </div>

        <div class="footer-text" style="color: rgba(255,255,255,0.6)">
            Masa Berlaku : Seumur Hidup
        </div>
    </div>

    <!-- BACK SIDE -->
    <div class="card-back">
        <div class="header-back text-center">
            <div class="title-back">
                <h1 style="text-align: center">Ketentuan & Peraturan</h1>
            </div>
        </div>
        <ul class="regulations">
            <li>Kartu ini adalah tanda anggota resmi Karang Taruna Unit Desa.</li>
            <li>Pemegang kartu wajib menaati AD/ART organisasi yang berlaku.</li>
            <li>Wajib dibawa & ditunjukkan saat mengikuti kegiatan resmi organisasi.</li>
            <li>Penyalahgunaan kartu dapat dikenakan sanksi sesuai aturan internal.</li>
            <li>Jika menemukan kartu ini, harap lapor ke sekretariat terdekat.</li>
        </ul>
        
        <div class="footer-text" style="color: #1a237e; opacity: 0.5; width: 100%; text-align: center; right: 0; bottom: 10px;">
            Dikeluarkan Oleh Pengurus Pusat Karang Taruna
        </div>
    </div>
</body>
</html>
