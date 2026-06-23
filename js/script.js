// script.js - Complete working version with no-cors
// CONFIGURATION - REPLACE WITH YOUR DEPLOYED SCRIPT URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbylSDpGlwqDJfyTfUrJN8hMXuQzF2c5UPC0N1I5wMK7od5xRzcday78a90Di45HoOHe/exec';

// Mobile navigation toggle
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - script starting');
    
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('show');
        });
    }

    // Price preview calculation
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

    // Attach event listeners for price calculation
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

    // Helper functions
    function showError(errorDiv, message) {
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            errorDiv.style.background = '#fed7d7';
            errorDiv.style.color = '#c53030';
            errorDiv.style.borderLeft = '4px solid #e53e3e';
        }
    }

    function resetButton(button, spinner) {
        if (button) {
            button.disabled = false;
            button.textContent = 'Pay & Book Now';
        }
        if (spinner) spinner.style.display = 'none';
    }

    // Handle form submission
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
            if (spinner) spinner.style.display = 'block';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Submitting...';
            }
            if (errorDiv) {
                errorDiv.style.display = 'none';
            }
            
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
            
            // Validation
            if (!formData.fullname) {
                showError(errorDiv, 'Please enter your full name.');
                resetButton(submitBtn, spinner);
                return;
            }
            
            if (!formData.email || !formData.email.includes('@')) {
                showError(errorDiv, 'Please enter a valid email address.');
                resetButton(submitBtn, spinner);
                return;
            }
            
            if (!formData.phone) {
                showError(errorDiv, 'Please enter your phone number.');
                resetButton(submitBtn, spinner);
                return;
            }
            
            if (!formData.rental_date) {
                showError(errorDiv, 'Please select a rental date.');
                resetButton(submitBtn, spinner);
                return;
            }
            
            if (!formData.delivery_location) {
                showError(errorDiv, 'Please select a delivery location.');
                resetButton(submitBtn, spinner);
                return;
            }
            
            if (formData.total_amount <= 0) {
                showError(errorDiv, 'Please select at least one kayak.');
                resetButton(submitBtn, spinner);
                return;
            }
            
            // Send to Google Sheets using no-cors mode
            console.log('Sending to Google Sheets...');
            console.log('URL:', GOOGLE_SCRIPT_URL);
            
            // FIXED: Use .then() instead of await
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
                // With no-cors, we can't read the response
                // But if we get here, the request was sent
                console.log('Data sent successfully (no-cors)');
                
                // Show success message
                if (errorDiv) {
                    errorDiv.textContent = '✅ Booking submitted! Check your email for confirmation.';
                    errorDiv.style.display = 'block';
                    errorDiv.style.background = '#c6f6d5';
                    errorDiv.style.color = '#22543d';
                    errorDiv.style.borderLeft = '4px solid #38a169';
                }
                
                // Reset button
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Pay & Book Now';
                }
                if (spinner) spinner.style.display = 'none';
                
                // Store for payment page (optional)
                sessionStorage.setItem('pendingBooking', JSON.stringify(formData));
                
                // Redirect to thank you page
                setTimeout(function() {
                    window.location.href = 'thank-you.html';
                }, 2500);
            })
            .catch(function(error) {
                // This catches network errors
                console.error('Network error:', error);
                showError(errorDiv, '⚠️ Network error. Please check your connection and try again.');
                resetButton(submitBtn, spinner);
            });
        });
    } else {
        console.error('booking-payment-form not found on page');
    }
});

console.log('script.js loaded successfully');
