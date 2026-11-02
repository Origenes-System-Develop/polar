#!/usr/bin/env python3
"""Gera as imagens animadas do README (docs/assets/*-claro.svg e *-escuro.svg).

Uso: python scripts/gerar-readme.py

O GitHub nao roda HTML nem JavaScript em README, mas toca SVG animado (CSS dentro do
proprio SVG) quando ele entra como <img>. Por isso a demonstracao do sistema e feita em SVG.
As duas versoes saem do mesmo desenho, so trocando a paleta pelas cores do GitHub.
"""
import random
import sys
from pathlib import Path

SAIDA = Path(__file__).resolve().parent.parent / "docs" / "assets"

TEMAS = {
    "escuro": dict(bg="#0d1117", painel="#161b22", painel2="#1c2128", borda="#30363d", texto="#e6edf3", mudo="#8b949e",
                   azul="#2f81f7", azul_suave="#0d2447", verde="#3fb950", verde_suave="#0f2d1a", amarelo="#d29922", amarelo_suave="#3a2c0a",
                   vermelho="#f85149", roxo="#a371f7", roxo_suave="#2a1f4a", estrela="#f0f6fc"),
    "claro": dict(bg="#ffffff", painel="#f6f8fa", painel2="#eaeef2", borda="#d0d7de", texto="#1f2328", mudo="#656d76",
                  azul="#0969da", azul_suave="#ddf4ff", verde="#1a7f37", verde_suave="#dafbe1", amarelo="#9a6700", amarelo_suave="#fff8c5",
                  vermelho="#cf222e", roxo="#8250df", roxo_suave="#fbefff", estrela="#0969da"),
}

FONTE = "-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans',Helvetica,Arial,sans-serif"

# --- desenhos da marca (mesmos tracados de apps/web/src/components/ui/Marca.tsx) -------------
ESTRELA_GRANDE = "M24 0.5Q25.5 21 40 24Q25.5 27 24 36Q22.5 27 8 24Q22.5 21 24 0.5Z"
ESTRELA_MENOR = "M35.31 12.69Q26.24 24.00 35.31 35.31Q24.00 26.24 12.69 35.31Q21.76 24.00 12.69 12.69Q24.00 21.76 35.31 12.69Z"
CAUDA = "M24 36Q24.7 41.5 24 47.5Q23.3 41.5 24 36Z"
# Ursa Menor: o cabo e a concha. A ultima estrela do cabo e a Polaris.
URSA = [(29.3, 19.03, 1.3), (23.3, 24.03, 1.95), (18.3, 30.03, 1.55), (11.3, 34.03, 2.45), (9.3, 43.03, 2.1), (19.3, 41.03, 3.25)]
URSA_LINHA = "M32.05 14.27 L29.3 19.03 L23.3 24.03 L18.3 30.03 L11.3 34.03 L9.3 43.03 L19.3 41.03 L18.3 30.03"
POLARIS = (34.3, 10.37)
POLARIS_BRILHO = "M34.3 2.87 L35.75 7.86 L40.8 6.62 L37.2 10.37 L40.8 14.12 L35.75 12.88 L34.3 17.87 L32.85 12.88 L27.81 14.12 L31.4 10.37 L27.81 6.62 L32.85 7.86 Z"


def marca(x, y, altura, t, classe="", fundo=None):
    """Estrela do Polar com a altura dada, canto superior esquerdo em (x, y)."""
    k = altura / 48
    return (
        f'<g class="{classe}" transform="translate({x - 8 * k:.1f} {y:.1f}) scale({k:.4f})">'
        f'<path class="menor" d="{ESTRELA_MENOR}" fill="{t["azul"]}" opacity=".45"/>'
        f'<path d="{ESTRELA_GRANDE}" fill="{t["azul"]}"/>'
        f'<path d="{CAUDA}" fill="{t["azul"]}" opacity=".5"/>'
        f'<circle cx="24" cy="24" r="2.9" fill="{fundo or t["bg"]}"/></g>'
    )


def cabeca(w, h, titulo, css, extra=""):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="{titulo}">'
        f"<style>text{{font-family:{FONTE}}}{css}"
        "@media (prefers-reduced-motion:reduce){*{animation:none!important;opacity:1!important;stroke-dashoffset:0!important}}"
        f"</style>{extra}"
    )


def texto(x, y, s, tam=14, peso=400, cor="#000", ancora="start", extra=""):
    s = s.replace("&", "&amp;").replace("<", "&lt;")
    return f'<text x="{x}" y="{y}" font-size="{tam}" font-weight="{peso}" fill="{cor}" text-anchor="{ancora}" {extra}>{s}</text>'


def caixa(x, y, w, h, fundo, borda=None, r=6, extra=""):
    b = f' stroke="{borda}"' if borda else ""
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fundo}"{b} {extra}/>'


def pilula(x, y, rotulo, fundo, cor, tam=12, pad=10, borda=None):
    w = len(rotulo) * tam * 0.58 + pad * 2
    return (
        caixa(x, y, w, tam + 12, fundo, borda, r=(tam + 12) / 2)
        + texto(x + w / 2, y + tam + 2, rotulo, tam, 600, cor, "middle")
    ), w


