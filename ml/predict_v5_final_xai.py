import sys
import joblib
import pandas as pd
import os
import json
import numpy as np
import shap

# ============================================================
# AGRONOMIC VALIDATION RULES
# These rules are used as validation/safety checks.
# They do NOT blindly override a high-confidence ML prediction.
# ============================================================

HARD_RULES = {
    'ph': {
        'coffee': {'max': 7.0},
        'apple': {'max': 7.2},
        'cardamom': {'max': 6.8},
        'blackpepper': {'max': 6.5},
        'tea': {'max': 6.5},
        'tomato': {'min': 5.5, 'max': 6.8} 
    },
    'temperature': {
        'cauliflower': {'max': 25.0},
        'cabbage': {'max': 26.0},
        'apple': {'max': 24.0},
        'wheat': {'max': 26.0},
        'barley': {'max': 25.0},
        'potato': {'max': 25.0},
        'tomato': {'min': 15.0, 'max': 32.0} 
    },
    'rainfall': {
        'watermelon': {'max': 600.0},
        'muskmelon': {'max': 500.0},
        'chickpea': {'max': 500.0},
        'lentil': {'max': 600.0},
        'tomato': {'max': 800.0} 
    }
}

# A high-confidence ML prediction is not automatically replaced
# by a rule that may be too strict for the training data.
VALIDATION_CONFIDENCE_THRESHOLD = 0.90


def validate_candidate(candidate, user_values):
    """
    Check whether a crop violates any available agronomic rule.
    Returns:
        (True, [])  -> no violation
        (False, [...]) -> one or more violations
    """
    candidate = str(candidate).lower()
    violations = []

    for feature, crop_rules in HARD_RULES.items():

        if candidate not in crop_rules:
            continue

        rules = crop_rules[candidate]
        value = user_values[feature]

        if 'max' in rules and value > rules['max']:
            violations.append(
                f"{feature} is above the defined maximum of "
                f"{rules['max']} for {candidate.capitalize()}."
            )

        if 'min' in rules and value < rules['min']:
            violations.append(
                f"{feature} is below the defined minimum of "
                f"{rules['min']} for {candidate.capitalize()}."
            )

    return len(violations) == 0, violations



# ============================================================
# MODEL XAI (SHAP)
# Explains the final ExtraTrees model prediction.
# ============================================================

def generate_shap_explanation(
    model,
    scaled_data,
    classes,
    final_prediction,
    feature_names
):
    """
    Generate model-based SHAP explanations for the final crop.

    For multiclass ExtraTrees, SHAP returns one explanation per
    class. We select the explanation corresponding to the final
    recommended crop.
    """

    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(scaled_data)

    class_index = list(classes).index(final_prediction)

    if isinstance(shap_values, list):
        values = np.asarray(
            shap_values[class_index][0],
            dtype=float
        )
    else:
        shap_array = np.asarray(shap_values)

        # Newer SHAP versions may return:
        # samples x features x classes
        if shap_array.ndim == 3:
            values = shap_array[0, :, class_index]

        # Some versions may return:
        # classes x samples x features
        elif shap_array.ndim == 2 and shap_array.shape[0] == len(classes):
            values = shap_array[class_index]

        else:
            values = shap_array[0]

    feature_display_names = {
        'N': 'Nitrogen',
        'P': 'Phosphorus',
        'K': 'Potassium',
        'temperature': 'Temperature',
        'humidity': 'Humidity',
        'ph': 'Soil pH',
        'rainfall': 'Rainfall'
    }

    feature_icons = {
        'N': '🌱',
        'P': '🧪',
        'K': '🌿',
        'temperature': '🌡️',
        'humidity': '💧',
        'ph': '🧪',
        'rainfall': '🌧️'
    }

    contributions = []

    for i, feature in enumerate(feature_names):
        contribution = float(values[i])

        contributions.append({
            'feature': feature,
            'name': feature_display_names[feature],
            'icon': feature_icons[feature],
            'contribution': round(contribution, 4),
            'direction': (
                'positive'
                if contribution >= 0
                else 'negative'
            )
        })

    contributions.sort(
        key=lambda item: abs(item['contribution']),
        reverse=True
    )

    return contributions


def build_model_xai_text(
    shap_contributions,
    final_prediction
):
    """
    Convert SHAP contributions into short, farmer-friendly
    explanation sentences.
    """

    positive = [
        item for item in shap_contributions
        if item['contribution'] > 0
    ]

    negative = [
        item for item in shap_contributions
        if item['contribution'] < 0
    ]

    positive.sort(
        key=lambda item: item['contribution'],
        reverse=True
    )

    negative.sort(
        key=lambda item: abs(item['contribution']),
        reverse=True
    )

    reasons = []

    for item in positive[:3]:
        reasons.append(
            f"{item['icon']} {item['name']} positively "
            f"supported the {str(final_prediction).capitalize()} prediction."
        )

    if not reasons:
        for item in negative[:3]:
            reasons.append(
                f"{item['icon']} {item['name']} had a negative "
                f"effect on the {str(final_prediction).capitalize()} prediction."
            )

    return reasons

