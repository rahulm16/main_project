document.addEventListener("DOMContentLoaded", () => {
    const steps = document.querySelectorAll(".form-step");
    const nextBtns = document.querySelectorAll("#next-btn");
    const prevBtns = document.querySelectorAll("#prev-btn");
    const submitBtn = document.getElementById("submit-btn");
    let currentStep = 0;

    const ageInput = document.getElementById("age");
    const extroversionInput = document.getElementById("extroversion");
    const opennessInput = document.getElementById("openness");
    const meticulousnessInput = document.getElementById("meticulousness");

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

    extroversionInput.addEventListener("input", () => {
        document.getElementById("extroversion-value").textContent = extroversionInput.value;
    });

    opennessInput.addEventListener("input", () => {
        document.getElementById("openness-value").textContent = opennessInput.value;
    });

    meticulousnessInput.addEventListener("input", () => {
        document.getElementById("meticulousness-value").textContent = meticulousnessInput.value;
    });

    // Show the current step in the form
    function showStep(step) {
        steps.forEach((s, index) => {
            s.classList.toggle("active", index === step);
        });
        prevBtns.forEach(btn => btn.style.display = step === 0 ? "none" : "inline");
        nextBtns.forEach(btn => btn.textContent = step === steps.length - 1 ? "Finish" : "Next");
    }

    // Event listeners for the next buttons
    nextBtns.forEach((btn, index) => {
        btn.addEventListener("click", () => {
            if (currentStep === 0) {
                currentStep = 1;
            } else if (currentStep === 1) {
                const status = document.querySelector('input[name="status"]:checked');
                if (status && status.value === "professional") {
                    currentStep = 2; // Move to Step 3 (Work Experience)
                } else {
                    currentStep = 3; // Skip to Step 4
                }
            } else if (currentStep === 2) {
                currentStep = 3; // Move to Step 4
            }
            showStep(currentStep);
        });
    });

    // Event listeners for the previous buttons
    prevBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            if (currentStep === 0) return; // Already on Step 1
            else if (currentStep === 1) currentStep = 0; // Go back to Step 1
            else if (currentStep === 2) currentStep = 1; // Go back to Step 2
            else if (currentStep === 3) {
                const status = document.querySelector('input[name="status"]:checked');
                currentStep = (status && status.value === "professional") ? 2 : 1;
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
            personality_traits: {
                extroversion: parseInt(document.getElementById("extroversion").value, 10),
                openness_to_work: parseInt(document.getElementById("openness").value, 10),
                meticulousness: parseInt(document.getElementById("meticulousness").value, 10),
            },
            education_details: {}
        };

        // Add conditional education details to formData
        if (educationInput.value === "highschool") {
            formData.education_details.syllabus = document.getElementById("syllabus").value === "other" ? document.getElementById("syllabus-other").value : document.getElementById("syllabus").value;
        } else if (educationInput.value === "bachelor") {
            formData.education_details.specialization = document.getElementById("bachelorSpecialization").value === "other" ? document.getElementById("bachelor-specialization-other").value : document.getElementById("bachelorSpecialization").value;
            formData.education_details.course = bachelorCourseSelect.value === "other" ? document.getElementById("bachelor-course-other").value : bachelorCourseSelect.value;
        } else if (educationInput.value === "master") {
            formData.education_details.specialization = document.getElementById("masterSpecialization").value === "other" ? document.getElementById("master-specialization-other").value : document.getElementById("masterSpecialization").value;
            formData.education_details.course = masterCourseSelect.value === "other" ? document.getElementById("master-course-other").value : masterCourseSelect.value;
        } else if (educationInput.value === "phd") {
            formData.education_details.specialization = document.getElementById("phdSpecialization").value === "other" ? document.getElementById("phd-specialization-other").value : document.getElementById("phdSpecialization").value;
        }

        console.log(formData);

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
            }
        })
        .catch(error => console.error('Error:', error));
    });

    // Initialize the form to show the first step
    showStep(currentStep);
});
