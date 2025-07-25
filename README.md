# Accent_Guessing_Demo
A web-based demo for the Science Festival at Interspeech 2025 where participants rate accented synthetic speech on pleasantness and trustworthiness, provide their language background, and play an accent guessing game. Includes live comparisons of individual ratings against group averages and accent-based statistics.

## Script Usage

1. **Place your CSV file** (`exploring_voice_data_test.csv`) in the same folder as the script.

2. **Run the script** from the terminal, providing a participant’s `ResponseId`:

   ```bash
   python analyze_voice_ratings.py R_2dV8oFbAIyxQ75f

The script will:

- Generate a bar chart comparing the participant’s trustworthiness ratings with:
  - People of the same first language
  - All other participants
  - Native speakers of the accent being rated

- If no `ResponseId` is provided, the script will prompt you to enter one interactively.



