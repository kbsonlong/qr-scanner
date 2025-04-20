let html5QrcodeScanner;

async function sendScanResultToBackend(decodedText, decodedResult) {
    try {
        const response = await fetch('/api/scan/result', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                result: {
                    text: decodedText,
                    format: decodedResult.result.format.formatName,
                    timestamp: new Date().toISOString()
                }
            })
        });

        const data = await response.json();
        if (data.error) {
            console.error('Error sending scan result:', data.error);
        } else {
            console.log('Scan result sent successfully:', data);
        }
    } catch (error) {
        console.error('Error sending scan result:', error);
    }
}

function formatScanResult(decodedText, decodedResult) {
    const format = decodedResult.result.format.formatName;
    let typeDisplay = format;
    
    // 优化显示格式
    if (format.includes('QR')) {
        typeDisplay = 'QR Code';
    } else if (format.includes('EAN')) {
        typeDisplay = 'EAN Barcode';
    } else if (format.includes('UPC')) {
        typeDisplay = 'UPC Barcode';
    } else if (format.includes('CODE_128')) {
        typeDisplay = 'Code 128 Barcode';
    } else if (format.includes('CODE_39')) {
        typeDisplay = 'Code 39 Barcode';
    } else if (format.includes('CODE_93')) {
        typeDisplay = 'CODE_93'
    }
    
    return `
        <div class="alert alert-success">
            <strong>Type:</strong> ${typeDisplay}<br>
            <strong>Data:</strong> ${decodedText}
        </div>
    `;
}

function onScanSuccess(decodedText, decodedResult) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = formatScanResult(decodedText, decodedResult);

    // 发送扫描结果到后端
    sendScanResultToBackend(decodedText, decodedResult);
}

function onScanFailure(error) {
    console.warn(`Code scan error = ${error}`);
}

function startScanner() {
    // 使用更优化的配置
    const config = {
        fps: 30,  // 提高帧率
        qrbox: { width: 300, height: 300 },  // 增大扫描区域
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        // 启用实验性功能
        experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
        },
        // 添加条形码特定配置
        barcodeDetectorConfig: {
            formats: [
                "ean_13",
                "ean_8",
                "upc_a",
                "upc_e",
                "code_128",
                "code_39",
                "code_93",
                "itf",
                "codabar",
                "pdf417",
                "upc_a",
                "upc_e"
            ]
        }
    };

    try {
        html5QrcodeScanner = new Html5QrcodeScanner(
            "reader",
            config,
            false
        );
        html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    } catch (error) {
        console.error('Scanner initialization error:', error);
        document.getElementById('reader').innerHTML = `
            <div class="alert alert-danger">
                <strong>Error:</strong> Failed to initialize scanner. Please try the following:
                <ul>
                    <li>Use Chrome or Edge browser</li>
                    <li>Allow camera access</li>
                    <li>Make sure you have a working camera</li>
                    <li>Refresh the page</li>
                </ul>
                <small>Error details: ${error.message}</small>
            </div>
        `;
    }
}

async function scanImage() {
    const fileInput = document.getElementById('imageFile');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please select an image file');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch('/api/scan/image', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        const resultDiv = document.getElementById('uploadResult');
        
        if (data.error) {
            resultDiv.innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
            return;
        }
        
        if (data.results.length === 0) {
            resultDiv.innerHTML = '<div class="alert alert-warning">No QR codes or barcodes found</div>';
            return;
        }
        
        let resultsHtml = '<div class="alert alert-success">';
        data.results.forEach(result => {
            resultsHtml += `<strong>Type:</strong> ${result.type}<br>`;
            resultsHtml += `<strong>Data:</strong> ${result.data}<br><br>`;
        });
        resultsHtml += '</div>';
        resultDiv.innerHTML = resultsHtml;
    } catch (error) {
        document.getElementById('uploadResult').innerHTML = 
            `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
}

async function performOCR() {
    const fileInput = document.getElementById('imageFile');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please select an image file');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch('/api/ocr', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        const resultDiv = document.getElementById('uploadResult');
        
        if (data.error) {
            resultDiv.innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
            return;
        }
        
        if (!data.text) {
            resultDiv.innerHTML = '<div class="alert alert-warning">No text found in image</div>';
            return;
        }
        
        resultDiv.innerHTML = `
            <div class="alert alert-success">
                <strong>Extracted Text:</strong><br>
                ${data.text}
            </div>
        `;
    } catch (error) {
        document.getElementById('uploadResult').innerHTML = 
            `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
}

// Start the scanner when the page loads
document.addEventListener('DOMContentLoaded', startScanner); 