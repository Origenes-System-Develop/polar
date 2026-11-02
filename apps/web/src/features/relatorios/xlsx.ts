// Gerador minimo de .xlsx (uma planilha, cabecalho colorido, filtro e linha congelada).
// Um .xlsx e um zip de XMLs; aqui o zip e "stored" (sem compressao), o que o Excel aceita e
// dispensa biblioteca. shortcut: so texto e numero, uma aba; para varias abas ou formulas, trocar por uma lib.

export interface ColunaXlsx {
  titulo: string;
  largura: number;
}

const codificar = new TextEncoder();

const TABELA_CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(dados: Uint8Array): number {
  let c = 0xffffffff;
  for (const byte of dados) c = TABELA_CRC[(c ^ byte) & 0xff]! ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function zip(arquivos: { nome: string; conteudo: string }[]): Uint8Array {
  const partes: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let deslocamento = 0;
  for (const { nome, conteudo } of arquivos) {
    const nomeBytes = codificar.encode(nome);
    const dados = codificar.encode(conteudo);
    const crc = crc32(dados);
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 0x0800, true); // nomes em UTF-8
    local.setUint32(14, crc, true);
    local.setUint32(18, dados.length, true);
    local.setUint32(22, dados.length, true);
    local.setUint16(26, nomeBytes.length, true);
    const cabecalho = new DataView(new ArrayBuffer(46));
    cabecalho.setUint32(0, 0x02014b50, true);
    cabecalho.setUint16(4, 20, true);
    cabecalho.setUint16(6, 20, true);
    cabecalho.setUint16(8, 0x0800, true);
    cabecalho.setUint32(16, crc, true);
    cabecalho.setUint32(20, dados.length, true);
    cabecalho.setUint32(24, dados.length, true);
    cabecalho.setUint16(28, nomeBytes.length, true);
    cabecalho.setUint32(42, deslocamento, true);
    partes.push(new Uint8Array(local.buffer), nomeBytes, dados);
    central.push(new Uint8Array(cabecalho.buffer), nomeBytes);
    deslocamento += 30 + nomeBytes.length + dados.length;
  }
  const tamanhoCentral = central.reduce((soma, p) => soma + p.length, 0);
  const fim = new DataView(new ArrayBuffer(22));
  fim.setUint32(0, 0x06054b50, true);
  fim.setUint16(8, arquivos.length, true);
  fim.setUint16(10, arquivos.length, true);
  fim.setUint32(12, tamanhoCentral, true);
  fim.setUint32(16, deslocamento, true);
  const todas = [...partes, ...central, new Uint8Array(fim.buffer)];
  const saida = new Uint8Array(todas.reduce((soma, p) => soma + p.length, 0));
  let posicao = 0;
  for (const parte of todas) {
    saida.set(parte, posicao);
    posicao += parte.length;
  }
  return saida;
}

function escapar(texto: string): string {
  // eslint-disable-next-line no-control-regex
  return texto.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function letraDaColuna(indice: number): string {
  return String.fromCharCode(65 + indice);
}

const ESTILO_CABECALHO = 1;
const ESTILO_LINHA = 2;
const ESTILO_LINHA_ZEBRA = 3;

// Texto vai como string inline, nunca como formula: "=1+1" digitado por alguem aparece como texto.
function celula(valor: string | number, coluna: number, linha: number, estilo: number): string {
  const ref = `${letraDaColuna(coluna)}${linha}`;
  if (typeof valor === "number") return `<c r="${ref}" s="${estilo}"><v>${valor}</v></c>`;
  return `<c r="${ref}" s="${estilo}" t="inlineStr"><is><t xml:space="preserve">${escapar(valor)}</t></is></c>`;
}

const ESTILOS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="2"><font><sz val="11"/><color rgb="FF183B56"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts>
<fills count="4"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF3D77B7"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF1F5FA"/></patternFill></fill></fills>
<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left/><right/><top/><bottom style="thin"><color rgb="FFD5DCE6"/></bottom><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="4">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
<xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

const NS_REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";

export function criarXlsx(nomeDaAba: string, colunas: ColunaXlsx[], linhas: (string | number)[][]): Uint8Array {
  const ultima = `${letraDaColuna(colunas.length - 1)}${linhas.length + 1}`;
  const cabecalho = `<row r="1" ht="26" customHeight="1">${colunas.map((c, i) => celula(c.titulo, i, 1, ESTILO_CABECALHO)).join("")}</row>`;
  const corpo = linhas
    .map((linha, i) => `<row r="${i + 2}">${linha.map((v, c) => celula(v, c, i + 2, i % 2 ? ESTILO_LINHA_ZEBRA : ESTILO_LINHA)).join("")}</row>`)
    .join("");
  const largura = colunas.map((c, i) => `<col min="${i + 1}" max="${i + 1}" width="${c.largura}" customWidth="1"/>`).join("");
  const aba = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0" showGridLines="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${largura}</cols><sheetData>${cabecalho}${corpo}</sheetData><autoFilter ref="A1:${ultima}"/></worksheet>`;
  const cabecalhoXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`;
  return zip([
    {
      nome: "[Content_Types].xml",
      conteudo: `${cabecalhoXml}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`
    },
    {
      nome: "_rels/.rels",
      conteudo: `${cabecalhoXml}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${NS_REL}/officeDocument" Target="xl/workbook.xml"/></Relationships>`
    },
    {
      nome: "xl/workbook.xml",
      conteudo: `${cabecalhoXml}<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="${NS_REL}"><sheets><sheet name="${escapar(nomeDaAba).slice(0, 31)}" sheetId="1" r:id="rId1"/></sheets></workbook>`
    },
    {
      nome: "xl/_rels/workbook.xml.rels",
      conteudo: `${cabecalhoXml}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${NS_REL}/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="${NS_REL}/styles" Target="styles.xml"/></Relationships>`
    },
    { nome: "xl/styles.xml", conteudo: ESTILOS },
    { nome: "xl/worksheets/sheet1.xml", conteudo: aba }
  ]);
}

export function baixarXlsx(bytes: Uint8Array, nomeArquivo: string) {
  const blob = new Blob([bytes as BlobPart], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  link.click();
  URL.revokeObjectURL(url);
}
