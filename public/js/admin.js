// Toggle the side navigation
window.addEventListener('DOMContentLoaded', event => {
    const sidebarToggle = document.body.querySelector('#sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', event => {
            event.preventDefault();
            document.body.classList.toggle('sidebar-toggled');
            document.querySelector('.sidebar').classList.toggle('toggled');
        });
    }

    // Toggle the side navigation when window is resized below 768px
    window.addEventListener('resize', () => {
        if (window.innerWidth < 768) {
            document.querySelector('.sidebar').classList.add('toggled');
        }
    });

    // Prevent the content wrapper from scrolling when the fixed side navigation hovered over
    document.querySelector('body.fixed-nav .sidebar').addEventListener('mousewheel DOMMouseScroll', event => {
        if (window.innerWidth > 768) {
            const e0 = event.originalEvent;
            const delta = e0.wheelDelta || -e0.detail;
            this.scrollTop += (delta < 0 ? 1 : -1) * 30;
            event.preventDefault();
        }
    });

    // Scroll to top button appear
    document.addEventListener('scroll', () => {
        const scrollToTop = document.body.querySelector('.scroll-to-top');
        if (document.documentElement.scrollTop > 100) {
            scrollToTop.style.display = 'block';
        } else {
            scrollToTop.style.display = 'none';
        }
    });

    // Smooth scrolling using jQuery easing
    document.querySelectorAll('a.scroll-to-top').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    });

    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
});

$(document).ready(function () {
    // Sidebar toggle
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
        $('#content').toggleClass('active');
    });

    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize popovers
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Auto-hide alerts after 5 seconds
    setTimeout(function() {
        $('.alert').fadeOut('slow');
    }, 5000);

    // Confirm delete actions
    $('.delete-confirm').on('click', function(e) {
        if (!confirm('Are you sure you want to delete this item?')) {
            e.preventDefault();
        }
    });

    // Update dashboard stats every 30 seconds
    if ($('#dashboard-stats').length) {
        setInterval(updateDashboardStats, 30000);
    }
});

// Function to update dashboard stats
function updateDashboardStats() {
    $.ajax({
        url: '/admin/stats',
        method: 'GET',
        success: function(response) {
            if (response.success) {
                const data = response.data;
                $('#total-users').text(data.totalUsers);
                $('#total-products').text(data.totalProducts);
                $('#total-orders').text(data.totalOrders);
                $('#total-revenue').text('$' + data.totalRevenue.toFixed(2));
            }
        },
        error: function(error) {
            console.error('Error updating dashboard stats:', error);
        }
    });
}

// Function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Function to format date
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Function to handle form submissions with AJAX
function handleFormSubmit(formId, successCallback) {
    $(formId).on('submit', function(e) {
        e.preventDefault();
        
        const form = $(this);
        const submitButton = form.find('button[type="submit"]');
        const originalButtonText = submitButton.text();
        
        // Disable submit button and show loading state
        submitButton.prop('disabled', true).text('Processing...');
        
        $.ajax({
            url: form.attr('action'),
            method: form.attr('method'),
            data: new FormData(this),
            processData: false,
            contentType: false,
            success: function(response) {
                if (response.success) {
                    if (typeof successCallback === 'function') {
                        successCallback(response);
                    }
                    showAlert('success', response.message || 'Operation completed successfully');
                } else {
                    showAlert('danger', response.message || 'An error occurred');
                }
            },
            error: function(xhr) {
                const response = xhr.responseJSON;
                showAlert('danger', response?.message || 'An error occurred');
            },
            complete: function() {
                // Re-enable submit button and restore original text
                submitButton.prop('disabled', false).text(originalButtonText);
            }
        });
    });
}

// Function to show alerts
function showAlert(type, message) {
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    $('#alert-container').html(alertHtml);
    
    // Auto-hide after 5 seconds
    setTimeout(function() {
        $('.alert').fadeOut('slow');
    }, 5000);
} 