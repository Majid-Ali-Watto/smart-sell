import * as Sharing from "expo-sharing";
import { Alert } from "react-native";
export const shareReport = async (fileUri) => {
  try {
    const isAvailable = await Sharing.isAvailableAsync();

    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: "application/pdf",
        dialogTitle: "Share Sales Report",
        UTI: "com.adobe.pdf",
      });
    } else {
      Alert.alert("Error", "Sharing is not available on this device");
    }
  } catch (error) {
    console.error("Error sharing PDF:", error);
    Alert.alert("Error", "Failed to share PDF. Please try again.");
  }
};
