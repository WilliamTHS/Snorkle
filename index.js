const fs = require('fs');
const { execSync } = require('child_process');
const inquirer = require('inquirer');
const chalk = require('chalk');

const consoleHeader = chalk.yellow(`
 ╻ ━━┏┓      ┓ ┓   • 
━╋━━━┗┓┏┓┏┓┏┓┃┏┃┏┓ ┓┏
 ╹ ━━┗┛┛┗┗┛┛ ┛┗┗┗ •┃┛
                   ┛ 
`);

const infoPrefix = chalk.blue('[*] INFO:  ');
const errorPrefix = chalk.red('[!] ERROR:  ');
const logsPrefix = chalk.green('[?] LOGS:  ');

// Fungsi untuk mencatat aktivitas
function catatAktivitas(namaAplikasi) {
  const waktu = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });
  const catatan = `${waktu} - Aplikasi ${namaAplikasi} dibuka\n`;

  fs.appendFile('aktivitas.txt', catatan, (err) => {
    if (err) {
      console.error(errorPrefix + 'Gagal menyimpan catatan aktivitas:', err);
      jedaWaktu(5000);
    } else {
      console.log(logsPrefix + `Sistem telah mencatat adanya aktivitas baru. Silakan periksa file aktivitas.txt untuk informasi lebih lanjut. Terima kasih. [${chalk.bgWhite(chalk.blackBright(waktu))}]`);
    }
  });
}

// Fungsi untuk mendapatkan daftar aplikasi yang sedang berjalan di Windows
function getDaftarAplikasi() {
  try {
    const output = execSync('tasklist /fo csv /nh').toString();
    const daftarAplikasi = output
      .split('\r\n')
      .filter((line) => line.trim() !== '')
      .map((line) => {
        const columns = line.split('","');
        return columns[0].replace('"', '');
      });
    return daftarAplikasi;
  } catch (err) {
    console.error(errorPrefix + 'Gagal mendapatkan daftar aplikasi:', err);
    jedaWaktu(5000);
    return [];
  }
}

// Fungsi untuk meminta pengguna memasukkan kata sandi
async function mintaKataSandi() {
  const { password } = await inquirer.prompt([
    {
      type: 'password',
      name: 'password',
      message: 'Masukkan kata sandi:',
      mask: '*' // Mengganti input dengan karakter bintang (*)
    }
  ]);

  return password;
}

// Fungsi untuk membuat jeda waktu
function jedaWaktu(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Fungsi untuk memantau perubahan dalam daftar aplikasi
async function monitorAktivitas() {
  console.clear();
  console.log(consoleHeader);

  let password = '';

  while (password !== 'williamns') {
    console.clear();
    console.log(consoleHeader);

    password = await mintaKataSandi();

    if (password !== 'williamns') {
      console.clear();
      console.log(consoleHeader);
      console.log(errorPrefix + 'Mohon maaf, terjadi kesalahan. Password yang Anda masukkan tidak dikenali. Ada kemungkinan kata sandi yang Anda masukkan kosong atau tidak valid. Mohon masukkan kata sandi yang valid dan dapat diterima oleh sistem. Terima kasih.');

      // Jeda waktu 5 detik
      await jedaWaktu(5000);
    }
  }

  console.clear();
  console.log(consoleHeader);
  console.log(infoPrefix + 'Kata sandi diterima. Memulai pemantauan aktivitas...\n');

  let daftarAplikasiSebelumnya = getDaftarAplikasi();

  setInterval(() => {
    const daftarAplikasiSekarang = getDaftarAplikasi();

    // Cari aplikasi yang baru dibuka
    const aplikasiBaru = daftarAplikasiSekarang.find(
      (app) => !daftarAplikasiSebelumnya.includes(app)
    );

    if (aplikasiBaru) {
      catatAktivitas(aplikasiBaru);
    }

    daftarAplikasiSebelumnya = daftarAplikasiSekarang;
  }, 1000);
}

// Jalankan pemantauan aktivitas
monitorAktivitas();
