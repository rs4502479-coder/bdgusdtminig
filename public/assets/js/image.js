const slides = [
    "https://th.bing.com/th/id/OSK.HEROIXTtQJWbU7Ip3YKcJRzZ867lChuawkkJ77br2T2I0GY?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3",
    "https://storage.cryptomus.com/eCXYNS0X91ebigSdo9ERybGYQpdrkthUK3zpbtjp.webp",
    "https://watcher.guru/news/wp-content/uploads/2023/05/stablecoin-tether-usdt.jpg"
];

let index = 0;
const img = document.getElementById("bannerImg");

setInterval(() => {
    index = (index + 1) % slides.length;
    img.style.opacity = 0;
    setTimeout(() => {
        img.src = slides[index];
        img.style.opacity = 1;
    }, 300);
}, 3000); // 3 s