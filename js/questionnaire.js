
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('carfectiveForm');
    const steps = document.querySelectorAll('.form-step');
    const nextBtns = document.querySelectorAll('.next-btn');
    const prevBtns = document.querySelectorAll('.prev-btn');
    const progressBar = document.getElementById('progressBar');
    let currentStep = 0;

    // --- Navigation Logic ---

    const updateProgress = () => {
        const percent = ((currentStep + 1) / steps.length) * 100;
        progressBar.style.width = percent + '%';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                steps[currentStep].classList.remove('active');
                currentStep++;
                steps[currentStep].classList.add('active');
                updateProgress();
            }
        });
    });

    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            steps[currentStep].classList.remove('active');
            currentStep--;
            steps[currentStep].classList.add('active');
            updateProgress();
        });
    });

    const validateStep = (stepIdx) => {
        const currentStepEl = steps[stepIdx];
        const requiredInputs = currentStepEl.querySelectorAll('[required]');
        let valid = true;

        requiredInputs.forEach(input => {
            // Skip validation if the element is hidden (e.g. conditional fields)
            if (input.offsetParent === null) return;

            if (input.type === 'radio') {
                const name = input.name;
                const checked = currentStepEl.querySelector(`input[name="${name}"]:checked`);
                if (!checked) {
                    valid = false;
                    input.closest('.form-group').classList.add('error');
                } else {
                    input.closest('.form-group').classList.remove('error');
                }
            } else if (!input.value.trim()) {
                valid = false;
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });

        // Special File Validation (Step 1 - Backup check on next)
        const fileInput = currentStepEl.querySelector('#build_sheet_pdf');
        if (fileInput && fileInput.files.length > 0) {
            const size = fileInput.files[0].size / 1024 / 1024; // MB
            if (size > 10) {
                alert('The PDF file is too large. Please upload a file under 10MB.');
                valid = false;
            }
        }

        if (!valid) {
            alert('Please complete all required fields correctly before proceeding.');
        }
        return valid;
    };

    // --- File Upload UI Update & Validation ---
    const fileInputs = document.querySelectorAll('.file-upload-wrapper input[type="file"]');
    
    fileInputs.forEach(fileInput => {
        fileInput.addEventListener('change', (e) => {
            const wrapper = fileInput.closest('.file-upload-wrapper');
            const fileLabel = wrapper.querySelector('.file-label');
            
            if (fileInput.files.length > 0) {
                if (fileInput.files.length > 1) {
                    fileLabel.innerText = `${fileInput.files.length} files selected`;
                    fileLabel.style.color = 'var(--text-accent)';
                } else {
                    const file = fileInput.files[0];
                    const size = file.size / 1024 / 1024; // MB
                    
                    if (size > 10) {
                        alert('The file is too large. Please upload a file under 10MB.');
                        fileInput.value = ''; // Clear the input
                        fileLabel.innerText = 'Click to upload or drag file here';
                        fileLabel.style.color = 'var(--text-secondary)';
                    } else {
                        fileLabel.innerText = file.name;
                        fileLabel.style.color = 'var(--text-accent)'; // Highlight success
                    }
                }
            } else {
                fileLabel.innerText = 'Click to upload or drag file here';
                fileLabel.style.color = 'var(--text-secondary)';
            }
        });
    });

    // --- Drag and Drop Ranking ---
    const priorityList = document.getElementById('priorityList');
    let dragSrcEl = null;

    function handleDragStart(e) {
        this.classList.add('dragging');
        dragSrcEl = this;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.innerHTML);
    }

    function handleDragOver(e) {
        if (e.preventDefault) { e.preventDefault(); }
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    function handleDrop(e) {
        if (e.stopPropagation) { e.stopPropagation(); }
        if (dragSrcEl !== this) {
            // Swap ID tracking
            const targetID = this.dataset.id;
            this.dataset.id = dragSrcEl.dataset.id;
            dragSrcEl.dataset.id = targetID;

            // Swap Content
            const targetContent = this.innerHTML;
            this.innerHTML = dragSrcEl.innerHTML;
            dragSrcEl.innerHTML = targetContent;

            updateRanks();
        }
        return false;
    }

    function handleDragEnd(e) {
        this.classList.remove('dragging');
        priorityList.querySelectorAll('.sort-item').forEach(item => {
            item.classList.remove('dragging');
        });
    }

    function updateRanks() {
        const items = priorityList.querySelectorAll('.sort-item');
        items.forEach((item, index) => {
            const hiddenInput = item.querySelector('.rank-input');
            if (hiddenInput) hiddenInput.value = index + 1;
        });
    }

    priorityList.querySelectorAll('.sort-item').forEach(item => {
        item.setAttribute('draggable', 'true');
        item.addEventListener('dragstart', handleDragStart, false);
        item.addEventListener('dragover', handleDragOver, false);
        item.addEventListener('drop', handleDrop, false);
        item.addEventListener('dragend', handleDragEnd, false);
    });
    updateRanks(); // Init ranks


    // --- Leasing vs Purchasing Toggle ---
    const financeToggle = document.getElementById('financeToggle');
    const purchaseFields = document.getElementById('purchasingFields');
    const leaseFields = document.getElementById('leasingFields');

    financeToggle.addEventListener('change', () => {
        const val = form.querySelector('input[name="finance_type"]:checked').value;
        if (val === 'Purchasing') {
            purchaseFields.style.display = 'block';
            leaseFields.style.display = 'none';
        } else if (val === 'Leasing') {
            purchaseFields.style.display = 'none';
            leaseFields.style.display = 'block';
        } else {
            purchaseFields.style.display = 'block';
            leaseFields.style.display = 'block';
        }
    });

    // --- Other Conditionals (State availability, etc) ---
    const setupConditionals = () => {
        const inputs = form.querySelectorAll('input[type="radio"], select');
        const checkConditionals = () => {
            document.querySelectorAll('.form-step .conditional').forEach(el => {
                const fieldName = el.dataset.showIf;
                const expectedValue = el.dataset.value;
                const field = form.querySelector(`[name="${fieldName}"]:checked`) || form.querySelector(`[name="${fieldName}"]`);
                el.style.display = (field && field.value === expectedValue) ? 'block' : 'none';
            });
        };
        inputs.forEach(input => input.addEventListener('change', checkConditionals));
        checkConditionals();
    };
    setupConditionals();


    // --- Submission ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        updateRanks(); // Final rank capture

        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.innerText = 'Submitting...';

        const toBase64 = file => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });

        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                if (!Array.isArray(data[key])) {
                    data[key] = [data[key]];
                }
                data[key].push(value);
            } else {
                data[key] = value;
            }
        }
        
        // Convert any arrays (like multiple checkboxes) into comma-separated strings
        for (let key in data) {
            if (Array.isArray(data[key])) {
                // Ensure we don't stringify file objects incorrectly
                if (data[key][0] instanceof File) {
                    continue;
                }
                data[key] = data[key].join(', ');
            }
        }

        // Handle File conversions
        const allFileInputs = form.querySelectorAll('input[type="file"]');
        for (const input of allFileInputs) {
            const key = input.name;
            if (input.files && input.files.length > 0) {
                if (input.multiple && input.files.length > 1) {
                    data[key] = [];
                    for (let i = 0; i < input.files.length; i++) {
                        try {
                            const file = input.files[i];
                            const base64Content = await toBase64(file);
                            data[key].push({
                                base64: base64Content.split(',')[1],
                                type: file.type,
                                name: file.name
                            });
                        } catch (err) {
                            console.error("Error converting file to base64:", err);
                        }
                    }
                } else {
                    try {
                        const file = input.files[0];
                        const base64Content = await toBase64(file);
                        data[key] = {
                            base64: base64Content.split(',')[1],
                            type: file.type,
                            name: file.name
                        };
                    } catch (err) {
                        console.error("Error converting file to base64:", err);
                    }
                }
            } else {
                // Send empty object instead of deleting to prevent backend crash
                data[key] = {};
            }
        }

        // CAPTCHA check
        if (typeof grecaptcha !== 'undefined') {
            const resp = grecaptcha.getResponse();
            if (!resp) {
                alert('Please complete CAPTCHA.');
                submitBtn.disabled = false;
                submitBtn.innerText = 'Submit Questionnaire';
                return;
            }
            data['g-recaptcha-response'] = resp;
        }

        const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw_0jMWyofmIV0uJXstyRMnZTlPMOYrAZVU8fRu6xzAVuHFYVAFx2R6Ld0px2zq46ov/exec';
        try {
            if (SCRIPT_URL.includes('YOUR_GOOGLE_')) {
                console.log('Simulating success (No URL set)...');
                await new Promise(r => setTimeout(r, 1500));
            } else {
                // We use mode: 'no-cors' because Google Apps Script doesn't support CORS preflight easily.
                // This means we won't be able to read the JSON response, but the data WILL reach the script.
                await fetch(SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    cache: 'no-cache',
                    body: JSON.stringify(data)
                });
            }

            steps[currentStep].classList.remove('active');
            document.getElementById('successMessage').style.display = 'block';
            progressBar.style.width = '100%';
        } catch (err) {
            console.error("Submission error:", err);
            steps[currentStep].classList.remove('active');
            document.getElementById('errorMessage').style.display = 'block';
        }
    });
});
