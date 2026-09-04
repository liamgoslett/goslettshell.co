/* Goslett Shell Company — world clocks
 * Chrome-rimmed office clock: white dial behind glass, bold numerals,
 * SBB-style bar hands and red seconds hand with a disc at the tip.
 * Movement is the real SBB "stop-to-go": the seconds hand sweeps the dial in
 * 58.5 s, waits at 12, and the minute hand steps forward on the minute signal.
 * Each clock reads its own time zone via Intl, so it is right anywhere.
 */
(function () {
	'use strict';

	var CX = 200, CY = 190, R = 178;   // centre + outer rim radius (SVG units)
	var RIM = 22;                      // chrome bezel thickness
	var SWEEP_SECONDS = 58.5;          // SBB: full revolution in 58.5 s, then hold
	var STEP_MS = 220;                 // minute-hand step duration

	function polar(r, deg) {
		var a = (deg - 90) * Math.PI / 180;
		return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
	}
	function f(n) { return (+n).toFixed(2); }

	// A blunt bar hand pointing at 12: base width wb, tip width wt,
	// reach `len` above centre, `tail` below centre.
	function bar(len, tail, wb, wt) {
		return 'M ' + f(CX - wb / 2) + ' ' + f(CY + tail) +
			' L ' + f(CX - wt / 2) + ' ' + f(CY - len) +
			' L ' + f(CX + wt / 2) + ' ' + f(CY - len) +
			' L ' + f(CX + wb / 2) + ' ' + f(CY + tail) + ' Z';
	}

	// big hour lugs on the ring, four minute dots between each pair, numerals inside
	function dial(dialR) {
		var s = '<g fill="#161616">';
		var lugLen = dialR * 0.10, lugW = dialR * 0.038;
		for (var i = 0; i < 60; i++) {
			if (i % 5 === 0) {
				s += '<rect x="' + f(CX - lugW / 2) + '" y="' + f(CY - dialR * 0.975) + '" width="' + f(lugW) + '" height="' + f(lugLen) +
					'" transform="rotate(' + (i * 6) + ' ' + CX + ' ' + CY + ')"/>';
			} else {
				var p = polar(dialR * 0.925, i * 6);
				s += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f(dialR * 0.016) + '"/>';
			}
		}
		s += '</g><g fill="#161616" font-weight="700" font-size="' + f(dialR * 0.24) + '" text-anchor="middle" dominant-baseline="central">';
		for (var n = 1; n <= 12; n++) {
			var q = polar(dialR * 0.71, n * 30);
			s += '<text x="' + f(q[0]) + '" y="' + f(q[1] + dialR * 0.01) + '">' + n + '</text>';
		}
		return s + '</g>';
	}

	function clockSVG(uid, label, idx) {
		var dialR = R - RIM;
		var hourLen = dialR * 0.62, hourTail = dialR * 0.20, hourWb = dialR * 0.070, hourWt = dialR * 0.092;
		var minLen  = dialR * 0.90, minTail  = dialR * 0.22, minWb  = dialR * 0.047, minWt  = dialR * 0.062;
		var secRod  = dialR * 0.025, secTail  = dialR * 0.19, discAt = dialR * 0.60, discR = dialR * 0.085;

		return '' +
		'<svg viewBox="0 0 400 470" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + label + ' clock">' +
		'<defs>' +
			// chrome bezel: bright top-left, dark bottom-right, then reversed for the inner slope
			'<linearGradient id="' + uid + '-rim" x1="0" y1="0" x2="1" y2="1">' +
				'<stop offset="0"    stop-color="#ffffff"/>' +
				'<stop offset="0.22" stop-color="#d7d7d7"/>' +
				'<stop offset="0.48" stop-color="#8a8a8a"/>' +
				'<stop offset="0.55" stop-color="#6c6c6c"/>' +
				'<stop offset="0.8"  stop-color="#bdbdbd"/>' +
				'<stop offset="1"    stop-color="#f2f2f2"/>' +
			'</linearGradient>' +
			'<linearGradient id="' + uid + '-rimIn" x1="1" y1="1" x2="0" y2="0">' +
				'<stop offset="0"    stop-color="#f6f6f6"/>' +
				'<stop offset="0.35" stop-color="#c9c9c9"/>' +
				'<stop offset="0.65" stop-color="#7a7a7a"/>' +
				'<stop offset="1"    stop-color="#a9a9a9"/>' +
			'</linearGradient>' +
			'<radialGradient id="' + uid + '-dial" cx="0.5" cy="0.5" r="0.5">' +
				'<stop offset="0.8"  stop-color="#fbfbf9"/>' +
				'<stop offset="1"    stop-color="#e9e9e6"/>' +
			'</radialGradient>' +
			// glass: soft glare top-left, faint dome shading at the edge
			'<linearGradient id="' + uid + '-glare" x1="0" y1="0" x2="0.5" y2="1">' +
				'<stop offset="0"   stop-color="#fff" stop-opacity="0.5"/>' +
				'<stop offset="0.55" stop-color="#fff" stop-opacity="0.1"/>' +
				'<stop offset="1"   stop-color="#fff" stop-opacity="0"/>' +
			'</linearGradient>' +
			'<radialGradient id="' + uid + '-dome" cx="0.5" cy="0.5" r="0.5">' +
				'<stop offset="0.82" stop-color="#000" stop-opacity="0"/>' +
				'<stop offset="1"    stop-color="#000" stop-opacity="0.16"/>' +
			'</radialGradient>' +
			'<clipPath id="' + uid + '-dialClip"><circle cx="' + CX + '" cy="' + CY + '" r="' + dialR + '"/></clipPath>' +
			// brushed steel plaque, fixed highlight
			'<linearGradient id="' + uid + '-plate" x1="0" y1="0" x2="0" y2="1">' +
				'<stop offset="0"    stop-color="#f8f8f8"/>' +
				'<stop offset="0.3"  stop-color="#d9d9d9"/>' +
				'<stop offset="0.6"  stop-color="#b6b6b6"/>' +
				'<stop offset="0.85" stop-color="#c8c8c8"/>' +
				'<stop offset="1"    stop-color="#e6e6e6"/>' +
			'</linearGradient>' +
			'<linearGradient id="' + uid + '-sheen" x1="0" y1="0" x2="1" y2="0.4">' +
				'<stop offset="0"    stop-color="#fff" stop-opacity="0"/>' +
				'<stop offset="0.35" stop-color="#fff" stop-opacity="0.35"/>' +
				'<stop offset="0.5"  stop-color="#fff" stop-opacity="0"/>' +
				'<stop offset="0.8"  stop-color="#000" stop-opacity="0.06"/>' +
				'<stop offset="1"    stop-color="#000" stop-opacity="0"/>' +
			'</linearGradient>' +
			'<pattern id="' + uid + '-brush" width="4" height="2" patternUnits="userSpaceOnUse">' +
				'<rect width="4" height="1" fill="#000" opacity="0.05"/>' +
				'<rect y="1" width="4" height="1" fill="#fff" opacity="0.08"/>' +
			'</pattern>' +
			'<filter id="' + uid + '-drop" x="-20%" y="-20%" width="140%" height="150%">' +
				'<feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#000" flood-opacity="0.3"/>' +
			'</filter>' +
			'<filter id="' + uid + '-hs" x="-50%" y="-50%" width="200%" height="200%">' +
				'<feDropShadow dx="0.8" dy="2.2" stdDeviation="1.3" flood-color="#000" flood-opacity="0.35"/>' +
			'</filter>' +
		'</defs>' +

		// ---- chrome case ----
		'<g filter="url(#' + uid + '-drop)">' +
			'<circle cx="' + CX + '" cy="' + CY + '" r="' + R + '" fill="url(#' + uid + '-rim)"/>' +
		'</g>' +
		'<circle cx="' + CX + '" cy="' + CY + '" r="' + (R - 2) + '" fill="none" stroke="#fff" stroke-opacity="0.5" stroke-width="1"/>' +
		'<circle cx="' + CX + '" cy="' + CY + '" r="' + (R - RIM * 0.45) + '" fill="url(#' + uid + '-rimIn)"/>' +
		'<circle cx="' + CX + '" cy="' + CY + '" r="' + (R - RIM * 0.45) + '" fill="none" stroke="#000" stroke-opacity="0.25" stroke-width="0.8"/>' +
		'<circle cx="' + CX + '" cy="' + CY + '" r="' + (dialR + 3) + '" fill="#4a4a4a"/>' +

		// ---- dial ----
		'<circle cx="' + CX + '" cy="' + CY + '" r="' + dialR + '" fill="url(#' + uid + '-dial)"/>' +
		dial(dialR) +

		// ---- hands ----
		'<g filter="url(#' + uid + '-hs)">' +
			'<path class="hand hour"   d="' + bar(hourLen, hourTail, hourWb, hourWt) + '" fill="#111" transform="rotate(0 ' + CX + ' ' + CY + ')"/>' +
			'<path class="hand minute" d="' + bar(minLen,  minTail,  minWb,  minWt)  + '" fill="#111" transform="rotate(0 ' + CX + ' ' + CY + ')"/>' +
			'<g class="hand second" transform="rotate(0 ' + CX + ' ' + CY + ')">' +
				'<rect x="' + f(CX - secRod / 2) + '" y="' + f(CY - discAt) + '" width="' + f(secRod) + '" height="' + f(discAt + secTail) + '" fill="#eb0000"/>' +
				'<circle cx="' + CX + '" cy="' + f(CY - discAt) + '" r="' + f(discR) + '" fill="#eb0000"/>' +
			'</g>' +
		'</g>' +

		// ---- glass ----
		'<g clip-path="url(#' + uid + '-dialClip)" pointer-events="none">' +
			'<circle cx="' + CX + '" cy="' + CY + '" r="' + dialR + '" fill="url(#' + uid + '-dome)"/>' +
			'<ellipse cx="' + f(CX - dialR * 0.28) + '" cy="' + f(CY - dialR * 0.42) + '" rx="' + f(dialR * 0.78) + '" ry="' + f(dialR * 0.42) +
				'" transform="rotate(-30 ' + f(CX - dialR * 0.28) + ' ' + f(CY - dialR * 0.42) + ')" fill="url(#' + uid + '-glare)"/>' +
		'</g>' +
		'<circle cx="' + CX + '" cy="' + CY + '" r="' + (dialR - 0.5) + '" fill="none" stroke="#fff" stroke-opacity="0.45" stroke-width="1.2"/>' +

		// ---- plain silver plaque, flat on the wall ----
		'<g class="plaque">' +
			'<rect x="66" y="400" width="268" height="56" fill="url(#' + uid + '-plate)"/>' +
			'<rect x="66" y="400" width="268" height="56" fill="url(#' + uid + '-brush)"/>' +
			'<rect x="66" y="400" width="268" height="56" fill="url(#' + uid + '-sheen)"/>' +
			'<rect x="66.5" y="400.5" width="267" height="55" fill="none" stroke="#6d6d6d" stroke-width="1"/>' +
			'<rect x="67.5" y="401.5" width="265" height="53" fill="none" stroke="#fff" stroke-opacity="0.55" stroke-width="1"/>' +
			'<text x="200" y="428" text-anchor="middle" dominant-baseline="central" font-size="27" font-weight="700" letter-spacing="1.5" fill="#111">' + label + '</text>' +
		'</g>' +
		'</svg>';
	}

	// ---------- time ----------
	var items = Array.prototype.slice.call(document.querySelectorAll('.clock-item[data-tz]'));
	var clocks = items.map(function (el, i) {
		var uid = 'c' + i;
		el.innerHTML = clockSVG(uid, el.getAttribute('data-label') || '', i);
		var fmt = null;
		try {
			fmt = new Intl.DateTimeFormat('en-GB', {
				timeZone: el.getAttribute('data-tz'),
				hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
			});
		} catch (e) {}
		return {
			fmt: fmt,
			hour: el.querySelector('.hand.hour'),
			minute: el.querySelector('.hand.minute'),
			second: el.querySelector('.hand.second'),
			lastMin: -1, from: null, to: null, stepAt: 0
		};
	});

	function partsOf(fmt, now) {
		if (!fmt) return { h: now.getHours(), m: now.getMinutes(), s: now.getSeconds() };
		var o = { h: 0, m: 0, s: 0 };
		fmt.formatToParts(now).forEach(function (p) {
			if (p.type === 'hour') o.h = +p.value;
			else if (p.type === 'minute') o.m = +p.value;
			else if (p.type === 'second') o.s = +p.value;
		});
		return o;
	}
	function rot(el, deg) {
		el.setAttribute('transform', 'rotate(' + deg.toFixed(3) + ' ' + CX + ' ' + CY + ')');
	}
	function easeOut(p) { return 1 - Math.pow(1 - p, 3); }
	function unwrap(from, to) { return to < from - 180 ? to + 360 : to; }

	var lastSec = -1;
	function frame() {
		var now = new Date();
		var ms = now.getMilliseconds();
		var t = now.getTime();
		var secNow = now.getSeconds();
		var refresh = secNow !== lastSec;
		lastSec = secNow;

		clocks.forEach(function (c) {
			if (refresh || !c.parts) c.parts = partsOf(c.fmt, now);
			var p = c.parts;
			var sec = p.s + ms / 1000;

			// seconds: sweep to 12 in 58.5 s, then hold until the minute signal
			var secAngle = sec < SWEEP_SECONDS ? (sec / SWEEP_SECONDS) * 360 : 360;
			rot(c.second, secAngle);

			// minute + hour: stepped on the minute, with a short mechanical step
			var target = { m: p.m * 6, h: (p.h % 12) * 30 + p.m * 0.5 };
			if (p.m !== c.lastMin) {
				c.from = c.to || target;
				c.to = target;
				c.stepAt = c.lastMin < 0 ? 0 : t;
				c.lastMin = p.m;
			}
			var k = easeOut(Math.min(1, (t - c.stepAt) / STEP_MS));
			rot(c.minute, c.from.m + (unwrap(c.from.m, c.to.m) - c.from.m) * k);
			rot(c.hour,   c.from.h + (unwrap(c.from.h, c.to.h) - c.from.h) * k);
		});
		requestAnimationFrame(frame);
	}
	frame();

	// ---------- information overlay ----------
	var fullScreenDiv = document.getElementById('infoblurb');
	var toggleButton = document.getElementById('information-tag');
	var fiveclock = document.getElementById('clocksflex');
	var except = document.getElementById('except');

	function toggle() {
		fullScreenDiv.classList.toggle('active');
		fiveclock.classList.toggle('active');
	}
	if (toggleButton) {
		toggleButton.addEventListener('click', toggle);
		toggleButton.addEventListener('keydown', function (ev) {
			if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); toggle(); }
		});
	}
	fullScreenDiv.addEventListener('click', toggle);
	except.addEventListener('click', function (ev) { ev.stopPropagation(); }, false);
})();
