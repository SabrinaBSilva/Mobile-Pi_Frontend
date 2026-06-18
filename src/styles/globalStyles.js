import { StyleSheet } from 'react-native';

export const colors = {
  azulEscuro: '#0D2B5E',
  laranja: '#F4A124',
  branco: '#FFFFFF',
  cinzaTexto: '#666',
  cinzaBorda: '#ccc',
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.branco,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.cinzaBorda,
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    fontSize: 14,
    color: '#333',
  },
  botao: {
    width: '100%',
    backgroundColor: colors.azulEscuro,
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  botaoTexto: {
    color: colors.branco,
    fontWeight: 'bold',
    fontSize: 15,
  },
  label: {
    color: colors.azulEscuro,
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 6,
    marginTop: 16,
  },
  select: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.cinzaBorda,
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectTexto: {
    fontSize: 14,
    color: '#333',
  },
  selectPlaceholder: {
    fontSize: 14,
    color: '#999',
  },
  textarea: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.cinzaBorda,
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    color: '#333',
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
});