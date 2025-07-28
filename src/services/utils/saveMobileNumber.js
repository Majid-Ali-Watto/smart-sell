import * as Contacts from "expo-contacts";
import { Alert } from "react-native";

// Helper to normalize numbers (remove +, -, space, etc.)
const normalizeNumber = (num) => {
  return num.replace(/[^\d]/g, ""); // keeps only digits
};

export const saveToContacts = async (name, number) => {
  const { status } = await Contacts.requestPermissionsAsync();

  if (status !== "granted") {
    Alert.alert("Permission Denied", "Cannot access contacts.");
    return;
  }

  const normalizedInput = normalizeNumber(number);

  try {
    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers],
    });

    const found = data.find((contact) => {
      return contact.phoneNumbers?.some((p) => {
        const normalizedContactNum = normalizeNumber(p.number);
        return (
          normalizedContactNum === normalizedInput ||
          normalizedContactNum.endsWith(normalizedInput) ||
          normalizedInput.endsWith(normalizedContactNum)
        );
      });
    });

    if (found) {
      const matchedNumber = found.phoneNumbers.find((p) => {
        const normalized = normalizeNumber(p.number);
        return (
          normalized === normalizedInput ||
          normalized.endsWith(normalizedInput) ||
          normalizedInput.endsWith(normalized)
        );
      });

      Alert.alert(
        "Already Exists",
        `Name: ${found.name}\nNumber: ${matchedNumber?.number}`
      );
      return;
    }

    // Add new contact
    const newContact = {
      [Contacts.Fields.FirstName]: name,
      [Contacts.Fields.PhoneNumbers]: [{ label: "mobile", number }],
    };

    const contactId = await Contacts.addContactAsync(newContact);

    if (contactId) {
      Alert.alert("Success", "Contact saved successfully.");
    }
  } catch (error) {
    console.error("Error saving contact:", error);
    Alert.alert("Error", "Failed to save contact.");
  }
};
