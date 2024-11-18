from flask import Flask, redirect, render_template, request, jsonify, session, url_for
from flask_pymongo import PyMongo
from pymongo import MongoClient
from bson import ObjectId
from bson.json_util import dumps
from mistralai import Mistral
from flask_bcrypt import Bcrypt
from datetime import datetime
from bson import ObjectId, json_util  # Add this import at the top
import random
import json
import logging
import os

app = Flask(__name__)
app.secret_key = "your_secret_key"  # Change this to a strong secret key
app.config["MONGO_URI"] = "mongodb://localhost:27017/aicareer"  # Your MongoDB URI
mongo = PyMongo(app)
bcrypt = Bcrypt(app)  # Initialize Bcrypt

client = MongoClient("mongodb://localhost:27017/")  # Connecting to MongoDB (if on localhost)
gaq_db = client.General_Aptitude_questions

# GAQ collections for Easy, Medium, and Hard questions
GAQ_Collection = {
    "easy": "easy",  # Easy questions collection
    "medium": "medium",  # Medium questions collection
    "hard": "hard"  # Hard questions collection
}

# Initialize logging
logging.basicConfig(level=logging.DEBUG)
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("pymongo").setLevel(logging.WARNING)


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

@app.route('/aptitude', methods=['GET', 'POST'])
def aptitude():
    # Fetch user data
    user = mongo.db.user_data.find_one()
    if not user:
        return redirect(url_for('index'))

    # Convert ObjectId in user data to string
    user['_id'] = str(user['_id'])  # Make sure the user ID is serializable

    user_age = user.get('age', 0)

    # Determine difficulty level based on age
    if user_age <= 18:
        collection_name = "Easy"
    elif 18 < user_age <= 25:
        collection_name = "Medium"
    else:
        collection_name = "Hard"
    
    # Fetch questions from the GAQ database
    questions_collection = gaq_db[collection_name]
    all_questions = list(questions_collection.find())
    
    # Convert ObjectId to string for each question
    for question in all_questions:
        question['_id'] = str(question['_id'])  # Convert ObjectId to string

    # Filtering questions by type
    logic_questions = [q for q in all_questions if q.get('Type') == 'Logic']
    math_questions = [q for q in all_questions if q.get('Type') == 'Mathematical']
    verbal_questions = [q for q in all_questions if q.get('Type') == 'Verbal']

    # Randomly select questions from each category
    selected_logic = random.sample(logic_questions, 5) if len(logic_questions) >= 5 else logic_questions
    selected_math = random.sample(math_questions, 5) if len(math_questions) >= 5 else math_questions
    selected_verbal = random.sample(verbal_questions, 5) if len(verbal_questions) >= 5 else verbal_questions

    # Combine selected questions
    selected_questions = selected_logic + selected_math + selected_verbal

    if 'current_index' not in session:
        session['current_index'] = 0

    current_index = session['current_index']

    if request.method == 'POST':
        answers = request.form.getlist('answers')

        session['current_index'] += 1
        if session['current_index'] >= len(selected_questions):
            session['current_index'] = len(selected_questions) - 1
        
        return redirect(url_for('aptitude'))

    # Pass user data to the template along with selected questions
    return render_template('aptitude.html', user=session.get('user'), questions=selected_questions, current_index=current_index)

@app.route('/api/save-aptitude-answers', methods=['POST'])
def save_aptitude_answers():
    # Fetch the user data from the database
    user = mongo.db.user_data.find_one()

    if not user:
        return jsonify({'status': 'error', 'message': 'User not found.'}), 404

    # Get answers and user details from the request
    answers = request.json.get('answers')  # List of answers provided by the user
    user_age = user.get('age', 0)  # Get user's age from the user data

    # Ensure that the answers are in a list format
    if not isinstance(answers, list):
        return jsonify({'status': 'error', 'message': 'Invalid data format. Expected a list of answers.'}), 400

    answered_results = []

    # Determine the difficulty based on user age
    if user_age <= 18:
        difficulty_level = 'easy'
        collection_name = "Easy"
    elif 18 < user_age <= 25:
        difficulty_level = 'medium'
        collection_name = "Medium"
    else:
        difficulty_level = 'hard'
        collection_name = "Hard"

    # Access the correct collection based on the difficulty level
    questions_collection = gaq_db[collection_name]

    # Process each answer
    for answer in answers:
        question_text = answer['question']
        selected_answer = answer['answered']
        
        # Fetch the question from the determined difficulty level collection
        question_data = questions_collection.find_one({"question": question_text})

        if question_data:
            correct_answer = question_data.get("correct_answer")
            correct_or_wrong = 'correct' if selected_answer == correct_answer else 'wrong'

            answered_results.append({
                "question": question_text,
                "answered": selected_answer,
                "correct_or_wrong": correct_or_wrong,
                "difficulty_level": difficulty_level
            })
        else:
            answered_results.append({
                "question": question_text,
                "answered": selected_answer,
                "correct_or_wrong": 'question not found',
                "difficulty_level": difficulty_level
            })

    # Insert answers into `gaq_answered` collection in the `aicareer` database
    mongo.db.gaq_answered.insert_many(answered_results)

    return jsonify({'status': 'success', 'message': 'Answers saved successfully.'})


