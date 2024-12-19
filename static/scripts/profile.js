document.addEventListener("DOMContentLoaded", () => {
    const steps = document.querySelectorAll(".form-step");
    const nextBtns = document.querySelectorAll("#next-btn");
    const prevBtns = document.querySelectorAll("#prev-btn");
    const submitBtn = document.getElementById("submit-btn");
    let currentStep = 0;

    const ageInput = document.getElementById("age");
    const educationInput = document.getElementById("education");
    const syllabusDiv = document.getElementById("highschool-syllabus");
    const bachelorSpecializationDiv = document.getElementById("bachelors-specialization");
    const bachelorCourseDiv = document.getElementById("bachelors-course");
    const masterSpecializationDiv = document.getElementById("masters-specialization");
    const masterCourseDiv = document.getElementById("masters-course");
    const phdSpecializationDiv = document.getElementById("phd-specialization");
    const workExperience = document.getElementById("workExperience");

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
        } else {
            document.getElementById("bachelor-specialization-other").style.display = "none";
        }
    });

    masterSpecializationSelect.addEventListener("change", () => {
        updateCourseOptions(masterSpecializationSelect, masterCourseSelect, masterCourses);
        if (masterSpecializationSelect.value === "other") {
            document.getElementById("master-specialization-other").style.display = "block";
        } else {
            document.getElementById("master-specialization-other").style.display = "none";
        }
    });

    // Update display of age value as it is adjusted
    ageInput.addEventListener("input", () => {
        document.getElementById("age-value").textContent = ageInput.value;
    });

    // Show the current step in the form
    function showStep(step) {
        steps.forEach((s, index) => {
            s.classList.toggle("active", index === step);
        });
        prevBtns.forEach(btn => btn.style.display = step === 0 ? "none" : "inline");
        
        // Modify the buttons based on user type and current step
        nextBtns.forEach(btn => {
            const status = document.querySelector('input[name="status"]:checked')?.value;
            if (status === "student" && step === 1) {
                btn.textContent = "Finish";  // For students, finish after education
            } else if (status === "professional" && step === 2) {
                btn.textContent = "Finish";  // For professionals, finish after work experience
            } else {
                btn.textContent = "Next";
            }
        });
    }

    // Event listeners for the next buttons
    nextBtns.forEach((btn, index) => {
        btn.addEventListener("click", () => {
            const status = document.querySelector('input[name="status"]:checked')?.value;
            
            if (currentStep === 0) {
                currentStep = 1;  // Move to education step
            } else if (currentStep === 1) {
                if (status === "student") {
                    // For students, submit form after education
                    submitForm();
                    return;
                } else {
                    currentStep = 2;  // Move to work experience for professionals
                }
            } else if (currentStep === 2 && status === "professional") {
                // For professionals, submit form after work experience
                submitForm();
                return;
            }
            showStep(currentStep);
        });
    });

    // Event listeners for the previous buttons
    prevBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            if (currentStep === 0) return;
            else if (currentStep === 1) currentStep = 0;
            else if (currentStep === 2) currentStep = 1;
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
    handleOtherOption(document.getElementById("phdSpecialization"), document.getElementById("phd-specialization-other"));

    function submitForm() {
        const status = document.querySelector('input[name="status"]:checked')?.value;

        // Basic validation
        if (!status) {
            alert("Please select your current status.");
            return;
        }
        if (!educationInput.value) {
            alert("Please select your education level.");
            return;
        }
        if (!document.getElementById("fieldOfStudy").value) {
            alert("Please enter your field of study/work.");
            return;
        }
        if (!document.getElementById("skills").value) {
            alert("Please enter your key skills.");
            return;
        }
        // Validate work experience if status is professional
        if (status === "professional" && !document.getElementById("workExperience").value) {
            alert("Please provide your work experience.");
            return;
        }

        const formData = {
            current_status: status,
            age: parseInt(document.getElementById("age").value, 10),
            highest_level_of_education: educationInput.value,
            current_field_of_study_or_work: document.getElementById("fieldOfStudy").value,
            key_skills: document.getElementById("skills").value.split(',').map(skill => skill.trim()),
            work_experience: status === "professional" ? document.getElementById("workExperience").value : "N/A",
        };

        // Add conditional education details to formData
        if (educationInput.value === "highschool") {
            formData.education_details = {
                syllabus: document.getElementById("syllabus").value === "other" ? 
                    document.getElementById("syllabus-other").value : 
                    document.getElementById("syllabus").value
            };
        } else if (educationInput.value === "bachelor") {
            formData.education_details = {
                specialization: document.getElementById("bachelorSpecialization").value === "other" ? 
                    document.getElementById("bachelor-specialization-other").value : 
                    document.getElementById("bachelorSpecialization").value,
                course: bachelorCourseSelect.value === "other" ? 
                    document.getElementById("bachelor-course-other").value : 
                    bachelorCourseSelect.value
            };
        } else if (educationInput.value === "master") {
            formData.education_details = {
                specialization: document.getElementById("masterSpecialization").value === "other" ? 
                    document.getElementById("master-specialization-other").value : 
                    document.getElementById("masterSpecialization").value,
                course: masterCourseSelect.value === "other" ? 
                    document.getElementById("master-course-other").value : 
                    masterCourseSelect.value
            };
        } else if (educationInput.value === "phd") {
            formData.education_details = {
                specialization: document.getElementById("phdSpecialization").value === "other" ? 
                    document.getElementById("phd-specialization-other").value : 
                    document.getElementById("phdSpecialization").value
            };
        }

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
                alert(data.message || 'Error saving data');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error saving data. Please try again.');
        });
    }

    // Initialize the form
    showStep(currentStep);
});