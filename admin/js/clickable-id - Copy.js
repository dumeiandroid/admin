/**
 * clickable-id.js
 * Membuat kolom ID dan X_01 pada tabel menjadi link yang dapat diklik:
 *  - Kolom ID  → https://psikogram.lidan.co.id/?id_x=<nilai>
 *  - Kolom X_01 → https://psikogram.lidan.co.id/?x_01=<nilai>
 *
 * Cara pakai: <script src="js/clickable-id.js"></script>
 * (letakkan sebelum </body>)
 */

(function () {
    const BASE_URL = 'https://psikogram.lidan.co.id/';

    /**
     * Temukan index kolom berdasarkan teks header (case-insensitive, trim)
     */
    function getColumnIndex(table, headerName) {
        const headers = table.querySelectorAll('thead th, thead td');
        for (let i = 0; i < headers.length; i++) {
            if (headers[i].textContent.trim().toLowerCase() === headerName.toLowerCase()) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Buat elemen <a> dengan style konsisten
     */
    function createLink(href, text) {
        const link = document.createElement('a');
        link.href = href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = text;
        link.style.cssText = 'color:#2563eb;text-decoration:none;font-weight:600;';
        link.addEventListener('mouseenter', () => {
            link.style.textDecoration = 'underline';
            link.style.color = '#1d4ed8';
        });
        link.addEventListener('mouseleave', () => {
            link.style.textDecoration = 'none';
            link.style.color = '#2563eb';
        });
        return link;
    }

    /**
     * Proses satu cell: jadikan link jika belum diproses
     */
    function processCell(cell, paramName) {
        if (!cell || cell.dataset.linked === 'true') return;
        const value = cell.textContent.trim();
        if (!value) return;

        const url = BASE_URL + '?' + paramName + '=' + encodeURIComponent(value);
        cell.textContent = '';
        cell.appendChild(createLink(url, value));
        cell.dataset.linked = 'true';
    }

    function makeColumnsClickable() {
        const tables = document.querySelectorAll('table');

        tables.forEach(table => {
            // Deteksi index kolom ID dan X_01 dari header
            const idIndex   = getColumnIndex(table, 'ID');
            const x01Index  = getColumnIndex(table, 'X_01');

            const rows = table.querySelectorAll('tbody tr');
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');

                if (idIndex >= 0)  processCell(cells[idIndex],  'id_x');
                if (x01Index >= 0) processCell(cells[x01Index], 'x_01');
            });
        });
    }

    // Jalankan saat DOM siap
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', makeColumnsClickable);
    } else {
        makeColumnsClickable();
    }

    // Jalankan ulang setiap 5 detik untuk menangani auto-refresh / data baru
    setInterval(makeColumnsClickable, 5000);

})();