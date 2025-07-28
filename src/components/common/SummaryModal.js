import { Modal, View, Text } from "react-native";

export default function SummaryModal({ children, showModal, closeModal }) {
  return (
    <Modal visible={showModal} animationType="slide" transparent={true}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.3)", // Optional dim background
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            padding: 20,
            borderRadius: 10,
            width: "80%",
            height: "40%",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems:'center',
              marginBottom: 15
            }}
          >
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>All Sale Details</Text>
            <Text
              onPress={() => closeModal(false)}
              style={{ fontSize: 24, fontWeight: "bold" }}
            >
              ×
            </Text>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}
