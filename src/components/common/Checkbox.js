import { useState } from "react";
import { TouchableOpacity, View, Text } from "react-native";

export default function Checkbox({
  label,
  value = false,
  onChange = () => {},
  size = 20,
  color = "#0dee45ff",
  labelStyle = {},
  boxStyle = {},
  selecteValue = null,
}) {
  const [checked, setChecked] = useState(value);

  const toggle = () => {
    const newValue = !checked;
    setChecked(newValue);
    onChange(newValue, selecteValue);
  };

  return (
    <TouchableOpacity
      onPress={toggle}
      style={{ flexDirection: "row", alignItems: "center", padding: 8 }}
    >
      <View
        style={{
          height: size,
          width: size,
          borderWidth: 1,
          borderColor: "#000",
          justifyContent: "center",
          alignItems: "center",
          marginRight: 10,
          ...boxStyle,
        }}
      >
        {checked && (
          <Text style={{ color, fontSize: size - 4 }}>✔</Text>
        )}
      </View>
      <Text onPress={toggle} style={{ fontSize: 16, ...labelStyle }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
