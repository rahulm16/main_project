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

    // Function to show the current step
    function showStep(step) {
        steps.forEach((s, index) => {
            s.classList.toggle("active", index === step);
        });
        prevBtns.forEach(btn => btn.style.display = step === 0 ? "none" : "inline");
        nextBtns.forEach(btn => btn.textContent = step === steps.length - 1 ? "Finish" : "Next");
    }

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

    prevBtns.forEach((btn, index) => {
        btn.addEventListener("click", () => {
            if (currentStep === 0) {
                // Do nothing, already on Step 1
                return;
            } else if (currentStep === 1) {
                currentStep = 0; // Go back to Step 1
            } else if (currentStep === 2) {
                currentStep = 1; // Go back to Step 2
            } else if (currentStep === 3) {
                // If coming from Step 4, check status and go back accordingly
                const status = document.querySelector('input[name="status"]:checked');
                if (status && status.value === "professional") {
                    currentStep = 2; // Go back to Step 3
                } else {
                    currentStep = 1; // Go back to Step 2 directly
                }
            }
            showStep(currentStep);
        });
    });

    submitBtn.addEventListener("click", () => {
        const formData = {
            status: document.querySelector('input[name="status"]:checked')?.value,
            age: document.getElementById("age").value,
            education: document.getElementById("education").value,
            fieldOfStudy: document.getElementById("fieldOfStudy").value,
            skills: document.getElementById("skills").value,
            workExperience: currentStep === 2 ? document.getElementById("workExperience").value : "N/A",
            extroversion: document.getElementById("extroversion").value,
            openness: document.getElementById("openness").value,
            meticulousness: document.getElementById("meticulousness").value,
        };
        
        // Send the data to the server
        fetch("/api/save_user_data", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Data saved:', data);
            alert(data.message);
        })
        .catch(error => console.error('Error:', error));
    });

    // Initialize the first step
    showStep(currentStep);
});
