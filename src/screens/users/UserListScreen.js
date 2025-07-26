import { View, StyleSheet } from "react-native";
import UsersList from "../../components/users/UserList";
import { useNavigation } from "@react-navigation/native";
import FloatingActionButton from "../../components/common/Fab";
export default function UserListScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <UsersList />
      <FloatingActionButton onPress={() => navigation.navigate("UserForm")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