@app.route('/aptitude_results', methods=['GET'])
def aptitude_results():
    # Fetch data from `gaq_answered` collection
    answered_data = list(mongo.db.gaq_answered.find())  

    total_questions = len(answered_data)
    correct_answers = sum(1 for answer in answered_data if answer['correct_or_wrong'] == 'correct')
    wrong_answers = total_questions - correct_answers
    score_percentage = (correct_answers / total_questions) * 100 if total_questions > 0 else 0

    detailed_results = []
    
    for answer in answered_data:
        difficulty_level = answer.get('difficulty_level')
        question_data = None
        
        # Determine the correct collection based on the difficulty level
        if difficulty_level == 'easy':
            collection_name = "Easy"
        elif difficulty_level == 'medium':
            collection_name = "Medium"
        elif difficulty_level == 'hard':
            collection_name = "Hard"
        else:
            collection_name = None  # Fallback in case the level is not recognized
        
        if collection_name:
            # Access the correct collection based on the difficulty level
            questions_collection = gaq_db[collection_name]

            # Fetch the question from the determined difficulty level collection
            question_data = questions_collection.find_one({"question": answer['question']})

        if question_data:
            detailed_results.append({
                'question': answer['question'],
                'selected_answer': answer['answered'],
                'correct_answer': question_data['correct_answer'],
                'options': question_data['options'],
                'is_correct': answer['correct_or_wrong'] == 'correct',
                'difficulty_level': difficulty_level
            })

    # Create aptitude results data
    aptitude_results_data = {
        "total_questions": total_questions,
        "correct_answers": correct_answers,
        "wrong_answers": wrong_answers,
        "score_percentage": score_percentage,
        "detailed_results": detailed_results,
        "user": session.get('user')
    }

    # Insert the aptitude results data into `gaq_aptitude_results` collection in `aicareer` database
    mongo.db.gaq_aptitude_results.insert_one(aptitude_results_data)

    # Render the results on the results page
    return render_template(
        'aptitude_results.html',
        user=session.get('user'),
        total_questions=total_questions,
        correct_answers=correct_answers,
        wrong_answers=wrong_answers,
        score_percentage=score_percentage,
        detailed_results=detailed_results
    )


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

@app.route('/api/save_user_data', methods=['POST'])
def save_user_data():
    user_data = request.json  # Get data from the request
    
    # Validate the incoming data
    required_fields = ["current_status", "age", "highest_level_of_education", 
                       "current_field_of_study_or_work", "key_skills", "personality_traits"]
    missing_fields = [field for field in required_fields if field not in user_data]
    if missing_fields:
        return jsonify({'status': 'error', 'message': f'Missing fields: {", ".join(missing_fields)}'}), 400

    # Insert data into MongoDB collection 'user_data'
    mongo.db.user_data.insert_one(user_data)

    return jsonify({'status': 'success', 'message': 'User data successfully saved.'}), 200


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
    # Fetch questions from MongoDB
    questions_data = mongo.db.questions.find()
    
    # Convert MongoDB cursor to a list
    questions = list(questions_data)

    # Format questions as a list of dictionaries
    formatted_questions = [
        {
            "question": q['question'],
            "options": q['options'],
            "correct_answer": q.get("correct_answer")  # Include correct answer if needed
        }
        for q in questions
    ]

    # Initialize current question index in the session if not already set
    if 'current_index' not in session:
        session['current_index'] = 0

    # Get current index
    current_index = session['current_index']

    # Render the questions.html template with questions data and current index
    return render_template('questions.html', user=session.get('user'), questions=formatted_questions, current_index=current_index)

