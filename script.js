document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('careerForm');
  const steps = Array.from(form.getElementsByClassName('step'));
  const nextBtn = document.getElementById('nextBtn');
  const prevBtn = document.getElementById('prevBtn');
  let currentStep = 0;

  function showStep(stepIndex) {
      steps.forEach((step, index) => {
          step.classList.toggle('active', index === stepIndex);
      });
      prevBtn.style.display = stepIndex === 0 ? 'none' : 'inline-block';
      
      if (stepIndex === steps.length - 1) {
          nextBtn.textContent = 'Finish';
      } else {
          nextBtn.textContent = 'Next';
      }
  }

  function validateStep(stepIndex) {
      const currentStepElement = steps[stepIndex];
      const inputs = currentStepElement.querySelectorAll('input, select, textarea');
      let isValid = true;

      inputs.forEach(input => {
          if (input.hasAttribute('required') && !input.value.trim()) {
              isValid = false;
              input.classList.add('error');
          } else {
              input.classList.remove('error');
          }
      });

      return isValid;
  }

  function nextStep() {
      if (validateStep(currentStep)) {
          if (currentStep < steps.length - 1) {
              currentStep++;
              showStep(currentStep);
          } else {
              showSummary();
          }
      }
  }

  function prevStep() {
      if (currentStep > 0) {
          currentStep--;
          showStep(currentStep);
      }
  }

  function showSummary() {
      const summaryContent = document.getElementById('summaryContent');
      const formData = new FormData(form);
      let summaryHTML = '';

      for (let [key, value] of formData.entries()) {
          if (key === 'status' && value === 'student') {
              formData.delete('workExperience');
          }
          if (key !== 'workExperience' || (key === 'workExperience' && value.trim() !== '')) {
              summaryHTML += `<p><strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${value}</p>`;
          }
      }

      summaryContent.innerHTML = summaryHTML;
      console.log('Form data:', Object.fromEntries(formData));
  }

  nextBtn.addEventListener('click', nextStep);
  prevBtn.addEventListener('click', prevStep);

  // Age slider
  const ageSlider = document.getElementById('age');
  const ageValue = document.getElementById('ageValue');
  ageSlider.addEventListener('input', function() {
      ageValue.textContent = this.value;
  });

  // Show initial step
  showStep(currentStep);
});