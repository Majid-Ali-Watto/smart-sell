import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Alert,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from "react-native";
import { addUser, updateUser } from "../../services/storage/userStorage";
import { useNavigation } from "@react-navigation/native";
import ContactPickerModal from "../../components/common/ContactPickerModal"; // 👈 import

export default function UserForm({ userToEdit }) {
  const [formData, setFormData] = useState({
    id: "",
    fullName: "",
    caste: "",
    mobile: "",
    address: "",
  });
  const [contactModalVisible, setContactModalVisible] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    if (userToEdit) {
      setFormData(userToEdit);
    }
  }, [userToEdit]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };
  const handleSelectContact = (contact) => {
    setFormData((prev) => ({
      ...prev,
      fullName: contact.name,
      mobile: contact.number,
    }));
  };

  const handleSubmit = async () => {
    const { fullName, mobile, address } = formData;
    if (!fullName || !mobile || !address) {
      Alert.alert("Validation Error", "Please fill all required fields.");
      return;
    }

    const userData = {
      ...formData,
      id: formData.id || Date.now().toString(),
    };

    if (userToEdit) {
      await updateUser(userData);
    } else {
      await addUser(userData);
    }

    Alert.alert("Success", "User saved successfully.");
    setFormData({ id: "", fullName: "", caste: "", mobile: "", address: "" });
    navigation.navigate("UserList");
  };

  const renderInput = (
    label,
    field,
    keyboardType = "default",
    required = false
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={styles.input}
        value={formData[field]}
        onChangeText={(text) => handleChange(field, text)}
        keyboardType={keyboardType}
        placeholder={label}
        placeholderTextColor="#888"
      />
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {renderInput("Full Name", "fullName", "default", true)}
      {renderInput("Caste", "caste", "default")}
      {renderInput("Mobile Number", "mobile", "phone-pad", true)}

      <TouchableOpacity
        onPress={() => setContactModalVisible(true)}
        style={styles.pickBtn}
      >
        <Text style={styles.pickBtnText}>📇 Pick from Contacts</Text>
      </TouchableOpacity>

      {renderInput("Address", "address", "default", true)}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>
          {userToEdit ? "Update User" : "Add User"}
        </Text>
      </TouchableOpacity>

      <ContactPickerModal
        visible={contactModalVisible}
        onClose={() => setContactModalVisible(false)}
        onSelect={handleSelectContact}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: "#333",
  },
  required: {
    color: "red",
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
  pickBtn: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  pickBtnText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: "#007bff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
