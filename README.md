# 💰 FinTrack

**FinTrack** adalah aplikasi manajemen keuangan pribadi berbasis web yang dirancang khusus untuk mahasiswa. Lacak pemasukan & pengeluaran, pantau target tabungan, dan simulasikan pertumbuhan investasimu — semuanya dalam satu dashboard yang modern dan responsif.

---

## ✨ Fitur Utama

### 📊 Dashboard
- Ringkasan **pemasukan**, **pengeluaran**, dan **tabungan** secara real-time
- **Health Score** keuangan berdasarkan rasio saving rate
- Perbandingan performa bulan ini vs bulan lalu (% naik/turun)
- **Insight otomatis** (kategori pengeluaran terbesar, saving rate, dll.)
- Grafik **Bar Chart** pengeluaran per kategori
- **Pie Chart** distribusi pengeluaran
- Grafik **tren bulanan** 6 bulan terakhir (income vs expense)
- List 5 transaksi terbaru

### 💳 Transaksi
- Tambah, lihat, dan kelola riwayat transaksi
- Kategori tersedia: 🍜 Makan, 🚌 Transport, ☕ Nongkrong, 📱 Kuota, 📚 Akademik, 🏦 Menabung, 💰 Pemasukan
- Input via modal yang bersih dan responsif

### 🎯 Target Tabungan
- Buat target tabungan dengan nama, nominal goal, dan warna kustom
- Progress bar visual per target
- Quick top-up dengan tombol +50K, +100K, +200K
- Statistik: total ditabung, jumlah goal aktif, rata-rata progress

### 📈 Simulasi Investasi
- Kalkulator **compound interest** interaktif dengan slider
- Parameter: Modal Awal (PV), Return Tahunan (%), Durasi (tahun), Tambahan per Bulan
- Grafik proyeksi pertumbuhan investasi hingga 40 tahun
- Tampilkan: Nilai Akhir, Total Modal Diinvestasikan, dan Keuntungan

### ⚙️ Pengaturan
- Kelola profil dan email akun
- Preferensi mata uang (IDR / USD) dan format tanggal
- Toggle **Dark Mode / Light Mode**
- Ganti password langsung dari aplikasi
- Logout aman

---

## 🛠️ Tech Stack

| Teknologi | Keterangan |
|---|---|
| **React 18** | UI Library utama |
| **Vite** | Build tool & dev server |
| **React Router v6** | Client-side routing |
| **Supabase** | Backend-as-a-Service (Auth + Database) |
| **Recharts** | Library grafik interaktif |
| **Lucide React** | Icon library |
| **Vanilla CSS** | Custom styling dengan CSS Variables |

---

## 🗂️ Struktur Proyek

```
FinTrack/
├── src/
│   ├── pages/
│   │   ├── Dashboard.jsx      # Halaman utama & ringkasan keuangan
│   │   ├── Transaksi.jsx      # Manajemen transaksi
│   │   ├── Target.jsx         # Target & goal tabungan
│   │   ├── Simulasi.jsx       # Simulasi investasi compound interest
│   │   ├── Pengaturan.jsx     # Profil & pengaturan akun
│   │   └── Login.jsx          # Halaman autentikasi
│   ├── components/
│   │   ├── Sidebar.jsx        # Navigasi sidebar
│   │   └── TransaksiModal.jsx # Modal input transaksi
│   ├── context/
│   │   ├── AuthContext.jsx    # State manajemen autentikasi
│   │   └── ThemeContext.jsx   # State manajemen tema (dark/light)
│   ├── lib/
│   │   └── supabase.js        # Konfigurasi Supabase client
│   ├── App.jsx                # Root component & routing
│   ├── main.jsx               # Entry point React
│   └── index.css              # Global styles & design system
├── index.html
├── vite.config.js
└── package.json
```

---

## 🚀 Cara Menjalankan Proyek

### Prasyarat
- **Node.js** v18 atau lebih baru
- **npm** atau **yarn**
- Akun **Supabase** (gratis di [supabase.com](https://supabase.com))

### 1. Clone Repository

```bash
git clone https://github.com/username/FinTrack.git
cd FinTrack
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Supabase

Buat project baru di [supabase.com](https://supabase.com), lalu buat tabel berikut:

**Tabel `transactions`**
```sql
create table transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  amount numeric not null,
  type text not null, -- 'pemasukan' | 'pengeluaran'
  cat text,
  date date,
  created_at timestamptz default now()
);
```

**Tabel `targets`**
```sql
create table targets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  goal numeric not null,
  saved numeric default 0,
  color text default 'fill-neon',
  created_at timestamptz default now()
);
```

> **Pastikan** Row Level Security (RLS) diaktifkan dan policy dikonfigurasi agar setiap user hanya bisa mengakses datanya sendiri.

### 4. Konfigurasi Environment

Buat file `.env` di root proyek:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Ganti dengan URL dan Anon Key dari dashboard Supabase proyekmu.

### 5. Jalankan Aplikasi

```bash
npm run dev
```

Buka browser dan akses `http://localhost:5173`

---

## 📦 Build untuk Produksi

```bash
npm run build
```

Output akan tersimpan di folder `dist/`. Bisa di-deploy ke Vercel, Netlify, atau hosting apapun yang mendukung static files.

---

## 🎨 Design System

FinTrack menggunakan dark-mode first design dengan CSS Variables:

- **Font Display**: Space Grotesk
- **Font Mono**: Space Mono  
- **Accent Color**: `#00f5c4` (Neon Cyan)
- **Background**: `#11111b` (Deep Dark)
- **Surface**: Glassmorphism layers

---

## 👤 Developer

Dibuat dengan ❤️ oleh **Muhammad** — Mahasiswa yang lelah ngitung uang jajan manual 😄

---

## 📄 Lisensi

Project ini dibuat untuk keperluan pembelajaran. Feel free to fork dan modifikasi sesuai kebutuhanmu!
