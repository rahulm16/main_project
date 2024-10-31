from flask import Flask, redirect, render_template, request, jsonify, session
from flask_pymongo import PyMongo
from mistralai import Mistral
from flask_bcrypt import Bcrypt
import json
import logging
#hi
app = Flask(__name__)
app.secret_key = "your_secret_key"  # Change this to a strong secret key
app.config["MONGO_URI"] = "mongodb://localhost:27017/aicareer"  # Your MongoDB URI
mongo = PyMongo(app)
bcrypt = Bcrypt(app)  # Initialize Bcrypt

# Initialize logging
logging.basicConfig(level=logging.DEBUG)

# Initialize Mistral client
api_key = "TAwCGc5pL1RjWdb45bqKQkfXAZEs9npP"
model = "mistral-large-latest"
client = Mistral(api_key=api_key)

@app.route('/')
def index():
    return render_template('login.html', user=session.get('user'))

@app.route('/chatbot')
def chatbot():
    return render_template('chatbot.html', user=session.get('user'))

@app.route('/profile')
def profile():
    return render_template('profile.html', user=session.get('user'))

@app.route('/choices')
def choices():
    return render_template('choices.html', user=session.get('user')) 

@app.route('/api/signup', methods=['POST'])
def signup():
    user_data = request.json
    existing_user = mongo.db.users.find_one({"email": user_data['email']})
    if existing_user:
        return jsonify({'success': False, 'message': 'Account already exists.'}), 400

    # Hash the password before storing
    hashed_password = bcrypt.generate_password_hash(user_data['password']).decode('utf-8')
    user_data['password'] = hashed_password  # Replace plain password with hashed password

    # Save the new user
    mongo.db.users.insert_one(user_data)
    return jsonify({'success': True}), 201

@app.route('/api/login', methods=['POST'])
def api_login():
    logging.debug("Login attempt.")
    user_data = request.json
    user = mongo.db.users.find_one({"email": user_data['email']})

    if user and bcrypt.check_password_hash(user['password'], user_data['password']):
        logging.debug(f"User {user['email']} logged in successfully.")
        session['user'] = {  # Store user information in the session
            'fullName': user['fullName'],
            'email': user['email']
        }
        return jsonify({'success': True, 'user': session['user']}), 200
    
    logging.debug(f"Failed login attempt for {user_data['email']}.")
    return jsonify({'success': False, 'message': 'Invalid email or password.'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user', None)  # Remove user info from the session
    return jsonify({'success': True})

@app.route('/save-data/', methods=['POST'])
def save_data():
    user_data = request.json  # Get data from the request
    
    # Validate incoming data
    if not isinstance(user_data, dict):
        return jsonify({'status': 'error', 'message': 'Invalid data format. Expected a dictionary.'}), 400

    # Check for career preferences in the data
    if 'careerPreferences' not in user_data or not isinstance(user_data['careerPreferences'], dict):
        return jsonify({'status': 'error', 'message': 'Invalid or missing career preferences.'}), 400

    # Insert data into MongoDB
    mongo.db.user_responses.insert_one(user_data)

    # Generate questions after saving data
    result = generate_questions(user_data['careerPreferences'])

    return jsonify({'status': 'success', 'message': result}), 200

def generate_questions(career_preferences):
    """ Generate aptitude questions using Mistral API. """
    messages = [
        {
            "role": "user",
            "content": f"Generate 15 aptitude questions related to the following career preferences: {', '.join(career_preferences.values())}. Please format the response as a JSON array like this: [{{"
                       f"\"question\": \"Question text\"," 
                       f"\"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"],"
                       f"\"correct_answer\": \"Correct Option\""
                       f"}}]."
        }
    ]

    chat_response = client.chat.complete(
        model=model,
        messages=messages
    )

    # Assuming chat_response.choices[0].message.content gives the raw JSON response
    raw_response = chat_response.choices[0].message.content

    # Cleaned response extraction logic
    try:
        # Extract JSON array from raw response
        start_index = raw_response.index('[')  # Find the start of the JSON array
        end_index = raw_response.rindex(']') + 1  # Find the end of the JSON array
        cleaned_response = raw_response[start_index:end_index]  # Extract the JSON part

        # Parse the cleaned response to JSON
        questions_data = json.loads(cleaned_response)

        # Store in MongoDB (assuming collection is named 'questions')
        mongo.db.questions.insert_many(questions_data)

    except (json.JSONDecodeError, ValueError) as e:
        logging.error(f"Error processing API response: {e}")
        return "Failed to generate questions.", 500

    return "Aptitude questions successfully added to the database."

@app.route('/questions', methods=['GET'])
def get_questions():
    questions = mongo.db.questions.find()  # Adjust 'questions' to your collection name
    questions_list = []
    for question in questions:
        questions_list.append({
            'question': question['question'],
            'options': question['options']  # Assuming 'options' is a list
        })
    return jsonify(questions_list)

if __name__ == "__main__":
    app.run(debug=True)
