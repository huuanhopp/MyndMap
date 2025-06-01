import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Animated, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import { useTranslation } from 'react-i18next';
import { INTENSITY_LEVELS } from '../src/constants/intensityLevels';

const SCREEN_WIDTH = Dimensions.get('window').width;

// ADHD-specific strategies database
const adhd_strategies = {
    task_initiation: [
      "Use the 'body doubling' technique - work alongside someone else",
      "Start with a 5-minute micro-commitment to overcome task paralysis",
      "Create a 'launch pad' routine for starting difficult tasks",
      "Use visual timers to make time more concrete",
      "Play your 'starting task' song or playlist",
      "Place a physical object as a task reminder in your path",
      "Set up your workspace the night before",
      "Use the 'if-then' technique for task transitions",
      "Pair task initiation with a dopamine-boosting activity (e.g., music or a favorite drink)",
      "Use a 'countdown from 5' method to initiate tasks",
      "Break the first step into smaller, more manageable actions",
      "Use a 'task initiation buddy' to check in with you",
    ],
    focus_management: [
      "Create a sensory-friendly workspace with proper lighting and noise control",
      "Use noise-canceling headphones or specific background sounds",
      "Position your desk to minimize visual distractions",
      "Keep fidget tools nearby for restless energy",
      "Use a 'focus anchor' object that signals work mode",
      "Create different zones for different types of tasks",
      "Maintain optimal temperature for focus",
      "Use color coding for task categories",
      "Implement the Pomodoro technique with short breaks",
      "Use a 'distraction pad' to jot down intrusive thoughts",
      "Set up a 'focus playlist' with instrumental music",
      "Use blue light filters to reduce eye strain",
    ],
    executive_function: [
      "Break tasks into 10-minute chunks",
      "Use external memory aids like checklists and timers",
      "Create templates for recurring tasks",
      "Set up 'now, next, later' task zones",
      "Use physical cards for task switching",
      "Create decision flowcharts for complex processes",
      "Maintain a central information hub",
      "Use the 'Swiss cheese' method for large tasks",
      "Set up a 'brain dump' session to clear mental clutter",
      "Use a 'priority matrix' to categorize tasks by urgency and importance",
      "Create a 'done list' to track completed tasks",
      "Use a 'weekly reset' routine to plan ahead",
    ],
    emotional_regulation: [
      "Create a 'reset corner' for overwhelming moments",
      "Develop personal success mantras",
      "Keep a 'wins' journal for motivation",
      "Use breathing exercises during transitions",
      "Create a sensory comfort kit",
      "Practice self-compassion scripts",
      "Set up celebration rituals for task completion",
      "Use mood tracking to identify patterns",
      "Implement a 'pause and reflect' practice before reacting",
      "Use grounding techniques during emotional spikes",
      "Create a 'calm down' playlist for stressful moments",
      "Practice gratitude journaling daily",
    ],
    accountability: [
      "Share your goals with an accountability partner",
      "Use task completion apps with social features",
      "Create external deadlines with consequences",
      "Join online body doubling sessions",
      "Set up regular check-ins with mentors",
      "Use time-blocking with shared calendars",
      "Create progress visualization boards",
      "Participate in study/work groups",
      "Use a 'commitment contract' to stay on track",
      "Set up a 'reward system' for meeting goals",
      "Use a 'progress tracker' app to visualize achievements",
      "Join ADHD-specific support groups for shared accountability",
    ],
    time_management: [
      "Use time-blocking to allocate specific periods for tasks",
      "Set up 'buffer times' between tasks to avoid over-scheduling",
      "Use a 'time audit' to identify time-wasting activities",
      "Implement a 'two-minute rule' for quick tasks",
      "Use a 'time horizon' approach to plan short, medium, and long-term goals",
      "Set up 'alarm cascades' for important deadlines",
      "Use a 'time timer' to visualize the passage of time",
      "Create a 'time budget' to allocate time for priorities",
    ],
    self_care: [
      "Prioritize sleep hygiene for better focus and mood",
      "Incorporate regular physical activity into your routine",
      "Practice mindfulness or meditation daily",
      "Maintain a balanced diet to support brain function",
      "Set up a 'digital detox' routine to reduce screen time",
      "Use a 'self-care checklist' to ensure daily well-being",
      "Schedule regular breaks to prevent burnout",
      "Practice deep breathing exercises for stress relief",
    ],
  };

const getRandomItems = (array, count) => {
  return [...array].sort(() => 0.5 - Math.random()).slice(0, count);
};

