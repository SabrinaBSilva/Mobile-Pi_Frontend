import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Image,
  ActivityIndicator,
} from 'react-native';
import LayoutBase from '../components/LayoutBase';
import StatusBadge from '../components/StatusBadge';
import { globalStyles, colors } from '../styles/globalStyles';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function CertificadosScreen() {
  const { user } = useAuth();
  const [cursoAtual, setCursoAtual] = useState(null);
  const [certificados, setCertificados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [certificadoSelecionado, setCertificadoSelecionado] = useState(null);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    if (cursoAtual?.idCurso) {
      carregarCertificados(cursoAtual.idCurso);
    }
  }, [cursoAtual]);

  async function carregarCertificados(idCurso) {
    try {
      setLoading(true);

      const [respostaAtividades, respostaRegras] = await Promise.all([
        api.get(`/atividades/aluno/${user?.matricula}`),
        api.get(`/regras/curso/${idCurso}`),
      ]);

      console.log('ATIVIDADES:', JSON.stringify(respostaAtividades.data))

      const idsRegrasDoCurso = respostaRegras.data.map((r) => r.idRegra);
      const mapaCategorias = {};
      respostaRegras.data.forEach((r) => { mapaCategorias[r.idRegra] = r.categoria; });

      const atividadesDoCurso = respostaAtividades.data
        .filter((ativ) => idsRegrasDoCurso.includes(ativ.regra_idRegra))
        .map((ativ) => ({
          ...ativ,
          categoria: mapaCategorias[ativ.regra_idRegra] || ativ.titulo,
          status: ativ.statusSubmissao || 'pendente',
        }));

      setCertificados(atividadesDoCurso);
    } catch (error) {
      console.error('Erro ao carregar certificados:', error);
    } finally {
      setLoading(false);
    }
  }

  function traduzirStatus(status) {
    if (status === 'aprovada') return 'Aprovado';
    if (status === 'rejeitada') return 'Reprovado';
    return 'Pendente';
  }

  function formatarData(data) {
    if (!data) return '—';
    return new Date(data).toLocaleDateString('pt-BR');
  }

  const certificadosFiltrados = filtro === 'todos'
    ? certificados
    : certificados.filter((c) => c.status === filtro);

  return (
    <LayoutBase titulo="Certificados" onCursoMudou={setCursoAtual}>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtrosContainer}>
        {[
          { label: 'Todos',      valor: 'todos'     },
          { label: 'Pendentes',  valor: 'pendente'  },
          { label: 'Aprovados',  valor: 'aprovada'  },
          { label: 'Rejeitados', valor: 'rejeitada' },
        ].map((f) => (
          <TouchableOpacity
            key={f.valor}
            style={[styles.filtroBotao, filtro === f.valor && styles.filtroBotaoAtivo]}
            onPress={() => setFiltro(f.valor)}
          >
            <Text style={[styles.filtroTexto, filtro === f.valor && styles.filtroTextoAtivo]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.azulEscuro} style={{ marginTop: 40 }} />
        ) : certificadosFiltrados.length === 0 ? (
          <Text style={styles.semDados}>
            {filtro === 'todos'
              ? 'Nenhum certificado enviado ainda.'
              : `Nenhum certificado ${traduzirStatus(filtro).toLowerCase()} encontrado.`}
          </Text>
        ) : (
          certificadosFiltrados.map((cert) => (
            <View key={cert.idAtividade} style={styles.card}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTexto}>
                  <Text style={styles.cardLabel}>Categoria: </Text>
                  {cert.categoria}
                </Text>
                <StatusBadge status={traduzirStatus(cert.status)} />
                <Text style={styles.cardTexto}>
                  <Text style={styles.cardLabel}>Data: </Text>
                  {formatarData(cert.dataEnvio || cert.createdAt)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.botaoVisualizar}
                onPress={() => setCertificadoSelecionado(cert)}
              >
                <Text style={styles.botaoVisualizarTexto}>Visualizar</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={certificadoSelecionado !== null} transparent animationType="slide">
        <TouchableOpacity style={globalStyles.overlay} onPress={() => setCertificadoSelecionado(null)} />
        {certificadoSelecionado && (
          <View style={styles.modalContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>

              <Text style={styles.modalTitulo}>Visualização</Text>

              <View style={styles.modalLinha}>
                <Text style={styles.cardLabel}>Status: </Text>
                <StatusBadge status={traduzirStatus(certificadoSelecionado.status)} />
              </View>
              <View style={styles.modalSeparador} />

              <View style={styles.modalLinha}>
                <Text style={styles.cardLabel}>Categoria: </Text>
                <Text style={styles.cardTexto}>{certificadoSelecionado.categoria}</Text>
              </View>
              <View style={styles.modalSeparador} />

              <View style={styles.modalLinha}>
                <Text style={styles.cardLabel}>Data: </Text>
                <Text style={styles.cardTexto}>
                  {formatarData(certificadoSelecionado.dataEnvio || certificadoSelecionado.createdAt)}
                </Text>
              </View>
              <View style={styles.modalSeparador} />

              <View style={styles.modalLinha}>
                <Text style={styles.cardLabel}>Horas solicitadas: </Text>
                <Text style={styles.cardTexto}>{certificadoSelecionado.cargaHorariaSolicitada} horas</Text>
              </View>
              <View style={styles.modalSeparador} />

              <View style={styles.modalLinhaColuna}>
                <Text style={styles.cardLabel}>Descrição: </Text>
                <Text style={styles.cardTexto}>{certificadoSelecionado.descricao}</Text>
              </View>
              <View style={styles.modalSeparador} />

              <Text style={[styles.cardLabel, { textAlign: 'center', marginBottom: 8 }]}>Imagem:</Text>
              {certificadoSelecionado.urlCertificado ? (
                <Image
                  source={{ uri: certificadoSelecionado.urlCertificado }}
                  style={styles.imagemCertificado}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.imagemPlaceholder}>
                  <Text style={{ color: colors.cinzaTexto, textAlign: 'center', paddingHorizontal: 16 }}>
                    Imagem não disponível
                  </Text>
                </View>
              )}
              <View style={styles.modalSeparador} />

              {certificadoSelecionado.observacao && (
                <>
                  <View style={styles.modalLinhaColuna}>
                    <Text style={styles.cardLabel}>Resposta do coordenador: </Text>
                    <Text style={styles.cardTexto}>{certificadoSelecionado.observacao}</Text>
                  </View>
                  <View style={styles.modalSeparador} />
                </>
              )}

              {certificadoSelecionado.status === 'aprovada' && (
                <View style={styles.modalLinha}>
                  <Text style={styles.cardLabel}>Horas aprovadas: </Text>
                  <Text style={styles.cardTexto}>
                    {certificadoSelecionado.cargaHorariaAprovada || certificadoSelecionado.cargaHorariaSolicitada} horas
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[globalStyles.botao, { marginTop: 24, marginBottom: 16 }]}
                onPress={() => setCertificadoSelecionado(null)}
              >
                <Text style={globalStyles.botaoTexto}>Fechar</Text>
              </TouchableOpacity>

            </ScrollView>
          </View>
        )}
      </Modal>

    </LayoutBase>
  );
}

const styles = StyleSheet.create({
  filtrosContainer: {
  flexDirection: 'row',
  marginBottom: 16,
  alignItems: 'center',
  height: 44,
},
  filtroBotao: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.azulEscuro,
    marginRight: 8,
  },
  filtroBotaoAtivo: { backgroundColor: colors.azulEscuro },
  filtroTexto: { color: colors.azulEscuro, fontSize: 13 },
  filtroTextoAtivo: { color: colors.branco, fontWeight: 'bold' },
  semDados: {
    textAlign: 'center',
    color: colors.cinzaTexto,
    marginTop: 40,
    fontSize: 14,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cinzaBorda,
  },
  cardInfo: { flex: 1, gap: 4 },
  cardTexto: { fontSize: 14, color: '#333', marginBottom: 2 },
  cardLabel: { fontWeight: 'bold', color: '#333', fontSize: 14 },
  botaoVisualizar: {
    borderWidth: 1,
    borderColor: colors.azulEscuro,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 8,
  },
  botaoVisualizarTexto: { color: colors.azulEscuro, fontSize: 13 },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '90%',
    backgroundColor: colors.branco,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.azulEscuro,
    marginBottom: 16,
  },
  modalLinha: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  modalLinhaColuna: { paddingVertical: 12 },
  modalSeparador: { height: 1, backgroundColor: colors.cinzaBorda },
  imagemCertificado: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 8,
  },
  imagemPlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 8,
  },
});