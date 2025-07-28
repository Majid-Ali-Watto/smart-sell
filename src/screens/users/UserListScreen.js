import { View, StyleSheet, Text, TextInput } from "react-native";
import UsersList from "../../components/users/UserList";
import { useNavigation } from "@react-navigation/native";
import FloatingActionButton from "../../components/common/Fab";
import { useEffect, useState } from "react";
import SearchableDropdown from "../../components/common/Dropdown";
import {
  loadUsers,
  userWithAllSales,
} from "../../services/storage/userStorage";
import { sendWhatsApp } from "../../services/whatsapp/sendWhatsapp";

import { useDebounce } from "../../hooks/useDebounce";
import { downloadFile } from "../../services/reports/DownloadFile";
import { calculateSummary } from "../../services/utils/calculateSummary";
import { generateUserSummaryMessage } from "../../services/whatsapp/getFormattedMessage";
import { exportToExcel } from "../../services/reports/DownloadUSersInExcel";

export default function UserListScreen() {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageNumbers, setPageNumbers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedSales, setSelectedSales] = useState([]);

  const debouncedSearch = useDebounce(search, 400); // optional: use 300–500ms
  useEffect(() => {
    const fetch = async () => {
      try {
        let result;
        if (debouncedSearch.trim()) {
          result = await userWithAllSales(debouncedSearch, pageNo);
        } else {
          result = await loadUsers(pageNo);
        }
        setUsers(result?.data || []);
        setTotalPages(Math.ceil(result?.total / (result?.pageSize || 10)));
      } catch (error) {
        Alert.alert("Error", "Could not fetch users");
      }
    };

    fetch();

    const unsubscribe = navigation.addListener("focus", fetch);
    return unsubscribe;
  }, [navigation, debouncedSearch, pageNo]);

  useEffect(() => {
    const options = [];
    for (let i = 1; i <= totalPages; i++) {
      options.push({ label: i.toString(), value: i.toString() });
    }
    setPageNumbers(options);
  }, [totalPages]);

  useEffect(() => {
    if (debouncedSearch.trim()) setPageNo(1);
  }, [debouncedSearch]);
  const downloadSales = () =>
    downloadFile(
      debouncedSearch,
      selectedSales?.length ? selectedSales : users,
      calculateSummary(selectedSales?.length ? selectedSales : users)
    );

  function sendSummary(mobile, record) {
    sendWhatsApp(mobile, generateUserSummaryMessage(record));
  }
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search by name or caste..."
          value={search}
          onChangeText={setSearch}
          style={styles.input}
          placeholderTextColor="#888"
        />
        <Text style={{ fontWeight: "bold" }}>/ {totalPages}</Text>
      </View>
      <UsersList usersFetched={users} sendSummary={sendSummary} />

      <View style={styles.actionRow}>
        <FloatingActionButton label="📄" onPress={downloadSales} />
        <FloatingActionButton label="📊" onPress={() => exportToExcel(users)}  />

        
        <View style={styles.paginationContainer}>
          <Text
            onPress={() => setPageNo((prev) => Math.max(prev - 1, 1))}
            style={[styles.pageButton, pageNo === 1 && styles.disabledButton]}
          >
            ◀ Prev
          </Text>
          <Text
            onPress={() => setPageNo((prev) => Math.min(prev + 1, totalPages))}
            style={[
              styles.pageButton,
              pageNo === totalPages && styles.disabledButton,
            ]}
          >
            Next ▶
          </Text>
        </View>

        <FloatingActionButton onPress={() => navigation.navigate("UserForm")} />
      </View>

      <View style={styles.dropdownWrapper}>
        <SearchableDropdown
          label=""
          selectBoxPaddingVertical={2}
          value={pageNo}
          setValue={(val) => setPageNo(Number(val))}
          options={pageNumbers}
          openAbove={true}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 4,
  },
  paginationContainer: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 12,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pageButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: "#1976D2",
    color: "#fff",
    fontSize: 14,
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
    width: "83%",
  },
  disabledButton: {
    backgroundColor: "#aaa",
    color: "#eee",
  },
  dropdownWrapper: {
    position: "absolute",
    top: 22,
    right: 22,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderRadius: 8,
    columnGap: 4,
  },
});
