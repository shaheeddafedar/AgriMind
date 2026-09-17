import sys
import joblib
import pandas as pd
import os
import json
import numpy as np


try:

    # ==========================================
    # 1. FILE PATHS
    # ==========================================

    script_dir = os.path.dirname(os.path.abspath(__file__))

    model_path = os.path.join(
        script_dir,
        'crop_model_v2.joblib'
    )

    scaler_path = os.path.join(
        script_dir,
        'scaler_v2.joblib'
    )

    dataset_path = os.path.join(
        script_dir,
        'final_crop_dataset_improved.csv'
    )


    # ==========================================
    # 2. LOAD MODEL, SCALER AND DATASET
    # ==========================================

    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)

    df = pd.read_csv(dataset_path)


    # ==========================================
    # 3. CHECK INPUT
    # ==========================================

    if len(sys.argv) != 8:

        print(
            json.dumps({
                "error":
                f"Incorrect number of arguments. Expected 7, got {len(sys.argv) - 1}"
            }),
            file=sys.stderr
        )

        sys.exit(1)


    # ==========================================
    # 4. GET USER INPUT
    # ==========================================

    data = [float(arg) for arg in sys.argv[1:8]]

    column_names = [

        'N',
        'P',
        'K',
        'temperature',
        'humidity',
        'ph',
        'rainfall'

    ]

    input_df = pd.DataFrame(
        [data],
        columns=column_names
    )


    # ==========================================
    # 5. SCALE + PREDICT
    # ==========================================

    scaled_data = scaler.transform(input_df)

    prediction = model.predict(
        scaled_data
    )[0]


    # ==========================================
    # 6. GET PREDICTED CROP PROFILE
    # ==========================================

    crop_data = df[
        df['label'].str.lower()
        ==
        str(prediction).lower()
    ]


    if crop_data.empty:

        raise Exception(
            f"No training data found for predicted crop: {prediction}"
        )


    # ==========================================
    # 7. CALCULATE FEATURE MATCH SCORES
    # ==========================================

    explanations = []

    feature_info = {

        'N': {
            'name': 'Nitrogen Level',
            'icon': '🌱',
            'unit': ''
        },

        'P': {
            'name': 'Phosphorus Level',
            'icon': '🧪',
            'unit': ''
        },

        'K': {
            'name': 'Potassium Level',
            'icon': '🌿',
            'unit': ''
        },

        'temperature': {
            'name': 'Temperature',
            'icon': '🌡️',
            'unit': '°C'
        },

        'humidity': {
            'name': 'Humidity',
            'icon': '💧',
            'unit': '%'
        },

        'ph': {
            'name': 'Soil pH',
            'icon': '🧪',
            'unit': ''
        },

        'rainfall': {
            'name': 'Rainfall',
            'icon': '🌧️',
            'unit': ' mm'
        }

    }


    # ==========================================
    # 8. COMPARE INPUT WITH CROP PROFILE
    # ==========================================

    for i, feature in enumerate(column_names):

        user_value = data[i]

        values = crop_data[feature]

        minimum = values.min()
        maximum = values.max()

        mean = values.mean()

        # Range of this feature
        feature_range = maximum - minimum


        # --------------------------------------
        # Calculate match score
        # --------------------------------------

        if minimum <= user_value <= maximum:

            # Distance from the crop's mean
            distance = abs(user_value - mean)

            # Avoid division by zero
            if feature_range == 0:

                score = 100

            else:

                score = max(
                    0,
                    100 - (distance / feature_range) * 100
                )

        else:

            # User value outside crop profile

            if feature_range == 0:

                score = 0

            else:

                distance_from_range = min(
                    abs(user_value - minimum),
                    abs(user_value - maximum)
                )

                score = max(
                    0,
                    60 - (
                        distance_from_range /
                        feature_range
                    ) * 60
                )


        explanations.append({

            'feature': feature,

            'name': feature_info[feature]['name'],

            'icon': feature_info[feature]['icon'],

            'value': round(user_value, 2),

            'unit': feature_info[feature]['unit'],

            'min': round(float(minimum), 2),

            'max': round(float(maximum), 2),

            'mean': round(float(mean), 2),

            'score': round(float(score), 2)

        })


    # ==========================================
    # 9. SELECT TOP 3 STRONGEST MATCHES
    # ==========================================

    explanations.sort(
        key=lambda x: x['score'],
        reverse=True
    )

    top_three = explanations[:3]


    # ==========================================
    # 10. CREATE HUMAN-READABLE REASONS
    # ==========================================

    reasons = []

    for item in top_three:

        name = item['name']
        value = item['value']
        unit = item['unit']

        crop_name = str(prediction).capitalize()


        if item['score'] >= 85:

            strength = "Excellent"

        elif item['score'] >= 70:

            strength = "Strong"

        else:

            strength = "Suitable"


        # Create proper explanation

        reason_text = (
            f": Your {name.lower()} of "
            f"{value}{unit} closely matches "
            f"the typical {name.lower()} conditions "
            f"for {crop_name}."
        )


        reasons.append({

            "title":
            f"{item['icon']} {strength} {name} Match",

            "text":
            reason_text,

            "score":
            item['score']

        })


    # ==========================================
    # 11. OUTPUT RESULT
    # ==========================================

    print(
        json.dumps({

            "crop": prediction,

            "reasons": reasons

        })

    )


# ==========================================
# ERROR HANDLING
# ==========================================

except FileNotFoundError:

    print(
        json.dumps({
            "error":
            "Model, scaler, or dataset file not found."
        }),
        file=sys.stderr
    )

    sys.exit(1)


except Exception as e:

    print(
        json.dumps({
            "error":
            f"Python script error: {str(e)}"
        }),
        file=sys.stderr
    )

    sys.exit(1)
