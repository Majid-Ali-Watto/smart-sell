import { View, StyleSheet } from "react-native";
import UserForm from "../../components/users/UserForm";
import {  useRoute } from "@react-navigation/native";

export default function UserFormScreen() {
  const route = useRoute();
  const userToEdit = route.params?.userToEdit || null;

  return (
    <View style={styles.container}>
      <UserForm userToEdit={userToEdit}  />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
