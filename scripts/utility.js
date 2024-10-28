// localStorage utility functions

function createLocalStorage(...keys) {
    keys.forEach(key => {
        if (!localStorage.getItem(key)) {
            localStorage.setItem(key, null);
        }
    });
}

function getLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key));
}

function setLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function deleteLocalStorage(...keys) {
    keys.forEach(key => {
        localStorage.removeItem(key);
    });
}

// sessionStorage utility functions

function createSessionStorage(...keys) {
    keys.forEach(key => {
        if (!sessionStorage.getItem(key)) {
            sessionStorage.setItem(key, null);
        }
    });
}

function getSessionStorage(key) {
    return JSON.parse(sessionStorage.getItem(key));
}

function setSessionStorage(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
}

function deleteSessionStorage(...keys) {
    keys.forEach(key => {
        sessionStorage.removeItem(key);
    });
}

// ISO to UK utility functions

function formatDate(isoString) {
    const date = new Date(isoString);
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Intl.DateTimeFormat('en-GB', options).format(date);
}

function formatTime(isoString) {
    const date = new Date(isoString);
    const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    return new Intl.DateTimeFormat('en-GB', options).format(date);
}

function formatDateTime(isoString) {
    const date = new Date(isoString);
    const options = {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    return new Intl.DateTimeFormat('en-GB', options).format(date);
}

function formatDownloadDate(date) {
    const pad = (num) => String(num).padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

// Export utility functions
function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// Set titlebar for Alt1
function setTitleBar(title, icon1 = null, icon2 = null, text = null) {
    let titlebar = `<span title="${title}">`
    if (icon1) titlebar += ` <img src="./assets/${icon1}.png"/> `; 
    if (text) titlebar += text;
    if (icon2) titlebar += ` <img src="./assets/${icon2}.png"/> `;
    titlebar += `</span>`;
    window.alt1?.setTitleBarText(titlebar);
}

export {
    createLocalStorage,
    getLocalStorage,
    setLocalStorage,
    deleteLocalStorage,
    createSessionStorage,
    getSessionStorage,
    setSessionStorage,
    deleteSessionStorage,
    formatDate,
    formatTime,
    formatDateTime,
    formatDownloadDate,
    downloadFile,
    setTitleBar
};