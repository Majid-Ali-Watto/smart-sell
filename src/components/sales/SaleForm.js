import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
  TextInput,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { saveSale } from "../../services/storage/saleStorage";
import { getUserForSaleForm } from "../../services/storage/userStorage";
import Dropdown from "../common/Dropdown";
import DateTimePicker from "../common/DatePicker";
import { useNavigation } from "@react-navigation/native";
import { useDebounce } from "../../hooks/useDebounce";

export default function SaleForm({ saleToEdit }) {
  const navigation = useNavigation();

  const [productEntry, setProductEntry] = useState({
    product: "",
    quantity: "",
    price: "",
    total: "",
  });

  const [search, setSearch] = useState("Watto");
  const [productList, setProductList] = useState([]);
  const [productsTotal, setProductsTotal] = useState(0);
  const [productEntryUpdate, setProductEntryUpdate] = useState(false);
  const [productEntryUpdateObj, setProductEntryUpdateObj] = useState(null);
  const [form, setForm] = useState({
    customer: "",
    paid: "",
    pending: "",
    date: new Date(),
  });

  const [users, setUsers] = useState([]);
  const debouncedSearch = useDebounce(search, 400); // Debounce for 400ms
  // Load users
  useEffect(() => {
    let isCancelled = false;

    (async () => {
      try {
        const data = await getUserForSaleForm(debouncedSearch);

        if (!isCancelled && data?.data?.length) {
          const names = data.data.map((user) => ({
            label: `${user.fullName} / ${user.caste} / ${user.address}`,
            value: user.id,
          }));
          setUsers(names);
        } else if (!isCancelled) {
          setUsers([]);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
        if (!isCancelled) setUsers([]);
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [debouncedSearch]);

  // Pre-fill if editing
  useEffect(() => {
    if (saleToEdit) {
      setForm({
        customer: saleToEdit.customer,
        paid: saleToEdit.paid.toString(),
        pending: saleToEdit.pending.toString(),
        date: new Date(saleToEdit.date),
      });
      setProductList(saleToEdit.products || []);
    }
  }, [saleToEdit]);

  // Update product total
  useEffect(() => {
    const q = parseFloat(productEntry.quantity);
    const p = parseFloat(productEntry.price);
    if (!isNaN(q) && !isNaN(p)) {
      setProductEntry((prev) => ({ ...prev, total: (q * p).toString() }));
    } else {
      setProductEntry((prev) => ({ ...prev, total: "" }));
    }
  }, [productEntry.quantity, productEntry.price]);

  // Update pending when paid or productList changes
  useEffect(() => {
    const total = productList.reduce(
      (sum, item) => sum + parseFloat(item.total || 0),
      0
    );
    setProductsTotal(total);
    const paid = parseFloat(form.paid);
    if (!isNaN(total) && !isNaN(paid)) {
      setForm((prev) => ({
        ...prev,
        pending: (total - paid).toString(),
      }));
    }
  }, [form.paid, productList]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleProductChange = (key, value) => {
    setProductEntry((prev) => ({ ...prev, [key]: value }));
  };

  const addProduct = () => {
    if (
      !productEntry.product ||
      !productEntry.quantity ||
      !productEntry.price
    ) {
      Alert.alert("Missing Info", "Fill product, quantity and price.");
      return;
    }
    if (productEntryUpdate) {
      setProductList((prev) =>
        prev.map((item) =>
          item.id === productEntryUpdateObj.id ? productEntry : item
        )
      );
      setProductEntryUpdate(false);
      setProductEntryUpdateObj(null);
    } else setProductList((prev) => [...prev, productEntry]);
    setProductEntry({
      product: "",
      quantity: "",
      price: "",
      total: "",
    });
  };

  const removeProduct = (index) => {
    setProductList((prev) => prev.filter((_, i) => i !== index));
  };
  const updateProduct = (item) => {
    setProductEntry({
      product: item.product || "",
      quantity: item.quantity?.toString() || "",
      price: item.price?.toString() || "",
      total: item.total?.toString() || "",
    });

    setProductEntryUpdate(true);
    setProductEntryUpdateObj(item);
  };

  const handleSave = async () => {
    if (!form.customer || productList.length === 0) {
      Alert.alert(
        "Validation Error",
        "Customer and at least one product are required."
      );
      return;
    }

    const totalAmount = productList.reduce(
      (sum, item) => sum + parseFloat(item.total || 0),
      0
    );

    const commonData = {
      ...form,
      total: totalAmount.toString(),
      date: form.date.toISOString(),
      products: productList,
    };

    const saleData = {
      ...commonData,
      id: saleToEdit?.id || Date.now().toString(),
    };

    try {
      await saveSale(saleData);
      Alert.alert("Success", "Sale saved successfully.");

      navigation.navigate("SaleList");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const renderInput = (
    label,
    field,
    onChange,
    value,
    keyboardType = "default"
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={(text) => onChange(field, text)}
        keyboardType={keyboardType}
        placeholder={label}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionTitle}>Add Product</Text>
        {renderInput(
          "Product",
          "product",
          handleProductChange,
          productEntry.product
        )}
        {renderInput(
          "Quantity",
          "quantity",
          handleProductChange,
          productEntry.quantity,
          "numeric"
        )}
        {renderInput(
          "Price",
          "price",
          handleProductChange,
          productEntry.price,
          "numeric"
        )}
        {renderInput("Total", "total", () => {}, productEntry.total, "numeric")}

        <TouchableOpacity style={styles.buttonOutline} onPress={addProduct}>
          <Text style={styles.buttonText}>Add Product</Text>
        </TouchableOpacity>

        {productList.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              Products Added of Total Rs. {productsTotal}
            </Text>
            {productList.map((item, index) => (
              <View key={index} style={styles.productRow}>
                <Text style={{ flex: 1 }}>
                  {item.product} ({item.quantity} × {item.price})
                </Text>
                <Text style={{ width: 60 }}>{item.total}</Text>
                <TouchableOpacity onPress={() => removeProduct(index)}>
                  <Text style={{ color: "red", marginLeft: 10 }}>Remove</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => updateProduct(item)}>
                  <Text style={{ color: "orange", marginLeft: 10 }}>
                    Update
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        <View style={styles.inputGroup}>
          <Dropdown
            label="Customer"
            value={form.customer}
            setValue={(val) => handleChange("customer", val)}
            options={users}
            searchValue={search}
            setSearchValue={setSearch}
          />
        </View>

        {renderInput("Paid", "paid", handleChange, form.paid, "numeric")}
        {renderInput("Pending", "pending", () => {}, form.pending, "numeric")}

        <View style={styles.inputGroup}>
          <DateTimePicker
            date={form.date}
            setDate={(val) => handleChange("date", val)}
          />
        </View>

        <TouchableOpacity style={styles.buttonOutline} onPress={handleSave}>
          <Text style={styles.buttonText}>
            {saleToEdit ? "Update Sale" : "Save Sale"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 100,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    fontSize: 16,
    color: "#000",
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  buttonOutline: {
    borderColor: "#007bff",
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "##007bff",
    fontSize: 16,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    // marginTop: 20,
    marginBottom: 8,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 6,
  },
});
