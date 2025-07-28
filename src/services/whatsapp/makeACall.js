import { Linking, Alert } from "react-native";

export const makeCall = (phoneNumber) => {
  if (!phoneNumber) {
    Alert.alert("No number", "Phone number is missing.");
    return;
  }

  const url = `tel:${phoneNumber}`;
  Linking.canOpenURL(url)
    .then((supported) => {
      if (!supported) {
        Alert.alert("Error", "This device does not support calling.");
      } else {
        return Linking.openURL(url);
      }
    })
    .catch((err) => console.error("Failed to make a call:", err));
};
