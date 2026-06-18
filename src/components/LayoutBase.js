import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/globalStyles';
import api from '../services/api';

export default function LayoutBase({ titulo, children, onCursoMudou }) {
  const navigation = useNavigation();
  const { logout, user } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);
  const [cursos, setCursos] = useState([]);
  const [loadingCursos, setLoadingCursos] = useState(true);
  const [cursoSelecionado, setCursoSelecionado] = useState(null);
  const [cursoMenuAberto, setCursoMenuAberto] = useState(false);

  useEffect(() => {
    carregarCursos();
  }, []);

  async function carregarCursos() {
    try {
      console.log('BUSCANDO CURSOS DA MATRICULA:', user?.matricula);
      const response = await api.get(`/alunos/${user?.matricula}/cursos`);
      setCursos(response.data);

      if (response.data.length > 0) {
        setCursoSelecionado(response.data[0]);
        onCursoMudou?.(response.data[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar cursos do aluno:', error);
    } finally {
      setLoadingCursos(false);
    }
  }

  function selecionarCurso(curso) {
    setCursoSelecionado(curso);
    setCursoMenuAberto(false);
    onCursoMudou?.(curso);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuAberto(true)}>
          <Text style={styles.hamburguer}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>{titulo}</Text>

        <TouchableOpacity
          style={styles.badge}
          onPress={() => setCursoMenuAberto(true)}
          disabled={loadingCursos}
        >
          {loadingCursos ? (
            <ActivityIndicator size="small" color={colors.branco} />
          ) : (
            <Text style={styles.badgeTexto}>
              {cursoSelecionado?.sigla || cursoSelecionado?.nome || '—'} ∨
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.conteudo}>
        {children}
      </View>

      <Modal visible={menuAberto} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setMenuAberto(false)}
        />
        <View style={styles.menu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => { setMenuAberto(false); navigation.navigate('Dashboard'); }}
          >
            <Text style={styles.menuTexto}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => { setMenuAberto(false); navigation.navigate('Submissao'); }}
          >
            <Text style={styles.menuTexto}>Submissão</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => { setMenuAberto(false); navigation.navigate('Certificados'); }}
          >
            <Text style={styles.menuTexto}>Certificados</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItemSair}
            onPress={() => { setMenuAberto(false); logout(); }}
          >
            <Text style={styles.menuTextoSair}>Sair</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal visible={cursoMenuAberto} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setCursoMenuAberto(false)}
        />
        <View style={styles.cursoMenu}>
          <Text style={styles.cursoMenuTitulo}>Selecione o curso</Text>
          {cursos.length === 0 ? (
            <Text style={styles.cursoSemDados}>Nenhum curso vinculado.</Text>
          ) : (
            cursos.map((curso) => (
              <TouchableOpacity
                key={curso.idCurso || curso.id}
                style={[
                  styles.cursoItem,
                  cursoSelecionado?.idCurso === curso.idCurso && styles.cursoItemSelecionado,
                ]}
                onPress={() => selecionarCurso(curso)}
              >
                <Text style={[
                  styles.cursoTexto,
                  cursoSelecionado?.idCurso === curso.idCurso && styles.cursoTextoSelecionado,
                ]}>
                  {curso.nome}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.branco,
  },
  header: {
    backgroundColor: colors.azulEscuro,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  hamburguer: {
    color: colors.branco,
    fontSize: 22,
  },
  titulo: {
    color: colors.branco,
    fontSize: 18,
    fontWeight: 'bold',
  },
  badge: {
    borderWidth: 1,
    borderColor: colors.branco,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 50,
    alignItems: 'center',
  },
  badgeTexto: {
    color: colors.branco,
    fontSize: 12,
  },
  conteudo: {
    flex: 1,
    padding: 16,
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  menu: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '60%',
    height: '100%',
    backgroundColor: colors.azulEscuro,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  menuItem: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  menuTexto: {
    color: colors.branco,
    fontSize: 16,
  },
  menuItemSair: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  menuTextoSair: {
    color: colors.laranja,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cursoMenu: {
    position: 'absolute',
    top: 100,
    right: 16,
    backgroundColor: colors.branco,
    borderRadius: 8,
    padding: 8,
    minWidth: 180,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cursoMenuTitulo: {
    color: colors.azulEscuro,
    fontWeight: 'bold',
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.cinzaBorda,
  },
  cursoSemDados: {
    padding: 12,
    color: colors.cinzaTexto,
    fontSize: 13,
  },
  cursoItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 6,
  },
  cursoItemSelecionado: {
    backgroundColor: colors.azulEscuro,
  },
  cursoTexto: {
    color: colors.azulEscuro,
    fontSize: 14,
  },
  cursoTextoSelecionado: {
    color: colors.branco,
    fontWeight: 'bold',
  },
});