const getPersonalizedStrategies = (stats) => {
    const strategies = [];
    
    if (stats.completionRate < 50) {
      strategies.push(...adhd_strategies.task_initiation.slice(0, 3));
    }
    
    if (stats.productivity.mostProductiveTime) {
      strategies.push(`Schedule challenging tasks during ${stats.productivity.mostProductiveTime} when your focus is strongest`);
    }
    
    if (stats.streaks.current < stats.streaks.average) {
      strategies.push(...adhd_strategies.accountability.slice(0, 2));
    }
    
    if (stats.stressLevel > 7) {
      strategies.push(...adhd_strategies.self_care.slice(0, 2));
    }
    
    if (stats.timeManagementScore < 5) {
      strategies.push(...adhd_strategies.time_management.slice(0, 2));
    }
    
    return strategies;
  };

const generateModeSpecificInsights = (stats, selectedIntensity) => {
  switch(selectedIntensity) {
    case INTENSITY_LEVELS.GENTLE:
      return {
        "Building Momentum": {
          description: "Focus on small wins and consistent progress",
          strategies: [
            ...getRandomItems(adhd_strategies.task_initiation, 3),
            ...getRandomItems(adhd_strategies.emotional_regulation, 2)
          ]
        },
        "Support Systems": {
          description: "Create external structures for success",
          strategies: [
            ...getRandomItems(adhd_strategies.accountability, 3),
            ...getRandomItems(adhd_strategies.focus_management, 2)
          ]
        }
      };
      
    case INTENSITY_LEVELS.BALANCED:
      return {
        "Optimization": {
          description: "Fine-tune your systems and routines",
          strategies: [
            ...getRandomItems(adhd_strategies.executive_function, 3),
            ...getRandomItems(adhd_strategies.focus_management, 2)
          ]
        },
        "Sustainable Growth": {
          description: "Build lasting habits and routines",
          strategies: [
            ...getRandomItems(adhd_strategies.emotional_regulation, 3),
            ...getRandomItems(adhd_strategies.accountability, 2)
          ]
        }
      };
      
    default: // INTENSIVE
      return {
        "Peak Performance": {
          description: "Maximize focus and productivity",
          strategies: [
            ...getRandomItems(adhd_strategies.focus_management, 3),
            ...getRandomItems(adhd_strategies.executive_function, 2)
          ]
        },
        "Advanced Techniques": {
          description: "Implement sophisticated productivity systems",
          strategies: [
            ...getRandomItems(adhd_strategies.accountability, 3),
            ...getRandomItems(adhd_strategies.task_initiation, 2)
          ]
        }
      };
  }
};

export const generateEnhancedInsights = (stats, selectedIntensity) => {
  const personalizedStrategies = getPersonalizedStrategies(stats);
  const modeInsights = generateModeSpecificInsights(stats, selectedIntensity);
  
  return {
    personalizedSection: {
      title: "Personalized For You",
      description: "Based on your recent patterns",
      strategies: personalizedStrategies
    },
    modeSpecificSections: modeInsights
  };
};

