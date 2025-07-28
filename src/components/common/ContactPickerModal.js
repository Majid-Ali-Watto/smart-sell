import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import * as Contacts from "expo-contacts";
import { useDebounce } from "../../hooks/useDebounce"; // optional but recommended

export default function ContactPickerModal({ visible, onClose, onSelect }) {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (!visible) return;

    const getContacts = async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access contacts was denied");
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });

      const filtered = data.filter(
        (c) => c.phoneNumbers && c.phoneNumbers.length > 0
      );

      setContacts(filtered);
      setLoading(false);
    };

    getContacts();
  }, [visible]);

  const filteredContacts = useMemo(() => {
    if (!debouncedSearch) return contacts;

    return contacts.filter((contact) =>
      contact.name?.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [debouncedSearch, contacts]);

  const renderItem = useCallback(
    ({ item }) => {
      const number = item.phoneNumbers?.[0]?.number;

      return (
        <TouchableOpacity
          style={styles.contactItem}
          onPress={() => {
            onSelect({ name: item.name, number });
            onClose();
          }}
        >
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactNumber}>{number}</Text>
        </TouchableOpacity>
      );
    },
    [onSelect, onClose]
  );

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.title}>Pick a Contact</Text>

        <TextInput
          style={styles.input}
          placeholder="Search..."
          value={search}
          onChangeText={setSearch}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : (
          <FlatList
            data={filteredContacts}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            initialNumToRender={20}
            maxToRenderPerBatch={30}
            windowSize={10}
          />
        )}

        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  input: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
  },
  contactItem: {
    paddingVertical: 12,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  contactName: { fontSize: 16, fontWeight: "bold" },
  contactNumber: { color: "#333", fontSize: 14 },
  closeBtn: {
    marginTop: 20,
    backgroundColor: "#007bff",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  closeText: { color: "#fff", fontSize: 16 },
});
