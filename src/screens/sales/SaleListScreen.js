import { View, StyleSheet, Text, TextInput, Alert,ActivityIndicator } from "react-native";
import SaleList from "../../components/sales/SalesList";
import FloatingActionButton from "../../components/common/Fab";
import { useEffect, useState, useMemo } from "react";
import {
  getSales,
  getAllSales,
  searchSales as searchSalesFromDB,
} from "../../services/storage/saleStorage";

import { useNavigation } from "@react-navigation/native";
import { downloadFile } from "../../services/reports/DownloadFile";
import SearchableDropdown from "../../components/common/Dropdown";
import { useDebounce } from "../../hooks/useDebounce";
import SummaryBox from "../../components/common/SummaryBox";
import SummaryModal from "../../components/common/SummaryModal";
import { calculateSummary } from "../../services/utils/calculateSummary";
import { exportSalesWithProductsToExcel } from "../../services/reports/DownloadSalesWithProducts";
export default function SaleListScreen({ userId }) {
  const [search, setSearch] = useState(userId || "");
  const debouncedSearch = useDebounce(search, 400); // optional: use 300–500ms
  const [sales, setSales] = useState([]);
  const [selectedSales, setSelectedSales] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageNumbers, setPageNumbers] = useState([0]);
  const [showAllSummary, setShowAllSummary] = useState(false);
  const [summaryOfAll, setSummaryOfAll] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        const result = debouncedSearch.trim()
        ? await searchSalesFromDB(debouncedSearch, pageNo)
        : await getSales(pageNo);
        setTotalPages(Math.ceil(result?.total / (result?.pageSize || 10)));
        setSales(result?.data || []);
      } catch (err) {
        console.error(err)
        Alert.alert(
          "Error",
          "Failed to load sales data. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };
    // setSelectedSales([]);
    // if (specificUserSales) {
    //   setSales(specificUserSales);
    // } else {
    fetchSales(); // call on pageNo change too

    const unsubscribe = navigation.addListener("focus", fetchSales);
    return unsubscribe;
    // }
  }, [navigation, pageNo]);

  useEffect(() => {
    const arr = [];
    for (let i = 1; i <= totalPages; i++) {
      arr.push({ label: i.toString(), value: i.toString() });
    }
    setPageNumbers(arr);
  }, [totalPages]);

  useEffect(() => {
    setLoading(true);
    async function fetchSearchedSales() {
      const result = debouncedSearch.trim()
        ? await searchSalesFromDB(debouncedSearch, pageNo)
        : await getSales(pageNo);
      setTotalPages(Math.ceil(result?.total / (result?.pageSize || 10)));
      setSales(result?.data || []);
      setPageNo(1);
      setLoading(false);
    }

    fetchSearchedSales();
  }, [debouncedSearch]);
  const filteredSales = sales;

  async function getFullSummary(query) {
    const result = await getAllSales(query);
    setShowAllSummary(true);
    setSummaryOfAll(calculateSummary(result.data));
  }
  async function downloadAllSales() {
    const result = await getAllSales(debouncedSearch);

    downloadFile(debouncedSearch, result.data, summaryOfAll);
  }

  // Calculate summary based on filtered sales
  const summary = useMemo(() => {
    const salesData = selectedSales?.length ? selectedSales : filteredSales;
    return calculateSummary(salesData);
  }, [filteredSales, selectedSales]);

  const downloadSales = () =>
    downloadFile(
      debouncedSearch,
      selectedSales?.length ? selectedSales : filteredSales,
      summary
    );

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;

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
        <Text style={{ fontWeight: "bold" }}>/ {totalPages}</Text>
      </View>

      {/* Summary Section */}
      <View style={styles.summaryContainer}>
        <Text style={styles.searchIndicatorText}>Summary of Current Page</Text>

        <SummaryBox summary={summary} search={debouncedSearch} />
        {showAllSummary && (
          <SummaryModal
            closeModal={setShowAllSummary}
            showModal={showAllSummary}
          >
            <View>
              <SummaryBox summary={summaryOfAll} search={debouncedSearch} />
              <Text
                style={{
                  color: "white",
                  backgroundColor: "#007bff",
                  padding: 5,
                  borderRadius: 3,
                }}
                onPress={() => downloadAllSales()}
              >
                Download Sales of {debouncedSearch || "All"}
              </Text>
            </View>
          </SummaryModal>
        )}
        {debouncedSearch && (
          <View style={styles.searchIndicator}>
            <Text style={styles.searchIndicatorText}>
              📊 Showing results for "{debouncedSearch}"
            </Text>
            <Text>|</Text>
            <Text
              onPress={() => getFullSummary(debouncedSearch)}
              style={styles.searchIndicatorText}
            >
              Full Summary
            </Text>
          </View>
        )}
        {!debouncedSearch && (
          <Text
            onPress={() => getFullSummary("")}
            style={styles.searchIndicatorText}
          >
            Click here view Full Summary of All Sales
          </Text>
        )}
      </View>
      <SaleList
        setSelectedSales={setSelectedSales}
        salesFetched={filteredSales}
        selectedSales={selectedSales}
      />
      <View
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          flexDirection: "row",
          paddingBlock: 4,
        }}
      >
        <FloatingActionButton
          // position={{ left: 20 }}
          label="📄"
          onPress={downloadSales}
        />
        <FloatingActionButton label="📊" onPress={() => exportSalesWithProductsToExcel(sales)}  />
        
        <View style={styles.paginationContainer}>
          <Text
            onPress={() => setPageNo((prev) => Number(prev) - 1)}
            style={[styles.pageButton, pageNo == 1 && styles.disabledButton]}
            disabled={pageNo == 1}
          >
            ◀ Prev
          </Text>

          <Text
            onPress={() => setPageNo((prev) => Number(prev) + 1)}
            style={[
              styles.pageButton,
              pageNo == totalPages && styles.disabledButton,
            ]}
            disabled={pageNo == totalPages}
          >
            Next ▶
          </Text>
        </View>

        {userId ? null : (
          <FloatingActionButton
            onPress={() => navigation.navigate("SaleForm")}
          />
        )}
      </View>
      <View
        style={{
          position: "absolute",
          top: 22,
          right: 22,
          alignSelf: "center",
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          // backgroundColor: "skyblue",
          borderRadius: 8,
          columnGap: 4,
          // borderColor: 'gray',
          // borderWidth:0.5
          // elevation: 10, // For Android
        }}
      >
        <SearchableDropdown
          label=""
          selectBoxPaddingVertical={2}
          value={pageNo}
          setValue={(val) => setPageNo(val)}
          options={pageNumbers}
          openAbove={true} // custom prop to control direction
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    position: "relative",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  searchIndicatorText: {
    fontSize: 12,
    color: "#1976D2",
    textAlign: "center",
    fontWeight: "500",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    columnGap: 16,
  },
  pageButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: "#1976D2",
    color: "#fff",
    // fontWeight: "bold",
    fontSize: 14,
    overflow: "hidden",
  },
  disabledButton: {
    backgroundColor: "#aaa",
    color: "#eee",
  },
});
