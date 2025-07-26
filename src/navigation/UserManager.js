import { createNativeStackNavigator } from "@react-navigation/native-stack";
import UserListScreen from "../screens/users/UserListScreen";
import UserFormScreen from "../screens/users/UserFormScreen";
import UserSalesDetailsScreen from "../components/users/SpecificUserDetails"; // Assuming this screen exists
import SaleFormScreen from "../screens/sales/SaleFormScreen";
const Stack = createNativeStackNavigator();

export default function UserManager() {
  return (
    <Stack.Navigator
      initialRouteName="UserList"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="UserList"
        component={UserListScreen}
        options={{ title: "Users" }}
      />
      <Stack.Screen
        name="UserForm"
        component={UserFormScreen}
        options={{ title: "User Form" }}
      />
      <Stack.Screen name="SaleForm" component={SaleFormScreen} options={{ title: "Sale Form" }} />
     
      <Stack.Screen
        name="UserSalesDetails"
        component={UserSalesDetailsScreen}
        options={{ title: "User Sales Details" }}
      />
    </Stack.Navigator>
  );
}
