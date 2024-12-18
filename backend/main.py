import os
from flask import Flask, request
from google.cloud import firestore, storage
from google.oauth2 import service_account
from werkzeug.datastructures import Headers
from flask_cors import CORS  # Import Flask-CORS
from werkzeug.utils import secure_filename


# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


# Initialize Firestore client
db = firestore.Client(database="final-project-db")
storage_client = storage.Client()
BUCKET_NAME = "menu-item-images-bucket"  


# Test route to check backend status
@app.route('/')
def home():
    return "Backend is running!"

# --- Menu Endpoints ---
@app.route('/menu', methods=['GET'])
def get_menu():
    """Fetch all menu items."""
    try:
        menu_ref = db.collection('MenuItems')
        docs = menu_ref.stream()
        menu = [{doc.id: doc.to_dict()} for doc in docs]
        return {"menu": menu}, 200
    except Exception as e:
        return {"error": str(e)}, 500

# @app.route('/menu', methods=['POST'])
# def add_menu_item():
#     """Add a new menu item."""
#     try:
#         data = request.json
#         menu_name = data.get('name')
#         if not menu_name:
#             return {"error": "Menu item name is required."}, 400
#         menu_ref = db.collection('MenuItems').document(menu_name)
#         if menu_ref.get().exists:
#             return {"error": f"Menu item '{menu_name}' already exists."}, 409
#         menu_ref.set(data)
#         return {"message": f"Menu item '{menu_name}' added successfully!"}, 201
#     except Exception as e:
#         return {"error": str(e)}, 500
    
@app.route('/menu', methods=['POST'])
def add_menu_item():
    """Add a new menu item, including an image URL."""
    try:
        data = request.json
        menu_name = data.get('name')
        if not menu_name:
            return {"error": "Menu item name is required."}, 400

        menu_ref = db.collection('MenuItems').document(menu_name)
        if menu_ref.get().exists:
            return {"error": f"Menu item '{menu_name}' already exists."}, 409

        menu_data = {
            "name": menu_name,
            "price": data.get("price"),
            "description": data.get("description"),
            "availability": data.get("availability", True),
            "image_url": data.get("image_url", "")  # Default to empty if no URL provided
        }

        menu_ref.set(menu_data)
        return {"message": f"Menu item '{menu_name}' added successfully!"}, 201

    except Exception as e:
        return {"error": str(e)}, 500


@app.route('/menu/<menu_id>', methods=['PUT'])
def update_menu_item(menu_id):
    """Update an existing menu item."""
    try:
        data = request.json
        menu_ref = db.collection('MenuItems').document(menu_id)
        menu_ref.update(data)
        return {"message": "Menu item updated successfully!"}, 200
    except Exception as e:
        return {"error": str(e)}, 500

@app.route('/menu/<menu_id>', methods=['DELETE'])
def delete_menu_item(menu_id):
    """Delete a menu item."""
    try:
        menu_ref = db.collection('MenuItems').document(menu_id)
        menu_ref.delete()
        return {"message": "Menu item deleted successfully!"}, 200
    except Exception as e:
        return {"error": str(e)}, 500

# -------- Upload image
@app.route('/upload-image', methods=['POST'])
def upload_image():
    """Upload an image to Cloud Storage and return the public URL."""
    try:
        if 'file' not in request.files:
            return {"error": "No file part in the request"}, 400

        file = request.files['file']
        if file.filename == '':
            return {"error": "No file selected"}, 400

        filename = secure_filename(file.filename)

        # Upload to Cloud Storage
        bucket = storage_client.bucket(BUCKET_NAME)
        blob = bucket.blob(filename)
        blob.upload_from_file(file)
        blob.make_public()  # Make the file publicly accessible

        # Return the public URL
        return {"image_url": blob.public_url}, 200

    except Exception as e:
        return {"error": str(e)}, 500
# ---------- delete end points
@app.route('/delete-image/<filename>', methods=['OPTIONS', 'DELETE'])
def delete_image(filename):
    """Delete an image from Cloud Storage."""
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = Flask.response_class()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Methods', 'OPTIONS, DELETE')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response

    try:
        # Delete the image from the bucket
        bucket = storage_client.bucket(BUCKET_NAME)
        blob = bucket.blob(filename)
        if not blob.exists():
            return {"error": f"Image {filename} does not exist."}, 404

        blob.delete()
        return {"message": f"Image {filename} deleted successfully."}, 200

    except Exception as e:
        return {"error": str(e)}, 500


# --- Order Endpoints ---
@app.route('/order', methods=['POST'])
def place_order():
    """Place a new order."""
    try:
        data = request.json
        table_id = data['table_id']
        items = data['items']
        order_ref = db.collection('Orders').document()
        order_data = {
            "table_id": table_id,
            "items": items,
            "status": "Pending",
            "timestamp": firestore.SERVER_TIMESTAMP
        }
        order_ref.set(order_data)
        return {"message": "Order placed successfully!", "order_id": order_ref.id}, 201
    except Exception as e:
        return {"error": str(e)}, 500

@app.route('/order-status/<table_id>', methods=['GET'])
def get_order_status(table_id):
    """Fetch order status for a specific table."""
    try:
        orders_ref = db.collection('Orders')
        docs = orders_ref.where('table_id', '==', table_id).stream()
        orders = [doc.to_dict() for doc in docs]
        return {"orders": orders}, 200
    except Exception as e:
        return {"error": str(e)}, 500

@app.route('/order/<order_id>', methods=['PUT'])
def update_order_status(order_id):
    """Update the status of an order."""
    try:
        data = request.json
        new_status = data['status']
        order_ref = db.collection('Orders').document(order_id)
        order_ref.update({"status": new_status})
        return {"message": f"Order {order_id} status updated to {new_status}."}, 200
    except Exception as e:
        return {"error": str(e)}, 500

@app.route('/orders', methods=['GET'])
def get_all_orders():
    """Fetch all orders."""
    try:
        orders_ref = db.collection('Orders')
        docs = orders_ref.stream()
        orders = [{doc.id: doc.to_dict()} for doc in docs]
        return {"orders": orders}, 200
    except Exception as e:
        return {"error": str(e)}, 500

def app_entry_point(request):
    """Entry point for Cloud Functions"""
    headers = Headers(request.headers)
    with app.test_request_context(
        path=request.path,
        base_url=request.url_root,
        query_string=request.query_string.decode("utf-8"),
        headers=headers,
        method=request.method,
        data=request.get_data()
    ):
        return app.full_dispatch_request()

# Run the app using the PORT environment variable
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=True)
