// Accent metrics calculation logic (ported from Python)

const accents = ["Polish", "Dutch", "Mandarin Chinese", "English"];

const promptAccentMap = {
  1: ["Polish", "Dutch", "Mandarin Chinese", "English"],
  2: ["Dutch", "Mandarin Chinese", "English", "Polish"],
  3: ["Mandarin Chinese", "English", "Polish", "Dutch"],
  4: ["English", "Polish", "Dutch", "Mandarin Chinese"],
  5: ["Polish", "Dutch", "Mandarin Chinese", "English"]
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

    const trustSums = {};
    const pleasantSums = {};
    const counts = {};
    
    accents.forEach(accent => {
      trustSums[accent] = 0.0;
      pleasantSums[accent] = 0.0;
      counts[accent] = 0;
    });

    // Process all 5 prompts
    for (let promptNum = 1; promptNum <= 5; promptNum++) {
      promptAccentMap[promptNum].forEach((accent, position) => {
        const pos = position + 1; // 1-indexed
        const trustScore = parseFloat(response[`q${promptNum}_${pos}a`]);
        const pleasantScore = parseFloat(response[`q${promptNum}_${pos}b`]);
        
        if (!isNaN(trustScore)) {
          trustSums[accent] += trustScore;
          counts[accent] += 1;
        }
        if (!isNaN(pleasantScore)) {
          pleasantSums[accent] += pleasantScore;
          counts[accent] += 1;
        }
      });
    }

    // Calculate averages
    accents.forEach(accent => {
      accentRatings[`${accent}_trust`] = counts[accent] > 0 ? 
        trustSums[accent] / counts[accent] : NaN;
      accentRatings[`${accent}_pleasant`] = counts[accent] > 0 ? 
        pleasantSums[accent] / counts[accent] : NaN;
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
    const accentAvgs = calculateGroupAverages(accentResponses, allCols);
    Object.keys(accentAvgs).forEach(col => {
      voiceL1Avgs[col] = accentAvgs[col];
    });
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