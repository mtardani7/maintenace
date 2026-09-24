# UAT Checklist Maintenance System - Plant 3

## Tujuan

Memastikan flow operasional berikut dapat diuji secara manual sebelum implementasi digunakan:

`Incident -> Ticket OPEN -> Maintenance Work Detail -> CLOSED -> History`

## Informasi Pengujian

| Item | Isi |
| --- | --- |
| Plant | Plant 3 |
| Tester | ______________________________ |
| Tanggal | ______________________________ |
| Environment / URL | ______________________________ |
| User Operator | ______________________________ |
| User Maintenance / Technician | ______________________________ |

## Precondition

- [ ] User dapat login dan memiliki akses ke halaman Incident dan Maintenance Ticket.
- [ ] Plant 3 aktif.
- [ ] Minimal satu Machine aktif tersedia pada Plant 3.
- [ ] Minimal satu user Maintenance/Technician tersedia untuk Executor dan Action By.
- [ ] Tidak menggunakan data produksi yang tidak boleh diubah.
- [ ] Catat Ticket Number dan Incident ID untuk setiap scenario.

## Panduan Eksekusi

- Gunakan data Incident dari Scenario 2 sebagai satu ticket utama untuk Scenario 3 sampai 9.
- Jangan memakai ticket yang sama untuk Scenario 1 dan Scenario 2 karena Scenario 1 memang tidak boleh membuat ticket.
- Screenshot minimal harus memperlihatkan Ticket Number, status, section yang diuji, dan nilai field yang relevan.
- Untuk hasil API/error, simpan screenshot response atau catat status/error message yang tampil.
- Jika browser melakukan refresh, gunakan Ticket Number yang sama untuk membuka kembali detail ticket.
- Work Detail pada flow existing dikirim bersama aksi `Close Ticket`. Sebelum close, isi semua field dan lanjutkan Scenario 7; bila tidak ada tombol simpan Work Detail terpisah, jangan menganggap itu sebagai kegagalan.

## Aturan Status

- Status Incident yang digunakan: `OPEN` atau `RESOLVED`.
- Status Ticket yang digunakan: `OPEN` atau `CLOSED`.
- Spare Part, Breakdown Analysis, dan Verification adalah data optional, bukan status atau workflow.

---

## Scenario 1 - Incident Dapat Diselesaikan Operator

**Data uji**

- Plant: Plant 3
- Machine: ______________________________
- Problem Type: ______________________________
- Description: ______________________________

**Langkah**

- [ ] Buka halaman Incident.
- [ ] Pilih Plant 3.
- [ ] Pilih Machine.
- [ ] Pilih Problem Type.
- [ ] Isi Description.
- [ ] Pilih `Bisa diselesaikan`.
- [ ] Isi Action Taken.
- [ ] Isi Result.
- [ ] Submit Incident.

**Expected result**

- [ ] Incident tersimpan dengan status `RESOLVED`.
- [ ] Action Taken dan Result tampil pada detail/riwayat Incident.
- [ ] Tidak ada Maintenance Ticket baru yang dibuat.

**Evidence / catatan**

- Incident ID: ______________________________
- Ticket Number yang terlihat: ______________________________
- Hasil: [ ] PASS  [ ] FAIL
- Catatan: ____________________________________________________________

**Evidence yang disarankan**

- [ ] Screenshot form Incident sebelum submit.
- [ ] Screenshot riwayat Incident setelah submit.
- [ ] Screenshot daftar Ticket yang membuktikan tidak ada ticket baru.

---

## Scenario 2 - Incident Menjadi Maintenance Ticket

**Data uji**

- Plant: Plant 3
- Machine: ______________________________
- Problem Type: ______________________________
- Description: ______________________________

**Langkah**

- [ ] Buka halaman Incident.
- [ ] Pilih Plant 3 dan Machine.
- [ ] Isi Problem Type dan Description.
- [ ] Pilih `Tidak dapat diselesaikan`.
- [ ] Submit Incident.
- [ ] Buka daftar Maintenance Ticket.

**Expected result**

- [ ] Incident tetap tercatat dengan status `OPEN`.
- [ ] Satu Maintenance Ticket otomatis dibuat.
- [ ] Ticket berstatus `OPEN`.
- [ ] Plant pada ticket adalah Plant 3.
- [ ] Machine, Problem, dan Description sama dengan Incident.
- [ ] Tidak terjadi ticket duplikat dari satu submit.

