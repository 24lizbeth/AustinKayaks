// script.js - Complete with Google Sheets + Stripe

// CONFIGURATION
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw5iKzqAmuUM5x3gqXscd-UUQLuWfRVYXWfN8aCeCiLOZJH2FzvfVZBzYNB7XVlrF8D/exec
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51QZ1EXAMPLEKEYREPLACELATER'; // Replace with your Stripe key

// Mobile navigation toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger) {
        hamburger.addEventListener('click', () => {
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
            priceSpan.textContent = `$${total.toFixed(2)}`;
        }
        
        return total;
    }

    // Attach event listeners for price calculation
    const formElements = ['single_qty', 'tandem_qty', 'fishing_qty', 'kids_qty', 'hours'];
    formElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', calculateTotal);
            el.addEventListener('change', calculateTotal);
        }
    });

    calculateTotal();

    // Handle booking + payment form submission
    const bookingForm = document.getElementById('booking-payment-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Show loading spinner
            const spinner = document.getElementById('loading-spinner');
            const errorDiv = document.getElementById('error-message');
            const submitBtn = document.getElementById('pay-book-button');
            
            if (spinner) spinner.style.display = 'block';
            if (submitBtn) submitBtn.disabled = true;
            if (errorDiv) errorDiv.style.display = 'none';
            
            // Collect form data
            const formData = {
                fullname: document.getElementById('fullname').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                rental_date: document.getElementById('rental_date').value,
                hours: document.getElementById('hours').value,
                single_qty: document.getElementById('single_qty').value,
                tandem_qty: document.getElementById('tandem_qty').value,
                fishing_qty: document.getElementById('fishing_qty').value,
                kids_qty: document.getElementById('kids_qty').value,
                delivery_location: document.getElementById('delivery_location').value,
                coordinates: document.getElementById('coordinates').value,
                special_requests: document.getElementById('special_requests').value
            };
            
            const total_amount = calculateTotal();
            
            // Validation
            if (!formData.fullname || !formData.email || !formData.phone || !formData.rental_date || !formData.delivery_location) {
                if (errorDiv) {
                    errorDiv.textContent = 'Please fill out all required fields.';
                    errorDiv.style.display = 'block';
                }
                if (spinner) spinner.style.display = 'none';
                if (submitBtn) submitBtn.disabled = false;
                return;
            }
            
            if (total_amount <= 0) {
                if (errorDiv) {
                    errorDiv.textContent = 'Please select at least one kayak.';
                    errorDiv.style.display = 'block';
                }
                if (spinner) spinner.style.display = 'none';
                if (submitBtn) submitBtn.disabled = false;
                return;
            }
            
            try {
                // STEP 1: Save booking to Google Sheets
                if (errorDiv) {
                    errorDiv.textContent = 'Saving your booking...';
                    errorDiv.style.display = 'block';
                    errorDiv.style.background = '#e6fffa';
                    errorDiv.style.color = '#234e52';
                }
                
                const googleResponse = await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ ...formData, total_amount })
                });
                
                const googleResult = await googleResponse.json();
                
                if (!googleResult.success) {
                    throw new Error(`Google Sheets error: ${googleResult.error}`);
                }
                
                console.log('Booking saved to Google Sheets:', googleResult);
                
                // STEP 2: Create Stripe Checkout Session
                if (errorDiv) {
                    errorDiv.textContent = 'Redirecting to secure payment...';
                }
                
                const stripeResponse = await fetch('/.netlify/functions/create-checkout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ ...formData, total_amount }),
                });
                
                const stripeData = await stripeResponse.json();
                
                if (!stripeResponse.ok) {
                    throw new Error(stripeData.error || 'Failed to create checkout session');
                }
                
                // STEP 3: Redirect to Stripe Checkout
                const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
                const { error } = await stripe.redirectToCheckout({ sessionId: stripeData.sessionId });
                
                if (error) {
                    throw new Error(error.message);
                }
                
            } catch (error) {
                if (errorDiv) {
                    errorDiv.textContent = 'Error: ' + error.message + '. Your booking was NOT saved. Please try again or contact support.';
                    errorDiv.style.display = 'block';
                    errorDiv.style.background = '#fed7d7';
                    errorDiv.style.color = '#c53030';
                }
                if (spinner) spinner.style.display = 'none';
                if (submitBtn) submitBtn.disabled = false;
                console.error('Booking error:', error);
            }
        });
    }
});