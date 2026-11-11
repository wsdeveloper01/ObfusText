(function () {
    'use strict';

    // ==========================================
    // OBFUSTEXT - logika bersama (versi JS)
    // Pola: 5 karakter acak + 1 huruf asli, diulang.
    // ==========================================

    var NOISE_LEN  = 5;
    var BLOCK      = NOISE_LEN + 1;
    var MAX_ENCODE = 1000;
    var MAX_INPUT  = MAX_ENCODE * BLOCK;
    var POOL = Array.from('!@#$%^&*()_+-=[]{}|;:,.<>?abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
    var HANDOFF = 'obfustext:handoff';

    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function $(id) { return document.getElementById(id); }
    function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
    function nf(n) { return n.toLocaleString('id-ID'); }

    // Angka acak tanpa bias (rejection sampling), pakai crypto kalau ada
    function randInt(max) {
        var c = window.crypto || window.msCrypto;
        if (!c || !c.getRandomValues) { return Math.floor(Math.random() * max); }
        var limit = Math.floor(0x100000000 / max) * max;
        var buf = new Uint32Array(1);
        do { c.getRandomValues(buf); } while (buf[0] >= limit);
        return buf[0] % max;
    }
    function noiseChar() { return POOL[randInt(POOL.length)]; }
    function noiseStr(n) {
        var s = '';
        for (var i = 0; i < n; i++) { s += noiseChar(); }
        return s;
    }

    function normalize(t) {
        t = String(t || '').replace(/\r\n?/g, '\n');
        return Array.from(t).slice(0, MAX_INPUT).join('');
    }

    function doEncode(input) {
        var list = Array.from(input);
        var notice = '';
        if (list.length > MAX_ENCODE) {
            list = list.slice(0, MAX_ENCODE);
            notice = 'Teksnya kepanjangan, jadi dipotong sampai ' + nf(MAX_ENCODE) + ' karakter pertama. Obi capek ngetik.';
        }
        var blocks = list.map(function (c) { return { noise: noiseStr(NOISE_LEN), ch: c }; });
        return {
            blocks: blocks,
            plain: blocks.map(function (b) { return b.noise + b.ch; }).join(''),
            inLen: list.length,
            outLen: list.length * BLOCK,
            notice: notice
        };
    }

    function doDecode(input) {
        var list = Array.from(input);
        var plain = '';
        for (var i = 0; i < list.length; i++) {
            if ((i + 1) % BLOCK === 0) { plain += list[i]; }
        }
        var notice = '';
        if (list.length % BLOCK !== 0) {
            notice = 'Panjang sandinya bukan kelipatan ' + BLOCK + ', jadi hasilnya mungkin tidak utuh. Cek lagi apakah sandinya tersalin lengkap.';
        }
        return { plain: plain, inLen: list.length, outLen: Array.from(plain).length, notice: notice };
    }

    // ==========================================
    // Maskot "Obi"
    // ==========================================
    var INK = '#1d1b2e';

    function mascotSVG(mood, body, decor) {
        var s = '<svg class="mascot" viewBox="0 0 200 200" ' +
            (decor ? 'aria-hidden="true"' : 'role="img" aria-label="Obi, maskot hantu kecil"') + '>';

        s += '<ellipse cx="100" cy="190" rx="54" ry="7" fill="rgba(29,27,46,.18)"/>';
        s += '<path d="M38 112 C38 54 68 24 100 24 C132 24 162 54 162 112 L162 164 ' +
             'Q146.5 184 131 164 Q115.5 184 100 164 Q84.5 184 69 164 Q53.5 184 38 164 Z" ' +
             'fill="' + body + '" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>';
        s += '<path d="M62 64 Q70 48 86 42" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".75"/>';
        s += '<ellipse cx="56" cy="120" rx="9" ry="6" fill="#ff7aa8" opacity=".85"/>';
        s += '<ellipse cx="144" cy="120" rx="9" ry="6" fill="#ff7aa8" opacity=".85"/>';

        if (mood === 'spy') {
            s += '<rect x="56" y="78" width="42" height="28" rx="10" fill="' + INK + '"/>';
            s += '<rect x="102" y="78" width="42" height="28" rx="10" fill="' + INK + '"/>';
            s += '<path d="M98 88 L102 88" stroke="' + INK + '" stroke-width="5"/>';
            s += '<path d="M63 86 L72 86" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".6"/>';
            s += '<path d="M110 86 L119 86" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".6"/>';
            s += '<path d="M86 126 Q102 138 118 120" fill="none" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>';
            s += '<text x="10" y="62" font-size="26" fill="#ff5c93" transform="rotate(-14 10 62)">#</text>';
            s += '<text x="168" y="48" font-size="26" fill="#2f9bff" transform="rotate(12 168 48)">%</text>';
            s += '<text x="172" y="128" font-size="24" fill="#ff9f1c" transform="rotate(-8 172 128)">?</text>';
            s += '<text x="8" y="136" font-size="24" fill="#16b36f" transform="rotate(10 8 136)">@</text>';
        } else if (mood === 'detective') {
            s += '<circle cx="74" cy="92" r="13" fill="#fff" stroke="' + INK + '" stroke-width="4"/>';
            s += '<circle class="pupil" cx="76" cy="94" r="6" fill="' + INK + '"/>';
            s += '<path d="M142 112 L168 140" stroke="' + INK + '" stroke-width="10" stroke-linecap="round"/>';
            s += '<circle cx="124" cy="94" r="25" fill="rgba(255,255,255,.7)" stroke="' + INK + '" stroke-width="6"/>';
            s += '<circle cx="124" cy="94" r="11" fill="#fff" stroke="' + INK + '" stroke-width="3"/>';
            s += '<circle class="pupil" cx="126" cy="96" r="6" fill="' + INK + '"/>';
            s += '<ellipse cx="96" cy="132" rx="8" ry="10" fill="' + INK + '"/>';
            s += '<text x="10" y="58" font-size="26" fill="#f2a900" transform="rotate(-12 10 58)">H</text>';
            s += '<text x="12" y="132" font-size="24" fill="#2f9bff" transform="rotate(10 12 132)">a</text>';
            s += '<text x="172" y="60" font-size="24" fill="#ff5c93" transform="rotate(14 172 60)">i</text>';
        } else if (mood === 'shock') {
            s += '<circle cx="78" cy="90" r="17" fill="#fff" stroke="' + INK + '" stroke-width="4"/>';
            s += '<circle cx="122" cy="90" r="17" fill="#fff" stroke="' + INK + '" stroke-width="4"/>';
            s += '<circle cx="78" cy="90" r="4" fill="' + INK + '"/>';
            s += '<circle cx="122" cy="90" r="4" fill="' + INK + '"/>';
            s += '<ellipse cx="100" cy="134" rx="11" ry="14" fill="' + INK + '"/>';
            s += '<path d="M40 70 L28 60 M42 84 L26 82 M160 70 L172 60 M158 84 L174 82" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>';
            s += '<text x="92" y="20" font-size="30" fill="#ff5c93">!</text>';
        } else if (mood === 'wink') {
            s += '<circle cx="78" cy="92" r="15" fill="#fff" stroke="' + INK + '" stroke-width="4"/>';
            s += '<circle cx="81" cy="94" r="7" fill="' + INK + '"/>';
            s += '<path d="M108 94 Q122 82 136 94" fill="none" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>';
            s += '<path d="M82 120 Q100 150 118 120 Z" fill="' + INK + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>';
            s += '<ellipse cx="100" cy="134" rx="7" ry="4" fill="#ff7aa8"/>';
        } else {
            s += '<circle cx="78" cy="92" r="15" fill="#fff" stroke="' + INK + '" stroke-width="4"/>';
            s += '<circle cx="122" cy="92" r="15" fill="#fff" stroke="' + INK + '" stroke-width="4"/>';
            s += '<circle class="pupil" cx="81" cy="94" r="7" fill="' + INK + '"/>';
            s += '<circle class="pupil" cx="125" cy="94" r="7" fill="' + INK + '"/>';
            s += '<path d="M84 122 Q100 148 116 122 Z" fill="' + INK + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>';
            s += '<ellipse cx="100" cy="133" rx="6" ry="3.5" fill="#ff7aa8"/>';
        }
        return s + '</svg>';
    }

    function renderMascot(el, mood) {
        el.innerHTML = mascotSVG(mood || el.getAttribute('data-mascot') || 'happy',
            el.getAttribute('data-body') || '#7ee8b8', el.hasAttribute('data-decor'));
    }

    function renderAllMascots() {
        Array.prototype.forEach.call(document.querySelectorAll('[data-mascot]'), function (el) {
            renderMascot(el);
        });
    }

    // Mata Obi mengikuti kursor / jari
    function setupEyes() {
        if (reduceMotion) { return; }
        var ticking = false, px = 0, py = 0;
        function move() {
            ticking = false;
            Array.prototype.forEach.call(document.querySelectorAll('svg.mascot'), function (svg) {
                var r = svg.getBoundingClientRect();
                if (!r.width) { return; }
                var dx = px - (r.left + r.width / 2);
                var dy = py - (r.top + r.height / 2);
                var d = Math.sqrt(dx * dx + dy * dy) || 1;
                var k = Math.min(1, d / 160) * 4;
                var tx = (dx / d * k).toFixed(2) + 'px';
                var ty = (dy / d * k).toFixed(2) + 'px';
                Array.prototype.forEach.call(svg.querySelectorAll('.pupil'), function (p) {
                    p.style.transform = 'translate(' + tx + ',' + ty + ')';
                });
            });
        }
        function onMove(e) {
            var t = e.touches ? e.touches[0] : e;
            px = t.clientX; py = t.clientY;
            if (!ticking) { ticking = true; requestAnimationFrame(move); }
        }
        window.addEventListener('mousemove', onMove, { passive: true });
        window.addEventListener('touchmove', onMove, { passive: true });
    }

    // ==========================================
    // Bicara & colek Obi
    // ==========================================
    var quipEl = $('quip');
    var quipTimer = null;

    function say(text, ms) {
        if (!quipEl) { return; }
        quipEl.textContent = text;
        quipEl.classList.remove('wiggle');
        void quipEl.offsetWidth;
        quipEl.classList.add('wiggle');
        clearTimeout(quipTimer);
        if (ms) {
            quipTimer = setTimeout(function () { quipEl.classList.remove('wiggle'); }, ms);
        }
    }

    function moodFor(el, mood, back, ms) {
        if (!el) { return; }
        renderMascot(el, mood);
        setTimeout(function () { renderMascot(el, back); }, ms || 1800);
    }

    var POKES = [
        'Geli! Jangan colek-colek!',
        'Aduh. Aku kan tembus pandang, kok bisa kena?',
        'Boo! ...kamu nggak kaget ya? Yah.',
        'Aku lagi kerja nih. Jangan diganggu.',
        'Colek lagi, aku ngambek lho.',
        'Hihihi, lagi dong. Eh, jangan.',
        'Tadi sarapan apa? Aku sih nggak sarapan. Hantu.',
        'Jari kamu hangat. Aku jadi baper.',
        'Awas, nanti kamu aku sembunyiin di antara #$%&.'
    ];
    var pokeCount = 0;

    function setupPoke() {
        Array.prototype.forEach.call(document.querySelectorAll('[data-poke]'), function (el) {
            el.setAttribute('role', 'button');
            el.setAttribute('tabindex', '0');
            el.setAttribute('aria-label', 'Colek Obi');
            function poke() {
                pokeCount++;
                var base = el.getAttribute('data-mascot');
                el.classList.remove('squish', 'spin');
                void el.offsetWidth;
                if (pokeCount % 10 === 0) {
                    el.classList.add('spin');
                    say('OKE CUKUP. Aku pindah ke kulkas. (Obi muter-muter pusing)');
                    moodFor(el, 'shock', base, 2200);
                    confetti(40);
                } else {
                    el.classList.add('squish');
                    say(pick(POKES));
                    moodFor(el, Math.random() < .5 ? 'wink' : 'shock', base, 1100);
                }
            }
            el.addEventListener('click', poke);
            el.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); poke(); }
            });
        });
    }

    // ==========================================
    // Konfeti karakter acak
    // ==========================================
    function confetti(n) {
        if (reduceMotion) { return; }
        var colors = ['#ff5c93', '#2f9bff', '#ff9f1c', '#16b36f', '#8a5cf6'];
        var layer = document.createElement('div');
        layer.className = 'confetti';
        layer.setAttribute('aria-hidden', 'true');
        for (var i = 0; i < n; i++) {
            var s = document.createElement('span');
            s.textContent = noiseChar();
            s.style.left = (Math.random() * 100) + 'vw';
            s.style.color = pick(colors);
            s.style.fontSize = (18 + Math.random() * 22).toFixed(0) + 'px';
            s.style.setProperty('--dx', (Math.random() * 160 - 80).toFixed(0) + 'px');
            s.style.setProperty('--rot', (Math.random() * 720 - 360).toFixed(0) + 'deg');
            s.style.animationDuration = (1.2 + Math.random() * 1.1).toFixed(2) + 's';
            s.style.animationDelay = (Math.random() * .35).toFixed(2) + 's';
            layer.appendChild(s);
        }
        document.body.appendChild(layer);
        setTimeout(function () { layer.remove(); }, 3000);
    }

    // ==========================================
    // Umum: tahun, penghitung, Ctrl+Enter, salin
    // ==========================================
    var yr = $('year');
    if (yr) { yr.textContent = new Date().getFullYear(); }

    var area = $('teks');
    var count = document.querySelector('[data-count-for="teks"]');
    var form = $('form');

    function updateCount() {
        if (area && count) {
            count.textContent = nf(Array.from(area.value).length) + ' karakter';
        }
    }
    if (area) {
        area.addEventListener('input', updateCount);
        area.addEventListener('keydown', function (e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (form && form.requestSubmit) { form.requestSubmit(); } else if (form) { form.dispatchEvent(new Event('submit', { cancelable: true })); }
            }
        });
        updateCount();
    }

    var hapus = $('hapus');
    if (hapus && area) {
        hapus.addEventListener('click', function () {
            area.value = '';
            updateCount();
            area.focus();
            say(pick(['Bersih! Kayak hati kamu.', 'Kotak dikosongkan. Obi sapu-sapu dulu.', 'Hilang semua. Kayak uang akhir bulan.']));
        });
    }

    function copyText(text, btn) {
        var label = btn.textContent;
        function done(ok) {
            btn.textContent = ok ? 'Tersalin!' : 'Gagal menyalin';
            setTimeout(function () { btn.textContent = label; }, 1800);
        }
        function fallback() {
            var t = document.createElement('textarea');
            t.value = text;
            t.style.position = 'fixed';
            t.style.opacity = '0';
            document.body.appendChild(t);
            t.select();
            var ok = false;
            try { ok = document.execCommand('copy'); } catch (e) {}
            document.body.removeChild(t);
            done(ok);
        }
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
        } else {
            fallback();
        }
    }

    function showResultBox(notice, hasResult) {
        var box = $('hasil'), n = $('notice'), body = $('resultBody');
        box.hidden = false;
        n.hidden = !notice;
        n.textContent = notice || '';
        body.hidden = !hasResult;
        box.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }

    // ==========================================
    // Halaman: Beranda
    // ==========================================
    function pageHome() {
        say(pick([
            'Halo! Aku Obi, hantu yang jago nyimpen rahasia (yang nggak penting-penting amat).',
            'Psst... pesanmu aman. Kecuali ketahuan polanya. Hehe.',
            'Aku nggak makan huruf kok. Cuma nyembunyiin.',
            'Boo! Eh, jangan kaget. Aku ramah.'
        ]));

        var t = $('ticker');
        if (t) {
            var line = '';
            for (var i = 0; i < 14; i++) { line += noiseStr(5) + ' BOO! '; }
            t.innerHTML = '<span></span><span></span>';
            t.children[0].textContent = line;
            t.children[1].textContent = line;
        }

        var FACTS = [
            'Hantu paling betah nongkrong di tempat yang ada WiFi-nya. Itu hoaks, tapi Obi percaya.',
            'Kalau kamu salah ketik di sandi, Obi ikut bingung dan jadi nanya ke kulkas.',
            'Satu huruf asli butuh lima bodyguard. Mahal, tapi aman.',
            'Kata "Hai" jadi 18 karakter setelah disamarkan. Gemuk, tapi bahagia.',
            'Obi pernah nyoba nyamarin kata "rahasia". Hasilnya malah jadi trending.',
            'Pesan 1.000 huruf akan jadi 6.000 karakter. Cukup buat ngerjain seluruh grup RT.',
            'Obi takut sama satu hal: baterai HP tinggal 1 persen.',
            'Kalau pola ini ketahuan, kamu cuma butuh jari buat ngitung sampai enam.'
        ];
        var fact = $('fact'), nextBtn = $('nextFact'), last = -1;
        function showFact() {
            var k;
            do { k = Math.floor(Math.random() * FACTS.length); } while (k === last && FACTS.length > 1);
            last = k;
            fact.textContent = FACTS[k];
        }
        if (fact) { showFact(); }
        if (nextBtn) { nextBtn.addEventListener('click', showFact); }
    }

    // ==========================================
    // Halaman: Samarkan
    // ==========================================
    function pageSamarkan() {
        var head = $('headArt');
        var out = $('out');
        var current = null;

        var SAMPLES = [
            'Ketemu di kantin jam 12 ya!',
            'Jangan bilang-bilang, tapi aku lapar banget.',
            'Besok kita bolos... eh, maksudnya belajar kelompok.',
            'Password wifi tetangga: jangan dipakai.',
            'Aku tahu apa yang kamu makan semalam.',
            'Mantan kamu lagi online. Sabar ya.',
            'Hantu juga butuh liburan. Ke mana ya?'
        ];

        $('contoh').addEventListener('click', function () {
            area.value = pick(SAMPLES);
            updateCount();
            say('Nih, contoh dari Obi. Ngasal tapi niat.');
        });

        var ph = [
            'Contoh: Ketemu di kantin jam 12 ya!',
            'Contoh: Aku sayang kamu (tapi rahasia).',
            'Contoh: Kode brankas: 1234 (bercanda).'
        ];
        area.placeholder = pick(ph);

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var input = normalize(area.value);
            if (input.trim() === '') {
                showResultBox('Kotaknya masih kosong. Tulis pesannya dulu ya.', false);
                $('next').hidden = true;
                say('Kotaknya kosong. Aku nggak bisa nyamarin angin.');
                moodFor(head, 'shock', 'spy', 2000);
                return;
            }

            current = doEncode(input);
            out.textContent = '';
            var frag = document.createDocumentFragment();
            var animate = !reduceMotion;
            current.blocks.forEach(function (b, idx) {
                var i = document.createElement('i');
                i.textContent = b.noise;
                var bb = document.createElement('b');
                bb.textContent = b.ch;
                if (animate && idx < 120) {
                    var d = (idx * 0.03).toFixed(2) + 's';
                    i.style.animationDelay = d;
                    bb.style.animationDelay = d;
                    i.classList.add('pop');
                    bb.classList.add('pop');
                }
                frag.appendChild(i);
                frag.appendChild(bb);
            });
            out.appendChild(frag);
            out.scrollTop = 0;

            $('meta').textContent = nf(current.inLen) + ' → ' + nf(current.outLen) + ' karakter';
            showResultBox(current.notice, true);
            $('next').hidden = false;

            say(pick([
                'Sret sret sret... selesai! Hurufmu sudah kabur ke semak-semak.',
                'Beres! Sekarang pesanmu kelihatan kayak password pas lupa.',
                'Misi sukses. Obi minta bayaran: satu senyuman.',
                'Terenkripsi... eh, tersamarkan. Obi jujur, ini bukan enkripsi.'
            ]));
            moodFor(head, 'wink', 'spy', 2000);
            confetti(36);
        });

        $('sorot').addEventListener('change', function () {
            out.classList.toggle('sorot', this.checked);
        });

        $('salin').addEventListener('click', function () {
            if (current) { copyText(current.plain, this); say('Disalin! Tinggal tempel, lalu kirim ke korban. Eh, teman.'); }
        });

        $('wa').addEventListener('click', function () {
            if (!current) { return; }
            window.open('https://wa.me/?text=' + encodeURIComponent(current.plain), '_blank', 'noopener');
        });

        $('toBuka').addEventListener('click', function () {
            if (!current) { return; }
            try { sessionStorage.setItem(HANDOFF, current.plain); } catch (e) {}
            location.href = 'buka.html';
        });

        // Kiriman dari halaman Buka
        try {
            var carry = sessionStorage.getItem(HANDOFF);
            if (carry) {
                sessionStorage.removeItem(HANDOFF);
                area.value = normalize(carry);
                updateCount();
                form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', { cancelable: true }));
            }
        } catch (e) {}
    }

    // ==========================================
    // Halaman: Buka samaran
    // ==========================================
    function pageBuka() {
        var head = $('headArt');
        var out = $('out');
        var current = null;
        var typing = null;

        $('tempel').addEventListener('click', function () {
            var btn = this;
            if (navigator.clipboard && navigator.clipboard.readText) {
                navigator.clipboard.readText().then(function (t) {
                    area.value = normalize(t);
                    updateCount();
                    say(t ? 'Tempel sukses! Obi nggak ngintip kok. Sedikit.' : 'Clipboard-nya kosong. Sama kayak dompet Obi.');
                }, function () {
                    btn.textContent = 'Izin ditolak, tempel manual ya';
                    setTimeout(function () { btn.textContent = 'Tempel dari clipboard'; }, 2200);
                });
            } else {
                say('Browser kamu pelit izin. Tempel manual aja ya (Ctrl + V).');
            }
        });

        function typeOut(text) {
            clearInterval(typing);
            out.textContent = '';
            var chars = Array.from(text);
            if (reduceMotion || chars.length > 400) { out.textContent = text; return; }
            var i = 0;
            typing = setInterval(function () {
                out.textContent += chars[i++];
                if (i >= chars.length) { clearInterval(typing); }
            }, 45);
        }

        function run() {
            var input = normalize(area.value);
            if (input.trim() === '') {
                showResultBox('Kotaknya masih kosong. Tempel sandinya dulu ya.', false);
                say('Mana sandinya? Obi nggak bisa baca pikiran. Cuma bisa baca huruf.');
                moodFor(head, 'shock', 'detective', 2000);
                return;
            }
            current = doDecode(input);
            $('meta').textContent = nf(current.inLen) + ' → ' + nf(current.outLen) + ' karakter';
            showResultBox(current.notice, true);
            typeOut(current.plain);

            if (current.notice) {
                say('Hmm, sandinya kayak kurang atau kelebihan. Obi coba semampunya.');
                moodFor(head, 'shock', 'detective', 1800);
            } else {
                say(pick([
                    'Ketemu! Obi memang detektif kelas kakap.',
                    'Kasus selesai. Tersangka: huruf ke-6, ke-12, ke-18...',
                    'Elementary, my dear teman.',
                    'Terbongkar! Mohon jangan bilang pengirimnya.'
                ]));
                moodFor(head, 'wink', 'detective', 1800);
                confetti(24);
            }
        }

        form.addEventListener('submit', function (e) { e.preventDefault(); run(); });

        $('salin').addEventListener('click', function () {
            if (current) { copyText(current.plain, this); }
        });

        $('toSamarkan').addEventListener('click', function () {
            if (!current) { return; }
            try { sessionStorage.setItem(HANDOFF, current.plain); } catch (e) {}
            location.href = 'samarkan.html';
        });

        // Kiriman dari halaman Samarkan
        try {
            var carry = sessionStorage.getItem(HANDOFF);
            if (carry) {
                sessionStorage.removeItem(HANDOFF);
                area.value = normalize(carry);
                updateCount();
                run();
            }
        } catch (e) {}
    }

    // ==========================================
    // Mulai
    // ==========================================
    renderAllMascots();
    setupEyes();
    setupPoke();

    var page = document.body.getAttribute('data-page');
    if (page === 'home') { pageHome(); }
    else if (page === 'samarkan') { pageSamarkan(); }
    else if (page === 'buka') { pageBuka(); }
})();
