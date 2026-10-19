import { PRIORIDADE_LABEL, type OcorrenciaDetalhada } from "../../services/domain";

const STATUS_LABEL: Record<OcorrenciaDetalhada["status"], string> = {
  REGISTRADA: "Registrada",
  EM_ANALISE: "Em analise",
  RESOLVIDA: "Resolvida",
  ENCERRADA: "Encerrada"
};

// Excel em pt-BR separa colunas por ";".
function celula(valor: string | number): string {
  let texto = String(valor);
  // Evita que o Excel execute texto digitado pelo usuario como formula (CSV injection).
  if (/^[=+\-@\t\r]/.test(texto)) texto = `'${texto}`;
  return /[";\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

function dataHora(valor: string): string {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(valor));
}

export function ocorrenciasParaCsv(ocorrencias: OcorrenciaDetalhada[]): string {
  const cabecalho = ["Data", "Aluno", "Turma", "Bimestre", "Categoria", "Prioridade", "Status", "Descricao", "Local", "Testemunhas"];
  const linhas = ocorrencias.map((item) => [
    dataHora(item.criadoEm),
    item.aluno,
    item.turma,
    item.bimestre,
    item.categoria,
    PRIORIDADE_LABEL[item.prioridade],
    STATUS_LABEL[item.status],
    item.descricao,
    item.local ?? "",
    item.testemunhas ?? ""
  ]);
  // BOM para o Excel reconhecer UTF-8 (acentos).
  return "﻿" + [cabecalho, ...linhas].map((linha) => linha.map(celula).join(";")).join("\r\n");
}

export function baixarCsv(conteudo: string, nomeArquivo: string) {
  const url = URL.createObjectURL(new Blob([conteudo], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  link.click();
  URL.revokeObjectURL(url);
}
