const namaPengguna = "alifiyan";
const form = document.getElementById('formTugas');
const daftarTugas = document.getElementById('daftarTugas');
const toastContainer = document.getElementById('toastContainer');
const judulInput = document.getElementById('judul');
const deskripsiInput = document.getElementById('deskripsi');
const deadlineInput = document.getElementById('deadline');

let tugasList = JSON.parse(localStorage.getItem(`tugas_${namaPengguna}`)) || [];

// Minta izin notifikasi dari browser
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

// Simpan data ke localStorage
function simpanTugas() {
  localStorage.setItem(`tugas_${namaPengguna}`, JSON.stringify(tugasList));
}

// Tampilkan semua tugas ke dalam tabel
function renderTugas() {
  daftarTugas.innerHTML = '';
  const sekarang = new Date();

  tugasList.forEach((tugas, index) => {
    const deadlineTugas = new Date(tugas.deadline);
    const terlambat = deadlineTugas < sekarang;
    const rowClass = terlambat ? 'baris-terlambat' : '';
    const judulTeks = terlambat ? `<span class="ikon-terlambat">${tugas.judul}</span>` : tugas.judul;

    const row = document.createElement('tr');
    row.className = rowClass;
    row.innerHTML = `
      <td>${judulTeks}</td>
      <td>${tugas.deskripsi}</td>
      <td>${deadlineTugas.toLocaleString('id-ID', {
        dateStyle: 'full', timeStyle: 'short'
      })}</td>
      <td>
        <button class="btn btn-warning btn-sm me-1" onclick="editTugas(${index})">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-danger btn-sm" onclick="hapusTugas(${index})">
          <i class="fas fa-trash"></i>
        </button>
      </td>`;
    daftarTugas.appendChild(row);
  });
}


// Edit tugas
function editTugas(index) {
  const tugas = tugasList[index];
  const judulBaru = prompt('Edit Judul:', tugas.judul);
  const deskripsiBaru = prompt('Edit Deskripsi:', tugas.deskripsi);
  const deadlineBaru = prompt('Edit Deadline (YYYY-MM-DDTHH:MM):', tugas.deadline);

  if (judulBaru && deskripsiBaru && deadlineBaru) {
    tugasList[index] = { judul: judulBaru, deskripsi: deskripsiBaru, deadline: deadlineBaru };
    simpanTugas();
    renderTugas();
  }
}

// Hapus satu tugas
function hapusTugas(index) {
  if (confirm("Yakin ingin menghapus catatan ini?")) {
    tugasList.splice(index, 1);
    simpanTugas();
    renderTugas();
  }
}

// Hapus semua tugas
function hapusSemuaTugas() {
  if (confirm("Yakin ingin menghapus semua catatan?")) {
    tugasList = [];
    simpanTugas();
    renderTugas();
  }
}

// Tampilkan notifikasi dengan suara
function tampilkanNotifikasi(teks) {
  const audio = document.getElementById("notifikasiSuara");
  audio.play();

  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("🔔 Pengingat Tugas", {
      body: teks,
      icon: "https://cdn-icons-png.flaticon.com/512/1250/1250615.png"
    });
  } else {
    const notifikasi = document.createElement('div');
    notifikasi.className = 'toast align-items-center text-bg-danger toast-animasi show';
    notifikasi.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${teks}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>`;

    toastContainer.appendChild(notifikasi);

    // Tambahkan animasi keluar sebelum dihapus
    setTimeout(() => {
      notifikasi.classList.remove('toast-animasi');
      notifikasi.classList.add('toast-keluar');
      setTimeout(() => notifikasi.remove(), 400); // tunggu animasi keluar selesai
    }, 9000);
  }
}


// Cek tugas yang mendekati deadline
// function cekPengingat() {
//   const sekarang = new Date();
//   const dalamSejam = tugasList.filter(t => {
//     const dl = new Date(t.deadline);
//     return dl - sekarang <= 3600000 && dl - sekarang > 0;
//   });

//   if (dalamSejam.length > 0) {
//     tampilkanNotifikasi(
//       `🛎️ Tugas mendekati deadline:\n` +
//       dalamSejam.map(t => `${t.judul} (${new Date(t.deadline).toLocaleTimeString('id-ID')})`).join(', ')
//     );
//   }
// }

// Cek tugas yang tepat saat deadline
function cekTepatDeadline() {
  const sekarang = new Date();
  tugasList.forEach(t => {
    const waktuDeadline = new Date(t.deadline);
    const selisih = waktuDeadline - sekarang;
    if (Math.abs(selisih) <= 30000) {
      tampilkanNotifikasi(`⏰ Deadline sekarang: ${t.judul}`);
    }
  });
}

// Filter tugas berdasarkan input pencarian
function filterTugas() {
  const kataKunci = document.getElementById('inputPencarian').value.toLowerCase();
  const baris = daftarTugas.getElementsByTagName('tr');
  for (let i = 0; i < baris.length; i++) {
    const kolom = baris[i].getElementsByTagName('td');
    const cocok = [...kolom].some(td =>
      td.innerText.toLowerCase().includes(kataKunci)
    );
    baris[i].style.display = cocok ? '' : 'none';
  }
}

// Tampilkan tanggal dan waktu sekarang
function updateWaktu() {
  const sekarang = new Date();
  document.getElementById('hariIni').textContent = sekarang.toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  document.getElementById('waktuSekarang').textContent = sekarang.toLocaleTimeString('id-ID');
}

// Tambahkan tugas baru dari form
form.addEventListener('submit', function (e) {
  e.preventDefault();
  const judul = judulInput.value.trim();
  const deskripsi = deskripsiInput.value.trim();
  const deadline = deadlineInput.value.trim();
  if (judul && deskripsi && deadline) {
    tugasList.unshift({ judul, deskripsi, deadline });
    simpanTugas();
    renderTugas();
    judulInput.value = '';
    deskripsiInput.value = '';
    deadlineInput.value = '';
  }
});

// Jika user kembali ke tab
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    cekPengingat();
    cekTepatDeadline();
  }
});

// Jalankan semua fungsi utama
renderTugas();
updateWaktu();
// cekPengingat();
cekTepatDeadline();

// Interval berkala
setInterval(updateWaktu, 1000);
// setInterval(cekPengingat, 180000);
setInterval(cekTepatDeadline, 15000);
setInterval(renderTugas, 10000); // render ulang setiap 10 detik
