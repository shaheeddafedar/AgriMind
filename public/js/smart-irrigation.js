document.addEventListener('DOMContentLoaded', () => {

    const form =
        document.getElementById('irrigation-form');

    const result =
        document.getElementById('irrigation-result');

    const status =
        document.getElementById('irrigation-status');

    const message =
        document.getElementById('irrigation-message');

    const statusIcon =
        document.getElementById('result-status-icon');

    const resultCrop =
        document.getElementById('result-crop');

    const resultMoisture =
        document.getElementById('result-moisture');

    const resultThreshold =
        document.getElementById('result-threshold');

    const button =
        document.getElementById('irrigation-check-btn');


    form.addEventListener('submit', async (event) => {

        event.preventDefault();


        const crop =
            document.getElementById('irrigation-crop').value;

        const moisture =
            Number(
                document.getElementById('soil-moisture').value
            );


        if (!crop || Number.isNaN(moisture)) {

            return;

        }


        button.disabled = true;

        button.innerHTML =
            '<i class="fas fa-spinner fa-spin"></i> Checking...';


        try {

            const response =
                await fetch('/api/irrigation/check', {

                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({

                        crop: crop,

                        moisture: moisture

                    })

                });


            const data =
                await response.json();


            if (!response.ok || !data.success) {

                throw new Error(
                    data.message ||
                    'Unable to check irrigation.'
                );

            }


            // ==========================================
            // DISPLAY RESULT
            // ==========================================

            result.style.display = 'block';


            resultCrop.textContent =
                data.crop;


            resultMoisture.textContent =
                data.soilMoisture;


            resultThreshold.textContent =
                data.threshold;


            message.textContent =
                data.message;


            // ==========================================
            // STATUS
            // ==========================================

            if (data.irrigationRequired) {

                status.textContent =
                    'Irrigation Required';

                statusIcon.innerHTML =
                    '<i class="fas fa-tint"></i>';

                statusIcon.classList.add(
                    'irrigation-required'
                );

                statusIcon.classList.remove(
                    'irrigation-not-required'
                );

            } else {

                status.textContent =
                    'Irrigation Not Required';

                statusIcon.innerHTML =
                    '<i class="fas fa-check-circle"></i>';

                statusIcon.classList.add(
                    'irrigation-not-required'
                );

                statusIcon.classList.remove(
                    'irrigation-required'
                );

            }


            // Scroll to result

            result.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });


        } catch (error) {

            alert(error.message);

        } finally {

            button.disabled = false;

            button.innerHTML =
                '<i class="fas fa-search"></i> Check Irrigation';

        }

    });

});