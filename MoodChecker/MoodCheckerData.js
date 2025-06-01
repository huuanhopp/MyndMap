// MoodCheckerData.js
// This file contains the expanded conversation data structure and utility functions

// Helper function to determine time of day
export const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };
  
  // Expanded mood options with more nuanced choices
  export const moodOptions = {
    morning: [
      { key: 'energetic', translationKey: 'moodChecker.moods.energetic' },
      { key: 'calm', translationKey: 'moodChecker.moods.calm' },
      { key: 'anxious', translationKey: 'moodChecker.moods.anxious' },
      { key: 'tired', translationKey: 'moodChecker.moods.tired' },
      { key: 'optimistic', translationKey: 'moodChecker.moods.optimistic' },
      { key: 'overwhelmed', translationKey: 'moodChecker.moods.overwhelmed' }
    ],
    afternoon: [
      { key: 'focused', translationKey: 'moodChecker.moods.focused' },
      { key: 'distracted', translationKey: 'moodChecker.moods.distracted' },
      { key: 'stressed', translationKey: 'moodChecker.moods.stressed' },
      { key: 'accomplished', translationKey: 'moodChecker.moods.accomplished' },
      { key: 'frustrated', translationKey: 'moodChecker.moods.frustrated' },
      { key: 'balanced', translationKey: 'moodChecker.moods.balanced' }
    ],
    evening: [
      { key: 'relaxed', translationKey: 'moodChecker.moods.relaxed' },
      { key: 'exhausted', translationKey: 'moodChecker.moods.exhausted' },
      { key: 'reflective', translationKey: 'moodChecker.moods.reflective' },
      { key: 'restless', translationKey: 'moodChecker.moods.restless' },
      { key: 'satisfied', translationKey: 'moodChecker.moods.satisfied' },
      { key: 'disconnected', translationKey: 'moodChecker.moods.disconnected' }
    ],
    // These options are always available
    common: [
      { key: 'mixed', translationKey: 'moodChecker.moods.mixed' },
      { key: 'neutral', translationKey: 'moodChecker.moods.neutral' }
    ]
  };
  
  // Expanded issue categories with new options
  export const issueCategories = [
    { key: 'workStress', translationKey: 'moodChecker.issues.workStress' },
    { key: 'personalIssues', translationKey: 'moodChecker.issues.personalIssues' },
    { key: 'healthConcerns', translationKey: 'moodChecker.issues.healthConcerns' },
    { key: 'creativeBlocks', translationKey: 'moodChecker.issues.creativeBlocks' },
    { key: 'socialChallenges', translationKey: 'moodChecker.issues.socialChallenges' },
    { key: 'environmentalStressors', translationKey: 'moodChecker.issues.environmentalStressors' },
    { key: 'notSure', translationKey: 'moodChecker.issues.notSure' }
  ];
  
  // Specific issues for each category
  export const specificIssues = {
    workStress: [
      { key: 'overwhelmingWorkload', translationKey: 'moodChecker.workStressIssues.overwhelmingWorkload' },
      { key: 'difficultColleagues', translationKey: 'moodChecker.workStressIssues.difficultColleagues' },
      { key: 'lackOfWorkLifeBalance', translationKey: 'moodChecker.workStressIssues.lackOfWorkLifeBalance' },
      { key: 'jobInsecurity', translationKey: 'moodChecker.workStressIssues.jobInsecurity' },
      { key: 'careerStagnation', translationKey: 'moodChecker.workStressIssues.careerStagnation' },
      { key: 'toxicWorkEnvironment', translationKey: 'moodChecker.workStressIssues.toxicWorkEnvironment' }
    ],
    personalIssues: [
      { key: 'relationshipProblems', translationKey: 'moodChecker.personalIssues.relationshipProblems' },
      { key: 'familyConflicts', translationKey: 'moodChecker.personalIssues.familyConflicts' },
      { key: 'financialStress', translationKey: 'moodChecker.personalIssues.financialStress' },
      { key: 'lowSelfEsteem', translationKey: 'moodChecker.personalIssues.lowSelfEsteem' },
      { key: 'identityConcerns', translationKey: 'moodChecker.personalIssues.identityConcerns' },
      { key: 'lifePurpose', translationKey: 'moodChecker.personalIssues.lifePurpose' }
    ],
    healthConcerns: [
      { key: 'chronicIllness', translationKey: 'moodChecker.healthConcerns.chronicIllness' },
      { key: 'mentalHealth', translationKey: 'moodChecker.healthConcerns.mentalHealth' },
      { key: 'sleepProblems', translationKey: 'moodChecker.healthConcerns.sleepProblems' },
      { key: 'poorDietExerciseHabits', translationKey: 'moodChecker.healthConcerns.poorDietExerciseHabits' },
      { key: 'substanceUse', translationKey: 'moodChecker.healthConcerns.substanceUse' },
      { key: 'exhaustion', translationKey: 'moodChecker.healthConcerns.exhaustion' }
    ],
    creativeBlocks: [
      { key: 'lackOfInspiration', translationKey: 'moodChecker.creativeBlocksIssues.lackOfInspiration' },
      { key: 'perfectionism', translationKey: 'moodChecker.creativeBlocksIssues.perfectionism' },
      { key: 'fearOfFailure', translationKey: 'moodChecker.creativeBlocksIssues.fearOfFailure' },
      { key: 'projectOverwhelm', translationKey: 'moodChecker.creativeBlocksIssues.projectOverwhelm' },
      { key: 'impostersyndrome', translationKey: 'moodChecker.creativeBlocksIssues.impostersyndrome' }
    ],
    socialChallenges: [
      { key: 'socialAnxiety', translationKey: 'moodChecker.socialChallengesIssues.socialAnxiety' },
      { key: 'loneliness', translationKey: 'moodChecker.socialChallengesIssues.loneliness' },
      { key: 'conflictResolution', translationKey: 'moodChecker.socialChallengesIssues.conflictResolution' },
      { key: 'establishingBoundaries', translationKey: 'moodChecker.socialChallengesIssues.establishingBoundaries' },
      { key: 'workplaceRelationships', translationKey: 'moodChecker.socialChallengesIssues.workplaceRelationships' }
    ],
    environmentalStressors: [
      { key: 'livingConditions', translationKey: 'moodChecker.environmentalStressorsIssues.livingConditions' },
      { key: 'noiseDisturbances', translationKey: 'moodChecker.environmentalStressorsIssues.noiseDisturbances' },
      { key: 'clutterDisorganization', translationKey: 'moodChecker.environmentalStressorsIssues.clutterDisorganization' },
      { key: 'lackOfNature', translationKey: 'moodChecker.environmentalStressorsIssues.lackOfNature' },
      { key: 'commutingStress', translationKey: 'moodChecker.environmentalStressorsIssues.commutingStress' }
    ],
    notSure: [
      { key: 'feelingLost', translationKey: 'moodChecker.notSureIssues.feelingLost' },
      { key: 'lackOfMotivation', translationKey: 'moodChecker.notSureIssues.lackOfMotivation' },
      { key: 'generalAnxiety', translationKey: 'moodChecker.notSureIssues.generalAnxiety' },
      { key: 'unexplainedMoodSwings', translationKey: 'moodChecker.notSureIssues.unexplainedMoodSwings' },
      { key: 'emotionalNumbness', translationKey: 'moodChecker.notSureIssues.emotionalNumbness' },
      { key: 'unidentifiedStress', translationKey: 'moodChecker.notSureIssues.unidentifiedStress' }
    ]
  };
  
  // Intensity levels with expanded options
  export const intensityLevels = [
    { key: 'veryMild', translationKey: 'moodChecker.intensityLevels.veryMild' },
    { key: 'mild', translationKey: 'moodChecker.intensityLevels.mild' },
    { key: 'moderate', translationKey: 'moodChecker.intensityLevels.moderate' },
    { key: 'significant', translationKey: 'moodChecker.intensityLevels.significant' },
    { key: 'intense', translationKey: 'moodChecker.intensityLevels.intense' }
  ];
  
  // Support resources for different categories
  export const supportResources = {
    workStress: [
      { key: 'careerCoaching', translationKey: 'moodChecker.supportResources.workStress.careerCoaching' },
      { key: 'stressManagementCourse', translationKey: 'moodChecker.supportResources.workStress.stressManagementCourse' },
      { key: 'boundariesWorkshop', translationKey: 'moodChecker.supportResources.workStress.boundariesWorkshop' }
    ],
    personalIssues: [
      { key: 'therapist', translationKey: 'moodChecker.supportResources.personalIssues.therapist' },
      { key: 'supportGroups', translationKey: 'moodChecker.supportResources.personalIssues.supportGroups' },
      { key: 'relationshipCounseling', translationKey: 'moodChecker.supportResources.personalIssues.relationshipCounseling' }
    ],
    healthConcerns: [
      { key: 'medicalProfessional', translationKey: 'moodChecker.supportResources.healthConcerns.medicalProfessional' },
      { key: 'therapist', translationKey: 'moodChecker.supportResources.healthConcerns.therapist' },
      { key: 'wellnessCoach', translationKey: 'moodChecker.supportResources.healthConcerns.wellnessCoach' }
    ],
    creativeBlocks: [
      { key: 'creativeCoaching', translationKey: 'moodChecker.supportResources.creativeBlocks.creativeCoaching' },
      { key: 'artistCommunities', translationKey: 'moodChecker.supportResources.creativeBlocks.artistCommunities' },
      { key: 'creativityWorkshops', translationKey: 'moodChecker.supportResources.creativeBlocks.creativityWorkshops' }
    ],
    socialChallenges: [
      { key: 'socialSkillsGroup', translationKey: 'moodChecker.supportResources.socialChallenges.socialSkillsGroup' },
      { key: 'therapist', translationKey: 'moodChecker.supportResources.socialChallenges.therapist' },
      { key: 'communityEvents', translationKey: 'moodChecker.supportResources.socialChallenges.communityEvents' }
    ],
    environmentalStressors: [
      { key: 'professionalOrganizer', translationKey: 'moodChecker.supportResources.environmentalStressors.professionalOrganizer' },
      { key: 'housingResources', translationKey: 'moodChecker.supportResources.environmentalStressors.housingResources' },
      { key: 'environmentalConsultant', translationKey: 'moodChecker.supportResources.environmentalStressors.environmentalConsultant' }
    ],
    notSure: [
      { key: 'generalTherapist', translationKey: 'moodChecker.supportResources.notSure.generalTherapist' },
      { key: 'lifeCoach', translationKey: 'moodChecker.supportResources.notSure.lifeCoach' },
      { key: 'mentalHealthHotline', translationKey: 'moodChecker.supportResources.notSure.mentalHealthHotline' }
    ]
  };
  
  // Helper function to determine if user needs personalized options based on history
  export const needsPersonalizedOptions = (moodHistory) => {
    return moodHistory && moodHistory.length >= 2;
  };
  
  // Get appropriate mood options based on time of day
  export const getMoodOptionsByTime = (t) => {
    const timeOfDay = getTimeOfDay();
    const timeBasedOptions = moodOptions[timeOfDay].map(option => t(option.translationKey));
    const commonOptions = moodOptions.common.map(option => t(option.translationKey));
    
    return [...timeBasedOptions, ...commonOptions];
  };
  
  // Get all issue categories translated
  export const getIssueCategories = (t) => {
    return issueCategories.map(category => t(category.translationKey));
  };
  
  // Get specific issues for a category
  export const getSpecificIssues = (category, t) => {
    const issueKey = Object.keys(specificIssues).find(key => 
      t(`moodChecker.issues.${key}`) === category
    );
    
    if (!issueKey) return [];
    
    return specificIssues[issueKey].map(issue => t(issue.translationKey));
  };
  
  // Get intensity levels
  export const getIntensityLevels = (t) => {
    return intensityLevels.map(level => t(level.translationKey));
  };
  
  // Get support resources based on issue category
  export const getSupportResources = (category, t) => {
    const issueKey = Object.keys(supportResources).find(key => 
      t(`moodChecker.issues.${key}`) === category
    );
    
    if (!issueKey) return [];
    
    return supportResources[issueKey].map(resource => t(resource.translationKey));
  };