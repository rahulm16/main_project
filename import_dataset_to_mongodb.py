import os
import json
from pymongo import MongoClient

# MongoDB connection
client = MongoClient("mongodb://localhost:27017/")  # Update with your connection string if needed

# Base folder containing the dataset
base_folder = "dataset"

# Iterate over each database folder in the dataset directory
for db_name in os.listdir(base_folder):
    db_path = os.path.join(base_folder, db_name)
    
    # Check if it's a directory
    if os.path.isdir(db_path):
        # Access the database in MongoDB
        db = client[db_name]
        
        # Iterate over each collection folder inside the database folder
        for collection_name in os.listdir(db_path):
            collection_path = os.path.join(db_path, collection_name)
            
            # Check if it's a directory
            if os.path.isdir(collection_path):
                # Access the collection in MongoDB
                collection = db[collection_name]
                
                # Iterate over JSON files (documents) in the collection folder
                for document_file in os.listdir(collection_path):
                    document_path = os.path.join(collection_path, document_file)
                    
                    # Check if it's a JSON file
                    if document_file.endswith(".json"):
                        # Read the JSON file and insert into MongoDB
                        with open(document_path, "r") as file:
                            document = json.load(file)
                            
                            # Insert the document into the collection
                            collection.insert_one(document)

print("Data has been successfully imported into MongoDB.")
