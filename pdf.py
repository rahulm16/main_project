import pdfplumber
import re
import json

def extract_resume_data(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text()
    
    # Process the extracted text
    resume_data = {}

    # Extract name (assuming name is the first line or follows a specific pattern)
    name_pattern = re.compile(r"^[A-Za-z\s]+$")
    lines = text.split('\n')
    
    for line in lines:
        if name_pattern.match(line.strip()):
            resume_data['Name'] = line.strip()
            break
    
    # Extract contact details (phone, email, address)
    email_pattern = re.compile(r"[\w\.-]+@[\w\.-]+")
    phone_pattern = re.compile(r"\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}")
    
    resume_data['Email'] = next((line for line in lines if email_pattern.search(line)), None)
    resume_data['Phone'] = next((line for line in lines if phone_pattern.search(line)), None)

    # Extract education (basic pattern matching for degrees or institutions)
    education_keywords = ['Bachelors', 'Masters', 'PhD', 'Degree', 'University']
    resume_data['Education'] = []
    for line in lines:
        if any(keyword in line for keyword in education_keywords):
            resume_data['Education'].append(line.strip())

    # Extract work experience (looking for phrases like "worked as", "experience", etc.)
    resume_data['Work Experience'] = []
    experience_keywords = ['worked as', 'experience', 'internship', 'role', 'responsible for']
    for line in lines:
        if any(keyword in line.lower() for keyword in experience_keywords):
            resume_data['Work Experience'].append(line.strip())

    return json.dumps(resume_data, indent=4)

# Example usage:
pdf_path = "Vamshik Resume.pdf"
resume_json = extract_resume_data(pdf_path)
print(resume_json)
