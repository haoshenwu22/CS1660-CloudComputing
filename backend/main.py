import os
from flask import Flask, request
from google.cloud import firestore
from google.oauth2 import service_account

# Initialize Flask app
app = Flask(__name__)

# Path to your service account key JSON file
SERVICE_ACCOUNT_FILE = "./serviceAccountKey.json"

# Authenticate and initialize Firestore client
credentials = service_account.Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE)
db = firestore.Client(project="endless-bounty-433922-g4", database="final-project-db", credentials=credentials)

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

@app.route('/menu', methods=['POST'])
def add_menu_item():
    """Add a new menu item."""
    try:
        data = request.json
        menu_name = data.get('name')
        # Validate input
        if not menu_name:
            return {"error": "Menu item name is required."}, 400
        # Use the menu name as the document ID
        menu_ref = db.collection('MenuItems').document(menu_name)
        # Check if the menu item already exists
        if menu_ref.get().exists:
            return {"error": f"Menu item '{menu_name}' already exists."}, 409
        # Add the menu item to Firestore
        menu_ref.set(data)
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

# Run the app using the PORT environment variable
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))  # Default to 8080 if PORT is not set
    app.run(host='0.0.0.0', port=port, debug=True)