const InsightCard = ({ title, description, strategies, isExpanded, onToggle }) => {
  const animationHeight = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    if (isExpanded) {
      contentOpacity.setValue(1);
      Animated.spring(animationHeight, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: false
      }).start();
    } else {
      Animated.spring(animationHeight, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: false
      }).start(() => {
        contentOpacity.setValue(0);
      });
    }
  }, [isExpanded]);

  return (
    <View style={styles.insightCard}>
      <TouchableOpacity 
        style={styles.insightHeader} 
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.insightTitleContainer}>
          <Text style={styles.insightTitle}>{title}</Text>
          {description && (
            <Text style={styles.insightDescription}>{description}</Text>
          )}
        </View>
        <Animated.View style={{
          transform: [{
            rotate: animationHeight.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '180deg']
            })
          }]
        }}>
          <FontAwesome name="chevron-down" size={16} color="#F7e8d3" />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View style={{
        maxHeight: animationHeight.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1000]
        }),
        opacity: contentOpacity,
        overflow: 'hidden'
      }}>
        <View style={styles.strategiesList}>
          {strategies.map((strategy, index) => (
            <View key={index} style={styles.strategyItem}>
              <View style={styles.strategyBullet} />
              <Text style={styles.strategyText}>{strategy}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

const InsightSection = ({ title, description, insights, expandedCards, setExpandedCards }) => {
  const toggleCard = useCallback((cardIndex) => {
    setExpandedCards(prev => ({
      ...prev,
      [title]: prev[title]?.includes(cardIndex)
        ? prev[title].filter(i => i !== cardIndex)
        : [...(prev[title] || []), cardIndex]
    }));
  }, [title, setExpandedCards]);

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {description && (
          <Text style={styles.sectionDescription}>{description}</Text>
        )}
      </View>
      {Object.entries(insights).map(([cardTitle, { description, strategies }], index) => (
        <InsightCard
          key={index}
          title={cardTitle}
          description={description}
          strategies={strategies}
          isExpanded={expandedCards[title]?.includes(index)}
          onToggle={() => toggleCard(index)}
        />
      ))}
    </View>
  );
};

export const EnhancedInsights = ({ stats, selectedIntensity }) => {
  const { t } = useTranslation();
  const [expandedCards, setExpandedCards] = useState({});
  const [activeTab, setActiveTab] = useState('personalized');
  const slideAnim = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const [currentInsights, setCurrentInsights] = useState(() => 
    generateEnhancedInsights(stats, selectedIntensity)
  );

  const changeTab = useCallback((tab) => {
    if (tab === activeTab) return;

    Animated.timing(contentOpacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true
    }).start(() => {
      setActiveTab(tab);
      setCurrentInsights(generateEnhancedInsights(stats, selectedIntensity));
      
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: tab === 'personalized' ? 0 : 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();
    });
  }, [activeTab, stats, selectedIntensity]);

  return (
    <View style={styles.insightsContainer}>
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'personalized' && styles.activeTab]}
          onPress={() => changeTab('personalized')}
          activeOpacity={0.7}
        >
          <FontAwesome 
            name="user" 
            size={16} 
            color="#F7e8d3" 
            style={styles.tabIcon} 
          />
          <Text style={styles.tabText}>For You</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'mode' && styles.activeTab]}
          onPress={() => changeTab('mode')}
          activeOpacity={0.7}
        >
          <FontAwesome 
            name="sliders" 
            size={16} 
            color="#F7e8d3" 
            style={styles.tabIcon} 
          />
          <Text style={styles.tabText}>Mode Tips</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentWrapper}>
        <Animated.View style={[
          styles.contentContainer,
          {
            opacity: contentOpacity,
            transform: [{
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -SCREEN_WIDTH + 32]
              })
            }]
          }
        ]}>
          <View style={styles.pageContainer}>
            <InsightSection
              title={currentInsights.personalizedSection.title}
              description={currentInsights.personalizedSection.description}
              insights={{ 
                "Your Strategies": { 
                  strategies: currentInsights.personalizedSection.strategies 
                }
              }}
              expandedCards={expandedCards}
              setExpandedCards={setExpandedCards}
            />
          </View>

          <View style={[styles.pageContainer, styles.modePageContainer]}>
            <InsightSection
              title={`${selectedIntensity.charAt(0).toUpperCase() + selectedIntensity.slice(1)} Mode Insights`}
              insights={currentInsights.modeSpecificSections}
              expandedCards={expandedCards}
              setExpandedCards={setExpandedCards}
            />
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  contentWrapper: {
    overflow: 'hidden',
  },
  contentContainer: {
    flexDirection: 'row',
    width: SCREEN_WIDTH * 2,
  },
  pageContainer: {
    width: SCREEN_WIDTH - 32,
    paddingHorizontal: 16,
  },
  modePageContainer: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(247, 232, 211, 0.1)',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: 'rgba(255,99,71,0.2)',
  },
  tabIcon: {
    marginRight: 8,
  },
  tabText: {
    color: '#F7e8d3',
    fontSize: 16,
    fontWeight: '600',
  },
  insightsContainer: {
    backgroundColor: 'rgba(26,26,26,0.9)',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#F7e8d3',
    overflow: 'hidden',
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F7e8d3',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#F7e8d3',
    opacity: 0.8,
  },
  insightCard: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  insightTitleContainer: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F7e8d3',
  },
  insightDescription: {
    fontSize: 12,
    color: '#F7e8d3',
    opacity: 0.8,
    marginTop: 4,
  },
  strategiesList: {
    padding: 16,
    paddingTop: 0,
  },
  strategyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingRight: 8,
  },
  strategyBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF6347',
    marginTop: 8,
    marginRight: 12,
  },
  strategyText: {
    flex: 1,
    color: '#F7e8d3',
    fontSize: 15,
    lineHeight: 22,
  },
});
