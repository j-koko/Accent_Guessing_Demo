// Voice Preferences Survey Configuration
// This file contains mappings and labels for the voice preferences survey data

export const questionLabels = {
  // Demographics
  'q1_language': 'Native Language',
  'q1_text': 'Other Language (if specified)',
  'q2': 'English Proficiency Level',
  'q3': 'Gender',
  
  // Voice Rating Questions - Q1 
  'q1_1a': 'Voice Sample 1A Rating',
  'q1_1b': 'Voice Sample 1B Rating',
  'q1_2a': 'Voice Sample 2A Rating',
  'q1_2b': 'Voice Sample 2B Rating',
  'q1_3a': 'Voice Sample 3A Rating',
  'q1_3b': 'Voice Sample 3B Rating',
  'q1_4a': 'Voice Sample 4A Rating',
  'q1_4b': 'Voice Sample 4B Rating',
  
  // Voice Rating Questions - Q2 
  'q2_1a': 'Q2 Voice Sample 1A Rating',
  'q2_1b': 'Q2 Voice Sample 1B Rating',
  'q2_2a': 'Q2 Voice Sample 2A Rating',
  'q2_2b': 'Q2 Voice Sample 2B Rating',
  'q2_3a': 'Q2 Voice Sample 3A Rating',
  'q2_3b': 'Q2 Voice Sample 3B Rating',
  'q2_4a': 'Q2 Voice Sample 4A Rating',
  'q2_4b': 'Q2 Voice Sample 4B Rating',
  
  // Voice Rating Questions - Q3
  'q3_1a': 'Q3 Voice Sample 1A Rating',
  'q3_1b': 'Q3 Voice Sample 1B Rating',
  'q3_2a': 'Q3 Voice Sample 2A Rating',
  'q3_2b': 'Q3 Voice Sample 2B Rating',
  'q3_3a': 'Q3 Voice Sample 3A Rating',
  'q3_3b': 'Q3 Voice Sample 3B Rating',
  'q3_4a': 'Q3 Voice Sample 4A Rating',
  'q3_4b': 'Q3 Voice Sample 4B Rating',
  
  // Voice Rating Questions - Q4
  'q4_1a': 'Q4 Voice Sample 1A Rating',
  'q4_1b': 'Q4 Voice Sample 1B Rating',
  'q4_2a': 'Q4 Voice Sample 2A Rating',
  'q4_2b': 'Q4 Voice Sample 2B Rating',
  'q4_3a': 'Q4 Voice Sample 3A Rating',
  'q4_3b': 'Q4 Voice Sample 3B Rating',
  'q4_4a': 'Q4 Voice Sample 4A Rating',
  'q4_4b': 'Q4 Voice Sample 4B Rating',
  
  // Voice Rating Questions - Q5
  'q5_1a': 'Q5 Voice Sample 1A Rating',
  'q5_1b': 'Q5 Voice Sample 1B Rating',
  'q5_2a': 'Q5 Voice Sample 2A Rating',
  'q5_2b': 'Q5 Voice Sample 2B Rating',
  'q5_3a': 'Q5 Voice Sample 3A Rating',
  'q5_3b': 'Q5 Voice Sample 3B Rating',
  'q5_4a': 'Q5 Voice Sample 4A Rating',
  'q5_4b': 'Q5 Voice Sample 4B Rating'
}

export const questionCategories = {
  demographics: {
    title: 'Demographics',
    questions: ['q1_language', 'q1_text', 'q2', 'q3'],
    description: 'Participant background information'
  },
  q1_ratings: {
    title: 'Voice Ratings - Question Set 1',
    questions: ['q1_1a', 'q1_1b', 'q1_2a', 'q1_2b', 'q1_3a', 'q1_3b', 'q1_4a', 'q1_4b'],
    description: 'Ratings for first set of voice samples'
  },
  q2_ratings: {
    title: 'Voice Ratings - Question Set 2',
    questions: ['q2_1a', 'q2_1b', 'q2_2a', 'q2_2b', 'q2_3a', 'q2_3b', 'q2_4a', 'q2_4b'],
    description: 'Ratings for second set of voice samples'
  },
  q3_ratings: {
    title: 'Voice Ratings - Question Set 3',
    questions: ['q3_1a', 'q3_1b', 'q3_2a', 'q3_2b', 'q3_3a', 'q3_3b', 'q3_4a', 'q3_4b'],
    description: 'Ratings for third set of voice samples'
  },
  q4_ratings: {
    title: 'Voice Ratings - Question Set 4',
    questions: ['q4_1a', 'q4_1b', 'q4_2a', 'q4_2b', 'q4_3a', 'q4_3b', 'q4_4a', 'q4_4b'],
    description: 'Ratings for fourth set of voice samples'
  },
  q5_ratings: {
    title: 'Voice Ratings - Question Set 5',
    questions: ['q5_1a', 'q5_1b', 'q5_2a', 'q5_2b', 'q5_3a', 'q5_3b', 'q5_4a', 'q5_4b'],
    description: 'Ratings for fifth set of voice samples'
  }
}

export const ratingScale = {
  1: 'Very Poor',
  2: 'Poor', 
  3: 'Neutral',
  4: 'Good',
  5: 'Excellent'
}

export const proficiencyLevels = {
  'Basic': 'Basic',
  'Intermediate': 'Intermediate', 
  'Advanced': 'Advanced',
  'Fluent': 'Fluent',
  'Bilingual': 'Bilingual',
  'Native': 'Native'
}

export const genderOptions = {
  'Male': 'Male',
  'Female': 'Female',
  'I prefer not to tell': 'Prefer not to say'
}

// Helper function to get display label for a question
export function getQuestionLabel(questionKey) {
  return questionLabels[questionKey] || questionKey
}

// Helper function to get category for a question
export function getQuestionCategory(questionKey) {
  for (const [categoryKey, category] of Object.entries(questionCategories)) {
    if (category.questions.includes(questionKey)) {
      return categoryKey
    }
  }
  return 'other'
}

// Helper function to format rating values
export function formatRatingValue(value) {
  if (!value) return 'No rating'
  return `${value} - ${ratingScale[value] || 'Unknown'}`
}

// Helper function to check if a question is a rating question
export function isRatingQuestion(questionKey) {
  return questionKey.match(/^q[1-5]_\d+[ab]$/)
}

// Helper function to get all questions in a specific category
export function getQuestionsInCategory(categoryKey) {
  return questionCategories[categoryKey]?.questions || []
}

// Get all valid column names from the schema
export function getAllValidColumns() {
  return Object.keys(questionLabels)
}

// Get all rating columns (numeric questions)
export function getRatingColumns() {
  return getAllValidColumns().filter(isRatingQuestion)
}

// Get all text columns (non-rating questions)
export function getTextColumns() {
  return getAllValidColumns().filter(col => !isRatingQuestion(col))
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