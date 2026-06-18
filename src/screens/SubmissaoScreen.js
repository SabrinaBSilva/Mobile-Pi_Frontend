import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LayoutBase from '../components/LayoutBase';
import { globalStyles, colors } from '../styles/globalStyles';
import api from '../services/api';

export default function SubmissaoScreen() {
  const navigation = useNavigation();
  const [cursoAtual, setCursoAtual] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [categoriaMenuAberto, setCategoriaMenuAberto] = useState(false);
  const [cargaHoraria, setCargaHoraria] = useState('');
  const [descricao, setDescricao] = useState('');

  useEffect(() => {
    if (cursoAtual?.idCurso) {
      carregarCategorias(cursoAtual.idCurso);
      setCategoriaSelecionada(null);
    }
  }, [cursoAtual]);

  async function carregarCategorias(idCurso) {
    try {
      setLoadingCategorias(true);
      const response = await api.get(`/regras/curso/${idCurso}`);
      setCategorias(response.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoadingCategorias(false);
    }
  }

  function handleAvancar() {
    if (!categoriaSelecionada || !cargaHoraria || !descricao) {
      alert('Preencha todos os campos antes de avançar.');
      return;
    }

    if (Number(cargaHoraria) > categoriaSelecionada.cargaHorariaPermitida) {
      alert(`A categoria "${categoriaSelecionada.categoria}" permite no máximo ${categoriaSelecionada.cargaHorariaPermitida}h.`);
      return;
    }

    navigation.navigate('Upload', {
      categoria: categoriaSelecionada,
      cargaHoraria,
      descricao,
    });
  }

  return (
    <LayoutBase titulo="Submissão" onCursoMudou={setCursoAtual}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <Text style={globalStyles.label}>Categoria</Text>
        <TouchableOpacity
          style={globalStyles.select}
          onPress={() => setCategoriaMenuAberto(true)}
          disabled={!cursoAtual}
        >
          <Text style={categoriaSelecionada ? globalStyles.selectTexto : globalStyles.selectPlaceholder}>
            {categoriaSelecionada?.categoria || 'Selecione'}
          </Text>
          <Text style={styles.selectSeta}>∨</Text>
        </TouchableOpacity>

        <Text style={globalStyles.label}>Carga Horária</Text>
        <TextInput
          style={globalStyles.input}
          placeholder="Ex: 10"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={cargaHoraria}
          onChangeText={setCargaHoraria}
        />

        <Text style={globalStyles.label}>Descrição</Text>
        <TextInput
          style={globalStyles.textarea}
          placeholder="Descreva a atividade realizada..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={5}
          value={descricao}
          onChangeText={setDescricao}
        />

        <TouchableOpacity style={globalStyles.botao} onPress={handleAvancar}>
          <Text style={globalStyles.botaoTexto}>Avançar para upload de comprovante</Text>
        </TouchableOpacity>

      </ScrollView>

      <Modal visible={categoriaMenuAberto} transparent animationType="fade">
        <TouchableOpacity
          style={globalStyles.overlay}
          onPress={() => setCategoriaMenuAberto(false)}
        />
        <View style={styles.categoriaMenu}>
          <Text style={styles.categoriaMenuTitulo}>Selecione a categoria</Text>
          {loadingCategorias ? (
            <ActivityIndicator color={colors.azulEscuro} style={{ padding: 16 }} />
          ) : categorias.length === 0 ? (
            <Text style={styles.categoriaSemDados}>
              Nenhuma categoria cadastrada para este curso.
            </Text>
          ) : (
            categorias.map((cat) => (
              <TouchableOpacity
                key={cat.idRegra}
                style={[
                  styles.categoriaItem,
                  categoriaSelecionada?.idRegra === cat.idRegra && styles.categoriaItemSelecionado,
                ]}
                onPress={() => {
                  setCategoriaSelecionada(cat);
                  setCategoriaMenuAberto(false);
                }}
              >
                <Text style={[
                  styles.categoriaTexto,
                  categoriaSelecionada?.idRegra === cat.idRegra && styles.categoriaTextoSelecionado,
                ]}>
                  {cat.categoria} (máx. {cat.cargaHorariaPermitida}h)
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </Modal>

    </LayoutBase>
  );
}

const styles = StyleSheet.create({
  selectSeta: {
    color: colors.azulEscuro,
    fontSize: 14,
  },
  categoriaMenu: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    right: '10%',
    backgroundColor: colors.branco,
    borderRadius: 8,
    padding: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  categoriaMenuTitulo: {
    color: colors.azulEscuro,
    fontWeight: 'bold',
    fontSize: 14,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cinzaBorda,
  },
  categoriaSemDados: {
    padding: 16,
    color: colors.cinzaTexto,
    fontSize: 13,
    textAlign: 'center',
  },
  categoriaItem: {
    padding: 14,
    borderRadius: 6,
  },
  categoriaItemSelecionado: {
    backgroundColor: colors.azulEscuro,
  },
  categoriaTexto: {
    color: colors.azulEscuro,
    fontSize: 14,
  },
  categoriaTextoSelecionado: {
    color: colors.branco,
    fontWeight: 'bold',
  },
});