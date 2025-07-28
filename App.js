import { useEffect } from "react";
import { View, StyleSheet, StatusBar, Text } from "react-native";
import Constants from "expo-constants";
import { NavigationContainer } from "@react-navigation/native";
import BottomTabs from "./src/navigation/BottomTabs";
import { initSalesTable } from "./src/services/storage/saleStorage";
import { initUserTable } from "./src/services/storage/userStorage";
// import { initBackgroundTask } from "./src/tasks/backgroundTask";

export default function App() {
  useEffect(() => {
    initSalesTable();
    initUserTable();
    // initBackgroundTask();
  }, []);
// Smart Sell – Simple Sales, Smarter Tracking.
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#087E8B" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.heading}>SmartSell</Text>
      </View>

      <NavigationContainer>
        <BottomTabs />
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: {
    backgroundColor: "#087E8B",
    paddingTop: Constants.statusBarHeight,
    paddingBottom: 12,
    alignItems: "center",
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
});
