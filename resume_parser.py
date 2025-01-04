import PyPDF2
import re

class ResumeParser:
    def __init__(self):
        
        # Define section keywords
        self.section_keywords = {
            'education': ['education', 'academic background', 'qualification', 'degree', 'academic details'],
            'skills': ['skills', 'technical skills', 'technologies', 'core competencies', 'expertise'],
            'experience': ['experience', 'work history', 'employment', 'job history', 'professional background'],
            'hobbies': ['hobbies', 'interests'],
            'objective': ['career objective', 'professional summary', 'profile summary', 'summary', 'objective'],
            'extracurricular': ['extra curricular', 'extracurricular activities', 'co-curricular', 'achievements'],
            'training': ['trainings/courses', 'courses', 'certifications', 'workshops', 'professional development'],
            'projects': ['projects', 'academics/personal projects', 'personal projects', 'major projects', 'mini projects'],
            'portfolio': ['portfolio/work samples', 'samples', 'publications', 'research papers'],
            'accomplishments': ['accomplishments/additional details', 'awards', 'honors', 'recognition', 'additional details']
        }

        # Link patterns for LinkedIn and GitHub
        self.link_patterns = {
            'linkedin': r'linkedin\.com/in/[\w-]+',
            'github': r'github\.com/[\w-]+'
        }

    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text from a PDF file."""
        try:
            reader = PyPDF2.PdfReader(pdf_path)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
            return ""

    def find_category(self, line: str) -> str:
        """Determine which section a line belongs to based on keywords."""
        line_lower = line.lower().strip()
        for category, keywords in self.section_keywords.items():
            if any(keyword in line_lower for keyword in keywords):
                return category
        return ""

    def extract_links(self, text: str) -> dict:
        """Extract LinkedIn and GitHub links from text."""
        links = {}
        for platform, pattern in self.link_patterns.items():
            match = re.search(pattern, text)
            links[platform] = match.group(0) if match else ""
        return links

    def parse_resume(self, txt_path: str):
        """Main method to parse resume using keyword-based approach"""
        try:
            # Read the file
            text = self.extract_text_from_pdf(txt_path)
            if not text:
                return None

            # Initialize parsed data structure with default empty values
            parsed_data = {
                'education': [],
                'skills': [],
                'experience': [],
                'hobbies': [],
                'objective': [],
                'extracurricular': [],
                'training': [],
                'projects': [],
                'portfolio': [],
                'accomplishments': [],
                'links': self.extract_links(text)
            }

            # Split into lines and process
            lines = text.splitlines()
            current_category = None
            current_content = []
            
            for line in lines:
                line = line.strip()
                if not line:  # Skip empty lines
                    continue
                
                # Check if this line starts a new category
                category = self.find_category(line)
                
                if category:
                    # Save previous category's content if exists
                    if current_category and current_content:
                        parsed_data[current_category].extend(current_content)
                        current_content = []
                    current_category = category
                    
                elif current_category and line:
                    current_content.append(line)

            # Add the last category's content
            if current_category and current_content:
                parsed_data[current_category].extend(current_content)

            # Clean up and format the parsed data
            formatted_data = self.clean_parsed_data(parsed_data)
            
            # Return only the required fields, with empty default values if sections don't exist
            return {
                'education': formatted_data['education'] if formatted_data['education'] else [],
                'skills': formatted_data['skills'] if formatted_data['skills'] else [],
                'hobbies': formatted_data['hobbies'] if formatted_data['hobbies'] else '',
                'experience': formatted_data['experience'] if formatted_data['experience'] else '',
                'linkedin': 'https://'+formatted_data['links'].get('linkedin', ''),
                'github': 'https://'+formatted_data['links'].get('github', '')
            }

        except Exception as e:
            print(f"Error parsing resume: {e}")
            return None

    def clean_parsed_data(self, parsed_data: dict) -> dict:
        """Clean and format parsed data according to application requirements."""
        cleaned_data = {
            'education': [],
            'skills': [],
            'hobbies': '',
            'experience': '',
            'links': parsed_data['links']
        }

        # Clean education section - join related lines
        education_entries = []
        current_entry = []
        for line in parsed_data['education']:
            if any(keyword in line.lower() for keyword in ['bachelor', 'master', 'phd', 'degree']):
                if current_entry:
                    education_entries.append(' - '.join(current_entry))
                current_entry = [line]
            else:
                current_entry.append(line)
        if current_entry:
            education_entries.append(' - '.join(current_entry))
        cleaned_data['education'] = education_entries

        # Extract skills based on categories
        all_skills = []
        current_category = None
        skills_buffer = []

        for skill_line in parsed_data['skills']:
            skill_line = skill_line.strip()
            if ':' in skill_line:
                # If we have buffered skills, add them to the current category
                if current_category and skills_buffer:
                    skills_to_add = [s.strip() for s in skills_buffer if s.strip()]
                    all_skills.extend(skills_to_add)
                
                # Start new category
                current_category = skill_line.split(':')[0].strip()
                skills_after_colon = skill_line.split(':')[1].strip()
                if skills_after_colon:
                    skills_buffer = [s.strip() for s in skills_after_colon.split(',')]
                else:
                    skills_buffer = []
            else:
                # Add to current buffer if not empty line
                if skill_line:
                    skills_buffer.extend([s.strip() for s in skill_line.split(',')])

        # Add any remaining buffered skills
        if skills_buffer:
            all_skills.extend([s.strip() for s in skills_buffer if s.strip()])

        # Remove duplicates and empty strings
        cleaned_data['skills'] = list(filter(None, set(all_skills)))

        # Clean hobbies section - join into comma-separated string
        cleaned_data['hobbies'] = ', '.join(filter(None, parsed_data['hobbies']))

        # Clean experience section - format as a readable string
        experience_lines = []
        for exp in parsed_data['experience']:
            experience_lines.append(exp)
        cleaned_data['experience'] = '\n'.join(experience_lines)
        print(cleaned_data)
        return cleaned_data
