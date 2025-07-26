import { useRoute } from "@react-navigation/native";
import { View, StyleSheet } from "react-native";
import SaleForm from "../../components/sales/SaleForm";

export default function SaleFormScreen() {
    const route = useRoute();
  const  sale  = route.params?.saleToEdit || null;
  return (
    <View style={styles.container}>
      <SaleForm saleToEdit={sale} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
