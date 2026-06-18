# 📱 spherEdu - Mobile App & PWA (Aluno)

O **spherEdu** é uma solução multiplataforma (Mobile e PWA) desenvolvida para que alunos de instituições de ensino possam gerenciar, enviar e acompanhar o registro de suas atividades complementares de forma centralizada e intuitiva.

---

## 🚀 Telas da Aplicação Mobile

O fluxo do aluno é estruturado em **4 telas principais**:

1. **Login**: Autenticação segura com validação de perfil focada exclusivamente na comunidade estudantil.
2. **Dashboard**: Painel geral exibindo graficamente o progresso da carga horária, horas pendentes e homologadas.
3. **Listar Atividades**: Histórico detalhado com o status de cada certificado enviado e feedbacks da validação.
4. **Enviar Atividades**: Formulário dedicado à submissão de novos documentos e certificados direto pelo dispositivo.

---

## 💻 Versão PWA (Progressive Web App)

Além do aplicativo mobile nativo, o projeto conta com suporte a **PWA (Progressive Web App)**. Isso permite que o sistema seja acessado diretamente por qualquer navegador web (computador ou celular) e instalado como um aplicativo de desktop ou mobile, sem a necessidade de passar por lojas virtuais, garantindo leveza e ampla acessibilidade.

---

## 🛠️ Tecnologias e Infraestrutura

A arquitetura do projeto foi desenhada utilizando serviços robustos em nuvem para garantir escalabilidade e desacoplamento:

- **Frontend Mobile**: [React Native](https://reactnative.dev) + [Expo](https://expo.dev) (Compilação gerenciada na nuvem via EAS)
- **Navegação & Estado**: [React Navigation](https://reactnavigation.org) + Context API (Persistência local via AsyncStorage)
- **Servidor de API (Backend)**: Hospedado na plataforma [Render](https://render.com), estruturado de forma independente e consumido via HTTPS por requisições Axios.
- **Banco de Dados**: Instância relacional hospedada e gerenciada no [Clever Cloud](https://clever-cloud.com).

> ⚠️ **Nota sobre Infraestrutura**: Por utilizar o plano gratuito do Render, o backend entra em modo de repouso após 15 minutos de inatividade. A primeira requisição do dia (como o primeiro clique de login) pode demorar cerca de 1 minuto para responder enquanto a instância "acorda". Os acessos seguintes operam instantaneamente.

---

## ⚙️ Pré-requisitos para Execução Local

Antes de rodar o projeto, certifique-se de ter instalado em sua máquina:
- [Node.js](https://nodejs.org) (versão LTS recomendada)
- Gerenciador de pacotes `npm`

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com
   ```
2. Acesse a pasta do projeto:
   ```bash
   cd spherEdu-mobile
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```

---

## 📦 Como Executar e Testar

### Modo de Desenvolvimento (Local)
Para rodar o projeto em tempo real usando o simulador ou seu aparelho físico com o app **Expo Go**:
```bash
npx expo start
```
*Escaneie o QR Code gerado com a câmera do celular (iOS) ou dentro do app Expo Go (Android).*

### Geração de Compilações na Nuvem (EAS Build)
Para gerar uma build instalável atualizada do aplicativo de testes para Android:
```bash
eas build --platform android --profile development
```

---

## 👥 Equipe de Desenvolvimento

O projeto foi planejado e implementado com a colaboração de:

* **Daniel Cabral**
* **Ian Gabriel**
* **Sabrina Beatriz**
* **Otávio Augusto**
