import pandas as pd
import matplotlib.pyplot as plt
import sys

# Load and preprocess once
df = pd.read_csv("voice_preferences_data.csv", sep=";")
df["L1"] = df["q1_language"].astype(str)
df.loc[df["L1"].str.lower().str.startswith("other"), "L1"] = "Other: " + df["q1_text"].fillna("unspecified")

accents = ["Polish", "Dutch", "Mandarin Chinese", "English"]
prompt_accent_map = {
    1: ["Polish", "Dutch", "Mandarin Chinese", "English"],
    2: ["Dutch", "Mandarin Chinese", "English", "Polish"],
    3: ["Mandarin Chinese", "English", "Polish", "Dutch"],
    4: ["English", "Polish", "Dutch", "Mandarin Chinese"],
    5: ["Polish", "Dutch", "Mandarin Chinese", "English"]
}

for accent in accents:
    df[f"{accent}_trust"] = 0.0
    df[f"{accent}_pleasant"] = 0.0

# Precompute averages
for index, row in df.iterrows():
    trust_sums = {accent: 0.0 for accent in accents}
    pleasant_sums = {accent: 0.0 for accent in accents}
    counts = {accent: 0 for accent in accents}

    for prompt_num in range(1, 6):
        for pos, accent in enumerate(prompt_accent_map[prompt_num], 1):
            trust_score = pd.to_numeric(row.get(f"q{prompt_num}_{pos}a"), errors="coerce")
            pleasant_score = pd.to_numeric(row.get(f"q{prompt_num}_{pos}b"), errors="coerce")
            if pd.notna(trust_score):
                trust_sums[accent] += trust_score
                counts[accent] += 1
            if pd.notna(pleasant_score):
                pleasant_sums[accent] += pleasant_score
                counts[accent] += 1

    for accent in accents:
        df.at[index, f"{accent}_trust"] = trust_sums[accent] / counts[accent] if counts[accent] > 0 else float("nan")
        df.at[index, f"{accent}_pleasant"] = pleasant_sums[accent] / counts[accent] if counts[accent] > 0 else float(
            "nan")

def main(response_id):
    if response_id not in df["ResponseId"].values:
        print(f"Response ID {response_id} not found.")
        return

    participant = df[df["ResponseId"] == response_id].iloc[0]
    participant_l1 = participant["L1"]

    trust_cols = [f"{a}_trust" for a in accents]
    pleasant_cols = [f"{a}_pleasant" for a in accents]
    same_l1_avgs = df.groupby("L1")[trust_cols + pleasant_cols].mean()
    other_l1_avgs = df[df["L1"] != participant_l1][trust_cols + pleasant_cols].mean()
    voice_l1_avgs = df[df["L1"].isin(accents)][trust_cols + pleasant_cols].groupby(df["L1"]).mean()

    trust_data = {
        "Voice": accents,
        "Participant": [participant[f"{a}_trust"] for a in accents],
        "Same L1 avg": [
            same_l1_avgs.loc[participant_l1, f"{a}_trust"] if participant_l1 in same_l1_avgs.index else float("nan") for
            a in accents],
        "Other L1 avg": [other_l1_avgs[f"{a}_trust"] for a in accents],
        "Voice L1 avg": [voice_l1_avgs.loc[a, f"{a}_trust"] if a in voice_l1_avgs.index else float("nan") for a in
                         accents]
    }
    pleasant_data = {
        "Voice": accents,
        "Participant": [participant[f"{a}_pleasant"] for a in accents],
        "Same L1 avg": [
            same_l1_avgs.loc[participant_l1, f"{a}_pleasant"] if participant_l1 in same_l1_avgs.index else float("nan")
            for a in accents],
        "Other L1 avg": [other_l1_avgs[f"{a}_pleasant"] for a in accents],
        "Voice L1 avg": [voice_l1_avgs.loc[a, f"{a}_pleasant"] if a in voice_l1_avgs.index else float("nan") for a in
                         accents]
    }
    trust_df = pd.DataFrame(trust_data)
    pleasant_df = pd.DataFrame(pleasant_data)

    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 10), sharex=True)
    fig.suptitle(f"Participant {response_id} ({participant_l1})")

    trust_df.set_index("Voice")[["Participant", "Same L1 avg", "Other L1 avg", "Voice L1 avg"]].plot(
        kind="bar", ax=ax1)
    ax1.set_title("Trustworthiness Ratings")
    ax1.set_ylabel("Rating (0–5)")
    ax1.set_ylim(0, 5)
    ax1.set_xlabel("Voice")
    ax1.legend(title="Group")

    pleasant_df.set_index("Voice")[["Participant", "Same L1 avg", "Other L1 avg", "Voice L1 avg"]].plot(
        kind="bar", ax=ax2)
    ax2.set_title("Pleasantness Ratings")
    ax2.set_ylabel("Rating (0–5)")
    ax2.set_ylim(0, 5)
    ax2.set_xlabel("Voice")
    ax2.legend(title="Group")

    plt.xticks(rotation=0)
    plt.tight_layout()
    plt.savefig(f"{response_id}_ratings_comparison.png")
    plt.show()

    print(f"\nRatings summary for {response_id} ({participant_l1}):")
    print('Trustworthiness \n', trust_df.to_string(index=False))
    print('Pleasantness \n', pleasant_df.to_string(index=False))


if __name__ == "__main__":
    if len(sys.argv) < 2:
        response_id = input("Enter Response ID: ").strip()
    else:
        response_id = sys.argv[1]
    main(response_id)
