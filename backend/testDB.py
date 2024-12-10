from google.cloud import firestore

try:
    db = firestore.Client(database="final-project-db")
    print("Firestore client initialized successfully.")
    try:
        # Reference the 'MenuItems' collection
        menu_ref = db.collection("MenuItems")
        # Query for items where 'name' is 'Burger'
        docs = menu_ref.where("name", "==", "Pizza").stream() 
        print("Query Results:")
        for doc in docs:
            print(f"{doc.id} => {doc.to_dict()}")

    except Exception as e:
        print(f"Error querying Firestore: {e}")
except Exception as e:
    print(f"Error initializing Firestore: {e}")
