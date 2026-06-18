import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import LayoutBase from '../components/LayoutBase';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/globalStyles';
import api from '../services/api';

export default function DashboardScreen() {
  const { user } = useAuth();
  const [cursoAtual, setCursoAtual] = useState(null);
  const [categoriasComHoras, setCategoriasComHoras] = useState([]);
  const [progresso, setProgresso] = useState({ aprovadas: 0, meta: 0 });
  const [statusContagem, setStatusContagem] = useState({ aprovadas: 0, pendentes: 0, rejeitadas: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cursoAtual?.idCurso) {
      carregarDados(cursoAtual.idCurso);
    }
  }, [cursoAtual]);

  async function carregarDados(idCurso) {
    try {
      setLoading(true);

      console.log('MATRICULA DO USER:', user?.matricula);

      const [respostaRegras, respostaAtividades] = await Promise.all([
        api.get(`/regras/curso/${idCurso}`),
        api.get(`/atividades/aluno/${user?.matricula}`),
      ]);

      console.log('ATIVIDADES DASHBOARD:', JSON.stringify(respostaAtividades.data));

      const regras = respostaRegras.data;
      const atividades = respostaAtividades.data;

      const categorias = regras.map((regra) => {
        const atividadesDaCategoria = atividades.filter(
          (ativ) => ativ.regra_idRegra === regra.idRegra
        );

        const horasAprovadas = atividadesDaCategoria
          .filter((a) => a.statusSubmissao === 'aprovada')
          .reduce((soma, a) => soma + Number(a.cargaHorariaAprovada || a.cargaHorariaSolicitada || 0), 0);

        return {
          idRegra: regra.idRegra,
          nome: regra.categoria,
          horasAprovadas,
          limite: regra.cargaHorariaPermitida,
        };
      });

      setCategoriasComHoras(categorias);

      const totalAprovadas = categorias.reduce((soma, cat) => soma + cat.horasAprovadas, 0);
      const totalLimite = categorias.reduce((soma, cat) => soma + Number(cat.limite || 0), 0);
      setProgresso({ aprovadas: totalAprovadas, meta: totalLimite });

      const idsRegrasDoCurso = regras.map((r) => r.idRegra);
      const atividadesDoCurso = atividades.filter((a) => idsRegrasDoCurso.includes(a.regra_idRegra));

      setStatusContagem({
        aprovadas:  atividadesDoCurso.filter((a) => a.statusSubmissao === 'aprovada').length,
        pendentes:  atividadesDoCurso.filter((a) => a.statusSubmissao === 'pendente' || !a.statusSubmissao).length,
        rejeitadas: atividadesDoCurso.filter((a) => a.statusSubmissao === 'rejeitada').length,
      });
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LayoutBase titulo="Dashboard" onCursoMudou={setCursoAtual}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.card}>
          <Text style={styles.cardTituloAzul}>Total de horas</Text>
          {loading ? (
            <ActivityIndicator color={colors.azulEscuro} style={{ marginVertical: 12 }} />
          ) : categoriasComHoras.length === 0 ? (
            <Text style={styles.semDados}>Nenhuma categoria encontrada para este curso.</Text>
          ) : (
            categoriasComHoras.map(({ idRegra, nome, horasAprovadas, limite }) => (
              <View key={idRegra} style={styles.horaLinha}>
                <Text style={styles.horaCategoria}>{nome}</Text>
                <Text style={styles.horaValor}>
                  {String(horasAprovadas).padStart(2, '0')}/{limite}h
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTituloLaranja}>Progresso</Text>
          <View style={styles.progressoContainer}>
            <Text style={styles.progressoTexto}>
              <Text style={styles.progressoDestaque}>
                {progresso.aprovadas}/{progresso.meta}
              </Text>
              {' '}horas
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTituloVerde}>Status da solicitação</Text>
          <View style={styles.statusLinha}>
            <StatusBadge status="Aprovado" />
            <Text style={styles.statusTexto}>{statusContagem.aprovadas} solicitações aprovadas</Text>
          </View>
          <View style={styles.statusLinha}>
            <StatusBadge status="Pendente" />
            <Text style={styles.statusTexto}>{statusContagem.pendentes} solicitações pendentes</Text>
          </View>
          <View style={styles.statusLinha}>
            <StatusBadge status="Reprovado" />
            <Text style={styles.statusTexto}>{statusContagem.rejeitadas} solicitações reprovadas</Text>
          </View>
        </View>

      </ScrollView>
    </LayoutBase>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.cinzaBorda,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  cardTituloAzul: {
    color: colors.azulEscuro,
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.laranja,
    paddingBottom: 6,
  },
  cardTituloVerde: {
    color: '#2e7d32',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.laranja,
    paddingBottom: 6,
  },
  cardTituloLaranja: {
    color: colors.laranja,
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.laranja,
    paddingBottom: 6,
  },
  progressoContainer: {
    backgroundColor: '#FFF3E0',
    borderRadius: 6,
    padding: 16,
    alignItems: 'center',
  },
  progressoTexto: {
    fontSize: 24,
    color: '#333',
  },
  progressoDestaque: {
    fontWeight: 'bold',
    fontSize: 28,
    color: '#333',
  },
  semDados: {
    color: colors.cinzaTexto,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 8,
  },
  horaLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.cinzaBorda,
  },
  horaCategoria: { fontSize: 14, color: '#333' },
  horaValor: { fontSize: 14, color: '#333' },
  statusLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  statusTexto: { fontSize: 14, color: '#333', marginLeft: 8 },
});