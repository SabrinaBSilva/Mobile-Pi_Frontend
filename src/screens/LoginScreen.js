import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { globalStyles, colors } from '../styles/globalStyles';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Preencha o e-mail e a senha.');
      return;
    }
    try {
      setLoading(true);
      await login(email, senha);
    } catch (error) {
  console.log('ERRO COMPLETO:', error.response?.data || error.message);
  Alert.alert('Erro', JSON.stringify(error.response?.data) || error.message);
   }
     finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={globalStyles.container}
        keyboardShouldPersistTaps="handled"
      >

        <Image
          source={require('../../assets/Logo.jpeg')}
          style={styles.logo}
        />
        <Text style={styles.titulo}>SpherEdu</Text>
        <Text style={styles.subtitulo}>Faça login para mais informações</Text>

        <TextInput
          style={globalStyles.input}
          placeholder="Informe o seu Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={styles.senhaContainer}>
          <TextInput
            style={styles.senhaInput}
            placeholder="Senha"
            placeholderTextColor="#999"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry={!mostrarSenha}
          />
          <TouchableOpacity
            onPress={() => setMostrarSenha(!mostrarSenha)}
            style={styles.olhoBotao}
          >
            <Text style={styles.olhoTexto}>{mostrarSenha ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={globalStyles.botao}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.branco} />
          ) : (
            <Text style={globalStyles.botaoTexto}>ENTRAR</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 250,
    height: 250,
    borderRadius: 45,
    marginBottom: 12,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.azulEscuro,
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 13,
    color: colors.cinzaTexto,
    marginBottom: 32,
  },
  senhaContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cinzaBorda,
    borderRadius: 6,
    marginBottom: 16,
  },
  senhaInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: '#333',
  },
  olhoBotao: {
    paddingHorizontal: 12,
  },
  olhoTexto: {
    fontSize: 18,
  },
});