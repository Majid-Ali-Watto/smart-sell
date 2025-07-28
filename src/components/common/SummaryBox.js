import React from "react";
import { View, Text } from "react-native";

export default function SummaryBox({ summary, search }) {
  const summaryRowStyle = {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  };

  const summaryItemStyle = {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 5,
  };

  const summaryValueStyle = {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  };

  const summaryLabelStyle = {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    fontWeight: "500",
  };

  return (
    <>
      <View style={summaryRowStyle}>
        <View style={summaryItemStyle}>
          <Text style={summaryValueStyle}>{summary.count}</Text>
          <Text style={summaryLabelStyle}>
            {search ? "Filtered Sales" : "Total Sales"}
          </Text>
        </View>

        <View style={summaryItemStyle}>
          <Text style={[summaryValueStyle, { color: "#087E8B" }]}>
            Rs. {summary.totalSales.toLocaleString()}
          </Text>
          <Text style={summaryLabelStyle}>Total Amount</Text>
        </View>
      </View>

      <View style={summaryRowStyle}>
        <View style={summaryItemStyle}>
          <Text style={[summaryValueStyle, { color: "#28A745" }]}>
            Rs. {summary.totalPaid.toLocaleString()}
          </Text>
          <Text style={summaryLabelStyle}>Amount Received</Text>
        </View>

        <View style={summaryItemStyle}>
          <Text style={[summaryValueStyle, { color: "#DC3545" }]}>
            Rs. {summary.totalPending.toLocaleString()}
          </Text>
          <Text style={summaryLabelStyle}>Amount Pending</Text>
        </View>
      </View>
    </>
  );
}
