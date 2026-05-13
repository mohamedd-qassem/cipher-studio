import os
from flask import Flask, request, jsonify, render_template
from ciphers import caesar, xor_cipher, rail_fence

app = Flask(__name__)

ALGORITHM_MAP = {
    'caesar': {
        'name': 'Caesar Cipher',
        'module': caesar,
        'key_label': 'Shift (1-25)',
        'description': 'The Caesar cipher shifts each letter by a fixed number of positions in the alphabet.'
    },
    'xor': {
        'name': 'XOR Cipher',
        'module': xor_cipher,
        'key_label': 'Key (0-255)',
        'description': 'The XOR cipher combines each character with a key using the bitwise XOR operation. Encryption and decryption are identical.'
    },
    'rail_fence': {
        'name': 'Rail Fence Cipher',
        'module': rail_fence,
        'key_label': 'Number of Rails (2+)',
        'description': 'The Rail Fence cipher writes the message in a zigzag pattern across multiple rows (rails) and reads it row by row.'
    }
}


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/algorithms')
def get_algorithms():
    info = {}
    for key, val in ALGORITHM_MAP.items():
        info[key] = {
            'name': val['name'],
            'key_label': val['key_label'],
            'description': val['description']
        }
    return jsonify(info)


@app.route('/api/process', methods=['POST'])
def process():
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'error': 'No JSON data provided'}), 400

    text = data.get('text', '').strip()
    algorithm_key = data.get('algorithm', '').strip().lower()
    operation = data.get('operation', '').strip().lower()
    key_raw = data.get('key', '').strip()

    if not text:
        return jsonify({'success': False, 'error': 'Please enter some text to process.'}), 400

    if algorithm_key not in ALGORITHM_MAP:
        return jsonify({'success': False, 'error': f'Unknown algorithm "{algorithm_key}".'}), 400

    if operation not in ('encrypt', 'decrypt'):
        return jsonify({'success': False, 'error': 'Operation must be "encrypt" or "decrypt".'}), 400

    if not key_raw:
        return jsonify({'success': False, 'error': 'Please enter a key.'}), 400

    try:
        key = int(key_raw)
    except ValueError:
        return jsonify({'success': False, 'error': 'Key must be an integer.'}), 400

    if algorithm_key == 'caesar':
        if key < 1 or key > 25:
            return jsonify({'success': False, 'error': 'Caesar shift must be between 1 and 25.'}), 400
    elif algorithm_key == 'xor':
        if key < 0 or key > 255:
            return jsonify({'success': False, 'error': 'XOR key must be between 0 and 255.'}), 400
    elif algorithm_key == 'rail_fence':
        if key < 2:
            return jsonify({'success': False, 'error': 'Rail Fence requires at least 2 rails.'}), 400
        if len(text) < key:
            return jsonify({'success': False, 'error': 'Number of rails cannot exceed the text length.'}), 400

    cipher_module = ALGORITHM_MAP[algorithm_key]['module']
    algo_name = ALGORITHM_MAP[algorithm_key]['name']

    try:
        if operation == 'encrypt':
            result_text, steps = cipher_module.encrypt(text, key)
        else:
            result_text, steps = cipher_module.decrypt(text, key)
    except Exception as e:
        return jsonify({'success': False, 'error': f'Processing error: {str(e)}'}), 500

    return jsonify({
        'success': True,
        'algorithm': algo_name,
        'operation': operation,
        'input_text': text,
        'result_text': result_text,
        'key': key,
        'steps': steps
    })


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
