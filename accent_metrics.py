import pandas as pd
import matplotlib.pyplot as plt
import sys

# Load and preprocess once
df = pd.read_csv("exploring_voice_data_test.csv", sep=";")
df_clean = df.iloc[2:].copy()

rating_columns = [
    "(1.1b)-Polish",
    "(1.2b)-Flemish",
    "(1.3b)-Mandarin",
    "(1.4b)-US-English"
]

for col in rating_columns:
    df_clean[col] = pd.to_numeric(df_clean[col], errors='coerce')
df_clean["Q1"] = pd.to_numeric(df_clean["Q1"], errors='coerce')

language_map = {4: "Polish", 2: "Dutch", 1: "Mandarin", 3: "English", 5: "Other"}
df_clean["L1"] = df_clean["Q1"].map(language_map)
df_clean.loc[df_clean["L1"] == "Other", "L1"] = (
    "Other: " + df_clean["Q1_5_TEXT"].fillna("unspecified")
)

voice_column_map = {
    "(1.1b)-Polish": "Polish",
    "(1.2b)-Flemish": "Dutch",
    "(1.3b)-Mandarin": "Mandarin",
    "(1.4b)-US-English": "English"
}

# Precompute averages
same_l1_avgs = df_clean.groupby("L1")[rating_columns].mean()
all_avgs = df_clean[rating_columns].mean()
voice_l1_avgs = {v: df_clean[df_clean["L1"] == v][rating_columns].mean() for v in ["Polish", "Dutch", "Mandarin", "English"]}

def main(response_id):
    if response_id not in df_clean["ResponseId"].values:
        print(f"Response ID {response_id} not found.")
        return

    participant = df_clean[df_clean["ResponseId"] == response_id].iloc[0]
    participant_l1 = participant["L1"]

    rows = []
    for col, voice_origin in voice_column_map.items():
        participant_score = participant[col]
        rows.append({
            "Voice": voice_origin,
            "Participant": participant_score,
            "Same L1 Avg": same_l1_avgs.loc[participant_l1, col] if participant_l1 in same_l1_avgs.index else None,
            "Other L1 Avg": all_avgs[col],
            "Voice L1 Avg": voice_l1_avgs[voice_origin][col] if voice_origin in voice_l1_avgs else None
        })

    result_df = pd.DataFrame(rows)

    # Plot with Y-axis starting at 0
    ax = result_df.set_index("Voice").plot(kind="bar", figsize=(10, 6))
    ax.set_title(f"Trustworthiness Ratings – Participant {response_id} ({participant_l1})")
    ax.set_ylabel("Rating (0–5)")
    ax.set_ylim(0, 5)
    plt.xticks(rotation=0)
    plt.legend(title="Group")
    plt.tight_layout()
    plt.savefig(f"{response_id}_trustworthiness_comparison.png")
    plt.show()

    print(f"\nRatings summary for {response_id} ({participant_l1}):")
    print(result_df.to_string(index=False))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        response_id = input("Enter Response ID: ").strip()
    else:
        response_id = sys.argv[1]
    main(response_id)