**Evidence / catatan**

- Incident ID: ______________________________
- Ticket Number: ______________________________
- Hasil: [ ] PASS  [ ] FAIL
- Catatan: ____________________________________________________________

**Evidence yang disarankan**

- [ ] Screenshot Incident status `OPEN`.
- [ ] Screenshot Ticket Detail dengan status `OPEN`.
- [ ] Screenshot perbandingan data Plant, Machine, Problem, dan Description.

---

## Scenario 3 - Maintenance Work Detail

**Precondition**: Gunakan ticket dari Scenario 2 yang masih `OPEN`.

**Langkah**

- [ ] Buka Ticket Detail menggunakan Ticket Number.
- [ ] Isi Cause.
- [ ] Isi Action.
- [ ] Pilih Executor.
- [ ] Isi Duration.
- [ ] Isi Solution.
- [ ] Simpan data sesuai kontrol yang tersedia.
- [ ] Refresh halaman.
- [ ] Buka kembali Ticket Detail bila diperlukan.

**Expected result**

- [ ] Cause, Action, Executor, Duration, dan Solution tersimpan.
- [ ] Semua data tetap tampil setelah refresh.
- [ ] Ticket tetap berstatus `OPEN` sampai aksi Close dilakukan.

**Evidence / catatan**

- Executor: ______________________________
- Duration: ______________________________
- Hasil: [ ] PASS  [ ] FAIL
- Catatan: ____________________________________________________________

**Catatan eksekusi**

- Field Work Detail diisi pada ticket OPEN dan hasil penyimpanannya diverifikasi setelah Scenario 7 berhasil menutup ticket.

**Evidence yang disarankan**

- [ ] Screenshot seluruh field Work Detail yang sudah diisi sebelum Close.
- [ ] Screenshot Work Detail setelah ticket dibuka kembali dari History.

---

## Scenario 4 - Spare Part

**Precondition**: Ticket masih `OPEN`.

**Langkah**

- [ ] Buka section Spare Part.
- [ ] Tambahkan spare part pertama.
- [ ] Isi Nama Spare Part.
- [ ] Isi Kode Material.
- [ ] Isi Quantity.
- [ ] Isi Remark.
- [ ] Simpan.
- [ ] Tambahkan spare part kedua dengan data berbeda.
- [ ] Refresh halaman.
- [ ] Pastikan semua spare part tetap tampil.
- [ ] Hapus salah satu spare part saat ticket masih `OPEN`.
- [ ] Refresh halaman kembali.

**Expected result**

- [ ] Satu atau beberapa spare part dapat disimpan.
- [ ] Nama, Material, Quantity, dan Remark tersimpan benar.
- [ ] Spare part yang dihapus tidak tampil lagi setelah refresh.
- [ ] Spare part yang tidak dihapus tetap tampil.

**Evidence / catatan**

- Spare Part tersimpan: ______________________________
- Spare Part dihapus: ______________________________
- Hasil: [ ] PASS  [ ] FAIL
- Catatan: ____________________________________________________________

**Evidence yang disarankan**

- [ ] Screenshot daftar Spare Part sebelum refresh.
- [ ] Screenshot daftar Spare Part setelah refresh.
- [ ] Screenshot setelah item yang dihapus tidak lagi tampil.

---

## Scenario 5 - Post Breakdown Analysis

**Precondition**: Ticket masih `OPEN`.

**Langkah**

- [ ] Isi Root Cause Analysis.
- [ ] Isi Corrective Action Plan.
- [ ] Isi Target tanggal/waktu.
- [ ] Pilih Action By dari user Maintenance.
- [ ] Simpan analisa.
- [ ] Refresh halaman.

**Expected result**

- [ ] Root Cause Analysis tersimpan.
- [ ] Corrective Action Plan tersimpan.
- [ ] Target tersimpan dengan tanggal/waktu yang benar.
- [ ] Action By tersimpan dengan user yang dipilih.
- [ ] Semua data tetap tampil setelah refresh.
- [ ] Ticket tetap berstatus `OPEN`.

**Evidence / catatan**

- Action By: ______________________________
- Target: ______________________________
- Hasil: [ ] PASS  [ ] FAIL
- Catatan: ____________________________________________________________

**Evidence yang disarankan**

