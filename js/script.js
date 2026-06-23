// script.js - Complete Production-Ready Version
// Last updated: 2026-06-23

// ========================================
// CONFIGURATION
// ========================================
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw2iGA3NBZDDMDUxve2GujCYEP558uR0Nj90qFnE6Fpt5NpVgeJfECIfSUi7JzTo5Gr/exec';

// ========================================
// PRICE CALCULATOR
// ========================================
function calculateTotal() {
    console.log('Calculating total...');
    
    const singleQty = parseInt(document.getElementById('single_qty')?.value) || 0;
    const tandemQty = parseInt(document.getElementById('tandem_qty')?.value) || 0;
    const fishingQty = parseInt(document.getElementById('fishing_qty')?.value) || 0;
    const kidsQty = parseInt(document.getElementById('kids_qty')?.value) || 0;
    const hours = parseInt(document.getElementById('hours')?.value) || 2;

    const singlePrice = 20;
    const tandemPrice = 35;
    const fishingPrice = 30;
    const kidsPrice = 17;

    const total = (singleQty * singlePrice + tandemQty * tandemPrice + fishingQty * fishingPrice + kidsQty * kidsPrice) * hours;
    
    const priceSpan = document.getElementById('total-price');
    if (priceSpan) {
        priceSpan.textContent = '$' + total.toFixed(2);
    }
    
    return total;
}

// ========================================
// UI HELPERS
// ========================================
function showMessage(element, message, type) {
    if (!element) return;
    
    element.textContent = message;
    element.style.display = 'block';
    
    // Remove previous classes
    element.classList.remove('success-message', 'error-message', 'info-message');
    
    // Add appropriate class
    if (type === 'success') {
        element.classList.add('success-message');
        element.style.background = '#c6f6d5';
        element.style.color = '#22543d';
        element.style.borderLeft = '4px solid #38a169';
    } else if (type === 'error') {
        element.classList.add('error-message');
        element.style.background = '#fed7d7';
        element.style.color = '#c53030';
        element.style.borderLeft = '4px solid #e53e3e';
    } else {
        element.classList.add('info-message');
        element.style.background = '#e6fffa';
        element.style.color = '#234e52';
        element.style.borderLeft = '4px solid #38b2ac';
    }
}

function setLoadingState(button, spinner, isLoading) {
    if (button) {
        button.disabled = isLoading;
        button.textContent = isLoading ? 'Submitting...' : 'Pay & Book Now';
    }
    if (spinner) {
        spinner.style.display = isLoading ? 'block' : 'none';
    }
}

// ========================================
// FORM VALIDATION
// ========================================
function validateForm(formData) {
    const errors = [];
    
    // Name validation
    if (!formData.fullname || formData.fullname.length < 2) {
        errors.push('Please enter your full name (minimum 2 characters).');
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
        errors.push('Please enter a valid email address.');
    }
    
    // Phone validation (basic)
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
        errors.push('Please enter a valid phone number (10 digits minimum).');
    }
    
    // Date validation
    if (!formData.rental_date) {
        errors.push('Please select a rental date.');
    } else {
        const selectedDate = new Date(formData.rental_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
            errors.push('Rental date cannot be in the past.');
        }
    }
    
    // Delivery location validation
    if (!formData.delivery_location) {
        errors.push('Please select a delivery location.');
    }
    
    // Kayak selection validation
    const totalKayaks = parseInt(formData.single_qty) + parseInt(formData.tandem_qty) + 
                        parseInt(formData.fishing_qty) + parseInt(formData.kids_qty);
    if (totalKayaks === 0) {
        errors.push('Please select at least one kayak.');
    }
    
    return errors;
}

// ========================================
// FORM SUBMISSION
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - script starting');
    
    // Mobile navigation
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('show');
        });
    }

    // Price calculator event listeners
    const formElements = ['single_qty', 'tandem_qty', 'fishing_qty', 'kids_qty', 'hours'];
    formElements.forEach(function(id) {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', calculateTotal);
            el.addEventListener('change', calculateTotal);
        }
    });
    
    // Initial calculation
    calculateTotal();

    // Form submission handler
    const bookingForm = document.getElementById('booking-payment-form');
    if (bookingForm) {
        console.log('Form found - attaching submit handler');
        
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted');
            
            // Get UI elements
            const spinner = document.getElementById('loading-spinner');
            const errorDiv = document.getElementById('error-message');
            const submitBtn = document.getElementById('pay-book-button');
            
            // Show loading state
            setLoadingState(submitBtn, spinner, true);
            if (errorDiv) errorDiv.style.display = 'none';
            
            // Collect form data
            const formData = {
                fullname: document.getElementById('fullname')?.value?.trim() || '',
                email: document.getElementById('email')?.value?.trim() || '',
                phone: document.getElementById('phone')?.value?.trim() || '',
                rental_date: document.getElementById('rental_date')?.value || '',
                hours: document.getElementById('hours')?.value || '2',
                single_qty: document.getElementById('single_qty')?.value || '0',
                tandem_qty: document.getElementById('tandem_qty')?.value || '0',
                fishing_qty: document.getElementById('fishing_qty')?.value || '0',
                kids_qty: document.getElementById('kids_qty')?.value || '0',
                delivery_location: document.getElementById('delivery_location')?.value || '',
                coordinates: document.getElementById('coordinates')?.value?.trim() || '',
                special_requests: document.getElementById('special_requests')?.value?.trim() || '',
                total_amount: calculateTotal()
            };
            
            console.log('Booking data collected:', formData);
            
            // Validate form
            const validationErrors = validateForm(formData);
            if (validationErrors.length > 0) {
                showMessage(errorDiv, '❌ ' + validationErrors.join(' '), 'error');
                setLoadingState(submitBtn, spinner, false);
                return;
            }
            
            // Check for duplicate submission (prevent double-click)
            if (sessionStorage.getItem('isSubmitting') === 'true') {
                showMessage(errorDiv, '⚠️ A submission is already in progress. Please wait.', 'error');
                setLoadingState(submitBtn, spinner, false);
                return;
            }
            
            // Set submitting flag
            sessionStorage.setItem('isSubmitting', 'true');
            
            // Send to Google Sheets
            console.log('Sending to Google Sheets...');
            
            fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })
            .then(function() {
                console.log('Data sent successfully (no-cors)');
                
                // Clear submitting flag
                sessionStorage.removeItem('isSubmitting');
                
                // Show success message
                showMessage(errorDiv, '✅ Booking submitted successfully! Check your email for confirmation.', 'success');
                
                // Reset form
                bookingForm.reset();
                calculateTotal();
                
                // Reset button
                setLoadingState(submitBtn, spinner, false);
                
                // Store for payment page
                sessionStorage.setItem('pendingBooking', JSON.stringify(formData));
                
                // Redirect to payment page after delay
                setTimeout(function() {
                    window.location.href = 'payment.html';
                }, 3000);
            })
            .catch(function(error) {
                console.error('Network error:', error);
                
                // Clear submitting flag
                sessionStorage.removeItem('isSubmitting');
                
                showMessage(errorDiv, '⚠️ Network error. Please check your connection and try again. Error: ' + error.message, 'error');
                setLoadingState(submitBtn, spinner, false);
            });
        });
    } else {
        console.error('booking-payment-form not found on page');
    }
});

console.log('script.js loaded successfully');
