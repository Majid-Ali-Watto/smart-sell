import { StyleSheet, View } from "react-native";
export default function Card({ children, cardStyle }) {
  return <View style={[styles.card, cardStyle]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderColor: "gray",
    borderWidth: 1,
    elevation: 2,
  },
});