# =============================================================================================
# BANNER
# =============================================================================================
def banner(t):
    w, h = 1280, 380
    rnd = random.Random(11)
    estrelas = "".join(
        f'<circle class="tw" cx="{rnd.uniform(24, w - 24):.0f}" cy="{rnd.uniform(18, h - 18):.0f}" r="{rnd.choice([0.8, 1, 1.2, 1.5])}" '
        f'fill="{t["estrela"]}" style="animation-delay:{rnd.uniform(0, 6):.1f}s;animation-duration:{rnd.uniform(2.6, 5.5):.1f}s"/>'
        for _ in range(60)
    )
    ox, oy, esc = 868, 42, 7.0

    def p(x, y):
        return ox + x * esc, oy + y * esc

    pontos = "".join(
        f'<circle class="ponto" cx="{p(x, y)[0]:.1f}" cy="{p(x, y)[1]:.1f}" r="{r * 2.1:.1f}" fill="{t["azul"]}" style="animation-delay:{1.2 + i * 0.25:.2f}s"/>'
        for i, (x, y, r) in enumerate(URSA)
    )
    px, py = p(*POLARIS)
    linha = " ".join(
        ("M" if i == 0 else "L") + f"{p(*pt)[0]:.1f} {p(*pt)[1]:.1f}"
        for i, pt in enumerate([(32.05, 14.27), (29.3, 19.03), (23.3, 24.03), (18.3, 30.03), (11.3, 34.03), (9.3, 43.03), (19.3, 41.03), (18.3, 30.03)])
    )
    css = f"""
.tw{{opacity:.1;animation:tw 3.6s ease-in-out infinite}}
@keyframes tw{{50%{{opacity:.55}}}}
.linha{{stroke-dasharray:1;stroke-dashoffset:1;animation:desenha 2.4s .5s cubic-bezier(.3,.7,.2,1) forwards}}
@keyframes desenha{{to{{stroke-dashoffset:0}}}}
.ponto{{opacity:0;animation:acende .6s ease forwards}}
@keyframes acende{{to{{opacity:1}}}}
.polaris{{transform-box:fill-box;transform-origin:center;animation:polaris 4.5s 2.4s ease-in-out infinite}}
@keyframes polaris{{50%{{transform:scale(1.22) rotate(18deg)}}}}
.halo{{transform-box:fill-box;transform-origin:center;animation:halo 4.5s 2.4s ease-in-out infinite}}
@keyframes halo{{50%{{transform:scale(1.5);opacity:.05}}}}
.mark .menor{{transform-box:fill-box;transform-origin:center;animation:gira 60s linear infinite}}
@keyframes gira{{to{{transform:rotate(360deg)}}}}
.mark{{animation:entra 1s .1s both}}
.t1{{animation:sobe .9s .3s both}} .t2{{animation:sobe .9s .55s both}} .t3{{animation:sobe .9s .8s both}} .t4{{animation:sobe .9s 1.05s both}}
@keyframes sobe{{from{{opacity:0;transform:translateY(10px)}}}}
@keyframes entra{{from{{opacity:0;transform:scale(.8)}}}}
.rotulo{{animation:sobe .9s 3s both}}
"""
    chips = ""
    cx = 206
    for i, (rot, cor, fundo) in enumerate([("Professor registra", t["azul"], t["azul_suave"]), ("Coordenação analisa e resolve", t["amarelo"], t["amarelo_suave"]), ("Direção encerra", t["verde"], t["verde_suave"])]):
        pil, larg = pilula(cx, 290, rot, fundo, cor, 16, 16, t["borda"])
        chips += pil
        cx += larg + 10
        if i < 2:
            chips += texto(cx - 4, 311, "›", 22, 700, t["mudo"], "middle")
            cx += 14
    corpo = (
        caixa(0.5, 0.5, w - 1, h - 1, t["bg"], t["borda"], 14)
        + f'<circle cx="1050" cy="60" r="260" fill="{t["azul"]}" opacity=".06"/>'
        + f'<circle cx="150" cy="340" r="220" fill="{t["azul"]}" opacity=".05"/>'
        + estrelas
        + f'<g class="mark">{marca(78, 96, 150, t)}</g>'
        + f'<g class="t1">{texto(204, 168, "Polar", 84, 800, t["texto"])}</g>'
        + f'<g class="t2">{texto(206, 218, "Ocorrências escolares, do registro ao encerramento.", 28, 500, t["mudo"])}</g>'
        + f'<g class="t3">{texto(206, 258, "Cada passo fica gravado. Ninguém apaga o histórico.", 21, 400, t["mudo"])}</g>'
        + f'<g class="t4">{chips}</g>'
        + f'<path class="linha" pathLength="1" d="{linha}" fill="none" stroke="{t["azul"]}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>'
        + pontos
        + f'<circle class="halo" cx="{px:.1f}" cy="{py:.1f}" r="34" fill="{t["azul"]}" opacity=".16"/>'
        + f'<g transform="translate({px - POLARIS[0] * esc * 0.9:.1f} {py - POLARIS[1] * esc * 0.9:.1f}) scale({esc * 0.9})"><g class="polaris"><path d="{POLARIS_BRILHO}" fill="{t["azul"]}"/></g></g>'
        + f'<g class="rotulo">{texto(1146, 352, "Polaris", 15, 700, t["azul"], "end")}{texto(1146, 370, "a equipe, a estrela e a constelação", 12, 400, t["mudo"], "end")}</g>'
    )
    return cabeca(w, h, "Polar: ocorrências escolares, do registro ao encerramento. Feito pela equipe Polaris.", css) + corpo + "</svg>"


# =============================================================================================
# DEMONSTRACAO (passeio animado pelo sistema)
# =============================================================================================
CENAS = 6
DURACAO = 30  # segundos por volta
_vis = {}


def vis(a, b, fade=0.5):
    """Classe que mostra o elemento entre a e b (em segundos da volta)."""
    chave = (a, b)
    if chave not in _vis:
        _vis[chave] = f"v{len(_vis)}"
    return _vis[chave]


