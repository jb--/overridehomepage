const targetUrlForm = document.getElementById('targetUrlForm');
const targetUrlInput = document.getElementById('targetUrlInput');
const targetUrlError = document.getElementById('targetUrlError');
const targetUrlSaved = document.getElementById('targetUrlSaved');

const urlRegex = /^(https?:\/\/)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/i;

const saveCurrentHomepageAndGoThere = function(event) {
    event.preventDefault();
    var targetUrl = targetUrlInput.value;
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
    targetUrlSaved.classList.remove('is-hidden');
    targetUrlInput.classList.add('is-success');
    targetUrlInput.classList.remove('is-danger');
    targetUrlError.classList.add('is-hidden');

    chrome.storage.sync.set({ targetUrl });
    
    setTimeout(() => {
        targetUrlSaved.classList.add('is-hidden');
        targetUrlInput.classList.remove('is-success');
        // go to target URL
        window.open(targetUrl, '_self');
    }, 3000);
}

targetUrlForm.addEventListener('submit', saveCurrentHomepageAndGoThere);
