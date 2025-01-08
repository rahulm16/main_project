# **SavvyAI: AI-Enhanced Career Guidance System**

## **Project Overview**
SavvyAI is an AI-powered career guidance system designed to help students and professionals discover their ideal career paths. By considering each user’s unique educational background, skills, and aspirations, SavvyAI provides personalized career recommendations. The system utilizes advanced AI tools, including data integration from **Mistralai** and **LinkedIn**, to assess user strengths and guide them toward successful career paths. The platform not only suggests career options but also provides guidance on skill development to bridge gaps and enhance employability.

---

## **Technologies Used**
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Python with **Flask** framework
- **Database**: **MongoDB** (NoSQL database)
- **APIs**: 
  - **Mistralai API**: Provides AI-driven career recommendations and personality assessments.
  - **LinkedIn API**: Retrieves professional data to enhance career recommendation accuracy.

---

## **How the System Works**

### **1. User Registration and Data Collection**
The system collects the following basic information from users:
- **Personal Details**: Age, education level, and whether the user is a student or a working professional.
- **Career Aspirations**: Preferences and aspirations related to potential career paths.

### **2. Aptitude and Skills Assessment**
- **Aptitude Assessment**: AI-driven tools analyze user’s intellectual strengths and aptitudes to determine suitable career areas.
- **Skills Mapping**: The system evaluates existing skills and maps them to various career options.

### **3. Career Recommendations**
After gathering and analyzing the data, the system generates:
- **Career Options**: Personalized career paths based on user’s skills and aspirations.
- **Skill Development**: Suggestions for courses, certifications, and professional networks based on **LinkedIn data**.

### **4. Resume Upload**
Users can upload their resumes in PDF format. The system parses the resume to extract education, skills, hobbies, and work experience, which are then used to enhance career recommendations.

### **5. Resume Download and Template Options**
Users can download their resumes in various templates. The system offers multiple resume templates to choose from, allowing users to select the one that best fits their style and preferences.

### **6. Continuous Learning**
SavvyAI helps users continue to develop their careers by:
- **Skill Gap Analysis**: Identifying areas for improvement and recommending appropriate educational resources.
- **Progression Guidance**: Offering continuous support as users progress in their career journey.

### **7. QR Code Generation**
Users can generate QR codes for their profiles, which can be shared easily with potential employers or networking contacts.

### **8. Feedback System**
Users can provide feedback on the recommendations and the overall system, helping to improve the platform.

### **9. Community Engagement**
Users can engage with a community of like-minded individuals, share insights, and seek advice on career-related topics.

---

## **Technologies and Setup**

### **1. MongoDB Setup**
MongoDB is used as the database to store and retrieve user data.

#### **Install MongoDB Locally**
Follow the official MongoDB installation guide to set it up:
- [MongoDB Installation](https://www.mongodb.com/docs/manual/installation/)

#### **Start MongoDB**
Once installed, run the following command to start MongoDB:
```bash
mongod
```

#### **Verify MongoDB**
Ensure MongoDB is running by checking if it’s accessible at `localhost:27017`.

---

### **2. Install Requirements and Setup Environment**

#### **Create a Virtual Environment**
To create a virtual environment, run the following commands:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
```

#### **Install Python Dependencies**
To install required Python libraries, use the following:
```bash
pip install -r requirements.txt
```

#### **Setup Environment Variables**
Create a `.env` file in the project root directory and add the following environment variables:
```properties
FLASK_APP="app.py"
API_KEY="your_mistralai_api_key"
MONGO_URI="mongodb://localhost:27017/"
```

Replace `your_mistralai_api_key` with your actual API key.

### **3. Run the Flask Application**

#### **Run the Flask Application**
Once the dependencies are installed, start the Flask server by running:
```bash
python app.py
```

#### **Access the Application**
Visit `http://localhost:5000` in your browser to use the SavvyAI system.

---

### **4. Integrating APIs**

#### **Mistralai API**
- Obtain an API key from Mistralai’s developer portal.
- Configure the API key in your project’s settings to integrate career recommendation capabilities.

#### **LinkedIn API**
- Set up **OAuth** authentication for LinkedIn API to retrieve professional data for more accurate career recommendations.

---

## **How We Innovate**

### **Personalized Career Recommendations**
SavvyAI’s AI-powered recommendation system considers:
- **User’s Aptitude**: The system uses **Mistralai** to analyze the user’s strengths.
- **Career Aspirations**: Based on direct user input and preferences.
- **Professional Data**: Integrated from **LinkedIn** to enhance accuracy.

### **Skill-Based Guidance**
- SavvyAI doesn’t just recommend careers but also provides **skill development guidance**, suggesting necessary courses and resources to help users bridge their skill gaps and improve employability.

---

## **Project Future Work**

### **Scalability**
To support a large number of users, we plan to:
- Optimize backend processes.
- Integrate **cloud-based solutions** for better performance.

### **Advanced AI Models**
In future iterations, we will:
- Enhance the system’s AI with more advanced models for even better career recommendations.
- Increase adaptability to individual user needs.

---

## **Contributing to the Project**

We welcome contributions to the SavvyAI project. To contribute:
1. **Fork** the repository.
2. **Clone** the forked repository to your local machine.
3. **Create a feature branch**: 
   ```bash
   git checkout -b feature-name
   ```
4. **Commit changes**: 
   ```bash
   git commit -am 'Add new feature'
   ```
5. **Push** the branch:
   ```bash
   git push origin feature-name
   ```
6. **Submit a pull request** for review.