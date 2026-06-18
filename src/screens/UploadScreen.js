import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import LayoutBase from '../components/LayoutBase';
import { globalStyles, colors } from '../styles/globalStyles';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function UploadScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { categoria, cargaHoraria, descricao } = route.params;
  const [imagem, setImagem] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function handleCamera() {
    const permissao = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert('Permissão negada', 'Precisamos de acesso à câmera.');
      return;
    }
    const resultado = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.7 });
    if (!resultado.canceled) setImagem(resultado.assets[0]);
  }

  async function handleGaleria() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert('Permissão negada', 'Precisamos de acesso à galeria.');
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.7 });
    if (!resultado.canceled) setImagem(resultado.assets[0]);
  }

  async function handleEnviar() {
    if (!imagem) {
      Alert.alert('Atenção', 'Adicione um comprovante antes de enviar.');
      return;
    }

    try {
      setEnviando(true);

      // Tenta resolver o coordenador do curso caso não venha na categoria
      let idCoordenador = categoria.coordenador_idCoordenador ?? null;
      if (!idCoordenador && categoria.idCurso) {
        try {
          const respostaCoordenador = await api.get(`/coordenadores/curso/${categoria.idCurso}`);
          idCoordenador = respostaCoordenador.data?.[0]?.idCoordenador ?? null;
        } catch (e) {
          console.warn('Não foi possível buscar o coordenador do curso:', e.message);
        }
      }

      // Cria a atividade complementar
      const respostaAtividade = await api.post('/atividades', {
        codigo: `ATV-${Date.now()}`,
        titulo: categoria.categoria,
        descricao,
        cargaHorariaSolicitada: Number(cargaHoraria),
        aluno_matricula: user?.matricula,
        regra_idRegra: categoria.idRegra,
      });

      const idAtividade = respostaAtividade.data.id;

      // Envia a submissão com o certificado
      const formData = new FormData();
      formData.append('certificado', {
        uri: imagem.uri,
        type: imagem.mimeType || 'image/jpeg',
        name: imagem.fileName || 'certificado.jpg',
      });
      formData.append('atividade_idAtividade', String(idAtividade));
      formData.append('status', 'pendente');
      formData.append('dataEnvio', new Date().toISOString().slice(0, 19).replace('T', ' '));
      if (idCoordenador) {
        formData.append('coordenador_idCoordenador', String(idCoordenador));
      }

      await api.post('/submissoes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert(
        'Enviado!',
        'Sua solicitação foi enviada e está pendente de aprovação.',
        [{ text: 'OK', onPress: () => navigation.navigate('Dashboard') }]
      );
    } catch (error) {
      console.log('ERRO DETALHADO:', JSON.stringify(error.response?.data));
      Alert.alert('Erro', 'Não foi possível enviar. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <LayoutBase titulo="Upload">
      <View style={styles.container}>

        <Text style={globalStyles.label}>Captura do documento</Text>
        <View style={styles.preview}>
          {imagem ? (
            <Image source={{ uri: imagem.uri }} style={styles.imagemPreview} />
          ) : (
            <>
              <Text style={styles.previewTexto}>Adicione uma imagem</Text>
              <Text style={styles.previewIcone}>📷</Text>
            </>
          )}
        </View>

        {imagem && (
          <TouchableOpacity
            style={[globalStyles.botao, { marginBottom: 24 }]}
            onPress={handleEnviar}
            disabled={enviando}
          >
            {enviando ? (
              <ActivityIndicator color={colors.branco} />
            ) : (
              <Text style={globalStyles.botaoTexto}>Enviar certificado</Text>
            )}
          </TouchableOpacity>
        )}

        <Text style={styles.escolhaTitulo}>Escolha uma opção</Text>
        <View style={styles.opcoes}>
          <TouchableOpacity style={styles.opcao} onPress={handleCamera}>
            <Text style={styles.opcaoIcone}>📷</Text>
            <Text style={styles.opcaoTexto}>Câmera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.opcao} onPress={handleGaleria}>
            <Text style={styles.opcaoIcone}>🖼️</Text>
            <Text style={styles.opcaoTexto}>Galeria</Text>
          </TouchableOpacity>
        </View>

      </View>
    </LayoutBase>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  preview: {
    width: '100%',
    height: 180,
    borderWidth: 1,
    borderColor: colors.cinzaBorda,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  imagemPreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  previewTexto: { color: colors.cinzaTexto, fontSize: 14, marginBottom: 8 },
  previewIcone: { fontSize: 32 },
  escolhaTitulo: {
    color: colors.azulEscuro,
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 16,
  },
  opcoes: { flexDirection: 'row', justifyContent: 'space-around' },
  opcao: { alignItems: 'center', padding: 12 },
  opcaoIcone: { fontSize: 32, marginBottom: 6 },
  opcaoTexto: { color: colors.azulEscuro, fontSize: 13, fontWeight: 'bold' },
});