@app.route('/api/save-answers', methods=['POST'])
def save_answers():
    answers = request.json  # Get the answers from the request

    if not isinstance(answers, list):
        return jsonify({'status': 'error', 'message': 'Invalid data format. Expected a list.'}), 400

    results = []  # To store the results for insertion

    for answer in answers:
        question_data = mongo.db.questions.find_one({"question": answer['question']})

        if question_data:
            correct_answer = question_data.get("correct_answer")
            correct_or_wrong = 'correct' if answer['answered'] == correct_answer else 'wrong'

            results.append({
                "question": answer['question'],
                "answered": answer['answered'],
                "correct_or_wrong": correct_or_wrong,
            })
        else:
            results.append({
                "question": answer['question'],
                "answered": answer['answered'],
                "correct_or_wrong": 'question not found',
            })

    mongo.db.answered.insert_many(results)
    
    # Return status with redirect URL
    return jsonify({'status': 'success', 'message': 'Answers saved.', 'url': url_for('results')}), 200

@app.route('/results', methods=['GET'])
def results():
    # Fetch answered questions and their details from MongoDB
    answered_data = list(mongo.db.answered.find())
    
    # Get the original questions with correct answers
    questions_data = {}
    for answer in answered_data:
        question = mongo.db.questions.find_one({"question": answer['question']})
        if question:
            questions_data[answer['question']] = {
                'correct_answer': question['correct_answer'],
                'options': question['options']
            }

    # Calculate statistics
    total_questions = len(answered_data)
    correct_answers = sum(1 for answer in answered_data if answer['correct_or_wrong'] == 'correct')
    wrong_answers = total_questions - correct_answers
    score_percentage = (correct_answers / total_questions) * 100 if total_questions > 0 else 0

    # Create detailed results list
    detailed_results = []
    for answer in answered_data:
        question_info = questions_data.get(answer['question'])
        if question_info:
            detailed_results.append({
                'question': answer['question'],
                'selected_answer': answer['answered'],
                'correct_answer': question_info['correct_answer'],
                'options': question_info['options'],
                'is_correct': answer['correct_or_wrong'] == 'correct'
            })
     # Prepare the results data for MongoDB
    results_data = {
        "total_questions": total_questions,
        "correct_answers": correct_answers,
        "wrong_answers": wrong_answers,
        "score_percentage": score_percentage
    }

    # Save results to the 'aptitude_result' collection
    mongo.db.aptitude_result.insert_one(results_data)  # Add this line to save to aptitude_result
    return render_template(
        'results.html',
        user=session.get('user'),
        total_questions=total_questions,
        correct_answers=correct_answers,
        wrong_answers=wrong_answers,
        score_percentage=score_percentage,
        detailed_results=detailed_results
    )

