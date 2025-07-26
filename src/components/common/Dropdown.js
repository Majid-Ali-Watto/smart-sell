import { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";

export default function SearchableDropdown({
  label,
  value,
  setValue,
  options,
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = options.filter((item) =>
    item.label?.toLowerCase()?.includes(search?.toLowerCase())
  );

  const handleSelect = (val) => {
    setValue(val);
    setOpen(false);
    setSearch("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        style={styles.selectBox}
        onPress={() => setOpen((prev) => !prev)}
      >
        <Text>
          {options.find((o) => o.value === value)?.label || "Select..."}
        </Text>
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdown}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search..."
            style={styles.searchInput}
          />

          <ScrollView
            style={{ maxHeight: 160 }}
            keyboardShouldPersistTaps="handled"
          >
            {filtered.length > 0 ? (
              filtered.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleSelect(item.value)}
                  style={styles.option}
                >
                  <Text>{item.label}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.empty}>No results</Text>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 15 },
  label: { marginBottom: 5, fontWeight: "bold" },
  selectBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
  },
  dropdown: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#fff",
    maxHeight: 200,
    zIndex: 10,
  },
  searchInput: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    padding: 8,
  },
  option: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  empty: {
    textAlign: "center",
    color: "#999",
    padding: 10,
  },
});
