/**
 * ChainCred — app.js
 * Decentralized Credential Verification System
 *
 * In production, replace mock functions with:
 *   - ethers.js / wagmi for real MetaMask + Polygon calls
 *   - Pinata SDK for real IPFS uploads
 *   - Web Crypto API for real SHA-256 hashing
 */

'use strict';

/* ══════════════════════════════════════
   STATE
══════════════════════════════════════ */
const state = {
  walletConnected: false,
  walletAddress: '0x7a3b9f2e1c4d8a5b3e6f2d1c4a7b0e3f9f2e',
  lastHash: '',
  lastCID: '',
  lastTX: '',
};

/* ══════════════════════════════════════
   NAVIGATION
══════════════════════════════════════ */
function showPanel(id, btn) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('panel-' + id).classList.add('active');
  btn.classList.add('active');
}

/* ══════════════════════════════════════
   WALLET
══════════════════════════════════════ */
function connectWallet() {
  state.walletConnected = !state.walletConnected;
  const el = document.getElementById('wallet-text');
  if (state.walletConnected) {
    const short = state.walletAddress.slice(0, 6) + '...' + state.walletAddress.slice(-4);
    el.innerHTML = `<span class="wallet-addr">${short}</span>`;
    toast('✅', 'MetaMask connected! Wallet: ' + short);

    /* ─ Real implementation ─────────────────────────────
       if (window.ethereum) {
         const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
         state.walletAddress = accounts[0];
         // Switch to Polygon Mumbai (chainId: 0x13881)
         await window.ethereum.request({
           method: 'wallet_switchEthereumChain',
           params: [{ chainId: '0x13881' }],
         });
       }
    ──────────────────────────────────────────────────── */
  } else {
    el.textContent = 'Connect MetaMask';
    toast('🦊', 'Wallet disconnected');
  }
}

/* ══════════════════════════════════════
   FILE UPLOAD (Issuer)
══════════════════════════════════════ */
function triggerUpload() {
  document.getElementById('file-input').click();
}

function handleFile(input) {
  const file = input.files[0];
  if (!file) return;

  const zone    = document.getElementById('upload-zone');
  const icon    = document.getElementById('upload-icon');
  const text    = document.getElementById('upload-text');
  const sub     = document.getElementById('upload-sub');
  const sizekb  = (file.size / 1024).toFixed(1);

  icon.textContent = '📄';
  text.textContent = file.name;
  sub.textContent  = `${sizekb} KB · Ready to hash`;
  zone.style.borderColor = 'var(--green)';
  zone.style.background  = 'var(--greenDim)';

  /* ─ Real SHA-256 implementation ─────────────────────
     const buffer = await file.arrayBuffer();
     const hashBuf = await crypto.subtle.digest('SHA-256', buffer);
     const hashArr = Array.from(new Uint8Array(hashBuf));
     const hash = hashArr.map(b => b.toString(16).padStart(2,'0')).join('');
  ──────────────────────────────────────────────────── */
}

/* ══════════════════════════════════════
   ISSUE CREDENTIAL (Issuer panel)
══════════════════════════════════════ */
function issueCred() {
  const btn  = document.getElementById('issue-btn');
  const name = document.getElementById('rec-name').value.trim()    || 'Demo Holder';
  const inst = document.getElementById('institution').value.trim() || 'Demo Institution';
  const type = document.getElementById('cred-type').value;

  // Reset flow steps
  ['step-1','step-2','step-3','step-4'].forEach(id =>
    document.getElementById(id).classList.remove('active-step')
  );
  document.getElementById('step-1').classList.add('active-step');

  setIssueBtn('<span class="spinner"></span> Hashing document...', true);

  /* ── Step 1: SHA-256 hash (mock) ── */
  setTimeout(() => {
    const hash = generateMockHash();
    state.lastHash = hash;
    document.getElementById('hash-display').textContent = hash;
    setStep(2);
    setIssueBtn('<span class="spinner"></span> Uploading to IPFS via Pinata...', true);

    /* ─ Real Pinata upload ───────────────────────────
       const formData = new FormData();
       formData.append('file', file);
       const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
         method: 'POST',
         headers: { Authorization: `Bearer ${PINATA_JWT}` },
         body: formData,
       });
       const { IpfsHash } = await res.json();
    ─────────────────────────────────────────────── */

    /* ── Step 2: IPFS (mock) ── */
    setTimeout(() => {
      const cid = 'Qm' + randomHex(44);
      state.lastCID = cid;
      document.getElementById('ipfs-display').textContent = cid;
      setStep(3);
      setIssueBtn('<span class="spinner"></span> Anchoring hash on Polygon...', true);

      /* ─ Real Polygon call ────────────────────────────
         const provider = new ethers.BrowserProvider(window.ethereum);
         const signer = await provider.getSigner();
         const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
         const tx = await contract.issueCredential(hash, cid, recipientAddress);
         await tx.wait();
         const txHash = tx.hash;
      ─────────────────────────────────────────────── */

      /* ── Step 3: Blockchain (mock) ── */
      setTimeout(() => {
        const tx = '0x' + randomHex(64);
        state.lastTX = tx;
        document.getElementById('tx-display').textContent = tx;
        setStep(4);

        setIssueBtn('✅ Issued Successfully!', false);
        document.getElementById('issue-btn').style.background = 'var(--green)';

        // Add to recent activity
        addRecentActivity(type, name, inst, tx);

        toast('🎉', `Credential issued for ${name} on Polygon!`);

        setTimeout(() => {
          setIssueBtn('⛓ Issue on Blockchain', false);
          document.getElementById('issue-btn').style.background = '';
          setStep(1);
        }, 3500);

      }, 2200);
    }, 2000);
  }, 1500);
}

