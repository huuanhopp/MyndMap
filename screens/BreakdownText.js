import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const BreakdownText = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Image source={require("../assets/back_arrow.png")} style={styles.backArrow} />
        </TouchableOpacity>
        <Image
          style={styles.logo}
          resizeMode="contain"
        />
<Text style={styles.introText}>
  Dear valued users,
</Text>
<Text style={[styles.text, { marginTop: 20 }]}>
  I am excited to share a preview of the ongoing development of MyndMap.
</Text>
<Text style={styles.text}>
  As someone who understands the challenges of ADHD, it’s my mission to create the best possible solution to help manage it. Driven by innovation and your invaluable feedback, I am currently working on refining every aspect of the app, improving performance, and enhancing the user experience.
</Text>
<Text style={styles.text}>
  I am incredibly grateful for each of you who uses this app. Your support and feedback are the driving forces behind our continual development.
</Text>
<Text style={styles.text}>
  From intense discussions to long coding sessions, every effort goes into creating an app that fits seamlessly into your daily life, helping you turn dreams into reality.
</Text>
<Text style={styles.text}>
  Your feedback guides me in creating something that exceeds all expectations. Together, we are shaping the future of productivity.
</Text>
<Text style={styles.text}>
  As I explore new possibilities and push the boundaries of what is possible, your unwavering support drives me to innovate and excel!
</Text>
<Text style={styles.textTwo}>Fair Winds,</Text>
<Text style={styles.textThree}>Jordan J. Mugenyi</Text>
</ScrollView>
</View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7e8d3",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 35,
  },
  backButton: {
    position: "absolute",
    top: 70,
    left: 20,
  },
  backArrow: {
    width: 24,
    height: 24,
  },
  logo: {
    width: 175,
    height: 150,
    alignSelf: "center",
  },
  introText: {
    fontSize: 16,
    textAlign: "center",
  },
  text: {
    fontSize: 16,
    marginBottom: 15,
    
  },
  textTwo: {
    textAlign: "center",
    paddingBottom: 5,
  },
  textThree: {
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default BreakdownText;