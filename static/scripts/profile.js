document.addEventListener("DOMContentLoaded", () => {
    const steps = document.querySelectorAll(".form-step");
    const nextBtns = document.querySelectorAll(".next-btn");
    const prevBtns = document.querySelectorAll(".prev-btn");
    const submitBtn = document.querySelector(".submit-btn");
    let currentStep = 0;

    const ageInput = document.getElementById("age");

    const educationInput = document.getElementById("education");
    const syllabusDiv = document.getElementById("highschool-syllabus");
    const bachelorSpecializationDiv = document.getElementById("bachelors-specialization");
    const bachelorCourseDiv = document.getElementById("bachelors-course");
    const masterSpecializationDiv = document.getElementById("masters-specialization");
    const masterCourseDiv = document.getElementById("masters-course");
    const phdSpecializationDiv = document.getElementById("phd-specialization");

    // Dynamic course data for bachelor and master levels
    const bachelorCourses = {
        "be": ["CSE", "ECE", "Mechanical", "Civil"],
        "bsc": ["Physics", "Chemistry", "Biology", "Mathematics"],
        "bcom": ["Accounting", "Finance", "Marketing"],
        "bca": ["Software Development", "Data Science", "AI"]
    };

    const masterCourses = {
        "me": ["Thermodynamics", "Automobile", "Aerospace"],
        "mtech": ["Machine Learning", "Cyber Security", "Data Analytics"],
        "mcom": ["Taxation", "Financial Markets", "Audit"],
        "mca": ["Cloud Computing", "Web Development", "Mobile Applications"]
    };

    const bachelorSpecializationSelect = document.getElementById("bachelorSpecialization");
    const bachelorCourseSelect = document.getElementById("bachelorCourse");
    const masterSpecializationSelect = document.getElementById("masterSpecialization");
    const masterCourseSelect = document.getElementById("masterCourse");

    function updateCourseOptions(specializationSelect, courseSelect, courses) {
        const specialization = specializationSelect.value;
        const courseOptions = courses[specialization] || [];

        // Reset course select options
        courseSelect.innerHTML = '<option value="" selected disabled>Select course</option>';

        courseOptions.forEach(course => {
            const option = document.createElement("option");
            option.value = course.toLowerCase();
            option.textContent = course;
            courseSelect.appendChild(option);
        });

        // Add "Other" option at the end
        const otherOption = document.createElement("option");
        otherOption.value = "other";
        otherOption.textContent = "Other";
        courseSelect.appendChild(otherOption);
    }

    // Handle changes in the specialization selection for Bachelor's and Master's
    bachelorSpecializationSelect.addEventListener("change", () => {
        updateCourseOptions(bachelorSpecializationSelect, bachelorCourseSelect, bachelorCourses);
        if (bachelorSpecializationSelect.value === "other") {
            document.getElementById("bachelor-specialization-other").style.display = "block";
        }
    });

    masterSpecializationSelect.addEventListener("change", () => {
        updateCourseOptions(masterSpecializationSelect, masterCourseSelect, masterCourses);
        if (masterSpecializationSelect.value === "other") {
            document.getElementById("master-specialization-other").style.display = "block";
        }
    });

    // Update display of age/personality values as they are adjusted
    ageInput.addEventListener("input", () => {
        document.getElementById("age-value").textContent = ageInput.value;
    });

    // Show the current step in the form
    function showStep(step) {
        steps.forEach((s, index) => {
            s.classList.toggle("active", index === step);
        });
        prevBtns.forEach(btn => btn.style.display = step === 0 ? "none" : "inline");

        // Modify next button text based on user status and current step
        const status = document.querySelector('input[name="status"]:checked')?.value;
        if (status === "student" && step === 1) {
            // For students, change next button to "Finish" on education step
            nextBtns.forEach(btn => btn.textContent = "Finish");
        } else {
            nextBtns.forEach(btn => btn.textContent = step === steps.length - 1 ? "Finish" : "Next");
        }
    }

    // Event listeners for the next buttons
    nextBtns.forEach((btn, index) => {
        btn.addEventListener("click", () => {
            const status = document.querySelector('input[name="status"]:checked');

            if (currentStep === 0) {
                currentStep = 1;
            } else if (currentStep === 1) {
                if (status && status.value === "student") {
                    // For students, submit the form directly from the education step
                    submitBtn.click();
                    return;
                } else if (status && status.value === "professional") {
                    currentStep = 2; // Move to Step 2 (Resume Upload)
                }
            } else if (currentStep === 2 && status && status.value === "professional") {
                currentStep = 3; // Move to Step 3 (Extracted Information)
            }
            showStep(currentStep);
        });
    });

    // Event listeners for the previous buttons
    prevBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const status = document.querySelector('input[name="status"]:checked');

            if (currentStep === 0) return; // Already on Step 1
            else if (currentStep === 1) currentStep = 0; // Go back to Step 1
            else if (currentStep === 2) {
                currentStep = (status && status.value === "professional") ? 1 : 0;
            } else if (currentStep === 3) {
                currentStep = 2; // Go back to Step 2 (Resume Upload)
            }
            showStep(currentStep);
        });
    });

    // Show/hide fields based on education selection
    educationInput.addEventListener("change", () => {
        const educationLevel = educationInput.value;

        syllabusDiv.style.display = "none";
        bachelorSpecializationDiv.style.display = "none";
        bachelorCourseDiv.style.display = "none";
        masterSpecializationDiv.style.display = "none";
        masterCourseDiv.style.display = "none";
        phdSpecializationDiv.style.display = "none";

        if (educationLevel === "highschool") {
            syllabusDiv.style.display = "block";
        } else if (educationLevel === "bachelor") {
            bachelorSpecializationDiv.style.display = "block";
            bachelorCourseDiv.style.display = "block";
        } else if (educationLevel === "master") {
            masterSpecializationDiv.style.display = "block";
            masterCourseDiv.style.display = "block";
        } else if (educationLevel === "phd") {
            phdSpecializationDiv.style.display = "block";
        }
    });

    // Function to handle showing 'Other' input for dropdowns
    function handleOtherOption(dropdown, otherInput) {
        dropdown.addEventListener("change", () => {
            otherInput.style.display = dropdown.value === "other" ? "block" : "none";
        });
    }

    // Apply handleOtherOption to relevant fields
    handleOtherOption(document.getElementById("syllabus"), document.getElementById("syllabus-other"));
    handleOtherOption(bachelorCourseSelect, document.getElementById("bachelor-course-other"));
    handleOtherOption(masterCourseSelect, document.getElementById("master-course-other"));
    handleOtherOption(bachelorSpecializationSelect, document.getElementById("bachelor-specialization-other"));
    handleOtherOption(masterSpecializationSelect, document.getElementById("master-specialization-other"));
    handleOtherOption(document.getElementById("phdSpecialization"), document.getElementById("phd-specialization-other"));

    // Form submission including additional fields
    submitBtn.addEventListener("click", (e) => {
        e.preventDefault();
    
        const status = document.querySelector('input[name="status"]:checked')?.value;
        
        // Get education details based on extracted resume data for professionals
        let formData = {
            current_status: status,
            age: +document.getElementById("age").value,
            highest_level_of_education: "",
            hobbies: "",
            key_skills: [],
            work_experience: "",
            education_details: {},
            linkedin_link: "",
            github_link: ""
        };
    
        if (status === "professional") {
            // For professionals, get data from preview fields
            formData.highest_level_of_education = document.getElementById("preview-education").value;
            formData.hobbies = document.getElementById("preview-hobbies").value;
            formData.key_skills = document.getElementById("preview-skills").value.split(',').map(skill => skill.trim()).filter(skill => skill);
            formData.work_experience = document.getElementById("preview-experience").value;
            formData.linkedin_link = document.getElementById("preview-linkedin").value;
            formData.github_link = document.getElementById("preview-github").value;
        } else {
            // For students, get data from form fields
            formData.highest_level_of_education = document.getElementById("education").value;
            formData.hobbies = document.getElementById("hobbies").value;
            formData.key_skills = document.getElementById("skills").value.split(',').map(skill => skill.trim()).filter(skill => skill);
            
            // Get education details based on education level
            const educationLevel = document.getElementById("education").value;
            if (educationLevel === "highschool") {
                const syllabus = document.getElementById("syllabus").value;
                formData.education_details.syllabus = syllabus === "other" ? 
                    document.getElementById("syllabus-other").value : syllabus;
            } else if (educationLevel === "bachelor") {
                const specialization = document.getElementById("bachelorSpecialization").value;
                const course = document.getElementById("bachelorCourse").value;
                formData.education_details.specialization = specialization === "other" ? 
                    document.getElementById("bachelor-specialization-other").value : specialization;
                formData.education_details.course = course === "other" ? 
                    document.getElementById("bachelor-course-other").value : course;
            } else if (educationLevel === "master") {
                const specialization = document.getElementById("masterSpecialization").value;
                const course = document.getElementById("masterCourse").value;
                formData.education_details.specialization = specialization === "other" ? 
                    document.getElementById("master-specialization-other").value : specialization;
                formData.education_details.course = course === "other" ? 
                    document.getElementById("master-course-other").value : course;
            } else if (educationLevel === "phd") {
                const specialization = document.getElementById("phdSpecialization").value;
                formData.education_details.specialization = specialization === "other" ? 
                    document.getElementById("phd-specialization-other").value : specialization;
            }
        }
    
        // Send the form data to the server
        fetch("/api/save_user_data", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                window.location.href = "/aptitude";
            } else {
                console.error('Error:', data.message);
            }
        })
        .catch(error => console.error('Error:', error));
    });   

    // Add handlers for professional vs student forms
    const professionalForm = document.getElementById("professional-form");
    const studentForm = document.getElementById("student-form");
    const resumeInput = document.getElementById("resume");
    const previewContainer = document.querySelector(".preview-container");

    // Show/hide appropriate form based on status selection
    document.querySelectorAll('input[name="status"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === "professional") {
                professionalForm.style.display = "block";
                studentForm.style.display = "none";
            } else {
                professionalForm.style.display = "none";
                studentForm.style.display = "block";
            }
        });
    });

    // Handle resume upload
    resumeInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('resume', file);

            try {
                const response = await fetch('/api/parse-resume', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();
                if (data.success) {
                    // Show preview container and populate fields
                    previewContainer.style.display = "block";
                    document.getElementById("preview-education").value = data.education;
                    document.getElementById("preview-hobbies").value = data.hobbies;
                    document.getElementById("preview-skills").value = data.skills;
                    document.getElementById("preview-experience").value = data.experience;
                    document.getElementById("preview-linkedin").value = data.linkedin;
                    document.getElementById("preview-github").value = data.github;
                }
            } catch (error) {
                console.error('Error parsing resume:', error);
            }
        }
    });

    // File Upload Handling
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('resume');
    const fileDetails = document.querySelector('.file-details');
    const fileName = document.querySelector('.file-name');
    const removeButton = document.querySelector('.remove-file');

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Highlight drop zone when dragging over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        dropZone.classList.add('dragover');
    }

    function unhighlight(e) {
        dropZone.classList.remove('dragover');
    }

    // Handle dropped files
    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            if (file.type === 'application/pdf') {
                fileInput.files = files;
                showFileDetails(file);
            } else {
                alert('Please upload a PDF file');
            }
        }
    }

    // Handle manual file selection
    fileInput.addEventListener('change', function(e) {
        if (this.files.length > 0) {
            showFileDetails(this.files[0]);
        }
    });

    function showFileDetails(file) {
        const dropZone = document.querySelector('.file-upload-area');
        const selectedFile = document.querySelector('.selected-file');
        const fileName = document.querySelector('.file-name');
        
        fileName.textContent = file.name;
        selectedFile.style.display = 'block';
        dropZone.style.display = 'none'; // Hide the drop zone
    }

    // Handle file removal
    document.querySelector('.remove-file').addEventListener('click', function() {
        const fileInput = document.getElementById('resume');
        const selectedFile = document.querySelector('.selected-file');
        const dropZone = document.querySelector('.file-upload-area');
        
        fileInput.value = '';
        selectedFile.style.display = 'none';
        dropZone.style.display = 'flex'; // Show the drop zone again
        
        // Reset the preview container if it exists
        const previewContainer = document.querySelector('.preview-container');
        if (previewContainer) {
            const previewFields = previewContainer.querySelectorAll('.preview-field');
            previewFields.forEach(field => field.value = '');
            previewContainer.style.display = 'none';
        }
    });
    
    // Initialize the form to show the first step
    showStep(currentStep);
});