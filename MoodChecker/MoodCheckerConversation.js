// MoodCheckerConversation.js
// This file contains the conversation flow logic with branching pathways for the MoodChecker component

import {
    getMoodOptionsByTime,
    getIssueCategories,
    getSpecificIssues,
    getIntensityLevels,
    getSupportResources,
    getTimeOfDay
  } from './MoodCheckerData';
  
  /**
   * Generate a personalized greeting based on mood history and time of day
   * @param {Array} moodHistory - User's previous mood entries
   * @param {Function} t - Translation function
   * @returns {String} - Personalized greeting
   */
  const getPersonalizedGreeting = (moodHistory, t) => {
    if (!moodHistory || moodHistory.length === 0) {
      // First-time user greeting
      const timeOfDay = getTimeOfDay();
      return t(`moodChecker.greetings.${timeOfDay}`);
    }
    
    const lastEntry = moodHistory[moodHistory.length - 1];
    const lastMood = lastEntry.mood;
    const lastIssue = lastEntry.issue;
    const timeOfDay = getTimeOfDay();
    
    // Morning greetings focus on fresh starts
    if (timeOfDay === 'morning') {
      return `${t('moodChecker.greetings.morning')} Last time we talked about ${lastIssue.toLowerCase()}. How are you feeling this morning?`;
    }
    
    // Afternoon greetings focus on check-ins
    if (timeOfDay === 'afternoon') {
      return `${t('moodChecker.greetings.afternoon')} When we last spoke, you felt ${lastMood.toLowerCase()}. How's your day going?`;
    }
    
    // Evening greetings focus on reflection
    return `${t('moodChecker.greetings.evening')} Last time you mentioned ${lastIssue.toLowerCase()}. How are you feeling now?`;
  };
  
  /**
   * Generate advice text based on user data and previous visits
   * @param {Object} userData - Current user data
   * @param {Function} t - Translation function
   * @returns {String} - Formatted advice text
   */
  const getAdviceText = (userData, t) => {
    const { mood, issue, specificIssue, intensity, previousVisits } = userData;
    
    // Find the issue key from translation
    const issueKey = Object.keys({
      workStress: t('moodChecker.issues.workStress'),
      personalIssues: t('moodChecker.issues.personalIssues'),
      healthConcerns: t('moodChecker.issues.healthConcerns'),
      creativeBlocks: t('moodChecker.issues.creativeBlocks'),
      socialChallenges: t('moodChecker.issues.socialChallenges'),
      environmentalStressors: t('moodChecker.issues.environmentalStressors'),
      notSure: t('moodChecker.issues.notSure')
    }).find(key => 
      t(`moodChecker.issues.${key}`) === issue
    );
    
    if (!issueKey) return t('moodChecker.advice.fallback');
    
    // Find the specific issue key
    let issuesObj;
    switch(issueKey) {
      case 'workStress':
        issuesObj = t('moodChecker.workStressIssues');
        break;
      case 'personalIssues':
        issuesObj = t('moodChecker.personalIssues');
        break;
      case 'healthConcerns':
        issuesObj = t('moodChecker.healthConcerns');
        break;
      case 'creativeBlocks':
        issuesObj = t('moodChecker.creativeBlocksIssues');
        break;
      case 'socialChallenges':
        issuesObj = t('moodChecker.socialChallengesIssues');
        break;
      case 'environmentalStressors':
        issuesObj = t('moodChecker.environmentalStressorsIssues');
        break;
      case 'notSure':
        issuesObj = t('moodChecker.notSureIssues');
        break;
      default:
        issuesObj = {};
    }
    
    const specificIssueKey = Object.keys(issuesObj).find(key =>
      issuesObj[key] === specificIssue
    );
    
    // Find the intensity key
    const intensityKey = Object.keys({
      veryMild: t('moodChecker.intensityLevels.veryMild'),
      mild: t('moodChecker.intensityLevels.mild'),
      moderate: t('moodChecker.intensityLevels.moderate'),
      significant: t('moodChecker.intensityLevels.significant'),
      intense: t('moodChecker.intensityLevels.intense')
    }).find(key =>
      t(`moodChecker.intensityLevels.${key}`) === intensity
    );
    
    // Select different advice based on whether this is a repeat visit (cycle through advice)
    const adviceIndex = (previousVisits % 4) + 1; // Cycle through 4 different pieces of advice
    
    // Get specific and general advice
    let specificAdvice, generalAdvice;
    
    try {
      specificAdvice = t(`moodChecker.advice.${issueKey}.${specificIssueKey}.${adviceIndex}`);
    } catch (e) {
      specificAdvice = t('moodChecker.advice.fallback');
    }
    
    try {
      generalAdvice = t(`moodChecker.advice.intensity.${intensityKey}.${adviceIndex}`);
    } catch (e) {
      generalAdvice = t('moodChecker.advice.fallback');
    }
    
    return t('moodChecker.adviceFormat', {
      specific: specificAdvice || t('moodChecker.advice.fallback'),
      general: generalAdvice || t('moodChecker.advice.fallback')
    });
  };
  
  /**
   * Generate the complete conversation flow structure
   * @param {Array} moodHistory - User's previous mood entries
   * @param {Function} t - Translation function
   * @returns {Array} - Conversation steps with branching logic
   */
  export const generateConversation = (moodHistory, t) => {
    return [
      // Initial greeting - varies by time of day and previous history
      {
        id: 'initial-greeting',
        text: () => getPersonalizedGreeting(moodHistory, t),
        options: () => getMoodOptionsByTime(t),
        nextStepId: (response) => {
          // Branch based on positivity/negativity of mood
          const positiveResponses = [
            t('moodChecker.moods.energetic'),
            t('moodChecker.moods.calm'),
            t('moodChecker.moods.optimistic'),
            t('moodChecker.moods.focused'),
            t('moodChecker.moods.accomplished'),
            t('moodChecker.moods.balanced'),
            t('moodChecker.moods.relaxed'),
            t('moodChecker.moods.satisfied'),
            t('moodChecker.moods.great')
          ];
          
          if (positiveResponses.includes(response)) {
            return 'positive-mood-followup';
          }
          
          return 'negative-mood-followup';
        }
      },
      
      // Follow-up for positive moods
      {
        id: 'positive-mood-followup',
        text: (userData) => {
          const timeOfDay = getTimeOfDay();
          return t(`moodChecker.positiveFollowups.${timeOfDay}`);
        },
        options: () => getIssueCategories(t),
        nextStepId: () => 'specific-issue'
      },
      
      // Follow-up for negative moods
      {
        id: 'negative-mood-followup',
        text: (userData) => {
          return t('moodChecker.negativeFollowups.general', {
            mood: userData.mood.toLowerCase()
          });
        },
        options: () => getIssueCategories(t),
        nextStepId: () => 'specific-issue'
      },
      
      // Identify specific issue within the selected category
      {
        id: 'specific-issue',
        text: (userData) => {
          if (userData.previousVisits > 3) {
            return t('moodChecker.returningUserIssue');
          }
          return t('moodChecker.specificIssuePrompt');
        },
        options: (userData) => getSpecificIssues(userData.issue, t),
        nextStepId: (response, userData) => {
          // If this is a recurring issue for the user, offer different path
          if (moodHistory && moodHistory.some(entry => 
            entry.specificIssue === response && entry.date !== userData.sessionDate
          )) {
            return 'recurring-issue';
          }
          return 'intensity-check';
        }
      },
      
      // Handle recurring issues differently
      {
        id: 'recurring-issue',
        text: (userData) => {
          return t('moodChecker.recurringIssuePrompt', {
            issue: userData.specificIssue.toLowerCase()
          });
        },
        options: [
          t('moodChecker.recurringIssueOptions.stillStruggling'),
          t('moodChecker.recurringIssueOptions.differentAspect'),
          t('moodChecker.recurringIssueOptions.seekingMoreHelp')
        ],
        nextStepId: (response) => {
          if (response === t('moodChecker.recurringIssueOptions.seekingMoreHelp')) {
            return 'professional-help';
          }
          return 'intensity-check';
        }
      },
      
      // Ask about the intensity of the issue
      {
        id: 'intensity-check',
        text: () => {
          return t('moodChecker.intensityPrompt');
        },
        options: () => getIntensityLevels(t),
        nextStepId: (response) => {
          // Route to special handling for high intensity responses
          if (response === t('moodChecker.intensityLevels.intense') ||
              response === t('moodChecker.intensityLevels.significant')) {
            return 'high-intensity-check';
          }
          return 'custom-input-option';
        }
      },
      
      // Follow-up for high intensity issues
      {
        id: 'high-intensity-check',
        text: () => {
          return t('moodChecker.highIntensityPrompt');
        },
        options: [
          t('moodChecker.highIntensityOptions.manageable'),
          t('moodChecker.highIntensityOptions.needSupport'),
          t('moodChecker.highIntensityOptions.crisis')
        ],
        nextStepId: (response) => {
          if (response === t('moodChecker.highIntensityOptions.crisis')) {
            return 'crisis-resources';
          } else if (response === t('moodChecker.highIntensityOptions.needSupport')) {
            return 'professional-help';
          }
          return 'custom-input-option';
        }
      },
      
      // Offer free-text input option
      {
        id: 'custom-input-option',
        text: () => {
          return t('moodChecker.customInputPrompt');
        },
        freeTextInput: true,
        options: [
          t('moodChecker.customInputOptions.skip'),
          t('moodChecker.customInputOptions.addThoughts')
        ],
        nextStepId: () => 'advice-request'
      },
      
      // Ask if user wants advice
      {
        id: 'advice-request',
        text: () => {
          return t('moodChecker.adviceRequestPrompt');
        },
        options: [
          t('moodChecker.adviceOptions.yes'),
          t('moodChecker.adviceOptions.resources'),
          t('moodChecker.adviceOptions.no')
        ],
        nextStepId: (response) => {
          if (response === t('moodChecker.adviceOptions.resources')) {
            return 'resource-suggestions';
          } else if (response === t('moodChecker.adviceOptions.no')) {
            return 'end-conversation';
          }
          return 'provide-advice';
        }
      },
      
      // Provide personalized advice
      {
        id: 'provide-advice',
        text: (userData) => {
          return getAdviceText(userData, t);
        },
        options: [
          t('moodChecker.adviceFeedback.helpful'),
          t('moodChecker.adviceFeedback.needMoreSupport'),
          t('moodChecker.adviceFeedback.notRelevant')
        ],
        nextStepId: (response) => {
          if (response === t('moodChecker.adviceFeedback.needMoreSupport')) {
            return 'resource-suggestions';
          } else if (response === t('moodChecker.adviceFeedback.notRelevant')) {
            return 'alternative-advice';
          }
          return 'follow-up-check';
        }
      },
      
      // Handle when advice isn't relevant
      {
        id: 'alternative-advice',
        text: () => {
          return t('moodChecker.alternativeAdvicePrompt');
        },
        options: [
          t('moodChecker.alternativeAdviceOptions.tryAgain'),
          t('moodChecker.alternativeAdviceOptions.resources'),
          t('moodChecker.alternativeAdviceOptions.endConversation')
        ],
        nextStepId: (response) => {
          if (response === t('moodChecker.alternativeAdviceOptions.tryAgain')) {
            return 'provide-advice';
          } else if (response === t('moodChecker.alternativeAdviceOptions.resources')) {
            return 'resource-suggestions';
          }
          return 'end-conversation';
        }
      },
      
      // Suggest resources based on issue category
      {
        id: 'resource-suggestions',
        text: () => {
          return t('moodChecker.resourceSuggestionsPrompt');
        },
        options: (userData) => getSupportResources(userData.issue, t),
        nextStepId: () => 'follow-up-check'
      },
      
      // Provide professional help options
      {
        id: 'professional-help',
        text: () => {
          return t('moodChecker.professionalHelpPrompt');
        },
        options: (userData) => [
          ...getSupportResources(userData.issue, t),
          t('moodChecker.professionalHelpOptions.notNow')
        ],
        nextStepId: (response) => {
          if (response === t('moodChecker.professionalHelpOptions.notNow')) {
            return 'provide-advice';
          }
          return 'professional-help-followup';
        }
      },
      
      // Follow-up on professional help selection
      {
        id: 'professional-help-followup',
        text: () => {
          return t('moodChecker.professionalHelpFollowupPrompt');
        },
        options: [
          t('moodChecker.professionalHelpFollowupOptions.yes'),
          t('moodChecker.professionalHelpFollowupOptions.no')
        ],
        nextStepId: (response) => {
          if (response === t('moodChecker.professionalHelpFollowupOptions.yes')) {
            return 'professional-resources-detail';
          }
          return 'follow-up-check';
        }
      },
      
      // Provide detailed professional resources information
      {
        id: 'professional-resources-detail',
        text: () => {
          // In a production app, this would pull from a database of local resources
          return t('moodChecker.professionalResourcesDetail');
        },
        options: [
          t('moodChecker.professionalResourcesDetailOptions.thanks')
        ],
        nextStepId: () => 'follow-up-check'
      },
      
      // Provide crisis resources
      {
        id: 'crisis-resources',
        text: () => {
          return t('moodChecker.crisisResourcesPrompt');
        },
        options: [
          t('moodChecker.crisisResourcesOptions.callHotline'),
          t('moodChecker.crisisResourcesOptions.textCrisisLine'),
          t('moodChecker.crisisResourcesOptions.emergencyServices')
        ],
        nextStepId: () => 'crisis-resources-followup'
      },
      
      // Follow-up after providing crisis resources
      {
        id: 'crisis-resources-followup',
        text: () => {
          return t('moodChecker.crisisResourcesFollowupPrompt');
        },
        options: [
          t('moodChecker.crisisResourcesFollowupOptions.yes'),
          t('moodChecker.crisisResourcesFollowupOptions.no')
        ],
        nextStepId: (response) => {
          if (response === t('moodChecker.crisisResourcesFollowupOptions.yes')) {
            return 'provide-advice';
          }
          return 'end-conversation';
        }
      },
      
      // Check if user wants to discuss more topics
      {
        id: 'follow-up-check',
        text: () => {
          const timeOfDay = getTimeOfDay();
          if (timeOfDay === 'evening') {
            return t('moodChecker.followUpChecks.evening');
          }
          return t('moodChecker.followUpChecks.default');
        },
        options: [
          t('moodChecker.followUpOptions.anotherIssue'),
          t('moodChecker.followUpOptions.scheduleLater'),
          t('moodChecker.followUpOptions.endNow')
        ],
        nextStepId: (response) => {
          if (response === t('moodChecker.followUpOptions.anotherIssue')) {
            return 'additional-topic';
          } else if (response === t('moodChecker.followUpOptions.scheduleLater')) {
            return 'schedule-check-in';
          }
          return 'end-conversation';
        }
      },
      
      // Ask about additional topics
      {
        id: 'additional-topic',
        text: () => {
          return t('moodChecker.additionalTopicPrompt');
        },
        options: () => getIssueCategories(t),
        nextStepId: () => 'specific-issue'
      },
      
      // Schedule a future check-in
      {
        id: 'schedule-check-in',
        text: () => {
          return t('moodChecker.scheduleCheckInPrompt');
        },
        options: [
          t('moodChecker.scheduleOptions.tomorrow'),
          t('moodChecker.scheduleOptions.fewDays'),
          t('moodChecker.scheduleOptions.nextWeek'),
          t('moodChecker.scheduleOptions.noThanks')
        ],
        nextStepId: (response) => {
          if (response === t('moodChecker.scheduleOptions.noThanks')) {
            return 'end-conversation';
          }
          return 'confirm-schedule';
        }
      },
      
      // Confirm scheduled check-in
      {
        id: 'confirm-schedule',
        text: (userData) => {
          return t('moodChecker.confirmSchedulePrompt', {
            time: userData.scheduleOption
          });
        },
        options: [
          t('moodChecker.confirmScheduleOptions.thanks')
        ],
        nextStepId: () => 'end-conversation'
      },
      
      // End the conversation
      {
        id: 'end-conversation',
        text: (userData) => {
          const timeOfDay = getTimeOfDay();
          
          if (userData.customInput && userData.customInput.length > 0) {
            // Acknowledge their custom input in the goodbye
            return t('moodChecker.endConversationWithInput', {
              timeOfDay: t(`moodChecker.timeOfDay.${timeOfDay}`)
            });
          }
          
          return t('moodChecker.endConversation', {
            timeOfDay: t(`moodChecker.timeOfDay.${timeOfDay}`)
          });
        },
        options: [
          t('moodChecker.endConversationOptions.thanks')
        ],
        nextStepId: null // End of conversation
      }
    ];
  };
  
  export default generateConversation;