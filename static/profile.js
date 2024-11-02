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
            if (index === 0) {
                currentStep = 1; // Move to Step 2
            } else if (index === 1) {
                const status = document.querySelector('input[name="status"]:checked');
                if (status && status.value === "professional") {
                    currentStep = 2; // Move to Step 3
                } else {
                    currentStep = 3; // Skip to Step 4
                }
            } else if (index === 2) {
                currentStep = 3; // Move to Step 4
            }
            showStep(currentStep);
        });
    });

    // Event listeners for the previous buttons
    prevBtns.forEach((btn, index) => {
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

    submitBtn.addEventListener("click", (e) => {
        e.preventDefault(); // Prevent default form submission
        const formData = {
            current_status: document.querySelector('input[name="status"]:checked')?.value,
            age: parseInt(document.getElementById("age").value, 10),
            highest_level_of_education: document.getElementById("education").value,
            current_field_of_study_or_work: document.getElementById("fieldOfStudy").value,
            key_skills: document.getElementById("skills").value.split(',').map(skill => skill.trim()),
            work_experience: currentStep === 2 ? document.getElementById("workExperience").value : "N/A",
            personality_traits: {
                extroversion: parseInt(document.getElementById("extroversion").value, 10),
                openness_to_work: parseInt(document.getElementById("openness").value, 10),
                meticulousness: parseInt(document.getElementById("meticulousness").value, 10),
            }
        };
    
        fetch("/api/save_user_data", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if(data.status === 'success') {
                window.location.href = "/chatbot";  // Redirect immediately after successful save
            }
        })
        .catch(error => console.error('Error:', error));
    });

    // Initialize the first step
    showStep(currentStep);
});