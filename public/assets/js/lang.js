const translations = {
    en: {
        title: "BDG USDT Mining",
        recharge: "Recharge",
        withdraw: "Withdraw",
        invite: "Invite",
        app: "App",
        company: "Company",
        agency: "Agency",
        taskHall: "Task Hall",
        memberList: "Member List",
        regulatory: "Regulatory Authority",
        account : "Account"
    },
    ru: {
        title: " BDG USDT Майнинг",
        recharge: "Пополнить",
        withdraw: "Вывести",
        invite: "Пригласить",
        app: "Приложение",
        company: "Компания",
        agency: "Агентство",
        taskHall: "Зал заданий",
        memberList: "Список участников",
        regulatory: "Регулирующий орган",
        account : "Аккаунт"
    },
    hi: {
        title: "BDG USDT माइनिंग",
        recharge: "रिचार्ज",
        withdraw: "निकासी",
        invite: "आमंत्रित करें",
        app: "ऐप",
        company: "कंपनी",
        agency: "एजेंसी",
        taskHall: "कार्य कक्ष",
        memberList: "सदस्य सूची",
        regulatory: "नियामक प्राधिकरण",
        account : "खाता"
    }
};

const langSelect = document.getElementById("langSwitcher");
const savedLang = localStorage.getItem("lang") || "en";
langSelect.value = savedLang;

function applyLanguage(lang) {
    localStorage.setItem("lang", lang);
    document.querySelectorAll("[data-key]").forEach(el => {
        const key = el.getAttribute("data-key");
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
}

langSelect.addEventListener("change", (e) => {
    applyLanguage(e.target.value);
});

applyLanguage(savedLang);
