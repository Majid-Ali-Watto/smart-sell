import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { deleteSale } from "../../services/storage/saleStorage";
import ActionButtons from "../common/ActionButtons";
import { downloadFile } from "../../services/reports/DownloadFile";

const SalesList = ({ salesFetched }) => {
  const navigation = useNavigation();
  const [sales, setSales] = useState([]);

  // Update sales when salesFetched prop changes
  useEffect(() => {
    setSales(salesFetched || []);
  }, [salesFetched]);

  const handleDelete = async (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this sale?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteSale(id);
              setSales((prev) => prev.filter((s) => s.id !== id));
              Alert.alert("Success", "Sale deleted successfully");
            } catch (err) {
              console.error("Failed to delete sale:", err);
              Alert.alert("Error", "Failed to delete sale. Please try again.");
            }
          },
        },
      ]
    );
  };

  const handleEdit = (item) => {
    navigation.navigate("SaleForm", { saleToEdit: item });
  };

  const downloadSales = (item)=>  downloadFile(item.id, [item], null);

  const renderSaleItem = ({ item }) => (
    <View style={styles.card}>
      {/* Customer Info */}

      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>{item?.fullName}</Text>
        <Text style={styles.customerDetails}>
          Customer ID: {item?.customer}
        </Text>
      </View>

      <Text style={styles.customerDetails}>
        {item?.caste && `${item.caste} • `}
        {item?.address && `${item.address} • `}
        {item?.mobile || "No mobile"}
      </Text>

      {/* Date */}
      <View style={styles.customerInfo}>
        <Text style={styles.date}>
          Date: {new Date(item.date).toLocaleDateString("en-GB")}
        </Text>
        <Text style={styles.date}>Order ID: {item.id}</Text>
      </View>
      {/* Products */}
      {item?.products && item.products.length > 0 && (
        <View style={styles.productsSection}>
          <Text style={styles.productsHeader}>Products:</Text>
          {item.products.map((product, index) => (
            <View key={index} style={styles.productRow}>
              <Text style={styles.product}>
                •{" "}
                <Text style={styles.productName}>
                  {product.product || product.name || "Unknown Product"}
                </Text>
              </Text>
              <Text style={styles.productDetails}>
                Qty: {product.quantity || 0} | Price: Rs. {product.price || 0} |
                Total: Rs. {product.total || 0}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Financial Info */}
      <View style={styles.financialInfo}>
        <Text style={styles.total}>Total: Rs. {item.total || 0}</Text>
        <Text style={styles.paid}>Paid: Rs. {item.paid || 0}</Text>
        <Text style={styles.pending}>Pending: Rs. {item.pending || 0}</Text>
      </View>

      <ActionButtons
        onView={() => downloadSales(item)}
        onEdit={() => handleEdit(item)}
        onDelete={() => handleDelete(item.id)}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={sales}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={renderSaleItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No sales found.</Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default SalesList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  customerName: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#087E8B",
    marginBottom: 4,
  },
  customerDetails: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  customerInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#087E8B",
  },
  date: {
    fontSize: 13,
    color: "#888",
    marginBottom: 12,
  },
  productsSection: {
    marginBottom: 12,
  },
  productsHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  productRow: {
    marginLeft: 8,
    marginBottom: 6,
    backgroundColor: "#F8F9FA",
    padding: 8,
    borderRadius: 6,
  },
  product: {
    fontSize: 14,
    color: "#333",
  },
  productName: {
    fontWeight: "600",
    color: "#087E8B",
  },
  productDetails: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
    marginLeft: 12,
  },
  financialInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  total: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  paid: {
    fontSize: 14,
    color: "#28A745",
    fontWeight: "500",
  },
  pending: {
    fontSize: 14,
    color: "#DC3545",
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#087E8B",
  },
  deleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#DC3545",
  },
  editButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
