// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Function to show messages
    function showMessage(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        document.body.insertBefore(alertDiv, document.body.firstChild);
        
        // Auto dismiss after 5 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }

    // Function to update cart counter
    async function updateCartCounter() {
        try {
            const response = await fetch('/cart');
            const data = await response.json();
            const counter = document.querySelector('.CartCounter');
            if (counter) {
                // Calculate total quantity instead of just counting items
                const totalQuantity = data.items ? data.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
                if (totalQuantity > 0) {
                    counter.textContent = totalQuantity;
                    counter.style.display = 'block';
                } else {
                    counter.textContent = '';
                    counter.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('Error updating cart counter:', error);
        }
    }

    // Function to add item to cart
    async function addToCart(productId, quantity = 1) {
        const button = document.querySelector(`[data-product-id="${productId}"]`);
        if (!button) return;

        // Store original button content
        const originalContent = button.innerHTML;
        
        try {
            // Show loading state
            button.disabled = true;
            button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Adding...';

            const response = await fetch('/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productId, quantity })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('Item added to cart successfully!', 'success');
                await updateCartCounter();
            } else {
                throw new Error(data.error || 'Failed to add item to cart');
            }
        } catch (error) {
            showMessage(error.message || 'Error adding item to cart', 'danger');
        } finally {
            // Restore button state
            button.disabled = false;
            button.innerHTML = originalContent;
        }
    }

    // Function to update quantity
    async function updateQuantity(productId, quantity) {
        const input = document.querySelector(`input[data-product-id="${productId}"]`);
        if (!input) return;

        // Store original input state
        const originalValue = input.value;
        
        try {
            // Show loading state
            input.disabled = true;
            input.classList.add('loading');

            const response = await fetch('/cart/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productId, quantity })
            });

            if (!response.ok) {
                throw new Error('Failed to update quantity');
            }

            const data = await response.json();

            if (data.success && data.cart) {
                // Find the updated item in the cart
                const updatedItem = data.cart.items.find(item => 
                    item.product._id === productId || item.product === productId
                );

                if (updatedItem) {
                    // Update the total price
                    const totalElement = input.closest('.cartitem').querySelector('.totalprice');
                    if (totalElement) {
                        totalElement.textContent = `$${updatedItem.total.toFixed(2)}`;
                    }
                    
                    // Update cart total
                    const subtotalElement = document.querySelector('.subtotal');
                    if (subtotalElement) {
                        subtotalElement.textContent = `$${data.cart.totalAmount.toFixed(2)}`;
                    }
                    
                    const grandTotalElement = document.querySelector('.grandtotal');
                    if (grandTotalElement) {
                        grandTotalElement.textContent = `$${(data.cart.totalAmount + 50).toFixed(2)}`;
                    }

                    // Update cart counter
                    await updateCartCounter();
                } else {
                    throw new Error('Item not found in cart');
                }
            } else {
                throw new Error(data.error || 'Failed to update quantity');
            }
        } catch (error) {
            showMessage(error.message || 'Error updating quantity', 'danger');
            // Restore original value on error
            input.value = originalValue;
        } finally {
            // Restore input state
            input.disabled = false;
            input.classList.remove('loading');
        }
    }

    // Make removeFromCart function globally available
    window.removeFromCart = async function(productId) {
        try {
            const response = await fetch(`/cart/remove/${productId}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            if (data.success) {
                // Reload the page to show updated cart
                window.location.reload();
            } else {
                showMessage('Error removing item', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error removing item', 'error');
        }
    };

    // Add click event listeners to all "Add to Cart" buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.dataset.productId;
            const quantityInput = document.querySelector('.quantity-input');
            const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
            addToCart(productId, quantity);
        });
    });

    // Add event listeners for quantity inputs in cart
    const quantityInputs = document.querySelectorAll('.qty');
    quantityInputs.forEach(input => {
        input.addEventListener('change', function() {
            const productId = this.dataset.productId;
            const stockLimit = parseInt(this.dataset.stock);
            let quantity = parseInt(this.value);

            // Validate quantity against stock limit
            if (quantity > stockLimit) {
                showMessage(`Sorry, only ${stockLimit} items available in stock`, 'warning');
                quantity = stockLimit;
                this.value = stockLimit;
            } else if (quantity < 1) {
                quantity = 1;
                this.value = 1;
            }

            if (quantity > 0) {
                updateQuantity(productId, quantity);
            }
        });

        // Also prevent manual input of numbers larger than stock
        input.addEventListener('input', function() {
            const stockLimit = parseInt(this.dataset.stock);
            if (parseInt(this.value) > stockLimit) {
                this.value = stockLimit;
            }
        });
    });

    // Initial cart counter update
    updateCartCounter();

    // Product Details Page Functionality
    // Quantity Controls
    const quantityInput = document.querySelector('.quantity-input');
    const decreaseBtn = document.querySelector('.quantity-btn:first-child');
    const increaseBtn = document.querySelector('.quantity-btn:last-child');

    if (quantityInput) {
        // Get stock limit from data attribute
        const stockLimit = parseInt(quantityInput.dataset.stock);

        // Handle decrease button
        if (decreaseBtn) {
            decreaseBtn.addEventListener('click', () => {
                const currentValue = parseInt(quantityInput.value);
                if (currentValue > 1) {
                    quantityInput.value = currentValue - 1;
                }
            });
        }

        // Handle increase button
        if (increaseBtn) {
            increaseBtn.addEventListener('click', () => {
                const currentValue = parseInt(quantityInput.value);
                if (currentValue < stockLimit) {
                    quantityInput.value = currentValue + 1;
                } else {
                    showMessage(`Sorry, only ${stockLimit} items available in stock`, 'warning');
                }
            });
        }

        // Handle direct input
        quantityInput.addEventListener('change', () => {
            let value = parseInt(quantityInput.value);
            if (value < 1 || isNaN(value)) {
                value = 1;
            } else if (value > stockLimit) {
                showMessage(`Sorry, only ${stockLimit} items available in stock`, 'warning');
                value = stockLimit;
            }
            quantityInput.value = value;
        });

        // Prevent manual input of numbers larger than stock
        quantityInput.addEventListener('input', () => {
            const value = parseInt(quantityInput.value);
            if (value > stockLimit) {
                quantityInput.value = stockLimit;
            }
        });
    }

    // Tab Switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabButtons.length && tabContents.length) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                // Add active class to clicked button and corresponding content
                button.classList.add('active');
                const tabId = button.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
            });
        });
    }

    // Add to Cart Functionality
    const addToCartBtn = document.querySelector('.add-to-cart');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            const productId = this.getAttribute('data-product-id');
            const quantity = parseInt(quantityInput.value);

            try {
                const response = await fetch('/cart/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        productId: productId,
                        quantity: quantity
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    // Show success message
                    alert('Product added to cart successfully!');
                    // Optionally update cart count in header
                    const cartCount = document.querySelector('.cart-count');
                    if (cartCount) {
                        cartCount.textContent = data.cartCount;
                    }
                } else {
                    alert(data.message || 'Failed to add product to cart');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while adding the product to cart');
            }
        });
    }
});