def keyframes_vis():
    saida = ""
    for (a, b), nome in _vis.items():
        pa, pb, f = a / DURACAO * 100, b / DURACAO * 100, 0.5 / DURACAO * 100
        pts = []
        if a > 0:
            pts.append(f"0%,{max(pa - f, 0):.2f}%{{opacity:0}}")
        pts.append(f"{pa:.2f}%{{opacity:1}}" if a > 0 else "0%{opacity:1}")
        if b < DURACAO:
            pts.append(f"{pb:.2f}%{{opacity:1}}{min(pb + f, 100):.2f}%,100%{{opacity:0}}")
        else:
            pts.append(f"{100 - f:.2f}%{{opacity:1}}100%{{opacity:0}}")
        saida += f"@keyframes {nome}{{{''.join(pts)}}}.{nome}{{opacity:0;animation:{nome} {DURACAO}s linear infinite}}"
    return saida


def digita(x, y, w, h, a, b, fundo):
    """Cobre o texto e descobre da esquerda para a direita entre a e b (segundos)."""
    nome = f"d{len(_vis)}_{int(a * 10)}"
    pa, pb = a / DURACAO * 100, b / DURACAO * 100
    _digita.append(
        f"@keyframes {nome}{{0%,{pa:.2f}%{{transform:scaleX(1)}}{pb:.2f}%,100%{{transform:scaleX(1)}}"
        f"{pa + 0.01:.2f}%{{transform:scaleX(1)}}{pb:.2f}%{{transform:scaleX(0)}}99.99%{{transform:scaleX(0)}}100%{{transform:scaleX(1)}}}}"
        f".{nome}{{transform-box:fill-box;transform-origin:right center;animation:{nome} {DURACAO}s linear infinite}}"
    )
    return f'<rect class="{nome}" x="{x}" y="{y}" width="{w}" height="{h}" fill="{fundo}"/>'


_digita = []


