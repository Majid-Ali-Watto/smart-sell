import {
  View,
  StyleSheet,
  Text,
  TextInput,
  Alert,
} from "react-native";
import SaleList from "../../components/sales/SalesList";
import FloatingActionButton from "../../components/common/Fab";
import { useEffect, useState, useMemo } from "react";
import { getSales } from "../../services/storage/saleStorage"

import { useNavigation } from "@react-navigation/native";
import { downloadFile } from "../../services/reports/DownloadFile";

export default function SaleListScreen({ specificUserSales }) {
  const [search, setSearch] = useState("");
  const [sales, setSales] = useState([]);
  const navigation = useNavigation();
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const result = await getSales();
        setSales(result);
      } catch (err) {
        Alert.alert(
          "Error",
          "Failed to load sales data. Please try again later."
        );
      }
    };
    if(specificUserSales) {
      setSales(specificUserSales);
    }
    else{
      const unsubscribe = navigation.addListener("focus", fetchSales);
      return unsubscribe;
    }
  }, [navigation]);

  // Filter sales based on search
  const filteredSales = sales.filter(
    (sale) =>
      sale.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      sale.caste?.toLowerCase().includes(search.toLowerCase()) ||
      sale.address?.toLowerCase().includes(search.toLowerCase()) ||
      sale.mobile?.includes(search) ||
      sale.id?.includes(search) ||
      sale.customer?.includes(search)
  );

  // Calculate summary based on filtered sales
  const summary = useMemo(() => {
    const totalSales = filteredSales.reduce(
      (sum, sale) => sum + (sale.total || 0),
      0
    );
    const totalPaid = filteredSales.reduce(
      (sum, sale) => sum + (sale.paid || 0),
      0
    );
    const totalPending = filteredSales.reduce(
      (sum, sale) => sum + (sale.pending || 0),
      0
    );

    return {
      count: filteredSales.length,
      totalSales,
      totalPaid,
      totalPending,
    };
  }, [filteredSales]);

  const downloadSales = ()=>  downloadFile(search, filteredSales, summary);



  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search by name, caste, address, or mobile..."
          value={search}
          onChangeText={setSearch}
          style={styles.input}
          placeholderTextColor="#888"
        />
      </View>

      {/* Summary Section */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{summary.count}</Text>
            <Text style={styles.summaryLabel}>
              {search ? "Filtered Sales" : "Total Sales"}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, styles.totalValue]}>
              Rs. {summary.totalSales.toLocaleString()}
            </Text>
            <Text style={styles.summaryLabel}>Total Amount</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, styles.paidValue]}>
              Rs. {summary.totalPaid.toLocaleString()}
            </Text>
            <Text style={styles.summaryLabel}>Amount Received</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, styles.pendingValue]}>
              Rs. {summary.totalPending.toLocaleString()}
            </Text>
            <Text style={styles.summaryLabel}>Amount Pending</Text>
          </View>
        </View>

        {search && (
          <View style={styles.searchIndicator}>
            <Text style={styles.searchIndicatorText}>
              📊 Showing results for "{search}"
            </Text>
          </View>
        )}
      </View>

      <SaleList salesFetched={filteredSales} />

      <FloatingActionButton
        position={{ left: 20 }}
        label="📄"
        onPress={downloadSales}
      />
      {specificUserSales ? null : 
      <FloatingActionButton onPress={() => navigation.navigate("SaleForm")} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    color: "#333",
    fontSize: 16,
  },
  summaryContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 5,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    fontWeight: "500",
  },
  totalValue: {
    color: "#087E8B",
  },
  paidValue: {
    color: "#28A745",
  },
  pendingValue: {
    color: "#DC3545",
  },
  searchIndicator: {
    backgroundColor: "#E3F2FD",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  searchIndicatorText: {
    fontSize: 12,
    color: "#1976D2",
    textAlign: "center",
    fontWeight: "500",
  },
});
