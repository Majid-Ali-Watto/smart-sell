import { Linking, Alert } from "react-native";

export const sendWhatsApp = (mobile, message = "Asslam-O-Alikum!") => {
  if (!mobile) return Alert.alert("Missing number");

  const phone = mobile.startsWith("+") ? mobile : `+92${mobile}`; // adjust if needed
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  Linking.canOpenURL(url)
    .then((supported) => {
      if (!supported) {
        Alert.alert("Error", "WhatsApp not installed");
      } else {
        return Linking.openURL(url);
      }
    })
    .catch((err) => console.error("Failed to open WhatsApp", err));
};