try:

    # ============================================================
    # LOAD MODEL ARTIFACTS
    # ============================================================

    script_dir = os.path.dirname(os.path.abspath(__file__))

    model_path = os.path.join(
        script_dir,
        'crop_model_agrimind_robust.joblib'
    )

    scaler_path = os.path.join(
        script_dir,
        'scaler_agrimind_robust.joblib'
    )
    dataset_path = os.path.join(
        script_dir,
        'final_crop_dataset_v5.csv'
    )

    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    df = pd.read_csv(dataset_path)

    # ============================================================
    # INPUT VALIDATION
    # ============================================================

    if len(sys.argv) != 8:

        print(
            json.dumps({
                "error":
                    f"Expected 7 arguments, got {len(sys.argv) - 1}"
            }),
            file=sys.stderr
        )

        sys.exit(1)

    data = [
        float(arg)
        for arg in sys.argv[1:8]
    ]

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

    # ============================================================
    # 1. EXTRA TREES MODEL PREDICTION
    # ============================================================

    scaled_data = scaler.transform(input_df)

    probs = model.predict_proba(
        scaled_data
    )[0]

    classes = model.classes_

    sorted_indices = np.argsort(
        probs
    )[::-1]

    raw_index = sorted_indices[0]

    raw_prediction = classes[raw_index]

    raw_confidence = float(
        probs[raw_index]
    )

    # ============================================================
    # 2. AGRONOMIC VALIDATION
    # ============================================================

    user_values = {
        'N': data[0],
        'P': data[1],
        'K': data[2],
        'temperature': data[3],
        'humidity': data[4],
        'ph': data[5],
        'rainfall': data[6]
    }

    raw_is_valid, raw_violations = validate_candidate(
        raw_prediction,
        user_values
    )

    final_prediction = raw_prediction
    validation_status = "validated"
    validation_warning = None
    validation_checked_crop = str(raw_prediction)

    # ------------------------------------------------------------
    # IMPORTANT:
    # If the model is highly confident, do not blindly replace it.
    # Instead, report the agronomic conflict.
    # ------------------------------------------------------------

    if not raw_is_valid:

        if raw_confidence >= VALIDATION_CONFIDENCE_THRESHOLD:

            final_prediction = raw_prediction
            validation_status = "warning"
            validation_warning = (
                "The model prediction has high confidence, but "
                "the supplied conditions conflict with one or more "
                "configured agronomic validation rules."
            )

        else:

            # Low-confidence prediction:
            # choose the highest-probability candidate that passes
            # the validation rules.
            replacement_found = False

            for idx in sorted_indices:

                candidate = classes[idx]

                is_valid, violations = validate_candidate(
                    candidate,
                    user_values
                )

                if is_valid:

                    final_prediction = candidate
                    validation_status = "adjusted"
                    validation_warning = (
                        f"The original prediction ({str(raw_prediction).capitalize()}) "
                        "had low confidence and did not pass agronomic validation. "
                        f"{str(final_prediction).capitalize()} was selected as the "
                        "highest-ranked candidate that passed the configured rules."
                    )

                    replacement_found = True
                    break

            if not replacement_found:

                final_prediction = raw_prediction
                validation_status = "warning"
                validation_warning = (
                    "No valid alternative was found, so the "
                    "original model prediction was retained."
                )

    # ============================================================
    # 3. DYNAMIC EXPLANATION DATA
    # ============================================================

    crop_data = df[
        df['label'].str.lower()
        == str(final_prediction).lower()
    ]

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

    for i, feature in enumerate(column_names):

        user_val = data[i]

        vals = crop_data[feature]

        minimum = vals.min()
        maximum = vals.max()
        mean = vals.mean()

        f_range = maximum - minimum

        if minimum <= user_val <= maximum:

            dist = abs(
                user_val - mean
            )

            score = (
                100
                if f_range == 0
                else max(
                    0,
                    100 - (dist / f_range) * 100
                )
            )

        else:

            dist_from_range = min(
                abs(user_val - minimum),
                abs(user_val - maximum)
            )

            score = (
                0
                if f_range == 0
                else max(
                    0,
                    60 -
                    (dist_from_range / f_range) * 60
                )
            )

        explanations.append({

            'feature': feature,

            'name':
                feature_info[feature]['name'],

            'icon':
                feature_info[feature]['icon'],

            'value':
                round(user_val, 2),

            'unit':
                feature_info[feature]['unit'],

            'score':
                round(float(score), 2)
        })

    explanations.sort(
        key=lambda x: x['score'],
        reverse=True
    )

    reasons = []

    for item in explanations[:3]:

        strength = (
            "Excellent"
            if item['score'] >= 85
            else (
                "Strong"
                if item['score'] >= 70
                else "Suitable"
            )
        )

        reasons.append({

            "title":
                f"{item['icon']} "
                f"{strength} "
                f"{item['name']} Match",

            "text":
                f"Your "
                f"{item['name'].lower()} "
                f"of {item['value']}"
                f"{item['unit']} closely matches "
                f"typical conditions for "
                f"{str(final_prediction).capitalize()}.",

            "score":
                item['score']
        })

    # ============================================================
    # 4. MODEL XAI
    # ============================================================

    try:

        shap_contributions = generate_shap_explanation(
            model,
            scaled_data,
            classes,
            final_prediction,
            column_names
        )

        model_xai = build_model_xai_text(
            shap_contributions,
            final_prediction
        )

    except Exception as xai_error:

        # Prediction should not fail just because XAI fails.
        print(
            f"SHAP explanation warning: {str(xai_error)}",
            file=sys.stderr
        )

        shap_contributions = []
        model_xai = []


    # ============================================================
    # 5. FINAL RESPONSE
    # ============================================================

    response = {

        "crop":
            final_prediction,

        "reasons":
            reasons,

        "rawPrediction":
            raw_prediction,

        "rawConfidence":
            round(raw_confidence, 4),

        "modelXAI":
            model_xai,

        "shapContributions":
            shap_contributions,

        "validationStatus":
            validation_status,

        "validationWarning":
            validation_warning,

        "validationCheckedCrop":
            validation_checked_crop,

        "validationViolations":
            raw_violations
    }

    print(
        json.dumps(
            response,
            ensure_ascii=False
        )
    )


except Exception as e:

    print(
        json.dumps({
            "error":
                f"Python script error: {str(e)}"
        }),
        file=sys.stderr
    )

    sys.exit(1)
