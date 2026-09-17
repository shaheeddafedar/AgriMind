document.addEventListener('DOMContentLoaded', () => {

    let recommendationMode = "crop";

    const cropModeBtn = document.getElementById("crop-mode-btn");
    const fertilizerModeBtn = document.getElementById("fertilizer-mode-btn");

    const recommendationTitle =
        document.getElementById("recommendation-title");

    const recommendationDescription =
        document.getElementById("recommendation-description");

    const recommendationSubmitBtn =
        document.getElementById("recommendation-submit-btn");

    const cropOnlyFields =
        document.querySelectorAll(".crop-only-field");

    const fertilizerOnlyFields =
    document.querySelectorAll(".fertilizer-only-field");

    const stateSelect = document.getElementById('state');
    const citySelect = document.getElementById('city');
    const seasonSelect = document.getElementById('season');
    const temperatureInput = document.getElementById('temperature');
    const humidityInput = document.getElementById('humidity');

    const form = document.getElementById('recommendation-form');
    let locationsData = [];

    const recommendationsContainer =
        document.getElementById('recent-recommendations');

    const fetchBtn =
        document.getElementById('fetch-farm-details-btn');

    const farmIdInput =
        document.getElementById('farmId');

    const askButton =
        document.getElementById('ask-btn');

    const chatInput =
        document.getElementById('chat-query');

    const chatWindow =
        document.querySelector('.chat-window');

    function setRecommendationMode(mode) {

    recommendationMode = mode;

    if (mode === "crop") {

        cropModeBtn.classList.add("active");
        fertilizerModeBtn.classList.remove("active");

        recommendationTitle.textContent =
            "Get a New Crop Recommendation";

        recommendationDescription.textContent =
            "Fill in the details below to get an AI-powered crop suggestion.";

        recommendationSubmitBtn.textContent =
            "Get Crop Recommendation";

        cropOnlyFields.forEach(field => {

            field.style.display = "";

            const input = field.querySelector("input, select");

            if (input) {
                input.required = input.id !== "pastCrop";
            }

        });

        fertilizerOnlyFields.forEach(field => {
            field.style.display = "none";
        });

        const fertilizerCrop =
            document.getElementById("fertilizerCrop");

        if (fertilizerCrop) {
            fertilizerCrop.required = false;
        }

    } else {

        fertilizerModeBtn.classList.add("active");
        cropModeBtn.classList.remove("active");

        recommendationTitle.textContent =
            "Get a New Fertilizer Recommendation";

        recommendationDescription.textContent =
            "Fill in the details below to get an AI-powered fertilizer recommendation.";

        recommendationSubmitBtn.textContent =
            "Get Fertilizer Recommendation";

        cropOnlyFields.forEach(field => {

            field.style.display = "none";

            const input = field.querySelector("input, select");

            if (input) {
                input.required = false;
            }

        });

        fertilizerOnlyFields.forEach(field => {
            field.style.display = "";
        });

        const fertilizerCrop =
            document.getElementById("fertilizerCrop");

        if (fertilizerCrop) {
            fertilizerCrop.required = true;
        }
    }
    }

    if (cropModeBtn) {
        cropModeBtn.addEventListener("click", () => {
            setRecommendationMode("crop");
        });
    }

    if (fertilizerModeBtn) {
        fertilizerModeBtn.addEventListener("click", () => {
            setRecommendationMode("fertilizer");
        });
    }

    setRecommendationMode("crop");

    async function fetchHistoricalRainfall() {

    const state = stateSelect.value;
    const city = citySelect.value;

    // Don't fetch until both are selected
    if (!state || !city) return;

    try {

        const season = document.getElementById('season').value;

        if (!state || !city || !season) return;

        const response = await fetch(
            `/api/historical-rainfall?state=${encodeURIComponent(state)}&city=${encodeURIComponent(city)}&season=${encodeURIComponent(season)}`
        );
        if (!response.ok) {
            throw new Error('Failed to fetch rainfall');
        }

        const data = await response.json();

        if (data.success) {

            const rainfallInput =
                document.getElementById('rainfall');

            rainfallInput.value =
                data.rainfall;

        }

    } catch (error) {

        console.error(
            'Error fetching historical rainfall:',
            error
        );

    }

}


    // ==========================================
    // LOAD RECENT RECOMMENDATIONS
    // ==========================================

    async function loadRecentRecommendations() {

        if (!recommendationsContainer) return;

        if (typeof USER_ID === 'undefined' || !USER_ID) {

            recommendationsContainer.innerHTML =
                '<p>Could not find user session.</p>';

            return;
        }

        try {

            const recommendations =
                await getRecentRecommendations(USER_ID);

            if (!recommendations || recommendations.length === 0) {

                recommendationsContainer.innerHTML =
                    '<p>You have no recent recommendations.</p>';

                return;
            }

            recommendationsContainer.innerHTML = '';

            recommendations.forEach(rec => {

                const card =
                    document.createElement('div');

                card.className =
                    'recommendation-card';

                const formattedDate =
                    new Date(rec.createdAt)
                        .toLocaleDateString('en-IN', {

                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'

                        });

                card.innerHTML = `
                    <strong>${
                        rec.recommendedCrop.charAt(0).toUpperCase() +
                        rec.recommendedCrop.slice(1).toLowerCase()
                    }</strong>
                    <span>${formattedDate}</span>
                `;

                recommendationsContainer.appendChild(card);

            });

        } catch (error) {

            console.error(
                'Error loading recommendations:',
                error
            );

            recommendationsContainer.innerHTML =
                '<p>Could not load recommendations.</p>';

        }
    }


    // ==========================================
    // LOAD STATES
    // ==========================================

    async function populateStates() {

        if (!stateSelect) return;

        try {

            locationsData = await getLocations();

            locationsData.forEach(location => {

                const option =
                    document.createElement('option');

                option.value = location.state;
                option.textContent = location.state;

                stateSelect.appendChild(option);

            });

        } catch (error) {

            console.error(
                'Error loading locations:',
                error
            );

        }
    }


    // ==========================================
    // POPULATE CITIES
    // ==========================================

    function populateCities(selectedStateName) {

        citySelect.innerHTML =
            '<option value="">Select City</option>';

        const selectedState =
            locationsData.find(
                s => s.state === selectedStateName
            );

        if (selectedState) {

            citySelect.disabled = false;

            selectedState.cities.forEach(city => {

                const option =
                    document.createElement('option');

                option.value = city;
                option.textContent = city;

                citySelect.appendChild(option);

            });

        } else {

            citySelect.disabled = true;

        }
    }


    // ==========================================
    // FETCH SEASONAL TEMPERATURE 🌡️
    // ==========================================

    async function fetchSeasonalTemperature() {

        const state = stateSelect.value;
        const city = citySelect.value;
        const season = seasonSelect.value;

        // Fetch only when all values are selected
        if (!state || !city || !season) {
            return;
        }

        try {

            // Clear previous temperature
            temperatureInput.value = '';

            const response = await fetch(
                `/api/seasonal-temperature?state=${encodeURIComponent(state)}&city=${encodeURIComponent(city)}&season=${encodeURIComponent(season)}`
            );

            const data = await response.json();

            if (!response.ok || !data.success) {

                throw new Error(
                    data.message ||
                    'Unable to fetch temperature'
                );

            }

            // Auto-fill temperature
            temperatureInput.value =
                data.temperature;

        } catch (error) {

            console.error(
                'Error fetching seasonal temperature:',
                error
            );

            temperatureInput.value = '';

            alert(
                'Unable to fetch seasonal temperature. Please enter it manually.'
            );

        }
    }

    // ==========================================
    // FETCH SEASONAL HUMIDITY 💧
    // ==========================================

    async function fetchSeasonalHumidity() {    

        const state = stateSelect.value;
        const city = citySelect.value;
        const season = seasonSelect.value;

        // Fetch only when all values are selected
        if (!state || !city || !season) {
            return;
        }

        try {

            // Clear previous humidity
            humidityInput.value = '';

            const response = await fetch(
                `/api/seasonal-humidity?state=${encodeURIComponent(state)}&city=${encodeURIComponent(city)}&season=${encodeURIComponent(season)}`
            );

            const data = await response.json();

            if (!response.ok || !data.success) {

                throw new Error(
                    data.message ||
                    'Unable to fetch humidity'
                );

            }

            // Auto-fill humidity
            humidityInput.value =
                data.humidity;

        } catch (error) {

            console.error(
                'Error fetching seasonal humidity:',
                error
            );

            humidityInput.value = '';

            alert(
                'Unable to fetch seasonal humidity. Please try again.'
            );

        }
    }


    // ==========================================
    // STATE CHANGE
    // ==========================================

    if (stateSelect) {

        stateSelect.addEventListener(
            'change',
            () => {

                populateCities(
                    stateSelect.value
                );

                // Clear old weather values
                temperatureInput.value = '';
                humidityInput.value = '';

            }
        );

    }

    if (citySelect) {
    citySelect.addEventListener('change', () => {
        fetchHistoricalRainfall();
    });
}

    // ==========================================
    // CITY CHANGE
    // ==========================================

    if (citySelect) {

        citySelect.addEventListener(
            'change',
            () => {

                fetchSeasonalTemperature();
                fetchSeasonalHumidity();

            }
        );

    }

    if (seasonSelect) {
    seasonSelect.addEventListener('change', () => {
        fetchHistoricalRainfall();
    });
    }

    // ==========================================
    // SEASON CHANGE
    // ==========================================

    if (seasonSelect) {

    seasonSelect.addEventListener(
        'change',
            () => {

                fetchSeasonalTemperature();
                fetchSeasonalHumidity();

            }
        );

    }


    // ==========================================
// RECOMMENDATION FORM SUBMIT
// ==========================================

if (form) {

    form.addEventListener(
        'submit',
        async (e) => {

            e.preventDefault();

            if (
                typeof USER_ID === 'undefined' ||
                !USER_ID
            ) {

                alert(
                    'Error: User session not found. Please log in again.'
                );

                return;
            }

            // ==========================================
            // FERTILIZER RECOMMENDATION
            // ==========================================

            if (recommendationMode === "fertilizer") {

                const fertilizerData = {

    crop:
        document.getElementById('fertilizerCrop').value.trim(),

    nitrogen:
        document.getElementById('nitrogen').value,

    phosphorus:
        document.getElementById('phosphorus').value,

    potassium:
        document.getElementById('potassium').value

};

                // Basic validation
                if (!fertilizerData.crop) {

                    alert('Please enter the crop name.');

                    return;
                }

                try {

                    const response = await fetch(
                        '/api/fertilizer/recommend',
                        {
                            method: 'POST',

                            headers: {
                                'Content-Type': 'application/json'
                            },

                            body: JSON.stringify(
                                fertilizerData
                            )
                        }
                    );

                    const result =
                        await response.json();

                    if (!response.ok || !result.success) {

                        alert(
                            result.message ||
                            'Failed to get fertilizer recommendation.'
                        );

                        return;
                    }

                    localStorage.removeItem(
                        'recommendationResult'
                    );

                    localStorage.setItem(
                        'fertilizerRecommendationResult',
                        JSON.stringify(result)
                    );

                    window.location.href =
                        '/recommend';
                    // Temporary redirect
                    window.location.href =
                        '/recommend';

                } catch (error) {

                    console.error(
                        'Fertilizer recommendation error:',
                        error
                    );

                    alert(
                        'Unable to get fertilizer recommendation. Please try again.'
                    );

                }

                return;
            }


            // ==========================================
            // CROP RECOMMENDATION
            // ==========================================

            const formData = {

                userId: USER_ID,

                soilPh:
                    document.getElementById('soilPh').value,

                humidity:
                    document.getElementById('humidity').value,

                nitrogen:
                    document.getElementById('nitrogen').value,

                phosphorus:
                    document.getElementById('phosphorus').value,

                potassium:
                    document.getElementById('potassium').value,

                temperature:
                    document.getElementById('temperature').value,

                area:
                    document.getElementById('area').value,

                rainfall:
                    document.getElementById('rainfall').value,

                season:
                    document.getElementById('season').value,

                state:
                    document.getElementById('state').value,

                city:
                    document.getElementById('city').value,

                pastCrop:
                    document.getElementById('pastCrop').value

            };


            const result =
                await submitRecommendationRequest(formData);


            if (result) {

    localStorage.removeItem(
        'fertilizerRecommendationResult'
    );

    localStorage.setItem(
        'recommendationResult',
        JSON.stringify(result)
    );

    window.location.href =
        '/recommend';

} else {

                alert(
                    'Failed to get a recommendation. Please try again.'
                );

            }

        }
    );

}


   // ==========================================
// FETCH FARM DETAILS
// ==========================================

if (fetchBtn) {

    fetchBtn.addEventListener(
        'click',
        async () => {

            const farmId =
                farmIdInput.value
                    .trim()
                    .toUpperCase();

            if (!farmId) {

                alert('Please enter a Farm ID.');

                return;
            }

            try {

                fetchBtn.disabled = true;
                fetchBtn.textContent = 'Fetching...';

                const response =
                    await fetch(`/api/farm/${farmId}`);

                console.log('Farm API status:', response.status);

                if (!response.ok) {

                    if (response.status === 404) {

                        alert(
                            'Farm ID not found. Please check the ID and try again.'
                        );

                    } else {

                        throw new Error(
                            'Failed to fetch farm data.'
                        );

                    }

                    return;
                }

                const farmData =
                    await response.json();

                console.log('Farm data received:', farmData);


                // ==========================================
                // FILL FARM SENSOR VALUES
                // ==========================================

                const soilPhInput =
                    document.getElementById('soilPh');

                const nitrogenInput =
                    document.getElementById('nitrogen');

                const phosphorusInput =
                    document.getElementById('phosphorus');

                const potassiumInput =
                    document.getElementById('potassium');


                if (soilPhInput)
                    soilPhInput.value = farmData.soilPh;

                if (nitrogenInput)
                    nitrogenInput.value = farmData.nitrogen;

                if (phosphorusInput)
                    phosphorusInput.value = farmData.phosphorus;

                if (potassiumInput)
                    potassiumInput.value = farmData.potassium;


                console.log(
                    'Farm sensor values filled successfully.'
                );


                // ==========================================
                // IMPORTANT
                // ==========================================
                // Temperature and rainfall are NOT stored
                // in the Farm API.
                //
                // They continue to come from:
                // Seasonal Temperature API
                // Historical Rainfall API
                //
                // So we do NOT modify them here.


            } catch (error) {

                console.error(
                    'Error fetching farm details:',
                    error
                );

                alert(
                    'An error occurred. Please check the browser console.'
                );

            } finally {

                fetchBtn.disabled = false;

                fetchBtn.textContent = 'Fetch';

            }

        }
    );

}


    // ==========================================
    // CHATBOT
    // ==========================================

    if (askButton) {

        askButton.addEventListener(
            'click',
            handleChatSubmit
        );

        chatInput.addEventListener(
            'keypress',
            (e) => {

                if (e.key === 'Enter') {

                    handleChatSubmit();

                }

            }
        );

    }


    function handleChatSubmit() {

        const userMessage =
            chatInput.value.trim();

        if (userMessage === '') return;

        appendMessage(
            userMessage,
            'user'
        );

        chatInput.value = '';

        setTimeout(() => {

            const botResponse =
                getBotResponse(userMessage);

            appendMessage(
                botResponse,
                'bot'
            );

        }, 600);

    }


    function appendMessage(message, sender) {

        const messageDiv =
            document.createElement('div');

        messageDiv.className =
            `chat-message ${sender}`;

        messageDiv.textContent =
            message;

        chatWindow.appendChild(
            messageDiv
        );

        chatWindow.scrollTop =
            chatWindow.scrollHeight;

    }


    function getBotResponse(message) {

        const lowerMessage =
            message.toLowerCase();


        if (lowerMessage.includes('soil ph')) {

            return 'Soil pH is a measure of soil acidity or alkalinity. Most crops prefer a pH between 6.0 and 7.5.';

        }


        if (lowerMessage.includes('increase soil ph')) {

            return 'To increase soil pH (make it less acidic), you can add lime (calcium carbonate).';

        }


        if (lowerMessage.includes('decrease soil ph')) {

            return 'To decrease soil pH (make it more acidic), you can add sulfur or aluminum sulfate.';

        }


        if (
            lowerMessage.includes('wheat') &&
            lowerMessage.includes('fertilizer')
        ) {

            return 'For wheat, NPK (Nitrogen, Phosphorus, Potassium) in a balanced ratio (e.g., 12:32:16) is usually recommended at sowing.';

        }


        if (lowerMessage.includes('wheat')) {

            return 'Wheat is a Rabi crop, typically sown in winter (October-December) and harvested in spring (February-May).';

        }


        if (lowerMessage.includes('rice')) {

            return 'Rice is a Kharif crop that requires high rainfall and high humidity. It is usually grown in the monsoon season.';

        }


        if (lowerMessage.includes('kharif')) {

            return 'Kharif crops (monsoon crops) are grown from June to October. Examples include rice, maize, and cotton.';

        }


        if (lowerMessage.includes('rabi')) {

            return 'Rabi crops (winter crops) are sown from October to December. Examples include wheat, barley, and mustard.';

        }


        if (
            lowerMessage.includes('hello') ||
            lowerMessage.includes('hi')
        ) {

            return 'Hello! Ask me about crops, seasons, or soil health.';

        }


        return "Sorry, I'm just a simple bot. Try asking about 'soil ph', 'wheat', or 'kharif season'.";

    }


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    populateStates();

    loadRecentRecommendations();

});