@app.route('/fetch_suggestions', methods=['GET'])
def fetch_suggestions():
    # Fetch 15 documents from the 'answered' collection
    documents = mongo.db.answered.find().limit(15)
    documents2 = list(mongo.db.user_data.find().limit(1))
    documents3 = list(mongo.db.user_responses.find().limit(1))

    # Check for user_data
    if not documents2:
        logging.warning("No user info found in the 'user_data' collection.")
        return jsonify({'success': False, 'message': 'No user info available.'}), 404

    doc1 = documents2[0]  # Get the first document from user_data

    # Check for user_responses
    if not documents3:
        logging.warning("No user responses found in the 'user_responses' collection.")
        return jsonify({'success': False, 'message': 'No user responses available.'}), 404

    doc2 = documents3[0]  # Get the first document from user_responses

    # Prepare data for Mistral API
    questions = [{"question": doc["question"], "answer": doc["answered"]} for doc in documents if "question" in doc and "answered" in doc]

    user_data = {
        "current status": doc1["current_status"],
        "age": doc1["age"],
        "Education pursuing": doc1["highest_level_of_education"],
        "Current field of study or work": doc1["current_field_of_study_or_work"],
        "Key skills": doc1["key_skills"],
        "Work experience": doc1["work_experience"],
        "Extroversion personality trait": doc1["personality_traits"]["extroversion"],
        "Openness to work personality trait": doc1["personality_traits"]["openness_to_work"],
        "Meticulousness personality trait": doc1["personality_traits"]["meticulousness"]
    }

    user_responses = {
        "First priority": doc2["careerPreferences"]["first"],
        "Second priority": doc2["careerPreferences"]["second"],
        "Third priority": doc2["careerPreferences"]["third"]
    }

    if not questions:
        logging.warning("No questions found in the 'answered' collection.")
        return jsonify({'success': False, 'message': 'No questions available for suggestions.'}), 404

    # Prepare the content for the API request
    content = (f"This is the brief information about user {json.dumps(user_data)} "
               f"These are the user preferences in priority order {json.dumps(user_responses)} "
               f"Questions and Answers: {json.dumps(questions)} "
               f"Based on the user details, user preferences and questions and answers given by the user, "
               f"suggest 5 career paths along with 5 roadmap points for each in JSON format. "
               f"Also provide 1 Udemy search query related to each career path (just the query, not the full URL). "
               f"Also provide 1 YouTube search query related to each career path (just the query, not the full URL). "
               f"Also provide 1 Coursera search query related to each career path (just the query, not the full URL). "
               f"Also provide 1 UpGrad search query related to each career path (just the query, not the full URL). "
               f"For each career path, please also give 5 high accurate keywords that can be used to search on the NPTEL website."
               f"These should be keywords that are relevant to courses available on NPTEL (e.g., topics, course names, subjects). "
               f"Please provide 5 keywords, separated by commas. "
               f"Please format the response as a JSON array like this: "
               f"[{{\"career\": \"Career Name\", \"roadmap\": [\"Step 1\", \"Step 2\", \"Step 3\", \"Step 4\", \"Step 5\"], "
               f"\"udemy_query\": \"Search query for Udemy\", "
               f"\"youtube_query\": \"Search query for YouTube\", "
               f"\"coursera_query\": \"Search query for Coursera\", "
               f"\"upgrad_query\": \"Search query for UpGrad\", "
               f"\"nptel_keywords\": [\"keyword1\", \"keyword2\", \"keyword3\", \"keyword4\", \"keyword5\"]}}].")

    try:
        chat_response = client.chat.complete(
            model=model,
            messages=[{
                "role": "user",
                "content": content  # Use the content prepared above
            }]
        )

        # Extract the response content
        raw_response = chat_response.choices[0].message.content
        logging.debug(f"Raw API response: {raw_response}")

        # Extracting JSON data from the response
        lines = raw_response.splitlines()
        if lines[0] == "```" and lines[-1] == "```":
            json_data = "\n".join(lines[1:-1])  # Extract between the second and last line
        elif lines[0] == "```json" and lines[-1] == "```":
            json_data = "\n".join(lines[1:-1])  # Extract between the second and last line
        else:
            json_data = raw_response.strip()

        # Parse JSON data
        suggestions = json.loads(json_data)

        # Check if the suggestions are in the expected format
        if not isinstance(suggestions, list):
            logging.error("Invalid format for suggestions; expected a list.")
            return jsonify({'success': False, 'message': 'Invalid format in API response'}), 500

        # Construct full URLs and clean up the suggestions
        for suggestion in suggestions:
            suggestion['youtube_link'] = f"https://www.youtube.com/results?search_query={suggestion['youtube_query']}"
            suggestion['udemy_link'] = f"https://www.udemy.com/courses/search/?q={suggestion['udemy_query']}"
            suggestion['coursera_link'] = f"https://www.coursera.org/courses?query={suggestion['coursera_query']}"
            suggestion['upgrad_link'] = f"https://www.upgrad.com/search/?q={suggestion['upgrad_query']}"

            # Ensure NPTEL keywords are included from API response
            nptel_keywords = suggestion.get('nptel_keywords', [])
            suggestion['nptel_keywords'] = nptel_keywords  # Add the NPTEL keywords

        # Update the 'career_suggestions' collection with the new data
        mongo.db.career_suggestions.insert_many(suggestions)

        logging.info(f"Inserted {len(suggestions)} suggestions into MongoDB.")

        # Return a redirect response
        return redirect(url_for('show_suggestions'))

    except json.JSONDecodeError as e:
        logging.error(f"Error decoding JSON response: {e}")
        return jsonify({'success': False, 'message': 'Invalid JSON in API response'}), 500
    except Exception as e:
        logging.error(f"Error while fetching suggestions: {e}")
        return jsonify({'success': False, 'message': 'Failed to fetch suggestions'}), 500

