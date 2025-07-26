import { Alert } from "react-native";
import { generatePDF } from "./pdfGenerator";
import { shareReport } from "./ShareReport";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
export async function downloadFile(search, filteredSales, summary) {
    try {
      // Show loading state
      Alert.alert(
        "Generating PDF",
        "Please wait while we generate your sales report..."
      );

      const htmlContent = await generatePDF(search, filteredSales, summary);

      // Generate PDF
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      // Create a better filename
      const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
      const searchSuffix = search
        ? `_filtered_${search.replace(/\s+/g, "_")}`
        : "";
      const fileName = `sales_report_${currentDate}${searchSuffix}.pdf`;

      // Move to a permanent location
      const newPath = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.moveAsync({
        from: uri,
        to: newPath,
      });

      // Show share options
      Alert.alert(
        "PDF Generated Successfully!",
        "Your sales report has been generated. What would you like to do?",
        [
          {
            text: "Share",
            onPress: () => shareReport(newPath),
          },
          {
            text: "Save Only",
            onPress: () => Alert.alert("Success", `Report saved as ${fileName}`),
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      Alert.alert("Error", "Failed to generate PDF. Please try again.");
    }
}