def demo(t):
    _vis.clear()
    _digita.clear()
    w, h = 960, 580
    janela_y = 20
    S = DURACAO / CENAS  # 5 s por cena

    def cena(i, conteudo):
        return f'<g class="{vis(i * S, (i + 1) * S)}">{conteudo}</g>'

    # moldura
    moldura = (
        caixa(0.5, 0.5, w - 1, h - 1, t["painel"], t["borda"], 14)
        + caixa(20, janela_y, w - 40, 470, t["bg"], t["borda"], 10)
        + caixa(20, janela_y, w - 40, 36, t["painel"], None, 10)
        + f'<rect x="20" y="{janela_y + 26}" width="{w - 40}" height="10" fill="{t["painel"]}"/>'
        + f'<line x1="20" x2="{w - 20}" y1="{janela_y + 36}" y2="{janela_y + 36}" stroke="{t["borda"]}"/>'
        + "".join(f'<circle cx="{40 + i * 18}" cy="{janela_y + 18}" r="5" fill="{c}"/>' for i, c in enumerate(["#ff5f56", "#ffbd2e", "#27c93f"]))
        + caixa(300, janela_y + 8, 360, 20, t["bg"], t["borda"], 10)
        + texto(480, janela_y + 22, "polarescolar.vercel.app", 11, 500, t["mudo"], "middle")
    )
    # menu lateral (aparece nas cenas 2 a 6)
    itens = ["Início", "Ocorrências", "Alunos", "Turmas", "Relatórios"]
    menu = (
        f'<rect x="20" y="{janela_y + 36}" width="170" height="434" fill="{t["painel"]}"/>'
        + f'<line x1="190" x2="190" y1="{janela_y + 36}" y2="{janela_y + 470}" stroke="{t["borda"]}"/>'
        + marca(40, janela_y + 52, 26, t, fundo=t["painel"])
        + texto(66, janela_y + 73, "Polar", 17, 800, t["texto"])
        + caixa(34, janela_y + 92, 142, 30, t["azul"], None, 15)
        + texto(105, janela_y + 112, "Registrar ocorrência", 11, 700, "#ffffff", "middle")
        + "".join(
            (caixa(34, janela_y + 138 + i * 34, 142, 28, t["azul_suave"], None, 6) if i == 1 else "")
            + caixa(44, janela_y + 147 + i * 34, 10, 10, "none", t["azul"] if i == 1 else t["mudo"], 3)
            + texto(64, janela_y + 157 + i * 34, nome, 12, 700 if i == 1 else 500, t["azul"] if i == 1 else t["mudo"])
            for i, nome in enumerate(itens)
        )
    )
    area_x, area_y = 214, janela_y + 56  # canto da area de conteudo
    # ---- cena 1: login --------------------------------------------------------------
    login = (
        f'<rect x="20" y="{janela_y + 36}" width="{w - 40}" height="434" fill="{t["bg"]}"/>'
        + caixa(330, 84, 300, 384, t["painel"], t["borda"], 12)
        + marca(462, 108, 38, t, fundo=t["painel"])
        + texto(480, 170, "Entrar no Polar", 20, 800, t["texto"], "middle")
        + texto(350, 222, "E-mail", 11, 700, t["mudo"])
        + caixa(350, 230, 260, 34, t["bg"], t["borda"], 6)
        + texto(362, 252, "professor@escola.polar", 13, 400, t["texto"])
        + digita(356, 236, 250, 22, 0.8, 2.0, t["bg"])
        + texto(350, 288, "Senha", 11, 700, t["mudo"])
        + caixa(350, 296, 260, 34, t["bg"], t["borda"], 6)
        + texto(362, 318, "••••••••••", 13, 400, t["texto"])
        + digita(356, 302, 250, 22, 2.0, 3.0, t["bg"])
        + caixa(350, 352, 260, 36, t["azul"], None, 18)
        + texto(480, 375, "Entrar", 13, 700, "#ffffff", "middle")
        + texto(480, 424, "Use o e-mail cadastrado pela escola.", 11, 400, t["mudo"], "middle")
    )
    # ---- cena 2: registrar ----------------------------------------------------------
    chips_cat = ""
    cx = area_x
    for i, rot in enumerate(["Atraso", "Desrespeito", "Briga", "Uso de celular"]):
        sel = i == 0
        pil, larg = pilula(cx, 196, rot, t["azul_suave"] if sel else t["bg"], t["azul"] if sel else t["mudo"], 12, 12, t["azul"] if sel else t["borda"])
        chips_cat += pil
        cx += larg + 8
    chips_pri = ""
    cx = area_x
    for rot, cor in [("Baixa", t["verde"]), ("Média", t["amarelo"]), ("Alta", t["vermelho"])]:
        sel = rot == "Alta"
        pil, larg = pilula(cx, 262, rot, t["painel2"] if sel else t["bg"], cor if sel else t["mudo"], 12, 12, cor if sel else t["borda"])
        chips_pri += pil
        cx += larg + 8
    registrar = (
        texto(area_x, 108, "Registrar ocorrência", 22, 800, t["texto"])
        + texto(area_x, 130, "Leva cerca de um minuto. Os campos com * são obrigatórios.", 12, 400, t["mudo"])
        + caixa(area_x, 144, 720, 262, t["painel"], t["borda"], 10)
        + texto(area_x + 16, 176, "ALUNO", 10, 700, t["mudo"])
        + texto(area_x + 70, 176, "Ana Souza · 8ºA", 12, 700, t["azul"])
        + chips_cat
        + texto(area_x + 16, 252, "GRAVIDADE", 10, 700, t["mudo"])
        + chips_pri
        + caixa(area_x + 16, 306, 688, 56, t["bg"], t["borda"], 6)
        + texto(area_x + 28, 328, "Chegou 20 minutos depois do início da aula.", 12, 400, t["texto"])
        + texto(area_x + 28, 346, "Não é a primeira vez no mês.", 12, 400, t["texto"])
        + digita(area_x + 22, 314, 676, 44, 0.8, 2.6, t["bg"])
        + caixa(area_x + 590, 372, 114, 30, t["azul"], None, 15)
        + texto(area_x + 647, 392, "Registrar", 12, 700, "#ffffff", "middle")
    )
    # ---- cena 3: pendencias ---------------------------------------------------------
    linhas = ""
    dados = [("Ana Souza", "8ºA · Atraso", "Alta", t["vermelho"], t["painel2"], "Registrada"), ("Bruno Lima", "9ºB · Desrespeito", "Média", t["amarelo"], t["amarelo_suave"], "Em análise"), ("Caio Reis", "7ºC · Uso de celular", "Baixa", t["verde"], t["verde_suave"], "Em análise")]
    for i, (nome, sub, pri, cor, _, st) in enumerate(dados):
        y = 150 + i * 70
        linhas += (
            caixa(area_x, y, 720, 58, t["painel"], t["azul"] if i == 0 else t["borda"], 8)
            + caixa(area_x + 14, y + 15, 28, 28, t["azul"] if i == 0 else t["painel2"], None, 14)
            + texto(area_x + 28, y + 34, str(i + 1), 13, 800, "#ffffff" if i == 0 else t["mudo"], "middle")
            + texto(area_x + 56, y + 25, nome, 14, 700, t["texto"])
            + texto(area_x + 56, y + 43, sub, 11, 400, t["mudo"])
            + (texto(area_x + 160, y + 25, "Comece por esta", 11, 700, t["azul"], extra='font-style="italic"') if i == 0 else "")
            + pilula(area_x + 560, y + 17, pri, t["bg"], cor, 11, 10, cor)[0]
            + pilula(area_x + 628, y + 17, st, t["azul_suave"], t["azul"], 11, 10)[0]
        )
    pend = (
        texto(area_x, 108, "Pendências", 22, 800, t["texto"])
        + texto(area_x, 130, "3 ocorrências esperam a sua análise, da mais urgente para a menos.", 12, 400, t["mudo"])
        + linhas
    )
    # ---- cena 4: coordenacao resolve --------------------------------------------------
    def etapas(ativa):
        nomes = ["Registrada", "Em análise", "Resolvida", "Encerrada"]
        s = ""
        for i, n in enumerate(nomes):
            x = area_x + 20 + i * 176
            cor = t["azul"] if i <= ativa else t["borda"]
            s += f'<circle cx="{x + 10}" cy="212" r="10" fill="{cor if i <= ativa else t["bg"]}" stroke="{cor}" stroke-width="2"/>'
            if i <= ativa:
                s += f'<path d="M{x + 5} 212l3.5 3.5 7-7" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
            s += texto(x + 28, 217, n, 12, 700 if i == ativa else 500, t["texto"] if i <= ativa else t["mudo"])
            if i < 3:
                s += f'<line x1="{x + 118}" x2="{x + 164}" y1="212" y2="212" stroke="{t["azul"] if i < ativa else t["borda"]}" stroke-width="2"/>'
        return s

    detalhe4 = (
        texto(area_x, 108, "Ana Souza · Atraso", 22, 800, t["texto"])
        + texto(area_x, 130, "8ºA · registrada pela professora Marta", 12, 400, t["mudo"])
        + caixa(area_x, 160, 720, 80, t["painel"], t["borda"], 10)
        + f'<g class="{vis(3 * S, 3 * S + 3.2)}">{etapas(1)}</g>'
        + f'<g class="{vis(3 * S + 3.2, 4 * S)}">{etapas(2)}</g>'
        + caixa(area_x, 256, 720, 108, t["painel"], t["borda"], 10)
        + texto(area_x + 16, 282, "OBSERVAÇÃO", 10, 700, t["mudo"])
        + texto(area_x + 16, 306, "Conversei com a família. Combinamos acompanhar a semana.", 12, 400, t["texto"])
        + digita(area_x + 16, 292, 688, 20, 3 * S + 0.6, 3 * S + 2.4, t["painel"])
        + caixa(area_x + 560, 322, 144, 30, t["verde"], None, 15)
        + texto(area_x + 632, 342, "Marcar resolvida", 12, 700, "#ffffff", "middle")
    )
    # ---- cena 5: direcao encerra --------------------------------------------------------
    detalhe5 = (
        texto(area_x, 108, "Ana Souza · Atraso", 22, 800, t["texto"])
        + texto(area_x, 130, "8ºA · aguardando o encerramento da direção", 12, 400, t["mudo"])
        + caixa(area_x, 160, 720, 80, t["painel"], t["borda"], 10)
        + f'<g class="{vis(4 * S, 4 * S + 3.2)}">{etapas(2)}</g>'
        + f'<g class="{vis(4 * S + 3.2, 5 * S)}">{etapas(3)}</g>'
        + caixa(area_x, 256, 720, 108, t["painel"], t["borda"], 10)
        + texto(area_x + 16, 282, "SITUAÇÃO", 10, 700, t["mudo"])
        + f'<g class="{vis(4 * S, 4 * S + 3.2)}">{pilula(area_x + 16, 292, "Resolvida", t["verde_suave"], t["verde"], 12, 12, t["verde"])[0]}'
        + texto(area_x + 120, 310, "Falta o ato formal de encerramento.", 12, 400, t["mudo"])
        + f'{caixa(area_x + 590, 322, 114, 30, t["azul"], None, 15)}{texto(area_x + 647, 342, "Encerrar", 12, 700, "#ffffff", "middle")}</g>'
        + f'<g class="{vis(4 * S + 3.2, 5 * S)}">{pilula(area_x + 16, 292, "Encerrada", t["roxo_suave"], t["roxo"], 12, 12, t["roxo"])[0]}'
        + texto(area_x + 120, 310, "Somente leitura, para sempre.", 12, 400, t["mudo"]) + "</g>"
    )
    # ---- cena 6: historico ---------------------------------------------------------------
    eventos = [("Registrada", "Marta Alves · professora", "02/11, 08:12", t["azul"]), ("Em análise", "Paulo Reis · coordenação", "02/11, 09:40", t["amarelo"]), ("Resolvida", "Paulo Reis · coordenação", "03/11, 10:05", t["verde"]), ("Encerrada", "Helena Prado · direção", "03/11, 15:30", t["roxo"])]
    tl = ""
    for i, (acao, quem, quando, cor) in enumerate(eventos):
        y = 152 + i * 68
        tl += (
            f'<circle cx="{area_x + 14}" cy="{y + 18}" r="7" fill="{cor}"/>'
            + (f'<line x1="{area_x + 14}" x2="{area_x + 14}" y1="{y + 26}" y2="{y + 60}" stroke="{t["borda"]}" stroke-width="2"/>' if i < 3 else "")
            + texto(area_x + 36, y + 22, acao, 14, 700, t["texto"])
            + texto(area_x + 36, y + 40, quem, 12, 400, t["mudo"])
            + texto(area_x + 716, y + 22, quando, 12, 500, t["mudo"], "end")
        )
    hist = (
        texto(area_x, 108, "Histórico", 22, 800, t["texto"])
        + texto(area_x, 130, "Cada passo, com autor, data e hora. Ninguém edita nem apaga.", 12, 400, t["mudo"])
        + tl
    )

    cenas = [login, registrar, pend, detalhe4, detalhe5, hist]
    corpo_cenas = ""
    for i, c in enumerate(cenas):
        corpo_cenas += cena(i, (menu if i > 0 else "") + c)

    # legenda e progresso
    legendas = ["1  Professor entra", "2  Professor registra", "3  Coordenação vê a fila", "4  Coordenação analisa e resolve", "5  Direção encerra", "6  Tudo fica no histórico"]
    leg = "".join(f'<g class="{vis(i * S, (i + 1) * S)}">{texto(w / 2, 542, l, 15, 700, t["texto"], "middle")}</g>' for i, l in enumerate(legendas))
    bolinhas = "".join(
        f'<circle cx="{w / 2 - 50 + i * 20}" cy="559" r="4" fill="{t["borda"]}"/>'
        f'<circle class="{vis(i * S, (i + 1) * S)}" cx="{w / 2 - 50 + i * 20}" cy="559" r="4" fill="{t["azul"]}"/>'
        for i in range(CENAS)
    )
    # cursor + clique: alvos por cena
    alvos = [(480, 380), (area_x + 647, 387), (area_x + 200, 180), (area_x + 632, 357), (area_x + 647, 357), (area_x + 500, 300)]
    pts = []
    for i, (x, y) in enumerate(alvos):
        a = i * S + 0.7
        pts.append((a / DURACAO * 100, x, y))
        pts.append(((i + 1) * S - 0.2) / DURACAO * 100)
    cur = ""
    for i, (x, y) in enumerate(alvos):
        ini = (i * S) / DURACAO * 100
        chega = (i * S + 1.4) / DURACAO * 100
        fim = ((i + 1) * S) / DURACAO * 100
        cur += f"{ini:.2f}%{{transform:translate({(alvos[i - 1][0] if i else 560):.0f}px,{(alvos[i - 1][1] if i else 470):.0f}px)}}{chega:.2f}%,{fim - 0.01:.2f}%{{transform:translate({x}px,{y}px)}}"
    cur += f"100%{{transform:translate(560px,470px)}}"
    cur_kf = f"@keyframes cur{{{cur}}}.cursor{{animation:cur {DURACAO}s ease-in-out infinite}}"
    ondas = ""
    for i, (x, y) in enumerate(alvos[:5]):
        a = i * S + (3.2 if i in (3, 4) else 3.4 if i in (1,) else 3.0 if i == 0 else 3.4)
        pa = a / DURACAO * 100
        pb = (a + 0.9) / DURACAO * 100
        ondas += (
            f"@keyframes on{i}{{0%,{pa:.2f}%{{opacity:0;transform:scale(.3)}}{pa + 0.01:.2f}%{{opacity:.55;transform:scale(.3)}}{pb:.2f}%{{opacity:0;transform:scale(1.6)}}100%{{opacity:0;transform:scale(1.6)}}}}"
            f".on{i}{{transform-box:fill-box;transform-origin:center;opacity:0;animation:on{i} {DURACAO}s linear infinite}}"
        )
        ondas_el = f'<circle class="on{i}" cx="{x}" cy="{y}" r="22" fill="{t["azul"]}"/>'
        corpo_cenas += ondas_el
    seta = f'<g class="cursor"><path d="M0 0L0 17l4.5-4 3.2 7 2.6-1.2-3.1-6.8H14Z" fill="{t["texto"]}" stroke="{t["bg"]}" stroke-width="1.2" stroke-linejoin="round"/></g>'
    css = keyframes_vis() + "".join(_digita) + cur_kf + ondas
    return cabeca(w, h, "Passeio animado pelo Polar: o professor registra, a coordenação analisa e resolve, a direção encerra e o histórico guarda tudo.", css) + moldura + corpo_cenas + leg + bolinhas + seta + "</svg>"


