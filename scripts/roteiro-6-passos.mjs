// Roteiro dos 6 passos (docs/visao-geral.md, secao 5) contra uma URL de verdade.
// Uso: POLAR_URL=https://polarescolar.vercel.app POLAR_PROFESSOR=email:senha POLAR_COORDENADOR=email:senha POLAR_DIRETOR=email:senha node scripts/roteiro-6-passos.mjs
// ATENCAO: cria UMA ocorrencia de teste (e a encerra). Na producao ela fica no historico: rode com um aluno de teste.
const url = (process.env.POLAR_URL ?? "http://localhost:3000").replace(/\/$/, "");
const conta = (nome) => {
  const [email, ...resto] = (process.env[nome] ?? "").split(":");
  if (!email || !resto.length) throw new Error(`Defina ${nome}=email:senha`);
  return { email, senha: resto.join(":") };
};

async function api(caminho, { token, ...opcoes } = {}) {
  const resposta = await fetch(`${url}/api${caminho}`, {
    ...opcoes,
    headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) }
  });
  const corpo = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(`${opcoes.method ?? "GET"} ${caminho} -> ${resposta.status} ${corpo?.error?.message ?? ""}`);
  return corpo;
}
const entrar = async (nome) => (await api("/auth/login", { method: "POST", body: JSON.stringify(conta(nome)) })).token;

const resultados = [];
async function passo(numero, titulo, fn) {
  try {
    const detalhe = await fn();
    resultados.push(true);
    console.log(`OK    ${numero}. ${titulo}${detalhe ? ` (${detalhe})` : ""}`);
  } catch (erro) {
    resultados.push(false);
    console.log(`FALHA ${numero}. ${titulo}: ${erro.message}`);
  }
}

let professor, coordenador, direcao, id;
await passo(1, "Professor faz login", async () => { professor = await entrar("POLAR_PROFESSOR"); });
await passo(2, "Professor registra ocorrencia", async () => {
  const alunos = (await api("/alunos", { token: professor })).data;
  if (!alunos?.length) throw new Error("nenhum aluno visivel para o professor");
  const criada = await api("/ocorrencias", {
    token: professor,
    method: "POST",
    body: JSON.stringify({ alunoId: alunos[0].id, categoria: "Atraso", prioridade: "BAIXA", bimestre: 1, descricao: "Teste do roteiro de 6 passos: aluno chegou depois do sinal." })
  });
  id = criada.data.id;
  if (criada.data.status !== "REGISTRADA") throw new Error(`status ${criada.data.status}`);
});
await passo(3, "Coordenacao visualiza a ocorrencia", async () => {
  coordenador = await entrar("POLAR_COORDENADOR");
  const lista = (await api("/ocorrencias", { token: coordenador })).data;
  if (!lista.some((o) => o.id === id)) throw new Error("a ocorrencia nao aparece na lista da coordenacao");
});
await passo(4, "Coordenacao altera o status (analise, depois resolvida, com observacao)", async () => {
  await api(`/ocorrencias/${id}/status`, { token: coordenador, method: "PATCH", body: JSON.stringify({ status: "EM_ANALISE" }) });
  await api(`/ocorrencias/${id}/status`, { token: coordenador, method: "PATCH", body: JSON.stringify({ status: "RESOLVIDA", observacao: "Conversado com o aluno e a familia." }) });
});
await passo(5, "Direcao encerra", async () => {
  direcao = await entrar("POLAR_DIRETOR");
  const r = await api(`/ocorrencias/${id}/status`, { token: direcao, method: "PATCH", body: JSON.stringify({ status: "ENCERRADA" }) });
  if (r.data.status !== "ENCERRADA") throw new Error(`status ${r.data.status}`);
});
await passo(6, "Historico mostra todas as acoes, com autores e datas", async () => {
  const h = (await api(`/ocorrencias/${id}/historico`, { token: direcao })).data;
  const status = h.map((e) => e.status);
  for (const esperado of ["REGISTRADA", "EM_ANALISE", "RESOLVIDA", "ENCERRADA"]) {
    if (!status.includes(esperado)) throw new Error(`falta ${esperado} no historico`);
  }
  if (h.some((e) => !e.usuarioId || Number.isNaN(Date.parse(e.criadoEm)))) throw new Error("entrada sem autor ou data");
  return `${h.length} entradas`;
});

const falhas = resultados.filter((ok) => !ok).length;
console.log(falhas ? `\n${falhas} etapa(s) falharam em ${url}` : `\nAs 6 etapas fecharam em ${url}`);
process.exit(falhas ? 1 : 0);