- [ ] Screenshot form Analysis sebelum simpan.
- [ ] Screenshot Analysis setelah refresh.

---

## Scenario 6 - Equipment Verification & Hygiene

**Precondition**: Ticket masih `OPEN`.

**Langkah**

- [ ] Isi Machine Cleanliness dengan `OK`, `NOK`, atau `N/A`.
- [ ] Isi Water dengan `OK`, `NOK`, atau `N/A`.
- [ ] Isi Grease dengan `OK`, `NOK`, atau `N/A`.
- [ ] Isi Gram dengan `OK`, `NOK`, atau `N/A`.
- [ ] Isi Machine Function dengan `OK`, `NOK`, atau `N/A`.
- [ ] Isi Machine Safety dengan `OK`, `NOK`, atau `N/A`.
- [ ] Isi Tool dengan `OK`, `NOK`, atau `N/A`.
- [ ] Gunakan kombinasi status pada checklist.
- [ ] Simpan Checklist.
- [ ] Refresh halaman.

**Expected result**

- [ ] Setiap item menyimpan pilihan yang dipilih.
- [ ] Kombinasi `OK`, `NOK`, dan `N/A` tetap benar.
- [ ] Semua data tetap tampil setelah refresh.
- [ ] Checklist tidak mengubah status ticket.

**Evidence / catatan**

- Kombinasi yang digunakan: ______________________________
- Hasil: [ ] PASS  [ ] FAIL
- Catatan: ____________________________________________________________

**Evidence yang disarankan**

- [ ] Screenshot checklist dengan kombinasi `OK`, `NOK`, dan `N/A`.
- [ ] Screenshot checklist setelah refresh.

---

## Scenario 7 - Close Ticket

### 7A. Close dengan Hasil Pekerjaan Tidak Lengkap

**Langkah**

- [ ] Pastikan ticket masih `OPEN`.
- [ ] Kosongkan salah satu atau beberapa field: Cause, Action, Executor, Duration, atau Solution.
- [ ] Coba Close Ticket.

**Expected result**

- [ ] Close ditolak.
- [ ] Error validation tampil jelas.
- [ ] Ticket tetap berstatus `OPEN`.
- [ ] Data optional tidak menghalangi close jika field wajib Work Detail sudah lengkap.

### 7B. Close dengan Semua Field Wajib Lengkap

**Langkah**

- [ ] Isi Cause.
- [ ] Isi Action.
- [ ] Pilih Executor.
- [ ] Isi Duration lebih besar dari nol.
- [ ] Isi Solution.
- [ ] Spare Part boleh ada atau kosong.
- [ ] Breakdown Analysis boleh ada atau kosong.
- [ ] Verification boleh ada atau kosong.
- [ ] Close Ticket.

**Expected result**

- [ ] Status berubah menjadi `CLOSED`.
- [ ] `closed_at` tersimpan.
- [ ] `closed_by` tersimpan sebagai user yang melakukan close.
- [ ] Close kedua pada ticket yang sama ditolak.
- [ ] Tidak ada data Work Detail, Spare Part, Breakdown Analysis, atau Verification yang hilang.

**Evidence / catatan**

- Closed At: ______________________________
- Closed By: ______________________________
- Hasil: [ ] PASS  [ ] FAIL
- Catatan: ____________________________________________________________

**Evidence yang disarankan**

- [ ] Screenshot error saat field wajib belum lengkap.
- [ ] Screenshot status `CLOSED` setelah close berhasil.
- [ ] Screenshot `closed_at` dan `closed_by`.

---

## Scenario 8 - History Ticket CLOSED

**Precondition**: Ticket telah `CLOSED` pada Scenario 7.

**Langkah**

- [ ] Refresh halaman Ticket Detail.
- [ ] Tutup halaman lalu buka kembali menggunakan Ticket Number.
- [ ] Periksa seluruh section.

**Expected result**

- [ ] Informasi Ticket tetap lengkap.
- [ ] Cause, Action, Executor, Duration, dan Solution tampil.
- [ ] Spare Part tetap tampil sebagai history.
- [ ] Breakdown Analysis tampil jika sebelumnya diisi.
- [ ] Verification tampil jika sebelumnya diisi.
- [ ] `closed_at` dan `closed_by` tampil.
- [ ] Tidak ada input edit.
- [ ] Tidak ada tombol Add/Remove Spare Part.
- [ ] Tidak ada tombol Save, Update, Close, atau Delete.
- [ ] Status tetap `CLOSED`.