# =============================================================================================
# FLUXO
# =============================================================================================
def fluxo(t):
    w, h = 1000, 220
    estados = [("REGISTRADA", t["azul"], t["azul_suave"]), ("EM ANÁLISE", t["amarelo"], t["amarelo_suave"]), ("RESOLVIDA", t["verde"], t["verde_suave"]), ("ENCERRADA", t["roxo"], t["roxo_suave"])]
    quem = ["Professor registra", "Coordenação analisa", "Coordenação resolve", "Direção encerra"]
    css = f"""
.fio{{stroke-dasharray:6 6;animation:flui 1.4s linear infinite}}
@keyframes flui{{to{{stroke-dashoffset:-12}}}}
.pulso{{transform-box:fill-box;transform-origin:center;animation:pulso 3.2s ease-in-out infinite}}
@keyframes pulso{{50%{{transform:scale(1.05)}}}}
.viaja{{animation:viaja 8s linear infinite}}
@keyframes viaja{{0%{{transform:translateX(0);opacity:0}}6%{{opacity:1}}94%{{opacity:1}}100%{{transform:translateX(735px);opacity:0}}}}
"""
    corpo = caixa(0.5, 0.5, w - 1, h - 1, t["bg"], t["borda"], 14)
    for i, ((nome, cor, suave), q) in enumerate(zip(estados, quem)):
        x = 30 + i * 245
        corpo += caixa(x, 78, 175, 64, suave, cor, 12, 'class="pulso" style="animation-delay:%ds"' % i)
        corpo += texto(x + 87, 116, nome, 15, 800, cor, "middle")
        corpo += texto(x + 87, 56, q, 14, 600, t["mudo"], "middle")
        corpo += texto(x + 87, 172, f"passo {i + 1} de 4" if i < 3 else "somente leitura", 12, 400, t["mudo"], "middle")
        if i < 3:
            corpo += f'<line class="fio" x1="{x + 181}" x2="{x + 234}" y1="110" y2="110" stroke="{t["borda"]}" stroke-width="2"/>'
            corpo += f'<path d="M{x + 228} 104l8 6-8 6" fill="none" stroke="{t["mudo"]}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    corpo += f'<circle class="viaja" cx="117" cy="110" r="5" fill="{t["azul"]}"/>'
    return cabeca(w, h, "Fluxo: registrada, em análise, resolvida e encerrada. Cada passo é de um papel.", css) + corpo + "</svg>"


