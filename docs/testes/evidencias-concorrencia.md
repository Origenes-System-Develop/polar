# Evidências de testes — Concorrência entre usuários

## Objetivo

Validar o comportamento do sistema POLAR quando dois usuários logados ao mesmo tempo (coordenação e professor) realizam ações simultâneas sobre a mesma ocorrência, incluindo a tentativa de resolver a mesma ocorrência duas vezes em sequência, que deve retornar erro HTTP `409 Conflict`.

## Ambiente

* Aplicação: POLAR (API)
* Perfis utilizados: Professor e Coordenação
* Usuários: `professor@escola.polar` e `coordenacao@escola.polar`
* Ambiente: desenvolvimento local, API em `http://localhost:3000`
* Banco de dados: provider `json` (`apps/api/data/dev-db.json`, populado pelo `pnpm seed`)
* Node.js: v24.19.0
* Branch: `feature/qa-03-evidencias-concorrencia` (código de `develop` em `5f5e931`)
* Data da execução: 24/09/2026

## Como o teste foi executado

As ações simultâneas foram disparadas por um script Node.js (ver [Anexo](#anexo--script-utilizado)) que chama a API REST diretamente. Cada usuário faz o próprio login e usa o próprio token JWT, como se fossem duas pessoas em navegadores diferentes.

Para as ações "ao mesmo tempo", as duas requisições são enviadas juntas com `Promise.all`, sem esperar a resposta da primeira. As ações "em sequência" esperam a resposta anterior antes de enviar a próxima.

Os casos 3, 5 e 6 foram repetidos em 5 rodadas, cada uma com uma ocorrência nova, para confirmar que o resultado se repete.

O fluxo de status validado é `REGISTRADA → EM_ANALISE → RESOLVIDA → ENCERRADA`. Somente a coordenação pode colocar em análise e resolver. O professor só pode editar a própria ocorrência enquanto ela estiver `REGISTRADA`.

---

## Caso 1 — Login simultâneo de coordenação e professor

**Entrada utilizada**

* Login de `professor@escola.polar` e de `coordenacao@escola.polar` enviados ao mesmo tempo.
* Em seguida, `GET /api/auth/me` com cada token, também ao mesmo tempo.

**Resultado esperado**

As duas sessões devem ser aceitas de forma independente, cada uma com o seu papel.

**Resultado obtido**

```text
professor  /auth/me -> 200 papel=PROFESSOR
coordenacao /auth/me -> 200 papel=COORDENADOR
```

**Status:** ✅ Sucesso

---

## Caso 2 — Leitura simultânea da mesma ocorrência

**Entrada utilizada**

* O professor registra uma ocorrência (`POST /api/ocorrencias`).
* Professor e coordenação consultam a mesma ocorrência ao mesmo tempo (`GET /api/ocorrencias/:id`).

**Resultado esperado**

Os dois usuários devem conseguir ler a ocorrência e ver o mesmo status.

**Resultado obtido**

```text
ocorrencia cef36be0-d771-4112-8de2-06755c0e99bd criada pelo professor: 201 status=REGISTRADA
GET professor -> 200 status=REGISTRADA | GET coordenacao -> 200 status=REGISTRADA
```

**Status:** ✅ Sucesso

---

## Caso 3 — Professor edita enquanto a coordenação coloca a ocorrência em análise

**Entrada utilizada**

Ao mesmo tempo:

* Professor: `PATCH /api/ocorrencias/:id` alterando a descrição.
* Coordenação: `PATCH /api/ocorrencias/:id/status` com `{ "status": "EM_ANALISE" }`.

O caso foi executado nas duas ordens de envio: **3a**, com a edição disparada primeiro, e **3b**, com a mudança de status disparada primeiro.

**Resultado esperado**

* Se a edição for processada primeiro, as duas ações são válidas: a ocorrência é editada e depois vai para análise.
* Se a mudança de status for processada primeiro, a edição deve ser recusada com `409` (`Ocorrencia so pode ser editada enquanto estiver em REGISTRADA.`).

**Resultado obtido — 3a (edição disparada primeiro)**

```text
rodada 1: PATCH professor -> 200 | PATCH status coordenacao -> 200 | final status=EM_ANALISE descricaoEditada=true | historico=[Ocorrencia registrada > Ocorrencia editada pelo autor > Status alterado de REGISTRADA para EM_ANALISE]
rodada 2: PATCH professor -> 200 | PATCH status coordenacao -> 200 | final status=EM_ANALISE descricaoEditada=true | historico=[Ocorrencia registrada > Ocorrencia editada pelo autor > Status alterado de REGISTRADA para EM_ANALISE]
rodada 3: PATCH professor -> 200 | PATCH status coordenacao -> 200 | final status=EM_ANALISE descricaoEditada=true | historico=[Ocorrencia registrada > Ocorrencia editada pelo autor > Status alterado de REGISTRADA para EM_ANALISE]
rodada 4: PATCH professor -> 200 | PATCH status coordenacao -> 200 | final status=EM_ANALISE descricaoEditada=true | historico=[Ocorrencia registrada > Ocorrencia editada pelo autor > Status alterado de REGISTRADA para EM_ANALISE]
rodada 5: PATCH professor -> 200 | PATCH status coordenacao -> 200 | final status=EM_ANALISE descricaoEditada=true | historico=[Ocorrencia registrada > Ocorrencia editada pelo autor > Status alterado de REGISTRADA para EM_ANALISE]
```

A edição ocorreu enquanto a ocorrência ainda estava `REGISTRADA`, e o histórico registra a ordem correta.

**Status 3a:** ✅ Sucesso

**Resultado obtido — 3b (mudança de status disparada primeiro)**

```text
rodada 1: PATCH status coordenacao -> 200 | PATCH professor -> 200 | final status=EM_ANALISE descricaoEditada=true | historico=[Ocorrencia registrada > Status alterado de REGISTRADA para EM_ANALISE > Ocorrencia editada pelo autor]
rodada 2: PATCH status coordenacao -> 200 | PATCH professor -> 200 | final status=EM_ANALISE descricaoEditada=true | historico=[Ocorrencia registrada > Status alterado de REGISTRADA para EM_ANALISE > Ocorrencia editada pelo autor]
rodada 3: PATCH status coordenacao -> 200 | PATCH professor -> 200 | final status=EM_ANALISE descricaoEditada=true | historico=[Ocorrencia registrada > Status alterado de REGISTRADA para EM_ANALISE > Ocorrencia editada pelo autor]
rodada 4: PATCH status coordenacao -> 200 | PATCH professor -> 200 | final status=EM_ANALISE descricaoEditada=true | historico=[Ocorrencia registrada > Status alterado de REGISTRADA para EM_ANALISE > Ocorrencia editada pelo autor]
rodada 5: PATCH status coordenacao -> 200 | PATCH professor -> 200 | final status=EM_ANALISE descricaoEditada=true | historico=[Ocorrencia registrada > Status alterado de REGISTRADA para EM_ANALISE > Ocorrencia editada pelo autor]
```

Nas 5 rodadas, a edição do professor foi aceita **depois** de a ocorrência já estar `EM_ANALISE`. O registro de histórico da edição também ficou com o status antigo:

```text
historico: 2026-09-24T23:08:25.732Z status=REGISTRADA Ocorrencia registrada
historico: 2026-09-24T23:08:25.766Z status=EM_ANALISE Status alterado de REGISTRADA para EM_ANALISE
historico: 2026-09-24T23:08:25.767Z status=REGISTRADA Ocorrencia editada pelo autor
```

**Status 3b:** ❌ Falha. Ver [defeito D2](#d2--edição-aceita-depois-da-mudança-de-status).

---

## Caso 4 — Resolver a mesma ocorrência duas vezes em sequência (critério de aceite)

**Entrada utilizada**

* O professor registra uma ocorrência.
* Coordenação: `EM_ANALISE`.
* Coordenação: `RESOLVIDA` (1ª tentativa).
* Coordenação: `RESOLVIDA` novamente (2ª tentativa), enviada depois da resposta da 1ª.
* Professor: `RESOLVIDA` na mesma ocorrência, depois das anteriores.

**Resultado esperado**

A 1ª resolução deve ser aceita. A 2ª tentativa deve retornar `409 Conflict`, pois a ocorrência já está `RESOLVIDA`.

**Resultado obtido**

```text
EM_ANALISE (coordenacao) -> 200
1a RESOLVIDA (coordenacao) -> 200
2a RESOLVIDA (coordenacao) -> 409 CONFLICT: Status nao pode pular etapas.
RESOLVIDA (professor, depois) -> 409 CONFLICT: Status nao pode pular etapas.
professor ve status=RESOLVIDA | historico=[Ocorrencia registrada > Status alterado de REGISTRADA para EM_ANALISE > Status alterado de EM_ANALISE para RESOLVIDA]
```

A 2ª tentativa retornou `409` e o histórico tem um único registro de resolução. O professor passou a ver a ocorrência como `RESOLVIDA`.

**Status:** ✅ Sucesso

---

## Caso 5 — Professor e coordenação tentam resolver ao mesmo tempo

**Entrada utilizada**

* Ocorrência em `EM_ANALISE`.
* Professor e coordenação enviam `RESOLVIDA` ao mesmo tempo.

**Resultado esperado**

A coordenação resolve a ocorrência (`200`). O professor recebe `403`, pois não tem permissão para resolver.

**Resultado obtido**

```text
rodada 1: professor -> 403 FORBIDDEN: Apenas coordenador pode resolver ocorrencia. | coordenacao -> 200 | registros de resolucao no historico=1
rodada 2: professor -> 403 FORBIDDEN: Apenas coordenador pode resolver ocorrencia. | coordenacao -> 200 | registros de resolucao no historico=1
rodada 3: professor -> 403 FORBIDDEN: Apenas coordenador pode resolver ocorrencia. | coordenacao -> 200 | registros de resolucao no historico=1
rodada 4: professor -> 403 FORBIDDEN: Apenas coordenador pode resolver ocorrencia. | coordenacao -> 200 | registros de resolucao no historico=1
rodada 5: professor -> 403 FORBIDDEN: Apenas coordenador pode resolver ocorrencia. | coordenacao -> 200 | registros de resolucao no historico=1
```

**Status:** ✅ Sucesso

---

## Caso 6 — Duas sessões da coordenação resolvem ao mesmo tempo

**Entrada utilizada**

* A coordenação faz login em uma segunda sessão (simula duas abas ou dois coordenadores).
* Ocorrência em `EM_ANALISE`.
* As duas sessões enviam `RESOLVIDA` ao mesmo tempo.

**Resultado esperado**

Assim como no caso 4, apenas uma resolução deve ser aceita (`200`) e a outra deve retornar `409`. O histórico deve ter um único registro de resolução.

**Resultado obtido**

```text
rodada 1: sessao A -> 200 | sessao B -> 200 | registros de resolucao no historico=2
rodada 2: sessao A -> 200 | sessao B -> 200 | registros de resolucao no historico=2
rodada 3: sessao A -> 200 | sessao B -> 200 | registros de resolucao no historico=2
rodada 4: sessao A -> 200 | sessao B -> 200 | registros de resolucao no historico=2
rodada 5: sessao A -> 200 | sessao B -> 200 | registros de resolucao no historico=2
```

Nas 5 rodadas, as duas requisições retornaram `200`. O histórico e a auditoria ficaram com a resolução duplicada:

```text
ocorrencia 5270c970-ff90-4235-8bff-03ce0f981669 (status final RESOLVIDA)
historico: 2026-09-24T23:08:27.435Z RESOLVIDA Status alterado de EM_ANALISE para RESOLVIDA
historico: 2026-09-24T23:08:27.436Z RESOLVIDA Status alterado de EM_ANALISE para RESOLVIDA
audit:     2026-09-24T23:08:27.435Z OCORRENCIA_STATUS_ALTERADO {"de":"EM_ANALISE","para":"RESOLVIDA"}
audit:     2026-09-24T23:08:27.436Z OCORRENCIA_STATUS_ALTERADO {"de":"EM_ANALISE","para":"RESOLVIDA"}
```

**Status:** ❌ Falha. Ver [defeito D1](#d1--resolução-simultânea-aceita-duas-vezes).

---

## Defeitos encontrados

### D1 — Resolução simultânea aceita duas vezes

Duas requisições `RESOLVIDA` enviadas ao mesmo tempo retornam `200`. O histórico e a auditoria ganham dois registros de resolução. O `409` só aparece quando a segunda tentativa chega depois da primeira ter sido gravada (caso 4).

### D2 — Edição aceita depois da mudança de status

Se a coordenação coloca a ocorrência em análise e, ao mesmo tempo, o professor a edita, a edição é gravada mesmo com a ocorrência já `EM_ANALISE`. O registro de histórico da edição fica com `status=REGISTRADA`, que já não era o status real da ocorrência.

### Causa provável (análise do código)

Em `apps/api/src/modules/ocorrencias/ocorrencias.service.ts`, os métodos `updateStatus` e `update` leem a ocorrência com `this.get(...)` e validam o status **antes** de abrir a transação de escrita. A função passada para `updateWithHistorico` aplica a alteração sem conferir o status de novo. Se duas requisições leem a ocorrência antes de qualquer uma gravar, ambas passam na validação.

O repositório Postgres (`ocorrencia.repository.postgres.ts`) já bloqueia a linha com `SELECT ... FOR UPDATE`, mas a validação acontece fora da transação. Pela leitura do código, o mesmo problema deve ocorrer em produção. O teste foi executado apenas com o provider `json`.

### Sugestão de correção

Validar o status dentro da função passada para `updateWithHistorico` e lançar `conflict(...)` se ele tiver mudado, antes de gravar. No provider `json` as transações já são executadas em fila. No Postgres a linha já está travada por `FOR UPDATE`. Assim, a segunda requisição passaria a ler o status atualizado e receberia `409`.

Também vale um teste de integração que dispare as duas requisições com `Promise.all` e espere `[200, 409]`.

---

## Observações

* Quando o professor tenta resolver uma ocorrência que já está `RESOLVIDA` (caso 4), a resposta é `409`, e não `403`. Isso acontece porque `updateStatus` valida a transição de status antes da permissão do papel. A ação é recusada de qualquer forma, mas a mensagem não informa ao professor que ele não tem permissão para resolver.
* A resposta de conflito usa a mensagem genérica `Status nao pode pular etapas.` também para a tentativa repetida. Uma mensagem como "Ocorrência já está RESOLVIDA" seria mais clara para o usuário.

---

## Conclusão

O critério de aceite da QA-03 foi atendido: resolver a mesma ocorrência duas vezes em sequência retorna `409 Conflict` na segunda tentativa (caso 4). Logins, leituras e ações com permissões diferentes feitas ao mesmo tempo por coordenação e professor se comportaram como esperado (casos 1, 2, 3a e 5).

O teste também encontrou dois defeitos de concorrência que acontecem quando as ações chegam de fato ao mesmo tempo:

* **D1:** a resolução simultânea é aceita duas vezes e duplica o histórico e a auditoria (caso 6, 5 de 5 rodadas).
* **D2:** a edição é aceita depois de a ocorrência já estar em análise (caso 3b, 5 de 5 rodadas).

Recomenda-se abrir uma tarefa de back-end para corrigir D1 e D2 conforme a sugestão acima.

---

## Anexo — script utilizado

Com a API rodando (`pnpm dev`) e o banco populado (`pnpm seed`), salve o script abaixo como `concorrencia.mjs` e execute `node concorrencia.mjs 5`. O argumento é o número de rodadas.

<details>
<summary>concorrencia.mjs</summary>

```js
// QA-03 — teste de concorrencia simples contra a API local.
// Uso: node concorrencia.mjs [rodadas]   (API em http://localhost:3000)
const API = process.env.API_URL ?? "http://localhost:3000/api";
const SENHA = process.env.SEED_SENHA ?? "SenhaDemo1!";
const RODADAS = Number(process.argv[2] ?? 5);
const tag = Date.now().toString(36);

async function call(token, method, path, body) {
  const res = await fetch(API + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, data: json?.data ?? json, error: json?.error };
}

const fmt = (r) => `${r.status}${r.error ? ` ${r.error.code}: ${r.error.message}` : ""}`;
const login = (email) => call(null, "POST", "/auth/login", { email, senha: SENHA }).then((r) => r.data.token);
const status = (token, id, novo) => call(token, "PATCH", `/ocorrencias/${id}/status`, { status: novo });

let seq = 0;
async function novaOcorrencia(prof, alunoId) {
  seq += 1;
  const r = await call(prof, "POST", "/ocorrencias", {
    alunoId,
    categoria: "Indisciplina",
    prioridade: "MEDIA",
    descricao: `QA-03 concorrencia ${tag}-${seq}: aluno conversando durante a avaliacao.`,
    local: "Sala 12",
    bimestre: 3
  });
  if (r.status !== 201) throw new Error(`criacao falhou: ${fmt(r)}`);
  return r.data;
}

async function historico(token, id) {
  const r = await call(token, "GET", `/ocorrencias/${id}/historico`);
  return r.data.map((h) => h.acao);
}

// Caso 1 — dois usuarios logados ao mesmo tempo
console.log("## Caso 1 — login simultaneo");
const [prof, coord] = await Promise.all([login("professor@escola.polar"), login("coordenacao@escola.polar")]);
const [meProf, meCoord] = await Promise.all([call(prof, "GET", "/auth/me"), call(coord, "GET", "/auth/me")]);
console.log(`professor  /auth/me -> ${meProf.status} papel=${meProf.data.user.papel}`);
console.log(`coordenacao /auth/me -> ${meCoord.status} papel=${meCoord.data.user.papel}`);

const alunos = await call(prof, "GET", "/alunos");
const alunoId = alunos.data[0].id;

// Caso 2 — leitura simultanea da mesma ocorrencia
console.log("\n## Caso 2 — leitura simultanea");
const o2 = await novaOcorrencia(prof, alunoId);
const [l1, l2] = await Promise.all([call(prof, "GET", `/ocorrencias/${o2.id}`), call(coord, "GET", `/ocorrencias/${o2.id}`)]);
console.log(`ocorrencia ${o2.id} criada pelo professor: 201 status=${o2.status}`);
console.log(`GET professor -> ${l1.status} status=${l1.data.status} | GET coordenacao -> ${l2.status} status=${l2.data.status}`);

// Caso 3 — professor edita enquanto a coordenacao coloca em analise
console.log("\n## Caso 3 — edicao (professor) x EM_ANALISE (coordenacao) simultaneas");
for (let i = 1; i <= RODADAS; i += 1) {
  const o = await novaOcorrencia(prof, alunoId);
  const [edit, analise] = await Promise.all([
    call(prof, "PATCH", `/ocorrencias/${o.id}`, { descricao: `Descricao editada pelo professor na rodada ${i} (${tag}).` }),
    status(coord, o.id, "EM_ANALISE")
  ]);
  const final = await call(coord, "GET", `/ocorrencias/${o.id}`);
  const hist = await historico(coord, o.id);
  const editada = final.data.descricao.startsWith("Descricao editada");
  console.log(
    `rodada ${i}: PATCH professor -> ${fmt(edit)} | PATCH status coordenacao -> ${fmt(analise)} | final status=${final.data.status} descricaoEditada=${editada} | historico=[${hist.join(" > ")}]`
  );
}

// Caso 3b — mesma disputa, com o pedido da coordenacao disparado primeiro
console.log("\n## Caso 3b — EM_ANALISE (coordenacao) disparado antes da edicao (professor)");
for (let i = 1; i <= RODADAS; i += 1) {
  const o = await novaOcorrencia(prof, alunoId);
  const pAnalise = status(coord, o.id, "EM_ANALISE");
  const pEdit = call(prof, "PATCH", `/ocorrencias/${o.id}`, { descricao: `Descricao editada pelo professor na rodada ${i} (${tag}).` });
  const [analise, edit] = await Promise.all([pAnalise, pEdit]);
  const final = await call(coord, "GET", `/ocorrencias/${o.id}`);
  const hist = await historico(coord, o.id);
  const editada = final.data.descricao.startsWith("Descricao editada");
  console.log(
    `rodada ${i}: PATCH status coordenacao -> ${fmt(analise)} | PATCH professor -> ${fmt(edit)} | final status=${final.data.status} descricaoEditada=${editada} | historico=[${hist.join(" > ")}]`
  );
}

// Caso 4 — criterio de aceite: resolver a mesma ocorrencia duas vezes em sequencia
console.log("\n## Caso 4 — resolver duas vezes em sequencia");
const o4 = await novaOcorrencia(prof, alunoId);
console.log(`EM_ANALISE (coordenacao) -> ${fmt(await status(coord, o4.id, "EM_ANALISE"))}`);
console.log(`1a RESOLVIDA (coordenacao) -> ${fmt(await status(coord, o4.id, "RESOLVIDA"))}`);
console.log(`2a RESOLVIDA (coordenacao) -> ${fmt(await status(coord, o4.id, "RESOLVIDA"))}`);
console.log(`RESOLVIDA (professor, depois) -> ${fmt(await status(prof, o4.id, "RESOLVIDA"))}`);
const f4 = await call(prof, "GET", `/ocorrencias/${o4.id}`);
console.log(`professor ve status=${f4.data.status} | historico=[${(await historico(coord, o4.id)).join(" > ")}]`);

// Caso 5 — professor e coordenacao tentam resolver ao mesmo tempo
console.log("\n## Caso 5 — RESOLVIDA simultanea: professor x coordenacao");
for (let i = 1; i <= RODADAS; i += 1) {
  const o = await novaOcorrencia(prof, alunoId);
  await status(coord, o.id, "EM_ANALISE");
  const [rp, rc] = await Promise.all([status(prof, o.id, "RESOLVIDA"), status(coord, o.id, "RESOLVIDA")]);
  const hist = await historico(coord, o.id);
  const resolucoes = hist.filter((a) => a.endsWith("para RESOLVIDA")).length;
  console.log(`rodada ${i}: professor -> ${fmt(rp)} | coordenacao -> ${fmt(rc)} | registros de resolucao no historico=${resolucoes}`);
}

// Caso 6 — duas sessoes da coordenacao resolvem ao mesmo tempo
console.log("\n## Caso 6 — RESOLVIDA simultanea: duas sessoes da coordenacao");
const coord2 = await login("coordenacao@escola.polar");
for (let i = 1; i <= RODADAS; i += 1) {
  const o = await novaOcorrencia(prof, alunoId);
  await status(coord, o.id, "EM_ANALISE");
  const [a, b] = await Promise.all([status(coord, o.id, "RESOLVIDA"), status(coord2, o.id, "RESOLVIDA")]);
  const hist = await historico(coord, o.id);
  const resolucoes = hist.filter((x) => x.endsWith("para RESOLVIDA")).length;
  console.log(`rodada ${i}: sessao A -> ${fmt(a)} | sessao B -> ${fmt(b)} | registros de resolucao no historico=${resolucoes}`);
}
```

</details>
