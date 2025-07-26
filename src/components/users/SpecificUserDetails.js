import { useEffect, useState } from "react";
import {
  View,
   StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { getSaleForSpecificUser } from "../../services/storage/saleStorage";
import SaleListScreen from "../../screens/sales/SaleListScreen";

export default function UserSalesDetails() {
  const route = useRoute();
  const { userId } = route.params;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setData([]);
        const result = await getSaleForSpecificUser(userId);
        setData(result)
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) return <ActivityIndicator style={{ marginTop: 20 }} />;

  return (
    <View style={styles.container}>
      <SaleListScreen specificUserSales={data}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
});