@app.route('/suggestions', methods=['GET'])
def show_suggestions():
    # Retrieve suggestions from MongoDB
    suggestions = mongo.db.career_suggestions.find()
    suggestions_list = list(suggestions)  # Convert cursor to list
    return render_template('suggestions.html', suggestions=suggestions_list, user=session.get('user'))

# Import the course finder function
from course_finder import find_relevant_courses  # Assuming the previous code is in course_finder.py

@app.route('/update-nptel-courses')
def update_nptel_courses():
    """
    Administrative route to update NPTEL course matches
    This should be called periodically or when new courses are added
    """
    try:
        # MongoDB connection settings
        mongo_uri = "mongodb://localhost:27017/"
        nptel_db_name = "sample"
        nptel_collection_name = "scraped_data"
        career_db_name = "aicareer"
        career_collection_name = "career_suggestions"
        
        # Call the function to find relevant courses
        find_relevant_courses(
            mongo_uri, 
            nptel_db_name, 
            nptel_collection_name, 
            career_db_name, 
            career_collection_name,
            save_to_db=True  # Add this parameter to your original function
        )
        
        return jsonify({"status": "success", "message": "NPTEL courses updated successfully"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

@app.route('/learning')
def learning():
    try:
        # Trigger the update of NPTEL courses before rendering the page
        update_nptel_courses()

        # Fetch all career suggestions from MongoDB
        career_data = list(mongo.db.career_suggestions.find())

        # Initialize dictionaries for our data
        careers_courses = {}
        youtube_resources = []
        nptel_courses = {}

        # Process each career
        for career in career_data:
            career_name = career['career']

            # Fetch the saved NPTEL courses for this career
            saved_nptel_courses = list(mongo.db.nptel_matches.find({"career": career_name}))
            
            # Convert ObjectId to string for each course
            for course in saved_nptel_courses:
                if '_id' in course:
                    course['_id'] = str(course['_id'])
            
            nptel_courses[career_name] = saved_nptel_courses

            # Process other learning resources
            careers_courses[career_name] = {
                'udemy': {
                    'title': f"Udemy Courses for {career_name}",
                    'description': f"Learn {career_name} skills with comprehensive Udemy courses",
                    'link': career.get('udemy_link')
                },
                'coursera': {
                    'title': f"Coursera Programs for {career_name}",
                    'description': f"Professional {career_name} certifications and courses",
                    'link': career.get('coursera_link')
                },
                'upgrad': {
                    'title': f"Upgrad Programs for {career_name}",
                    'description': f"Professional {career_name} degree and certification programs",
                    'link': career.get('upgrad_link')
                }
            }

            youtube_resources.append({
                'career': career_name,
                'title': f"YouTube Tutorials for {career_name}",
                'description': f"Free {career_name} tutorials and courses",
                'link': career.get('youtube_link')
            })

        return render_template('learning.html',
                           careers_courses=careers_courses,
                           youtube_resources=youtube_resources,
                           nptel_courses=nptel_courses,
                           user=session.get('user'))

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

#feedback
@app.route('/feedback')
def feedback_page():
    """Render the feedback page"""
    if 'user' not in session:
        return redirect(url_for('login'))
    return render_template('feedback.html', user=session.get('user'))

@app.route('/api/submit-feedback', methods=['POST'])
def submit_feedback():
    """Handle feedback form submission"""
    try:
        # Get feedback data from request
        feedback_data = request.json
        
        # Add user info and timestamp
        feedback_data.update({
            'submitted_at': datetime.utcnow(),
            'user_email': session['user'].get('email')
        })

        # Insert into MongoDB
        result = mongo.db.feedback.insert_one(feedback_data)

        if result.inserted_id:
            return jsonify({
                'success': True,
                'message': 'Feedback submitted successfully'
            }), 201
            
        else:
            raise Exception("Failed to insert feedback")

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'An error occurred while submitting feedback'
        }), 500
        
if __name__ == "__main__":
    app.run(debug=True)