function setStep(n) {
  ['step-1','step-2','step-3','step-4'].forEach(id =>
    document.getElementById(id).classList.remove('active-step')
  );
  document.getElementById('step-' + n).classList.add('active-step');
}

function setIssueBtn(html, disabled) {
  const btn = document.getElementById('issue-btn');
  btn.innerHTML = html;
  btn.disabled = disabled;
}

function addRecentActivity(type, name, inst, tx) {
  const list = document.getElementById('recent-list');
  const item = document.createElement('div');
  item.className = 'activity-item';
  item.style.opacity = '0';
  item.style.transition = 'opacity 0.4s';
  item.innerHTML = `
    <div class="activity-dot" style="background:var(--green)"></div>
    <div class="activity-content">
      <div class="activity-title">${type} — ${name}</div>
      <div class="activity-meta">${inst} · just now · #${tx.substring(0,10)}...</div>
    </div>`;
  list.insertBefore(item, list.firstChild);
  requestAnimationFrame(() => { item.style.opacity = '1'; });
  // Keep list under 10 items
  while (list.children.length > 10) list.removeChild(list.lastChild);
}

/* ══════════════════════════════════════
   VERIFY (Verifier panel)
══════════════════════════════════════ */
function triggerVerifyUpload() {
  document.getElementById('v-file').click();
}

function verifyFile(input) {
  const file = input.files[0];
  if (!file) return;
  toast('🔒', 'Hashing ' + file.name + ' locally...');

  /* ─ Real Web Crypto hash ─────────────────────────
     const buffer = await file.arrayBuffer();
     const hashBuf = await crypto.subtle.digest('SHA-256', buffer);
     const hash = Array.from(new Uint8Array(hashBuf))
       .map(b => b.toString(16).padStart(2,'0')).join('');
     verifyHashOnChain(hash);
  ─────────────────────────────────────────────── */

  setTimeout(() => {
    // Demo: 60% chance verified for uploaded files
    if (Math.random() > 0.4) {
      simulateVerified(
        'ba7816fb8f04f52e3e5a1c4f4d3b6c1e',
        'B.Tech Computer Science',
        'IIT Bombay', 'Apr 2024'
      );
    } else {
      simulateFailed();
    }
  }, 1800);
}

function verifyHash() {
  const h = document.getElementById('v-hash').value.trim();
  if (!h) { toast('⚠️', 'Please enter a hash to verify'); return; }

  showVerifyIdle();
  toast('🔎', 'Querying Polygon smart contract...');

  /* ─ Real contract call ───────────────────────────
     const provider = new ethers.JsonRpcProvider(POLYGON_RPC);
     const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
     const result = await contract.verifyCredential(hash);
     if (result.isValid) { ... }
  ─────────────────────────────────────────────── */

  // Demo: known valid hash prefixes always pass
  const knownValid = [
    'ba7816fb8f04f52e3e5a1c4f',
    'e3b0c44298fc1c149afb',
    'cf83e1357eefb8bdf158',
    '2c624232cdd221771294'
  ];
  const isValid = knownValid.some(v => h.toLowerCase().startsWith(v)) || Math.random() > 0.45;

  setTimeout(() => {
    if (isValid) {
      simulateVerified(h, 'B.Tech Computer Science', 'IIT Bombay', 'Apr 2024');
    } else {
      simulateFailed();
    }
  }, 2200);
}

