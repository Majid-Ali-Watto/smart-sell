import { useState, useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TextInput,
  Text,
  Alert,
} from "react-native";
import { deleteUser } from "../../services/storage/userStorage";
import { useNavigation } from "@react-navigation/native";
import Card from "../common/Card";
import ActionButtons from "../common/ActionButtons";
import { makeCall } from "../../services/whatsapp/makeACall";
import { saveToContacts } from "../../services/utils/saveMobileNumber";

export default function UsersList({ usersFetched, sendSummary }) {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setUsers(usersFetched || []);
  }, [usersFetched]);

  const filteredUsers = users;

  const handleDelete = async (id) => {
    Alert.alert("Delete", "Are you sure you want to delete this user?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          await deleteUser(id);
          fetchUsers();
        },
      },
    ]);
  };

  const startEdit = (user) => {
    navigation.navigate("UserForm", { userToEdit: user });
  };

  const getDetails = (user) => {
    navigation.navigate("UserSalesDetails", { userId: user.id });
  };

  const renderUser = ({ item }) => (
    <Card style={styles.card}>
      <View style={[styles.infoRow, { justifyContent: "space-between" }]}>
        <Text style={styles.cardTitle}>{item.fullName}</Text>
        <Text style={styles.detailText}>Customer ID: {item.id}</Text>
      </View>

      <View style={[styles.infoRow, { justifyContent: "space-between" }]}>
        <Text style={styles.cardSubtitle}>🧬 {item.caste}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.icon}>📱</Text>
          <Text
          onLongPress={() => saveToContacts(item.fullName?.trim()+' '+item?.caste, item.mobile)}
            onPress={() => sendSummary(item?.mobile, item)}
            style={[
              styles.detailText,
              { color: "blue", textDecorationLine: "underline" },
            ]}
          >
            {item.mobile}
          </Text>
        </View>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.icon}>🏠</Text>
        <Text style={styles.detailText}>{item.address}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>💰 Total</Text>
          <Text style={styles.statValue}>Rs {item.total || 0}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>⏳ Pending</Text>
          <Text style={styles.statValue}>Rs {item.pending || 0}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>✅ Given</Text>
          <Text style={styles.statValue}>Rs {item.given || 0}</Text>
        </View>
      </View>

      <ActionButtons
        onView={() => getDetails(item)}
        onEdit={() => startEdit(item)}
        onDelete={() => handleDelete(item.id)}
        viewTitle="Sales"
      >
        <Text
          style={{
            color: "white",
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 5,
            fontWeight: "bold",
            textAlign: "center",
            borderColor: "gray",
            borderWidth: 0.5,
          }}
          onPress={() => makeCall(item?.mobile)}
        >
          📞
        </Text>
      </ActionButtons>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No users found.
          </Text>
        }
        renderItem={renderUser}
        contentContainerStyle={{ paddingBottom: 300 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: "#f2f2f2",
    flex: 1,
  },
  input: {
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    color: "#333",
    fontSize: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontWeight: "700",
    fontSize: 18,
    color: "#222",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#777",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 4,
  },
  icon: {
    fontSize: 16,
    marginRight: 6,
  },
  detailText: {
    fontSize: 14,
    color: "#444",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#f6f6f6",
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 4,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
});
