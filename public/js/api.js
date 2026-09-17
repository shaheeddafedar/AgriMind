const API_BASE_URL = '/api';

async function getLocations() {
    try {
        const response = await fetch('/data/indian-states-cities.json');
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch locations:', error);
        return [];
    }
}

async function submitRecommendationRequest(formData) {
    try {
        const response = await fetch(`${API_BASE_URL}/recommend`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });
        if (!response.ok) throw new Error('Failed to get recommendation');
        return await response.json();
    } catch (error) {
        console.error('Error in submitRecommendationRequest:', error);
        return null;
    }
}

async function getRecentRecommendations(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/recommend/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch history');
        return await response.json();
    } catch (error) {
        console.error('Error fetching recent recommendations:', error);
        return [];
    }
}