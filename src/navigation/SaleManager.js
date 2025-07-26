import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SaleListScreen from "../screens/sales/SaleListScreen";
import SaleFormScreen from "../screens/sales/SaleFormScreen";

const Stack = createNativeStackNavigator();

export default function SaleManager() {
  return (
    <Stack.Navigator
      initialRouteName="SaleList"
      screenOptions={{
        headerShown: false, 
      }}
  
    >
      <Stack.Screen name="SaleList" component={SaleListScreen} options={{ title: "Sales" }} />
      <Stack.Screen name="SaleForm" component={SaleFormScreen} options={{ title: "Sale Form" }} />
    </Stack.Navigator>
  );
}
