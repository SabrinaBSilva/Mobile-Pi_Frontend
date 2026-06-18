import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/globalStyles';

export default function StatusBadge({ status }) {
  function corStatus() {
    if (status === 'Aprovado') return '#2e7d32';
    if (status === 'Reprovado') return '#c62828';
    return colors.laranja;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.bolinha, { backgroundColor: corStatus() }]} />
      <Text style={[styles.texto, { color: corStatus() }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bolinha: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  texto: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});