// script.js - Using no-cors mode (bypasses CORS)
// Last updated: 2026-06-17

// CONFIGURATION - REPLACE WITH YOUR DEPLOYED SCRIPT URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbylSDpGlwqDJfyTfUrJN8hMXuQzF2c5UPC0N1I5wMK7od5xRzcday78a90Di45HoOHe/exec';

// Mobile navigation toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('show');
        });
    }

    // Price preview calculation
    function calculateTotal() {
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

    calculateTotal();

    // Handle form submission
    const bookingForm = document.getElementById('booking-payment-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
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
                fullname: document.getElementById('fullname').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                rental_date: document.getElementById('rental_date').value,
                hours: document.getElementById('hours').value,
                single_qty: document.getElementById('single_qty').value || '0',
                tandem_qty: document.getElementById('tandem_qty').value || '0',
                fishing_qty: document.getElementById('fishing_qty').value || '0',
                kids_qty: document.getElementById('kids_qty').value || '0',
                delivery_location: document.getElementById('delivery_location').value,
                coordinates: document.getElementById('coordinates').value.trim(),
                special_requests: document.getElementById('special_requests').value.trim()
            };
            
            const total_amount = calculateTotal();
            
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
            
            if (total_amount <= 0) {
                showError(errorDiv, 'Please select at least one kayak.');
                resetButton(submitBtn, spinner);
                return;
            }
            
            try {
                // Show progress
                if (errorDiv) {
                    errorDiv.textContent = 'Submitting your booking...';
                    errorDiv.style.display = 'block';
                    errorDiv.style.background = '#e6fffa';
                    errorDiv.style.color = '#234e52';
                    errorDiv.style.borderLeft = '4px solid #38b2ac';
                }
                
                // Send to Google Sheets using no-cors mode
                // THIS BYPASSES THE CORS ERROR
                a// YOUR CURRENT CODE (problematic with await + no-cors)
                    await fetch(GOOGLE_SCRIPT_URL, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(bookingData)
                    });
                    // The await never resolves properly with no-cors
                    body: JSON.stringify({
                        fullname: formData.fullname,
                        email: formData.email,
                        phone: formData.phone,
                        rental_date: formData.rental_date,
                        hours: formData.hours,
                        single_qty: formData.single_qty,
                        tandem_qty: formData.tandem_qty,
                        fishing_qty: formData.fishing_qty,
                        kids_qty: formData.kids_qty,
                        delivery_location: formData.delivery_location,
                        coordinates: formData.coordinates,
                        special_requests: formData.special_requests,
                        total_amount: total_amount
                    })
                });
                
                // With no-cors, we can't read the response
                // So we assume success if no error was thrown
                
                // Success!
                if (errorDiv) {
                    errorDiv.textContent = '✅ Booking submitted! Check your email for confirmation.';
                    errorDiv.style.background = '#c6f6d5';
                    errorDiv.style.color = '#22543d';
                    errorDiv.style.borderLeft = '4px solid #38a169';
                }
                
                // Reset button
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Submit Booking Request';
                }
                if (spinner) spinner.style.display = 'none';
                
                // Redirect to thank you page after delay
                setTimeout(function() {
                    window.location.href = 'thank-you.html';
                }, 3000);
                
            } catch (error) {
                console.error('Booking error:', error);
                showError(errorDiv, '⚠️ ' + error.message + '. Please try again or contact us directly.');
                resetButton(submitBtn, spinner);
            }
        });
    }
});

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
        button.textContent = 'Submit Booking Request';
    }
    if (spinner) spinner.style.display = 'none';
}
