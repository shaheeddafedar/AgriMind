document.addEventListener('DOMContentLoaded', () => {
    let allFeedbacks = [];
    let currentPage = 1;
    const feedbacksPerPage = 6;

    const feedbackGrid = document.getElementById('recent-feedback');
    const paginationElement = document.getElementById('pagination');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const pageInfoElement = document.getElementById('page-info');
    const form = document.getElementById('feedback-form');
    const stars = document.querySelectorAll('.star-rating .star');
    const ratingInput = document.getElementById('rating');
    
    async function fetchFeedbacks() {
        feedbackGrid.innerHTML = `<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Loading feedback...</p></div>`;
        try {
            const response = await fetch('/api/feedback');
            if (!response.ok) throw new Error('Failed to fetch feedback');
            allFeedbacks = await response.json();
            renderFeedbacks(); 
        } catch (error) {
            console.error('Error fetching feedback:', error);
            feedbackGrid.innerHTML = `<p>Unable to load feedback. Please try again later.</p>`;
        }
    }

    function renderFeedbacks() {
        const totalPages = Math.ceil(allFeedbacks.length / feedbacksPerPage);
        if (currentPage > totalPages) currentPage = totalPages || 1;

        const startIndex = (currentPage - 1) * feedbacksPerPage;
        const paginatedFeedbacks = allFeedbacks.slice(startIndex, startIndex + feedbacksPerPage);
        
        updatePaginationUI(totalPages);

        if (paginatedFeedbacks.length === 0) {
            feedbackGrid.innerHTML = `<p>No feedback available yet. Be the first!</p>`;
            return;
        }

        feedbackGrid.innerHTML = paginatedFeedbacks.map(feedback => `
            <div class="feedback-card">
                <div class="rating">${'★'.repeat(feedback.rating)}${'☆'.repeat(5 - feedback.rating)}</div>
                <p class="comment">"${feedback.comment}"</p>
                <small><strong>- ${feedback.name}</strong> on ${new Date(feedback.createdAt).toLocaleDateString()}</small>
            </div>
        `).join('');
    }

    function updatePaginationUI(totalPages) {
        if (totalPages <= 1) {
            if (paginationElement) paginationElement.style.display = 'none';
            return;
        }
        if (paginationElement) paginationElement.style.display = 'flex';
        if (pageInfoElement) pageInfoElement.textContent = `Page ${currentPage} of ${totalPages}`;
        if (prevPageButton) prevPageButton.disabled = currentPage === 1;
        if (nextPageButton) nextPageButton.disabled = currentPage === totalPages;
    }

    if (prevPageButton) prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) { currentPage--; renderFeedbacks(); }
    });
    if (nextPageButton) nextPageButton.addEventListener('click', () => {
        const totalPages = Math.ceil(allFeedbacks.length / feedbacksPerPage);
        if (currentPage < totalPages) { currentPage++; renderFeedbacks(); }
    });

    if (stars) stars.forEach(star => {
        star.addEventListener('click', () => {
            const value = star.getAttribute('data-value');
            if (ratingInput) ratingInput.value = value;
            stars.forEach(s => {
                s.textContent = s.getAttribute('data-value') <= value ? '★' : '☆';
            });
        });
    });

    // --- FORM SUBMISSION ---
    if (form) form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('.btn');
        btn.disabled = true;
        
        const feedbackData = {
            name: document.getElementById('name').value,
            rating: parseInt(ratingInput.value),
            // THE FIX: We are now sending a 'comment' field to the API
            comment: document.getElementById('comment').value,
        };

        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(feedbackData),
            });
            
            if (response.ok) {
                alert('Thank you for your feedback!');
                form.reset();
                stars.forEach(s => { s.textContent = '☆'; });
                fetchFeedbacks(); // Refresh the list with the new feedback
            } else {
                alert('Could not submit feedback. Please check all fields.');
            }
        } catch (error) {
            console.error('Feedback submission error:', error);
        } finally {
            btn.disabled = false;
        }
    });

    // --- INITIALIZE THE PAGE ---
    fetchFeedbacks();
});