# =============================================================================================
# CARTOES DE RECURSOS
# =============================================================================================
ICONES = {
    "fluxo": "M4 7h5l3 3-3 3H4zM15 10h5M12 17l3-3-3-3",
    "historico": "M12 7v5l3 2M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4",
    "olho": "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
    "fila": "M4 6h16M4 12h12M4 18h8",
    "grafico": "M5 20V10M12 20V4M19 20v-7",
    "rosto": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4.4 3.6-7 8-7s8 2.6 8 7",
    "lupa": "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5",
    "moeda": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9 12h6",
}

RECURSOS = [
    ("fluxo", "Fluxo fechado", ["4 estados e 3 transições,", "cada uma de um papel.", "Pular etapa dá erro 409."]),
    ("historico", "Histórico que não se apaga", ["Toda ação grava um registro.", "Tentar editar devolve 405."]),
    ("olho", "Cada um vê o seu", ["O professor só vê o que registrou.", "Coordenação e direção veem tudo."]),
    ("fila", "Pendências em ordem", ["Fila por urgência, sem ficar", "caso perdido. A primeira vem", "marcada."]),
    ("grafico", "Relatórios de verdade", ["Gráficos por turma, mês e", "status, com filtros e planilha", "para baixar."]),
    ("rosto", "Estúdio de avatar", ["Mais de 70 cabelos e 20 roupas,", "feitos aqui, sem enviar nada", "para terceiros."]),
    ("lupa", "Auditoria", ["Login, criação, edição e mudança", "de status ficam registrados."]),
    ("moeda", "Custo zero", ["Site na Vercel, API como função", "e banco no Supabase, tudo no", "plano gratuito."]),
]


