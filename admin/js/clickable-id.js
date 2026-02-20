/**
 * clickable-id.js
 * Membuat kolom ID pada tabel menjadi link yang dapat diklik,
 * mengarahkan ke https://psikogram.lidan.co.id/?id_x=<nilai_id>
 *
 * Cara pakai: <script src="clickable-id.js"></script>
 * (letakkan sebelum </body> atau setelah tabel ter-render)
 */

(function () {
    const BASE_URL = 'https://psikogram.lidan.co.id/?id_x=';

    function makeIdClickable() {
        // Cari semua baris tabel (tbody tr)
        const rows = document.querySelectorAll('table tbody tr');

        rows.forEach(row => {
            const firstCell = row.querySelector('td:first-child');
            if (!firstCell) return;

            // Hindari duplikasi jika sudah diproses
            if (firstCell.dataset.linked === 'true') return;

            const idValue = firstCell.textContent.trim();
            if (!idValue) return;

            // Buat elemen <a>
            const link = document.createElement('a');
            link.href = BASE_URL + encodeURIComponent(idValue);
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = idValue;
            link.style.cssText = `
                color: #2563eb;
                text-decoration: none;
                font-weight: 600;
            `;
            link.addEventListener('mouseenter', () => {
                link.style.textDecoration = 'underline';
                link.style.color = '#1d4ed8';
            });
            link.addEventListener('mouseleave', () => {
                link.style.textDecoration = 'none';
                link.style.color = '#2563eb';
            });

            // Ganti isi cell dengan link
            firstCell.textContent = '';
            firstCell.appendChild(link);
            firstCell.dataset.linked = 'true';
        });
    }

    // Jalankan saat DOM siap
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', makeIdClickable);
    } else {
        makeIdClickable();
    }

    // Jalankan ulang setiap 5 detik untuk menangani auto-refresh / data baru
    setInterval(makeIdClickable, 5000);

})();