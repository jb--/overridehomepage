const urlForm = document.getElementById('urlForm');
const urlInput = document.getElementById('urlInput');
const urlList = document.getElementById('urlList');
const urlError = document.getElementById('urlError');
const targetUrlForm = document.getElementById('targetUrlForm');
const targetUrlInput = document.getElementById('targetUrlInput');
const targetUrlError = document.getElementById('targetUrlError');
const targetUrlSaved = document.getElementById('targetUrlSaved');

const urlRegex = /^(https?:\/\/)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/i;

const saveCurrentHomepage = function (event) {
    event.preventDefault();
    var targetUrl = targetUrlInput.value;
    if (targetUrl != "") {
        if (!urlRegex.test(targetUrlInput.value)) {
            targetUrlInput.classList.add('is-danger');
            targetUrlError.classList.remove('is-hidden');
            return;
        }
        // check if it starts with http or https if not add it 
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            targetUrl = `https://${targetUrl}`;
            targetUrlInput.value = targetUrl;
        }
    }
    targetUrlSaved.classList.remove('is-hidden');
    targetUrlInput.classList.add('is-success');
    targetUrlInput.classList.remove('is-danger');
    targetUrlError.classList.add('is-hidden');

    chrome.storage.sync.set({ targetUrl });

    // after 5 seconds remove the saved message
    setTimeout(() => {
        targetUrlSaved.classList.add('is-hidden');
        targetUrlInput.classList.remove('is-success');
    }, 3000);
}

targetUrlForm.addEventListener('change', saveCurrentHomepage);
targetUrlInput.addEventListener('change', saveCurrentHomepage);
window.addEventListener('unload', saveCurrentHomepage);

// Add URL to list
urlForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const url = urlInput.value;
    if (!urlRegex.test(url)) {
        urlInput.classList.add('is-danger');
        urlError.classList.remove('is-hidden');
        return;
    }
    urlInput.classList.remove('is-danger');
    urlError.classList.add('is-hidden');

    const row = document.createElement('tr');
    const urlCell = document.createElement('td');
    urlCell.textContent = url;
    const removeCell = document.createElement('td');
    removeCell.classList.add('has-text-right');
    const removeButton = document.createElement('button');
    removeButton.classList.add('button', 'is-danger', 'is-small');
    const icon = document.createElement('i');
    icon.classList.add('fas', 'fa-trash-alt');
    removeButton.appendChild(icon);
    removeButton.addEventListener('click', () => {
        row.remove();
        saveUrls();
    });
    removeCell.appendChild(removeButton);
    row.appendChild(urlCell);
    row.appendChild(removeCell);
    urlList.appendChild(row);
    saveUrls();
    urlInput.value = '';
});

// Remove URL from list
function saveUrls() {
    const urls = Array.from(urlList.querySelectorAll('tr')).map((row) => row.firstChild.textContent);
    chrome.storage.sync.set({ urls });
}

chrome.storage.sync.get(['targetUrl'], (result) => {
    targetUrlInput.value = result.targetUrl || '';
});

// on load, load the urls from storage
chrome.storage.sync.get(['urls'], (result) => {
    const urls = result.urls || [];
    urls.forEach((url) => {
        const row = document.createElement('tr');
        const urlCell = document.createElement('td');
        urlCell.textContent = url;
        const removeCell = document.createElement('td');
        removeCell.classList.add('has-text-right');
        const removeButton = document.createElement('button');
        removeButton.classList.add('button', 'is-danger', 'is-small');
        const icon = document.createElement('i');
        icon.classList.add('fas', 'fa-trash-alt');
        removeButton.appendChild(icon);
        removeButton.addEventListener('click', () => {
            row.remove();
            saveUrls();
        });
        removeCell.appendChild(removeButton);
        row.appendChild(urlCell);
        row.appendChild(removeCell);
        urlList.appendChild(row);
    });
});