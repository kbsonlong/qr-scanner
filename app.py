from flask import Flask, render_template, request, jsonify
import cv2
import numpy as np
from pyzbar.pyzbar import decode
import pytesseract
import os
from werkzeug.utils import secure_filename

app = Flask(__name__, 
           template_folder='app/templates',
           static_folder='app/static')
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg'}

def process_image(image_path):
    # Read image
    img = cv2.imread(image_path)
    
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Decode QR codes and barcodes
    decoded_objects = decode(gray)
    
    results = []
    for obj in decoded_objects:
        results.append({
            'type': obj.type,
            'data': obj.data.decode('utf-8')
        })
    
    return results

def perform_ocr(image_path):
    # Read image
    img = cv2.imread(image_path)
    
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Perform OCR
    text = pytesseract.image_to_string(gray)
    
    return text.strip()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/scan/result', methods=['POST'])
def handle_scan_result():
    try:
        data = request.get_json()
        if not data or 'result' not in data:
            return jsonify({'error': 'No scan result provided'}), 400
        
        scan_result = data['result']
        print(scan_result)
        # 这里可以添加对扫描结果的处理逻辑
        # 例如：保存到数据库、进行验证等
        
        return jsonify({
            'status': 'success',
            'message': 'Scan result received',
            'data': scan_result
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/scan/image', methods=['POST'])
def scan_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            results = process_image(filepath)
            return jsonify({'results': results})
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        finally:
            # Clean up
            if os.path.exists(filepath):
                os.remove(filepath)
    
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/api/ocr', methods=['POST'])
def ocr():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            text = perform_ocr(filepath)
            return jsonify({'text': text})
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        finally:
            # Clean up
            if os.path.exists(filepath):
                os.remove(filepath)
    
    return jsonify({'error': 'Invalid file type'}), 400

if __name__ == '__main__':
    app.run(debug=True, port=15000) 