def recursos(t):
    w, h = 1000, 470
    css = f"""
.c{{animation:entra .7s both}}
@keyframes entra{{from{{opacity:0;transform:translateY(10px)}}}}
.c:hover{{}}
.lampada{{transform-box:fill-box;transform-origin:center;animation:resp 5s ease-in-out infinite}}
@keyframes resp{{50%{{transform:scale(1.12)}}}}
"""
    corpo = ""
    for i, (ic, titulo, linhas) in enumerate(RECURSOS):
        col, lin = i % 4, i // 4
        x, y = 8 + col * 247, 12 + lin * 226
        corpo += f'<g class="c" style="animation-delay:{i * 0.08:.2f}s">'
        corpo += caixa(x, y, 236, 210, t["painel"], t["borda"], 12)
        corpo += f'<circle class="lampada" cx="{x + 38}" cy="{y + 46}" r="22" fill="{t["azul_suave"]}" style="animation-delay:{i * 0.4:.1f}s"/>'
        corpo += f'<g transform="translate({x + 26} {y + 34})"><path d="{ICONES[ic]}" fill="none" stroke="{t["azul"]}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></g>'
        corpo += texto(x + 18, y + 100, titulo, 15.5, 700, t["texto"])
        for j, l in enumerate(linhas):
            corpo += texto(x + 18, y + 126 + j * 21, l, 12.5, 400, t["mudo"])
        corpo += "</g>"
    return cabeca(w, h, "O que o Polar faz: fluxo fechado, histórico que não se apaga, cada um vê o seu, pendências em ordem, relatórios, estúdio de avatar, auditoria e custo zero.", css) + corpo + "</svg>"


# =============================================================================================
# TABELAS NO ESTILO DO GITHUB (papeis, seguranca)
# =============================================================================================
def tabela(t, titulo, colunas, linhas, larguras, w=1000, linha_h=50, tam=16):
    h = 46 + linha_h * len(linhas) + 8
    css = ".l{animation:entra .6s both}@keyframes entra{from{opacity:0;transform:translateX(-8px)}}"
    corpo = caixa(0.5, 0.5, w - 1, h - 9, t["bg"], t["borda"], 8)
    corpo += f'<path d="M0.5 46V8.5a8 8 0 0 1 8-8H{w - 8.5}a8 8 0 0 1 8 8V46z" fill="{t["painel"]}" stroke="{t["borda"]}"/>'
    x = 0
    xs = []
    for c, lg in zip(colunas, larguras):
        xs.append(x)
        corpo += texto(x + 20 + (lg / 2 - 20 if c.startswith("^") else 0), 29, c.lstrip("^"), tam, 700, t["texto"], "middle" if c.startswith("^") else "start")
        x += lg
    for i, linha in enumerate(linhas):
        y = 46 + i * linha_h
        corpo += f'<g class="l" style="animation-delay:{i * 0.07:.2f}s">'
        corpo += f'<line x1="0.5" x2="{w - 0.5}" y1="{y}" y2="{y}" stroke="{t["borda"]}"/>'
        if i % 2:
            corpo += f'<rect x="1" y="{y + 1}" width="{w - 2}" height="{linha_h - 1}" fill="{t["painel"]}" opacity=".6"/>'
        for j, (cel, lg, xx) in enumerate(zip(linha, larguras, xs)):
            cx = xx + 20 + (lg / 2 - 20 if colunas[j].startswith("^") else 0)
            anc = "middle" if colunas[j].startswith("^") else "start"
            if cel == "ok":
                corpo += f'<path d="M{cx - 8} {y + linha_h / 2}l5 5 11-11" fill="none" stroke="{t["verde"]}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'
            elif cel == "-":
                corpo += f'<line x1="{cx - 6}" x2="{cx + 6}" y1="{y + linha_h / 2}" y2="{y + linha_h / 2}" stroke="{t["borda"]}" stroke-width="2.4" stroke-linecap="round"/>'
            elif cel.startswith("*"):
                corpo += texto(cx, y + linha_h / 2 + 5, cel[1:], tam, 700, t["azul"], anc)
            else:
                corpo += texto(cx, y + linha_h / 2 + 5, cel, tam, 700 if j == 0 else 400, t["texto"], anc)
        corpo += "</g>"
    return cabeca(w, h, titulo, css) + corpo + "</svg>"


def papeis(t):
    return tabela(
        t,
        "Quem faz o quê: o professor registra, a coordenação analisa e resolve, a direção encerra e a administração cuida dos cadastros.",
        ["Papel", "^Registra", "Muda o status", "Vê"],
        [
            ["Professor", "ok", "-", "só as próprias ocorrências"],
            ["Coordenação", "-", "*análise e resolução", "tudo, mais relatórios"],
            ["Direção", "-", "*encerramento", "tudo, mais relatórios"],
            ["Administração", "ok", "-", "tudo, e gerencia alunos, turmas e usuários"],
        ],
        [210, 150, 220, 420],
    )


def seguranca(t):
    return tabela(
        t,
        "Segurança: senhas com bcrypt, sessão com JWT, permissão decidida no servidor, entrada validada com Zod, consultas parametrizadas, avatar validado, helmet e CodeQL.",
        ["Medida", "Como"],
        [
            ["Senhas", "bcrypt. Nenhuma resposta devolve o hash. A senha temporária vale até o primeiro acesso."],
            ["Sessão", "JWT com validade. 5 tentativas erradas bloqueiam o usuário por 15 minutos."],
            ["Permissão", "Decidida no servidor, em toda rota. A tela só esconde, nunca autoriza."],
            ["Entrada", "Zod em todos os endpoints. HTML e caracteres de controle são recusados."],
            ["Banco", "Consultas 100% parametrizadas."],
            ["Avatar", "O SVG é validado no servidor (sem script, sem imagem externa)."],
            ["Cabeçalhos e código", "helmet com CSP, e CodeQL do GitHub em todo pull request."],
        ],
        [210, 790],
        linha_h=46,
    )


