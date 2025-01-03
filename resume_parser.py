import PyPDF2
import nltk
import re
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords

# Download required NLTK data
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('averaged_perceptron_tagger')

class ResumeParser:
    def __init__(self):
        self.stop_words = set(stopwords.words('english'))
        
        # Keywords for different sections
        self.education_keywords = {'education', 'qualification', 'academic', 'degree', 'university', 'college', 'school'}
        self.skills_keywords = {'skills', 'technical skills', 'technologies', 'programming', 'languages', 'tools'}
        self.experience_keywords = {'experience', 'work history', 'employment', 'job history', 'professional experience'}
        self.hobbies_keywords = {'hobbies', 'interests', 'activities', 'extracurricular'}

    def extract_text_from_pdf(self, pdf_file):
        """Extract text content from PDF file"""
        try:
            reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
            return ""

    def find_section_content(self, text, keywords, end_keywords=None):
        """Find content of a specific section based on keywords"""
        text_lower = text.lower()
        section_start = float('inf')
        
        # Find the earliest occurrence of any keyword
        for keyword in keywords:
            pos = text_lower.find(keyword)
            if pos != -1 and pos < section_start:
                section_start = pos

        if section_start == float('inf'):
            return ""

        # Find the end of the section
        section_end = len(text)
        if end_keywords:
            for keyword in end_keywords:
                pos = text_lower.find(keyword, section_start + 1)
                if pos != -1 and pos < section_end:
                    section_end = pos

        section_text = text[section_start:section_end].strip()
        return section_text

    def clean_text(self, text):
        """Clean and normalize text"""
        # Remove special characters and extra whitespace
        text = re.sub(r'[^\w\s]', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def extract_education(self, text):
        """Extract education information"""
        education_section = self.find_section_content(text, self.education_keywords)
        if education_section:
            # Extract the highest education level
            education_levels = {
                'phd': 'phd',
                'master': 'master',
                'bachelor': 'bachelor',
                'high school': 'highschool'
            }
            
            text_lower = education_section.lower()
            for level, value in education_levels.items():
                if level in text_lower:
                    return value
        return "Not specified"

    def extract_skills(self, text):
        """Extract skills"""
        skills_section = self.find_section_content(text, self.skills_keywords)
        if skills_section:
            # Tokenize and extract potential skills
            words = word_tokenize(skills_section)
            # Remove stop words and common words
            skills = [word for word in words if word.lower() not in self.stop_words and len(word) > 2]
            return list(set(skills))  # Remove duplicates
        return []

    def extract_experience(self, text):
        """Extract work experience"""
        experience_section = self.find_section_content(text, self.experience_keywords)
        if experience_section:
            # Clean and return the experience section
            return self.clean_text(experience_section)
        return "No experience listed"

    def extract_hobbies(self, text):
        """Extract hobbies and interests"""
        hobbies_section = self.find_section_content(text, self.hobbies_keywords)
        if hobbies_section:
            # Clean and return the hobbies section
            return self.clean_text(hobbies_section)
        return "Not specified"

    def parse_resume(self, pdf_file):
        """Main method to parse resume"""
        try:
            # Extract text from PDF
            text = self.extract_text_from_pdf(pdf_file)
            if not text:
                return None

            # Parse different sections
            parsed_data = {
                'education': self.extract_education(text),
                'skills': self.extract_skills(text),
                'hobbies': self.extract_hobbies(text),
                'experience': self.extract_experience(text)
            }

            return parsed_data

        except Exception as e:
            print(f"Error parsing resume: {e}")
            return None
