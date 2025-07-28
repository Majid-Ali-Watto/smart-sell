import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

export default function ActionButtons({children, onView, onEdit, onDelete, viewTitle='View',editTitle='Edit',deleteTitle='Delete' }) {
  return (
    <View style={styles.actions}>
      {children}
      <TouchableOpacity style={styles.viewButton} onPress={onView}>
        <Text style={styles.buttonText}>📄 {viewTitle}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.editButton} onPress={onEdit}>
        <Text style={styles.buttonText}>✏️ {editTitle}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Text style={styles.buttonText}>🗑️ {deleteTitle}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    gap: 8,
  },
  baseButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  viewButton: {
    backgroundColor: "#28a745",
    borderColor: "#28a745",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButton: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    borderColor: "#dc3545",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
