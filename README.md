# QR Code and Barcode Scanner Web Application

A Flask-based web application that provides QR code and barcode scanning capabilities, as well as OCR text recognition.

## Features

- Scan QR codes and barcodes using device camera
- Upload and recognize QR codes/barcodes from images
- OCR text recognition from images
- Real-time scanning using HTML5-QRCode library

## Project Structure

```
.
├── app/
│   ├── __init__.py
│   ├── routes.py
│   ├── static/
│   │   ├── css/
│   │   └── js/
│   └── templates/
├── requirements.txt
└── README.md
```

## Installation

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
python app.py
```

## Dependencies

- Flask: Web framework
- opencv-python: Image processing
- pyzbar: QR code and barcode decoding
- pytesseract: OCR text recognition
- html5-qrcode: Frontend scanning library

## API Endpoints

- POST /api/scan/image: Upload and scan image for QR codes/barcodes
- POST /api/ocr: Perform OCR on uploaded image
- GET /: Main page with camera scanning interface

## Usage

1. Camera Scanning:
   - Open the main page
   - Allow camera access
   - Point camera at QR code/barcode
   - Results will be displayed automatically

2. Image Upload:
   - Click "Upload Image" button
   - Select image file
   - Results will be displayed after processing

3. OCR:
   - Upload an image containing text
   - Click "OCR" button
   - Extracted text will be displayed