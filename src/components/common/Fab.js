import { TouchableOpacity, Text, StyleSheet } from "react-native";

export default function FloatingActionButton({
  onPress,
  label = "＋",
  position,
}) {
  return (
    <TouchableOpacity
      style={[styles.fab, { ...position }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.fabText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    bottom: 15,
    backgroundColor: "#007bff",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    // elevation: 5,
    // shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    zIndex: 100,
  },
  fabText: {
    color: "#fff",
    fontSize: 30,
    lineHeight: 30,
    fontWeight: "bold",
  },
});
