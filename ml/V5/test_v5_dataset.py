import pandas as pd
import subprocess
import json
import sys
import os

df = pd.read_csv("final_crop_dataset_v5.csv")

samples = df.sample(20, random_state=42)

correct = 0
successful = 0

print("\n===== V5 DATASET TEST =====\n")

# Force UTF-8 for the Python subprocess
env = os.environ.copy()
env["PYTHONIOENCODING"] = "utf-8"
env["PYTHONUTF8"] = "1"

for i, (_, row) in enumerate(samples.iterrows(), 1):

    args = [
        "predict_v5_final_xai.py",
        str(row["N"]),
        str(row["P"]),
        str(row["K"]),
        str(row["temperature"]),
        str(row["humidity"]),
        str(row["ph"]),
        str(row["rainfall"])
    ]

    process = subprocess.run(
        [sys.executable] + args,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        env=env
    )

    if process.returncode != 0:

        print(f"\n{i:02d}. PYTHON ERROR")
        print(process.stderr)

        continue

    try:

        result = json.loads(process.stdout)

        actual = str(row["label"]).lower()
        predicted = str(result.get("crop", "")).lower()

        confidence = (
            float(result.get("rawConfidence", 0)) * 100
        )

        validation = result.get(
            "validationStatus",
            "unknown"
        )

        is_correct = actual == predicted

        successful += 1

        if is_correct:
            correct += 1

        print(
            f"{i:02d}. "
            f"Actual: {actual:<15} | "
            f"Predicted: {predicted:<15} | "
            f"Confidence: {confidence:6.2f}% | "
            f"Validation: {validation:<10} | "
            f"{'CORRECT' if is_correct else 'WRONG'}"
        )

    except Exception as e:

        print(f"\n{i:02d}. JSON ERROR")
        print("STDOUT:")
        print(process.stdout)
        print("STDERR:")
        print(process.stderr)
        print("ERROR:", e)

print("\n============================")

if successful > 0:
    print(f"Successful tests: {successful}/20")
    print(f"Correct: {correct}/{successful}")
    print(
        f"Accuracy: {(correct / successful) * 100:.2f}%"
    )
else:
    print("No successful predictions.")

print("============================\n")
