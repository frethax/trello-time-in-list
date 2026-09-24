/* ---- auth-success.js — return page for Kanbrain's write authorization ----
   Trello redirects here with #token=... (callback_method=fragment).
   window.opener.authorize(token) resolves the t.authorize() promise in the
   Power-Up iframe that opened this pop-up. */
(function() {
  var match = /[#&]token=([^&]+)/.exec(window.location.hash || '');
  var token = match ? decodeURIComponent(match[1]) : '';
  if (token && window.opener && typeof window.opener.authorize === 'function') {
    try { window.opener.authorize(token); } catch (e) {}
    setTimeout(function() { window.close(); }, 300);
  } else if (!token) {
    document.getElementById('msg').innerText = 'Authorization was not completed. Please close this window and try again.';
  }
})();