function verifyCID() {
  const cid = document.getElementById('v-cid').value.trim();
  if (!cid) { toast('⚠️', 'Please enter an IPFS CID'); return; }

  showVerifyIdle();
  toast('📦', 'Fetching from IPFS gateway...');

  setTimeout(() => {
    simulateVerified(
      cid.substring(0, 20) + '...',
      'AWS Solutions Architect',
      'Amazon Web Services',
      'Apr 2025'
    );
  }, 2800);
}

function showVerifyIdle() {
  document.getElementById('v-success').style.display = 'none';
  document.getElementById('v-fail').style.display = 'none';
  document.getElementById('v-idle').style.display = 'block';
}

function simulateVerified(hash, cred, issuer, date) {
  document.getElementById('v-idle').style.display = 'none';
  document.getElementById('v-fail').style.display = 'none';
  const el = document.getElementById('v-success');
  el.style.display = 'block';
  document.getElementById('v-detail').innerHTML = `
    <div class="flex justify-between text-sm mt-1">
      <span class="text-dim">Credential:</span><span class="fw-600">${cred}</span>
    </div>
    <div class="flex justify-between text-sm mt-1">
      <span class="text-dim">Issuer:</span><span class="text-green">${issuer}</span>
    </div>
    <div class="flex justify-between text-sm mt-1">
      <span class="text-dim">Issue Date:</span><span>${date}</span>
    </div>
    <div class="flex justify-between text-sm mt-1">
      <span class="text-dim">Hash:</span>
      <span class="text-mono text-xs text-green">${hash.substring(0,24)}...</span>
    </div>
    <div class="flex justify-between text-sm mt-1">
      <span class="text-dim">Chain:</span><span class="text-purple">Polygon Mumbai</span>
    </div>
    <div class="flex justify-between text-sm mt-1">
      <span class="text-dim">Status:</span>
      <span class="tag tag-green">✓ AUTHENTIC</span>
    </div>`;
  toast('✅', 'Certificate verified on-chain!');
}

function simulateFailed() {
  document.getElementById('v-idle').style.display = 'none';
  document.getElementById('v-success').style.display = 'none';
  document.getElementById('v-fail').style.display = 'block';
  toast('❌', 'Certificate not found — possible fake!');
}

/* ══════════════════════════════════════
   HOLDER — SELECT CREDENTIAL
══════════════════════════════════════ */
function selectCred(el, title, issuer, year, hash, cid, tx) {
  document.querySelectorAll('.cred-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');

  document.getElementById('cred-detail').innerHTML = `
    <div class="section-title" style="margin-bottom:14px">${title}</div>
    <div class="flex justify-between text-sm mt-1">
      <span class="text-dim">Issuer:</span><span class="fw-600 text-green">${issuer}</span>
    </div>
    <div class="flex justify-between text-sm mt-1">
      <span class="text-dim">Year:</span><span>${year}</span>
    </div>
    <div class="divider"></div>
    <div class="hash-label">SHA-256 Hash</div>
    <div class="hash-box" style="font-size:10px;margin-bottom:10px">${hash}</div>
    <div class="hash-label">IPFS CID</div>
    <div class="hash-box" style="font-size:10px;color:var(--blue);margin-bottom:10px">${cid}</div>
    <div class="hash-label">Transaction Hash (Polygon)</div>
    <div class="hash-box" style="font-size:10px;color:var(--purple);margin-bottom:14px">${tx}</div>
    <div class="flex gap-2">
      <button class="btn btn-primary btn-sm" onclick="shareCredential('${title}')">🔗 Share</button>
      <button class="btn btn-secondary btn-sm" onclick="downloadCred('${title}')">⬇ Download</button>
      <button class="btn btn-secondary btn-sm" onclick="verifyFromHolder('${hash}')">🔍 Verify</button>
    </div>`;
}

function shareCredential(title) {
  const url = `${window.location.origin}?verify=${btoa(title)}`;
  // In production: navigator.clipboard.writeText(url)
  toast('🔗', 'Shareable verification link copied!');
}

function downloadCred(title) {
  toast('⬇', `Downloading credential: ${title}`);
}

function verifyFromHolder(hash) {
  // Switch to verifier panel and pre-fill hash
  document.getElementById('v-hash').value = hash;
  document.querySelector('[onclick*="verifier"]').click();
  setTimeout(verifyHash, 300);
}

function shareAll() {
  toast('🔗', 'Portfolio link copied to clipboard!');
}

