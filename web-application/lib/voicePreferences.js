// Voice Preferences Survey Configuration
// Minimal configuration needed for the accent ratings report

const questionLabels = {
  // Demographics
  'q1_language': 'Native Language',
  'q1_text': 'Other Language (if specified)',
  'q2': 'English Proficiency Level',
  'q3': 'Gender',
  
  // Voice Rating Questions - Q1 through Q5
  'q1_1a': 'Q1 Voice 1A', 'q1_1b': 'Q1 Voice 1B', 'q1_2a': 'Q1 Voice 2A', 'q1_2b': 'Q1 Voice 2B',
  'q1_3a': 'Q1 Voice 3A', 'q1_3b': 'Q1 Voice 3B', 'q1_4a': 'Q1 Voice 4A', 'q1_4b': 'Q1 Voice 4B',
  'q2_1a': 'Q2 Voice 1A', 'q2_1b': 'Q2 Voice 1B', 'q2_2a': 'Q2 Voice 2A', 'q2_2b': 'Q2 Voice 2B',
  'q2_3a': 'Q2 Voice 3A', 'q2_3b': 'Q2 Voice 3B', 'q2_4a': 'Q2 Voice 4A', 'q2_4b': 'Q2 Voice 4B',
  'q3_1a': 'Q3 Voice 1A', 'q3_1b': 'Q3 Voice 1B', 'q3_2a': 'Q3 Voice 2A', 'q3_2b': 'Q3 Voice 2B',
  'q3_3a': 'Q3 Voice 3A', 'q3_3b': 'Q3 Voice 3B', 'q3_4a': 'Q3 Voice 4A', 'q3_4b': 'Q3 Voice 4B',
  'q4_1a': 'Q4 Voice 1A', 'q4_1b': 'Q4 Voice 1B', 'q4_2a': 'Q4 Voice 2A', 'q4_2b': 'Q4 Voice 2B',
  'q4_3a': 'Q4 Voice 3A', 'q4_3b': 'Q4 Voice 3B', 'q4_4a': 'Q4 Voice 4A', 'q4_4b': 'Q4 Voice 4B',
  'q5_1a': 'Q5 Voice 1A', 'q5_1b': 'Q5 Voice 1B', 'q5_2a': 'Q5 Voice 2A', 'q5_2b': 'Q5 Voice 2B',
  'q5_3a': 'Q5 Voice 3A', 'q5_3b': 'Q5 Voice 3B', 'q5_4a': 'Q5 Voice 4A', 'q5_4b': 'Q5 Voice 4B'
}

// Get all valid column names from the schema
export function getAllValidColumns() {
  return Object.keys(questionLabels)
}

// Helper function to check if a question is a rating question
function isRatingQuestion(questionKey) {
  return questionKey.match(/^q[1-5]_\d+[ab]$/)
}

// Process and validate question data for API
export function processQuestionData(data) {
  const validColumns = getAllValidColumns()
  const processed = {}
  
  Object.keys(data).forEach(key => {
    if (validColumns.includes(key)) {
      // Convert string numbers to integers for rating columns
      if (isRatingQuestion(key)) {
        processed[key] = data[key] ? parseInt(data[key]) : null
      } else {
        processed[key] = data[key]
      }
    }
  })
  
  return processed
}