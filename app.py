from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image

app = Flask(__name__)
CORS(app)

model = tf.keras.models.load_model('model_esam.h5')
class_labels = ['anorganik', 'b3', 'organik']

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'Tidak ada file gambar'}), 400
        
    file = request.files['image']
    img = Image.open(file.stream).resize((224, 224))
    
    if img.mode != 'RGB':
        img = img.convert('RGB')
        
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    
    predictions = model.predict(img_array)
    pred_class = class_labels[np.argmax(predictions[0])]
    confidence = float(np.max(predictions[0]) * 100)
    
    return jsonify({
        'kategori': pred_class.upper(),
        'akurasi': f"{confidence:.2f}%"
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)