# =============================================================================================
# ARQUITETURA
# =============================================================================================
def arquitetura(t):
    w, h = 1000, 330
    css = """
.fio{stroke-dasharray:6 6;animation:flui 1.2s linear infinite}
@keyframes flui{to{stroke-dashoffset:-12}}
.p{animation:entra .7s both}
@keyframes entra{from{opacity:0;transform:translateY(8px)}}
"""

    def no(x, y, ww, hh, titulo, sub, cor, suave, atraso, topo=False):
        ty = y + 34 if topo else y + hh / 2 - 2
        return (
            f'<g class="p" style="animation-delay:{atraso}s">'
            + caixa(x, y, ww, hh, suave, cor, 12)
            + texto(x + ww / 2, ty, titulo, 16, 800, cor, "middle")
            + texto(x + ww / 2, ty + 20, sub, 13, 400, t["mudo"], "middle")
            + "</g>"
        )

    corpo = caixa(0.5, 0.5, w - 1, h - 1, t["bg"], t["borda"], 14)
    corpo += caixa(240, 22, 380, 270, "none", t["borda"], 14, 'stroke-dasharray="4 5"')
    corpo += texto(430, 312, "Vercel: site na CDN e API como função", 13, 600, t["mudo"], "middle")
    corpo += no(24, 112, 170, 90, "Navegador", "quem usa o Polar", t["texto"], t["painel"], 0)
    corpo += no(262, 44, 336, 84, "Site", "React 18 · Vite · TypeScript", t["azul"], t["azul_suave"], 0.15)
    corpo += no(262, 150, 336, 124, "API em /api", "Node 20 · Express 5 · TypeScript", t["verde"], t["verde_suave"], 0.3, True)
    for i, (rot, cor, suave) in enumerate([("JWT + bcrypt", t["amarelo"], t["amarelo_suave"]), ("Permissão por papel", t["roxo"], t["roxo_suave"]), ("Zod", t["azul"], t["azul_suave"])]):
        larg = [112, 142, 56][i]
        x = 276 + [0, 120, 270][i]
        corpo += f'<g class="p" style="animation-delay:{0.5 + i * 0.1:.1f}s">{pilula(x, 232, rot, suave, cor, 12, 10, cor)[0]}</g>'
    corpo += no(742, 128, 226, 96, "PostgreSQL", "Supabase, com transações", t["azul"], t["azul_suave"], 0.7)
    for x1, y1, x2, y2 in [(196, 157, 260, 86), (196, 157, 260, 212), (600, 212, 740, 176)]:
        corpo += f'<line class="fio" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{t["mudo"]}" stroke-width="2"/>'
    corpo += texto(672, 186, "pg · pool", 12, 600, t["mudo"], "middle")
    return cabeca(w, h, "Arquitetura: o navegador fala com o site e com a API na Vercel, e a API fala com o PostgreSQL do Supabase.", css) + corpo + "</svg>"


# =============================================================================================
# POLARIS (rodape)
# =============================================================================================
def polaris(t):
    w, h = 1200, 190
    rnd = random.Random(5)
    estrelas = "".join(
        f'<circle class="tw" cx="{rnd.uniform(20, w - 20):.0f}" cy="{rnd.uniform(14, h - 14):.0f}" r="{rnd.choice([0.8, 1, 1.3])}" fill="{t["estrela"]}" style="animation-delay:{rnd.uniform(0, 6):.1f}s"/>'
        for _ in range(40)
    )
    esc, ox, oy = 3.4, 60, 12

    def p(x, y):
        return ox + x * esc, oy + y * esc

    linha = " ".join(("M" if i == 0 else "L") + f"{p(*pt)[0]:.1f} {p(*pt)[1]:.1f}" for i, pt in enumerate([(32.05, 14.27), (29.3, 19.03), (23.3, 24.03), (18.3, 30.03), (11.3, 34.03), (9.3, 43.03), (19.3, 41.03), (18.3, 30.03)]))
    pontos = "".join(f'<circle cx="{p(x, y)[0]:.1f}" cy="{p(x, y)[1]:.1f}" r="{r * 1.3:.1f}" fill="{t["azul"]}"/>' for x, y, r in URSA)
    px, py = p(*POLARIS)
    css = ".tw{opacity:.1;animation:tw 4s ease-in-out infinite}@keyframes tw{50%{opacity:.5}}.pol{transform-box:fill-box;transform-origin:center;animation:pol 5s ease-in-out infinite}@keyframes pol{50%{transform:scale(1.2) rotate(15deg)}}"
    corpo = (
        caixa(0.5, 0.5, w - 1, h - 1, t["bg"], t["borda"], 14)
        + estrelas
        + f'<path d="{linha}" fill="none" stroke="{t["azul"]}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>'
        + pontos
        + f'<g transform="translate({px - POLARIS[0] * esc * 0.9:.1f} {py - POLARIS[1] * esc * 0.9:.1f}) scale({esc * 0.9})"><g class="pol"><path d="{POLARIS_BRILHO}" fill="{t["azul"]}"/></g></g>'
        + texto(260, 82, "Feito pela equipe Polaris", 30, 800, t["texto"])
        + texto(260, 114, "Trabalho de conclusão de curso, turma 3ºB 2026.", 16, 400, t["mudo"])
        + texto(260, 140, "A Polaris é a estrela que guia a navegação. O Polar é o nosso norte.", 14, 400, t["mudo"])
    )
    return cabeca(w, h, "Feito pela equipe Polaris, a constelação da Ursa Menor com a estrela do norte.", css) + corpo + "</svg>"


def main():
    SAIDA.mkdir(parents=True, exist_ok=True)
    pecas = dict(banner=banner, demo=demo, fluxo=fluxo, recursos=recursos, papeis=papeis, seguranca=seguranca, arquitetura=arquitetura, polaris=polaris)
    for nome_tema, t in TEMAS.items():
        for nome, fn in pecas.items():
            svg = fn(t)
            (SAIDA / f"{nome}-{nome_tema}.svg").write_text(svg, encoding="utf-8")
            print(f"{nome}-{nome_tema}.svg  {len(svg) / 1024:.1f} KB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
