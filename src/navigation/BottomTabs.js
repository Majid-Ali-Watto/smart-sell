import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import SaleManager from "../navigation/SaleManager";
import UserManager from "../navigation/UserManager";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Users"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#087E8B",
      }}
    >
      <Tab.Screen
        name="Users"
        component={UserManager}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-group"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Sales"
        component={SaleManager}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="cart-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
