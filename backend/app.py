from flask import Flask
from flask_cors import CORS

# Import blueprint yang sudah ada
from routes.user_routes import user_bp
from routes.monitoring_routes import monitoring_bp
from routes.auth_routes import auth_bp
from routes.sensor_routes import sensor_bp
from routes.ml_routes import ml_bp
from routes.lstm_predict_routes import lstm_predict_bp

# 1. Import blueprint FAQ yang baru
from routes.faq_routes import faq_bp

app = Flask(__name__)
CORS(app, supports_credentials=True, expose_headers=["Authorization"])

# Daftarkan blueprint yang sudah ada
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(monitoring_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(sensor_bp, url_prefix='/api/sensors')
app.register_blueprint(ml_bp, url_prefix='/api/ml')
app.register_blueprint(lstm_predict_bp, url_prefix='/api/predict')

# 2. Daftarkan blueprint FAQ yang baru
app.register_blueprint(faq_bp, url_prefix='/api')


print(app.url_map)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)