**Evidence / catatan**

- Ticket Number: ______________________________
- Hasil: [ ] PASS  [ ] FAIL
- Catatan: ____________________________________________________________

**Evidence yang disarankan**

- [ ] Screenshot Ticket Detail CLOSED setelah refresh.
- [ ] Screenshot setiap section history yang terisi.
- [ ] Screenshot area yang menunjukkan tidak ada kontrol edit/action.

---

## Scenario 9 - Protection Ticket CLOSED

**Precondition**: Gunakan ticket `CLOSED` dari Scenario 7.

**Langkah dan expected result**

- [ ] Dari UI, pastikan edit Work Detail -> tidak ada input/action.
- [ ] Dari UI, pastikan tambah Spare Part -> tidak ada tombol Add.
- [ ] Dari UI, pastikan hapus Spare Part -> tidak ada tombol Remove.
- [ ] Dari UI, pastikan update Breakdown Analysis -> tidak ada input/save.
- [ ] Dari UI, pastikan update Verification -> tidak ada kontrol yang aktif.
- [ ] Dengan API client yang disetujui, bila tersedia, coba delete Ticket -> ditolak.
- [ ] Dengan API client yang disetujui, bila tersedia, coba tambah/hapus Spare Part -> ditolak.
- [ ] Dengan API client yang disetujui, bila tersedia, coba Close Ticket lagi -> ditolak.
- [ ] Tidak ada perubahan data setelah seluruh percobaan.

**Catatan eksekusi**

- Pemeriksaan API hanya dilakukan bila tester memang memiliki akses ke tool API UAT. Tanpa tool tersebut, bukti UI read-only tetap dicatat dan pengecekan API dilakukan oleh tester teknis.

**Evidence / catatan**

- Response/error yang terlihat: ______________________________
- Hasil: [ ] PASS  [ ] FAIL
- Catatan: ____________________________________________________________

**Evidence yang disarankan**

- [ ] Screenshot Ticket CLOSED tanpa kontrol mutasi.
- [ ] Screenshot error/status response untuk request API yang ditolak, bila dilakukan.

---

## Scenario 10 - Existing Data

**Data yang diuji**

- [ ] Ticket existing tanpa Spare Part.
- [ ] Ticket existing tanpa Breakdown Analysis.
- [ ] Ticket existing tanpa Verification.
- [ ] Ticket existing tanpa `closed_by`.
- Ticket Number: ______________________________

**Langkah**

- [ ] Buka ticket existing dari Ticket List/History.
- [ ] Refresh halaman.
- [ ] Buka kembali ticket menggunakan Ticket Number.

**Expected result**

- [ ] Ticket dapat dibuka tanpa error.
- [ ] Section Spare Part tampil aman dalam kondisi kosong.
- [ ] Section Breakdown Analysis tampil aman dalam kondisi kosong.
- [ ] Section Verification tampil aman dalam kondisi kosong.
- [ ] `closed_by` kosong/null tidak menyebabkan error.
- [ ] Data ticket existing tidak berubah atau terhapus.

**Evidence / catatan**

- Hasil: [ ] PASS  [ ] FAIL
- Catatan: ____________________________________________________________

**Evidence yang disarankan**

- [ ] Screenshot ticket existing saat pertama dibuka.
- [ ] Screenshot section optional dalam kondisi kosong.
- [ ] Screenshot setelah refresh.

---

## Final Sign-off

| Area | Status | Catatan |
| --- | --- | --- |
| Incident operator resolved | [ ] PASS [ ] FAIL | |
| Incident creates OPEN ticket | [ ] PASS [ ] FAIL | |
| Work Detail persistence | [ ] PASS [ ] FAIL | |
| Spare Part persistence | [ ] PASS [ ] FAIL | |
| Breakdown Analysis persistence | [ ] PASS [ ] FAIL | |
| Verification persistence | [ ] PASS [ ] FAIL | |
| Close validation and audit | [ ] PASS [ ] FAIL | |
| CLOSED history read-only | [ ] PASS [ ] FAIL | |
| Existing data compatibility | [ ] PASS [ ] FAIL | |

**Overall UAT result:** [ ] PASS  [ ] FAIL

**Tester signature:** ______________________________

**Reviewer signature:** ______________________________
