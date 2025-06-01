import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
// Import from our centralized Firebase initialization with modular API
import {
  firestore,
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getAuth
} from "../firebase/init";
import { PieChart } from "react-native-chart-kit";

const CompletedTaskItem = ({ task, totalTasks, priorityStats }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [showPriorityChart, setShowPriorityChart] = useState(true);

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const toggleChart = () => {
    setShowPriorityChart(!showPriorityChart);
  };

  // Format the completion time
  const completionTime = task.completionTime
    ? task.completionTime.toDate().toLocaleString()
    : "";

  // Calculate the time taken
  const timeTaken = task.completionTime
    ? task.completionTime.toDate() - task.createdAt.toDate()
    : 0;
  const hours = Math.floor(timeTaken / 3600000);
  const minutes = Math.floor((timeTaken % 3600000) / 60000);
  const seconds = Math.floor((timeTaken % 60000) / 1000);

  // Prepare data for the pie charts
  const priorityData = Object.entries(priorityStats).map(
    ([priority, percentage]) => ({
      name: priority,
      population: percentage,
      color: getColorByPriority(priority),
      legendFontColor: "#fff",
      legendFontSize: 12,
    })
  );

  const timeTakenData = [
    {
      name: "Time Taken",
      population: timeTaken,
      color: "#0A5C36",
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    },
  ];

  return (
    <View>
      <TouchableOpacity
        style={styles.taskContainer}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.taskTitle}>{task.title}</Text>
        <Text style={styles.statisticsText}>
          Priority Level: {task.priority}
        </Text>
        <Text style={styles.completionTime}>{completionTime}</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="fade">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{task.title}</Text>
          <Text style={styles.modalDescription}>{task.description}</Text>
          <Text style={styles.modalPriority}>Priority: {task.priority}</Text>
          <Text style={styles.modalCompletionTime}>
            Completed At: {completionTime}
          </Text>

          {/* Add charts */}
          <TouchableOpacity onPress={toggleChart}>
            {showPriorityChart ? (
              <PieChart
                key={`${task.id}-priority`}
                data={priorityData}
                width={300}
                height={200}
                chartConfig={{
                  backgroundColor: "#000",
                  backgroundGradientFrom: "#000",
                  backgroundGradientTo: "#000",
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            ) : (
              <PieChart
                key={`${task.id}-timeTaken`}
                data={timeTakenData}
                width={300}
                height={200}
                chartConfig={{
                  backgroundColor: "#000",
                  backgroundGradientFrom: "#000",
                  backgroundGradientTo: "#000",
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            )}
          </TouchableOpacity>

          {/* Add statistics and comparisons */}
          <View style={styles.statisticsContainer}>
            {/* Compare priority levels */}

            <Text style={styles.statisticsText}>
              Percentage of {task.priority} Tasks:{" "}
              {priorityStats[task.priority] || 0}%
            </Text>

            {/* Compare time taken */}
            <Text style={styles.statisticsText}>
              Time Taken: {hours}h {minutes}m {seconds}s
            </Text>

            {/* Display total tasks completed */}
            <Text style={styles.statisticsText}>
              Total Tasks Completed: {totalTasks}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleModalClose}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const CompletedTasks = () => {
  const navigation = useNavigation();
  const [completedTasks, setCompletedTasks] = useState([]);
  const [priorityStats, setPriorityStats] = useState({});
  const [totalTasks, setTotalTasks] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    const fetchCompletedTasks = async () => {
      try {
        const db = getFirestore();
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (currentUser) {
          const userDocRef = doc(db, "users", currentUser.uid);
          const tasksQuery = query(
            collection(userDocRef, "completedTasks"),
            orderBy("completionTime", "desc"),
            limit(10)
          );

          const unsubscribe = onSnapshot(tasksQuery, (querySnapshot) => {
            const fetchedTasks = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setCompletedTasks(fetchedTasks);
            setPage(1);
            setHasMore(true);
            calculatePriorityStats(fetchedTasks);
            setTotalTasks(fetchedTasks.length);
          });

          return () => unsubscribe();
        } else {
          console.log("User is not signed in");
        }
      } catch (error) {
        console.error("Error fetching completed tasks:", error);
      }
    };

    fetchCompletedTasks();
  }, []);

  const calculatePriorityStats = (tasks) => {
    const priorityCounts = tasks.reduce((counts, task) => {
      counts[task.priority] = (counts[task.priority] || 0) + 1;
      return counts;
    }, {});

    const totalTasks = tasks.length;
    const stats = {};

    for (const priority in priorityCounts) {
      stats[priority] = Math.round(
        (priorityCounts[priority] / totalTasks) * 100
      );
    }

    setPriorityStats(stats);
  };

  const fetchMoreTasks = async () => {
    if (!hasMore) return;

    try {
      const db = getFirestore();
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const lastTask = completedTasks[completedTasks.length - 1];
        const tasksQuery = query(
          collection(userDocRef, "completedTasks"),
          orderBy("completionTime", "desc"),
          startAfter(lastTask ? lastTask.completionTime : null),
          limit(10)
        );

        const querySnapshot = await getDocs(tasksQuery);
        const fetchedTasks = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (fetchedTasks.length === 0) {
          setHasMore(false);
        } else {
          setCompletedTasks((prevTasks) => [...prevTasks, ...fetchedTasks]);
          setPage((prevPage) => prevPage + 1);
        }
      } else {
        console.log("User is not signed in");
      }
    } catch (error) {
      console.error("Error fetching more completed tasks:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.heading}>Completed Tasks</Text>
        <Text style={styles.dateText}>{`As of ${currentDate}`}</Text>
      </View>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Text style={styles.backCompleteText}>Back</Text>
      </TouchableOpacity>

      <FlatList
        data={completedTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CompletedTaskItem
            task={item}
            totalTasks={totalTasks}
            priorityStats={priorityStats}
          />
        )}
        onEndReached={fetchMoreTasks}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          hasMore ? (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={fetchMoreTasks}
            >
              <Text style={styles.loadMoreText}>Load More</Text>
            </TouchableOpacity>
          ) : null
        }
      />
    </View>
  );
};

const getColorByPriority = (priority) => {
  switch (priority) {
    case "Low":
      return "#ADD8E6";
    case "Medium":
      return "#0A5C36";
    case "High":
      return "#FF8C00";
    case "Major":
      return "#FF0000";
    default:
      return "#808080";
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
  },
  headerContainer: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    fontStyle: "italic",
    textAlign: "center",
    color: "#f7e8d3",
  },
  backCompleteText: {
    color: "#f7e8d3",
    fontWeight: "bold",
  },
  dateText: {
    fontSize: 16,
    color: "#fff",
    marginTop: 2.5,
  },
  taskContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f7e8d3",
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "bold",
    fontStyle: "italic",
    color: "#f7e8d3",
  },
  completionTime: {
    fontSize: 14,
    color: "#fff",
    marginTop: 5,
  },
  loadMoreButton: {
    padding: 10,
    backgroundColor: "transparent",
    alignItems: "center",
    marginVertical: 10,
  },
  loadMoreText: {
    fontSize: 16,
    color: "#f7e8d3",
    fontWeight: "bold",
    fontStyle: "italic",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#000",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f7e8d3",
  },
  modalDescription: {
    fontSize: 16,
    color: "#f7e8d3",
  },
  modalCompletionTime: {
    fontSize: 14.5,
    color: "#fff",
    marginBottom: 10,
  },
  statisticsContainer: {
    marginBottom: 20,
  },
  statisticsText: {
    fontSize: 14.5,
    marginBottom: 5.5,
    marginTop: 5,
    color: "#fff",
  },
  closeButton: {
    backgroundColor: "transparent",
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#f7e8d3",
  },
});

export default CompletedTasks;
