/* ── SkyVayu — Payment & Confirmation Page ── */

/* ── Load operator & booking summary ── */
document.addEventListener('DOMContentLoaded', function() {
  var raw = sessionStorage.getItem('sv_selected_op');
  if (!raw) return;
  try {
    var op = JSON.parse(raw);
    var subtitle = document.getElementById('pay-subtitle');
    if (subtitle) subtitle.textContent = 'Complete your booking with ' + op.name;
    setText('pay-op',       op.name);
    setText('pay-aircraft', op.aircraft);
    setText('pay-route',    op.route);
    setText('pay-date',     op.date);
    setText('pay-pax',      op.pax);
    setText('pay-charter',  op.charter);
    setText('pay-platform', op.platform);
    setText('pay-total',    op.total);
    var btn = document.getElementById('pay-btn');
    if (btn) btn.textContent = 'Pay ' + op.total + ' & confirm booking';
  } catch (e) {
    console.error('Could not load operator data', e);
  }
});

function setText(id, value) {
  var el = document.getElementById(id);
  if (el) el.textContent = value || '—';
}

/* ── Payment tabs ── */
function switchTab(tab) {
  ['card','upi','nb'].forEach(function(t) {
    document.getElementById('tab-'   + t).classList.remove('active');
    document.getElementById('panel-' + t).classList.remove('active');
  });
  document.getElementById('tab-'   + tab).classList.add('active');
  document.getElementById('panel-' + tab).classList.add('active');
}

function selUpi(el) {
  document.querySelectorAll('.upi-app').forEach(function(b) { b.classList.remove('active'); });
  el.classList.add('active');
}

function selBank(el) {
  document.querySelectorAll('.bank-option').forEach(function(b) {
    b.classList.remove('active');
    b.querySelector('input').checked = false;
  });
  el.classList.add('active');
  el.querySelector('input').checked = true;
}

/* ── Form error helpers (reused from booking) ── */
function showErr(inputId, errId) {
  var el  = document.getElementById(inputId);
  var msg = document.getElementById(errId);
  if (el)  el.classList.add('error');
  if (msg) msg.classList.add('visible');
  if (el)  el.focus();
}

function clearErr(input) {
  input.classList.remove('error');
  var msg = document.getElementById('err-' + input.id);
  if (msg) msg.classList.remove('visible');
}

function clearAllErrors() {
  document.querySelectorAll('input.error').forEach(function(el) { el.classList.remove('error'); });
  document.querySelectorAll('.error-msg.visible').forEach(function(el) { el.classList.remove('visible'); });
}

/* ── Confirm booking ── */
function confirmBooking() {
  clearAllErrors();
  var valid = true;

  var clientName  = document.getElementById('client-name').value.trim();
  var clientEmail = document.getElementById('client-email').value.trim();
  var clientPhone = document.getElementById('client-phone').value.trim();

  if (!clientName)  { showErr('client-name',  'err-client-name');  valid = false; }
  if (!clientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
    showErr('client-email', 'err-client-email');
    valid = false;
  }
  if (!clientPhone) { showErr('client-phone', 'err-client-phone'); valid = false; }
  if (!valid) return;

  var raw    = sessionStorage.getItem('sv_selected_op');
  var op     = raw ? JSON.parse(raw) : {};
  var ini    = op.name ? op.name.split(' ').map(function(w) { return w[0]; }).join('').substring(0, 3) : 'SKY';
  var ref    = ini.toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);

  sessionStorage.setItem('sv_confirmation', JSON.stringify({
    ref:          ref,
    route:        op.route,
    date:         op.date,
    op_name:      op.name,
    aircraft:     op.aircraft,
    pax:          op.pax,
    total:        op.total,
    client_name:  clientName,
    client_email: clientEmail,
    client_phone: clientPhone
  }));

  window.location.href = 'confirmed.html';
}
