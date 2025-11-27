const messages = [
    "Anshu just withdrew $5,000 successfully — Join our family!",
    "@ukatkrsh just joined us — Welcome aboard!",
    "@calvin@gmail.com earned $125,000 — Congrats!",
    "Deposit bonus activated — Claim now!",
    "VIP Rewards updated — Check your dashboard"
];

(function initTicker() {
    const track = document.getElementById("tickerTrack");

    function createItems() {
        const frag = document.createDocumentFragment();
        messages.forEach(msg => {
            const div = document.createElement("div");
            div.className = "ticker-item";
            div.innerHTML = `<span class="bullet"></span> ${msg}`;
            frag.appendChild(div);
        });
        return frag;
    }

    track.appendChild(createItems()); // first copy
    track.appendChild(createItems()); // duplicate second copy

    requestAnimationFrame(() => {
        const totalWidth = track.scrollWidth / 2;
        const pxPerSec = 80; // speed
        const duration = Math.max(8, totalWidth / pxPerSec);
        track.style.animationDuration = duration + "s";
    });

})();