/* ══════════════════════════════════════
   EXPLORER — LIVE TX FEED
══════════════════════════════════════ */
const TX_TYPES    = ['issued', 'issued', 'issued', 'verified', 'verified', 'blocked'];
const TX_COLORS   = { issued: 'var(--green)', verified: 'var(--blue)', blocked: 'var(--red)' };
const TX_ICONS    = { issued: '📜', verified: '✅', blocked: '🚫' };
const INSTITUTIONS = [
  'IIT Delhi','BITS Pilani','Coursera','Google',
  'Amazon','NIT Trichy','IIM Bangalore','edX',
  'Scaler','upGrad','NPTEL','Microsoft'
];
const CRED_NAMES = [
  'B.Tech CSE','MBA Finance','AWS Cert','React Dev',
  'Data Science','Blockchain Dev','Python ML','DevOps Pro'
];

function addTxFeedItem() {
  const type = TX_TYPES[Math.floor(Math.random() * TX_TYPES.length)];
  const inst  = INSTITUTIONS[Math.floor(Math.random() * INSTITUTIONS.length)];
  const cred  = CRED_NAMES[Math.floor(Math.random() * CRED_NAMES.length)];
  const feed  = document.getElementById('tx-feed');
  if (!feed) return;

  const item = document.createElement('div');
  item.className = 'activity-item';
  item.style.opacity = '0';
  item.style.transition = 'opacity 0.5s';
  item.innerHTML = `
    <div class="activity-dot" style="background:${TX_COLORS[type]}"></div>
    <div class="activity-content">
      <div class="activity-title">${TX_ICONS[type]} ${capitalize(type)}: ${cred}</div>
      <div class="activity-meta">${inst} · just now · 0x${randomHex(8)}...</div>
    </div>`;

  feed.insertBefore(item, feed.firstChild);
  requestAnimationFrame(() => { item.style.opacity = '1'; });

  // Keep feed under 8 items
  while (feed.children.length > 8) feed.removeChild(feed.lastChild);
}

/* ══════════════════════════════════════
   DRAG AND DROP
══════════════════════════════════════ */
function initDragDrop() {
  const zone = document.getElementById('upload-zone');
  if (!zone) return;

  ['dragenter','dragover'].forEach(evt => {
    zone.addEventListener(evt, e => {
      e.preventDefault();
      zone.classList.add('drag-over');
    });
  });

  ['dragleave','drop'].forEach(evt => {
    zone.addEventListener(evt, e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
    });
  });

  zone.addEventListener('drop', e => {
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const input = document.getElementById('file-input');
    // Create a DataTransfer to assign file to input
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    handleFile(input);
  });
}

/* ══════════════════════════════════════
   HELPERS
══════════════════════════════════════ */
function generateMockHash() {
  // Returns a deterministic-looking SHA-256-length hex
  return 'ba7816fb8f04f52e3e5a1c4f' + randomHex(40);
}

function randomHex(n) {
  const chars = '0123456789abcdef';
  return Array.from({ length: n }, () => chars[Math.floor(Math.random() * 16)]).join('');
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

/* ── Toast notification ── */
function toast(icon, msg) {
  const t = document.getElementById('toast');
  document.getElementById('toast-icon').textContent = icon;
  document.getElementById('toast-msg').textContent  = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3500);
}

/* IPFS / Polygon link stubs */
function openIPFS() {
  const cid = document.getElementById('ipfs-display').textContent.trim();
  if (cid.startsWith('Qm') || cid.startsWith('baf')) {
    window.open('https://gateway.pinata.cloud/ipfs/' + cid, '_blank');
  } else {
    toast('ℹ️', 'No CID yet — issue a credential first');
  }
}

function copyIPFS() {
  const cid = document.getElementById('ipfs-display').textContent.trim();
  // navigator.clipboard.writeText(cid);
  toast('📋', 'CID copied to clipboard!');
}

function openPolygon() {
  const tx = document.getElementById('tx-display').textContent.trim();
  if (tx.startsWith('0x')) {
    window.open('https://mumbai.polygonscan.com/tx/' + tx, '_blank');
  } else {
    toast('ℹ️', 'No transaction yet — issue a credential first');
  }
}

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Set today's date in the form
  const dateInput = document.getElementById('issue-date');
  if (dateInput) dateInput.valueAsDate = new Date();

  // Init drag-and-drop
  initDragDrop();

  // Start live tx feed
  addTxFeedItem();
  addTxFeedItem();
  addTxFeedItem();
  addTxFeedItem();
  setInterval(addTxFeedItem, 2500);
});
