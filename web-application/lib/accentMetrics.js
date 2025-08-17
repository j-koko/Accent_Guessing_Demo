// Accent metrics calculation logic (ported from Python)

const accents = ["Polish", "Dutch", "Mandarin Chinese", "English"];

// For Q2 only - mapping positions to accents
const q2AccentMap = {
  1: "Dutch", 
  2: "Mandarin Chinese", 
  3: "English", 
  4: "Polish"
};

export function preprocessResponses(allResponses) {
  return allResponses.map(response => {
    // Create L1 field from q1_language
    let L1 = String(response.q1_language || '');
    
    // Extract English part before "|" separator (handles both old and new formats)
    if (L1.includes('|')) {
      L1 = L1.split('|')[0].trim();
    }
    
    if (L1.toLowerCase().startsWith('other')) {
      L1 = `Other: ${response.q1_text || 'unspecified'}`;
    }

    // Calculate average ratings for each accent
    const accentRatings = {};
    
    accents.forEach(accent => {
      accentRatings[`${accent}_trust`] = 0.0;
      accentRatings[`${accent}_pleasant`] = 0.0;
    });

    // Calculate ratings for Q2 data only
    accents.forEach(accent => {
      const position = Object.keys(q2AccentMap).find(pos => q2AccentMap[pos] === accent);
      accentRatings[`${accent}_trust`] = parseFloat(response[`q2_${position}a`]) || NaN;
      accentRatings[`${accent}_pleasant`] = parseFloat(response[`q2_${position}b`]) || NaN;
    });

    return {
      ...response,
      L1,
      ...accentRatings
    };
  });
}

export function calculateAccentMetrics(responseId, allResponses) {
  // Preprocess all responses
  const processedResponses = preprocessResponses(allResponses);
  
  // Find the participant
  const participant = processedResponses.find(r => r.ResponseId === responseId);
  if (!participant) {
    throw new Error(`Response ID ${responseId} not found.`);
  }

  const participantL1 = participant.L1;

  // Calculate trust and pleasant columns
  const trustCols = accents.map(a => `${a}_trust`);
  const pleasantCols = accents.map(a => `${a}_pleasant`);
  const allCols = [...trustCols, ...pleasantCols];

  // Calculate averages by L1 groups
  const sameL1Responses = processedResponses.filter(r => r.L1 === participantL1);
  const otherL1Responses = processedResponses.filter(r => r.L1 !== participantL1);
  const voiceL1Responses = processedResponses.filter(r => accents.includes(r.L1));

  // Helper function to calculate group averages
  function calculateGroupAverages(responses, columns) {
    const averages = {};
    columns.forEach(col => {
      const validValues = responses
        .map(r => r[col])
        .filter(val => !isNaN(val) && val !== null && val !== undefined);
      
      averages[col] = validValues.length > 0 ? 
        validValues.reduce((sum, val) => sum + val, 0) / validValues.length : NaN;
    });
    return averages;
  }

  // Calculate averages for different groups
  const sameL1Avgs = calculateGroupAverages(sameL1Responses, allCols);
  const otherL1Avgs = calculateGroupAverages(otherL1Responses, allCols);
  
  // For voice L1 averages, group by L1 and calculate averages
  const voiceL1Avgs = {};
  accents.forEach(accent => {
    const accentResponses = voiceL1Responses.filter(r => r.L1 === accent);
    const trustCol = `${accent}_trust`;
    const pleasantCol = `${accent}_pleasant`;
    const accentAvgs = calculateGroupAverages(accentResponses, [trustCol, pleasantCol]);
    voiceL1Avgs[trustCol] = accentAvgs[trustCol];
    voiceL1Avgs[pleasantCol] = accentAvgs[pleasantCol];
  });

  // Prepare data for charts
  const trustData = {
    accents: accents,
    data: accents.map(accent => ({
      accent,
      participant: participant[`${accent}_trust`] || 0,
      sameL1Avg: sameL1Avgs[`${accent}_trust`] || 0,
      otherL1Avg: otherL1Avgs[`${accent}_trust`] || 0,
      voiceL1Avg: voiceL1Avgs[`${accent}_trust`] || 0
    }))
  };

  const pleasantData = {
    accents: accents,
    data: accents.map(accent => ({
      accent,
      participant: participant[`${accent}_pleasant`] || 0,
      sameL1Avg: sameL1Avgs[`${accent}_pleasant`] || 0,
      otherL1Avg: otherL1Avgs[`${accent}_pleasant`] || 0,
      voiceL1Avg: voiceL1Avgs[`${accent}_pleasant`] || 0
    }))
  };

  return {
    participantL1,
    trustData,
    pleasantData,
    metadata: {
      totalResponses: processedResponses.length,
      sameL1Count: sameL1Responses.length,
      otherL1Count: otherL1Responses.length
    }
  };
}