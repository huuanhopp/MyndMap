import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BarChart, PieChart } from "react-native-chart-kit";
import { getFirestore, collection, onSnapshot, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { fetchTasksWithSubtasks } from "./firebaseUtils";

const Stats = () => {
  const navigation = useNavigation();
  const [completedTasks, setCompletedTasks] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [tasksByPriority, setTasksByPriority] = useState({});
  const [tasksByEstimatedTime, setTasksByEstimatedTime] = useState({});
  const [averageCompletionTime, setAverageCompletionTime] = useState(0);
  const [showPriorityChart, setShowPriorityChart] = useState(false);
  const [showEstimatedTimeChart, setShowEstimatedTimeChart] = useState(false);
  const [tip, setTip] = useState("");

  const screenWidth = Dimensions.get("window").width;

  const chartConfig = {
    backgroundGradientFrom: "#f7e8d3",
    backgroundGradientTo: "#f7e8d3",
    color: (opacity = 1) => `rgba(26, 26, 26, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.8,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 12,
    },
  };

  const mainData = {
    labels: ["Completed Tasks", "Total Tasks"],
    datasets: [
      {
        data: [completedTasks, totalTasks],
        colors: [(opacity = 1) => "#36A2EB", (opacity = 1) => "#FF6384"],
      },
    ],
  };

  const priorityData = {
    labels: ["Low", "Medium", "High", "Major"],
    datasets: [
      {
        data: [
          tasksByPriority.Low || 0,
          tasksByPriority.Medium || 0,
          tasksByPriority.High || 0,
          tasksByPriority.Major || 0,
        ],
        colors: [
          (opacity = 1) => "#1a1a1a",
          (opacity = 1) => "#FFCC80",
          (opacity = 1) => "#FF8A65",
          (opacity = 1) => "#EF5350",
        ],
      },
    ],
  };

  const estimatedTimeData = Object.entries(tasksByEstimatedTime).map(
    ([time, count]) => ({
      name: `${time} mins`,
      count,
      color: "#FF6384",
      legendFontColor: "#1a1a1a",
      legendFontSize: 12,
    })
  );

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (currentUser) {
          const tasksWithSubtasks = await fetchTasksWithSubtasks(
            currentUser.uid
          );
          setTotalTasks(tasksWithSubtasks.length);
          setCompletedTasks(
            tasksWithSubtasks.filter((task) => task.completed).length
          );

          const priorityCount = tasksWithSubtasks.reduce((acc, task) => {
            const priority = task.priority || "Medium";
            acc[priority] = (acc[priority] || 0) + 1;
            return acc;
          }, {});
          setTasksByPriority(priorityCount);

          const estimatedTimeCount = tasksWithSubtasks.reduce((acc, task) => {
            const estimatedTime = task.estimatedTime || 0;
            acc[estimatedTime] = (acc[estimatedTime] || 0) + 1;
            return acc;
          }, {});
          setTasksByEstimatedTime(estimatedTimeCount);

          const completionTimes = tasksWithSubtasks
            .filter((task) => task.completed)
            .map((task) => {
              const createdAt = task.createdAt.toDate();
              const completedAt = task.completedAt.toDate();
              return (completedAt - createdAt) / 60000; // Convert milliseconds to minutes
            });

          const totalCompletionTime = completionTimes.reduce(
            (sum, time) => sum + time,
            0
          );
          const avgCompletionTime =
            completionTimes.length > 0
              ? Math.round(totalCompletionTime / completionTimes.length)
              : 0;
          setAverageCompletionTime(avgCompletionTime);
        } else {
          console.log("User is not signed in");
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, []);

  useEffect(() => {
    const tips = [
      "Break down tasks into smaller, manageable steps to avoid feeling overwhelmed.",
      "Use visual cues and reminders to stay on track with your tasks and deadlines.",
      "Incorporate regular breaks and physical activity to maintain focus and energy levels.",
      "Prioritize tasks based on importance and urgency to manage your time effectively.",
      "Create a structured routine and stick to it as much as possible to establish consistency.",
      "Minimize distractions by working in a quiet environment or using noise-canceling headphones.",
      "Use timers or the Pomodoro technique to work in focused intervals and take regular breaks.",
      "Celebrate your accomplishments, no matter how small, to maintain motivation and positive reinforcement.",
      "Collaborate with others or seek support when needed to stay accountable and motivated.",
      "Experiment with different productivity techniques and find what works best for you.",
    ];

    const randomIndex = Math.floor(Math.random() * tips.length);
    setTip(tips[randomIndex]);
  }, []);

  const handleChartPress = () => {
    setShowPriorityChart(!showPriorityChart);
  };

  const handleEstimatedTimeChartPress = () => {
    setShowEstimatedTimeChart(!showEstimatedTimeChart);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Task Statistics</Text>
      <TouchableOpacity onPress={handleChartPress}>
        <BarChart
          data={showPriorityChart ? priorityData : mainData}
          width={screenWidth - 40}
          height={400}
          yAxisLabel={showPriorityChart ? "" : ""}
          chartConfig={chartConfig}
          verticalLabelRotation={0}
          fromZero
          withInnerLines={false}
          showBarTops
          showValuesOnTopOfBars
          flatColor
          style={styles.chart}
        />
      </TouchableOpacity>
      <Text style={styles.caption}>
        {showPriorityChart
          ? "Tap the chart to view overall task statistics"
          : "Tap the chart to view tasks by priority"}
      </Text>
      <TouchableOpacity onPress={handleEstimatedTimeChartPress}>
        <PieChart
          data={estimatedTimeData}
          width={screenWidth - 40}
          height={200}
          chartConfig={chartConfig}
          accessor="count"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </TouchableOpacity>
      <Text style={styles.caption}>
        {showEstimatedTimeChart
          ? "Tap the chart to hide estimated time chart"
          : "Tap the chart to view tasks by estimated time"}
      </Text>
      <Text style={styles.stat}>
        Average Completion Time: {averageCompletionTime} minutes
      </Text>
      <View style={styles.tipContainer}>
        <Text style={styles.tipTitle}>MyndMap Tip:</Text>
        <Text style={styles.tipText}>{tip}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f7e8d3",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 150,
    paddingBottom: 40,
  },
  backButton: {
    position: "absolute",
    top: 65,
    left: 20,
    backgroundColor: "transparent",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  backButtonText: {
    color: "#1a1a1a",
    fontSize: 16,
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1a1a1a",
  },
  chart: {
    marginVertical: 20,
    borderRadius: 16,
  },
  caption: {
    fontSize: 16,
    color: "#1a1a1a",
    marginBottom: 20,
  },
  stat: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginTop: 20,
  },
  tipContainer: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
    alignItems: "center",
    width: "100%",
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 10,
  },
  tipText: {
    fontSize: 16,
    textAlign: "center",
    fontStyle: "italic",
    color: "#1a1a1a",
  },
});

export default Stats;
