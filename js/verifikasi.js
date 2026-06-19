document.addEventListener('DOMContentLoaded', () => {
    // PRELOADER
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.classList.add('loaded');
            }, 600);
        });
        // Fallback in case load event already fired
        setTimeout(() => {
            preloader.classList.add('loaded');
        }, 1200);
    }

    // Navigation Toggle for Mobile
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('open');
        });
    }

    // Scroll Navbar Effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Check URL parameters for auto verification
    checkUrlParams();
});

// GLOBAL VARIABLES FOR SCANNER
let html5QrcodeScanner = null;
let currentTab = 'manual';
let isScannerRunning = false;

// SWITCH BETWEEN TABS (Manual Code vs QR Scan)
window.switchTab = function(tab) {
    currentTab = tab;
    
    // Update Tab active class
    document.getElementById('tabManual').classList.toggle('active', tab === 'manual');
    document.getElementById('tabScan').classList.toggle('active', tab === 'scan');
    
    // Update Panel active class
    document.getElementById('panelManual').classList.toggle('active', tab === 'manual');
    document.getElementById('panelScan').classList.toggle('active', tab === 'scan');

    // Stop scanner if leaving the scan tab
    if (tab !== 'scan' && isScannerRunning) {
        stopScanner();
    }
}

// HANDLE MANUAL CODE SUBMISSION
window.handleManualVerify = function(event) {
    event.preventDefault();
    const codeInput = document.getElementById('verificationCode').value.trim().toUpperCase();
    if (codeInput) {
        verifySlipCode(codeInput);
    }
}

// CHECK URL PARAMETERS ON LOAD
function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
        verifySlipCode(code.trim().toUpperCase());
    }
}

// VERIFY SLIP CODE FROM DATABASE
function verifySlipCode(code) {
    // Show loading card
    document.getElementById('verifyInputCard').classList.add('hide');
    document.getElementById('verifyLoadingCard').classList.remove('hide');
    document.getElementById('verifySuccessCard').classList.add('hide');
    document.getElementById('verifyFailedCard').classList.add('hide');

    // Stop camera if running
    if (isScannerRunning) {
        stopScanner();
    }

    // Simulate Network Latency for a premium "Scanning/Validating" UX
    setTimeout(() => {
        fetch('data/slips.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Gagal mengambil database verifikasi.');
                }
                return response.json();
            })
            .then(data => {
                const foundSlip = data.find(slip => slip.code.toUpperCase() === code);

                document.getElementById('verifyLoadingCard').classList.add('hide');

                if (foundSlip) {
                    // Populate success card details
                    document.getElementById('resEmployeeId').textContent = foundSlip.employeeId;
                    document.getElementById('resName').textContent = foundSlip.name;
                    document.getElementById('resPosition').textContent = foundSlip.position;
                    document.getElementById('resPeriod').textContent = foundSlip.period;
                    document.getElementById('resThp').textContent = foundSlip.thp;
                    document.getElementById('resPayment').textContent = foundSlip.bank + ' (Rek. ' + foundSlip.rekening + ')';
                    document.getElementById('resCode').textContent = foundSlip.code;

                    // Set current date/time for verification
                    const now = new Date();
                    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' };
                    document.getElementById('resVerifyTime').textContent = now.toLocaleDateString('id-ID', options);

                    // Show success
                    document.getElementById('verifySuccessCard').classList.remove('hide');
                } else {
                    // Show failure
                    document.getElementById('failedCodeDisplay').textContent = code;
                    document.getElementById('verifyFailedCard').classList.remove('hide');
                }
            })
            .catch(error => {
                console.error(error);
                document.getElementById('verifyLoadingCard').classList.add('hide');
                document.getElementById('failedCodeDisplay').textContent = code;
                document.getElementById('verifyFailedCard').classList.remove('hide');
            });
    }, 1800);
}

// RESET VERIFICATION TO SCANNING/INPUT STAGE
window.resetVerification = function() {
    // Clear inputs
    document.getElementById('verificationCode').value = '';
    
    // Reset browser address bar query param without reloading page
    const url = new URL(window.location);
    url.searchParams.delete('code');
    window.history.pushState({}, '', url);

    // Show input card, hide others
    document.getElementById('verifyInputCard').classList.remove('hide');
    document.getElementById('verifySuccessCard').classList.add('hide');
    document.getElementById('verifyFailedCard').classList.add('hide');
    document.getElementById('verifyLoadingCard').classList.add('hide');

    // Default to manual input tab
    switchTab('manual');
}

// WEBCAM QR SCANNER UTILITIES
window.toggleScanner = function() {
    if (isScannerRunning) {
        stopScanner();
    } else {
        startScanner();
    }
}

function startScanner() {
    const messageEl = document.getElementById('scannerMessage');
    const buttonEl = document.getElementById('btnToggleCamera');
    const panelEl = document.getElementById('panelScan');

    messageEl.textContent = 'Meminta izin kamera...';
    panelEl.classList.add('scanning');

    // Create html5Qrcode instance
    html5QrcodeScanner = new Html5Qrcode("qrReader");

    html5QrcodeScanner.start(
        { facingMode: "environment" }, // back camera first
        {
            fps: 10,
            qrbox: { width: 250, height: 250 }
        },
        onScanSuccess,
        onScanError
    )
    .then(() => {
        isScannerRunning = true;
        messageEl.textContent = 'Kamera aktif. Arahkan QR Code slip gaji ke dalam kotak scanner.';
        buttonEl.innerHTML = '<span>Matikan Kamera</span>';
    })
    .catch(err => {
        console.error('Camera init error:', err);
        messageEl.textContent = 'Gagal mengakses kamera. Harap izinkan kamera browser Anda atau ketik kode secara manual.';
        panelEl.classList.remove('scanning');
        isScannerRunning = false;
        buttonEl.innerHTML = '<span>Nyalakan Kamera</span>';
    });
}

function stopScanner() {
    if (html5QrcodeScanner) {
        html5QrcodeScanner.stop().then(() => {
            html5QrcodeScanner = null;
            isScannerRunning = false;
            document.getElementById('scannerMessage').textContent = 'Kamera dinonaktifkan.';
            document.getElementById('btnToggleCamera').innerHTML = '<span>Nyalakan Kamera</span>';
            document.getElementById('panelScan').classList.remove('scanning');
        }).catch(err => {
            console.error('Failed to stop camera:', err);
        });
    }
}

function onScanSuccess(decodedText, decodedResult) {
    console.log(`Scan success: ${decodedText}`, decodedResult);
    
    // Play subtle beep sound or vibrate if supported
    if (navigator.vibrate) {
        navigator.vibrate(100);
    }

    let code = decodedText;
    
    // Check if the QR code data is a full URL containing a code parameter
    try {
        if (decodedText.startsWith('http://') || decodedText.startsWith('https://')) {
            const url = new URL(decodedText);
            const codeParam = url.searchParams.get('code');
            if (codeParam) {
                code = codeParam;
            }
        }
    } catch (e) {
        console.warn('Scanned text is not a valid URL, treating as raw code.');
    }

    // Trigger verification
    verifySlipCode(code.trim().toUpperCase());
}

function onScanError(err) {
    // Verbose camera frame scanning errors are muted to prevent console spam
}
