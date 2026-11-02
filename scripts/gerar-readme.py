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


def cabeca(w, h, titulo, css, extra="", css_depois=""):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="{titulo}">'
        f"<style>text{{font-family:{FONTE}}}{css}"
        "@media (prefers-reduced-motion:reduce){*{animation:none!important;opacity:1!important;stroke-dashoffset:0!important}" + css_depois + "}"
        f"</style>{extra}"
    )


def texto(x, y, s, tam=14, peso=400, cor="#000", ancora="start", extra=""):
    s = s.replace("&", "&amp;").replace("<", "&lt;")
    return f'<text x="{x}" y="{y}" font-size="{tam}" font-weight="{peso}" fill="{cor}" text-anchor="{ancora}" {extra}>{s}</text>'


def rotulo_central(x, cy, s_, tam=14, peso=400, cor="#000", extra=""):
    """Texto centrado na horizontal e na vertical em (x, cy), sem depender da altura da fonte."""
    s_ = s_.replace("&", "&amp;").replace("<", "&lt;")
    return f'<text x="{x}" y="{cy}" font-size="{tam}" font-weight="{peso}" fill="{cor}" text-anchor="middle" dominant-baseline="central" {extra}>{s_}</text>'


def caixa(x, y, w, h, fundo, borda=None, r=6, extra=""):
    b = f' stroke="{borda}"' if borda else ""
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fundo}"{b} {extra}/>'


def pilula(x, y, rotulo, fundo, cor, tam=12, pad=10, borda=None):
    w = len(rotulo) * tam * 0.58 + pad * 2
    return (
        caixa(x, y, w, tam + 12, fundo, borda, r=(tam + 12) / 2)
        + rotulo_central(x + w / 2, y + (tam + 12) / 2, rotulo, tam, 600, cor)
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
.mark{{animation:entra 1s .1s both}}
.t1{{animation:sobe .9s .3s both}} .t2{{animation:sobe .9s .55s both}} .t3{{animation:sobe .9s .8s both}} .t4{{animation:sobe .9s 1.05s both}}
@keyframes sobe{{from{{opacity:0;transform:translateY(10px)}}}}
@keyframes entra{{from{{opacity:0;transform:scale(.8)}}}}
.rotulo{{animation:sobe .9s 3s both}}
.cadente{{opacity:0;animation:cadente 9s 3s linear infinite}}
@keyframes cadente{{0%{{opacity:0;transform:translate(0,0)}}2%{{opacity:.9}}9%{{opacity:0;transform:translate(-260px,150px)}}100%{{opacity:0}}}}
"""
    chips = ""
    cx = 206
    for i, (rot, cor, fundo) in enumerate([("Professor registra", t["azul"], t["azul_suave"]), ("Coordenação analisa e resolve", t["amarelo"], t["amarelo_suave"]), ("Direção encerra", t["verde"], t["verde_suave"])]):
        pil, larg = pilula(cx, 290, rot, fundo, cor, 16, 16, t["borda"])  # 28 de altura: centro em y=304
        chips += pil
        fim = cx + larg
        cx = fim + 28
        if i < 2:
            cxs = fim + 14  # meio do vao entre as pilulas
            chips += f'<path d="M{cxs - 3} 299l6 5-6 5" fill="none" stroke="{t["mudo"]}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>'
    corpo = (
        caixa(0, 0, w, h, t["bg"], None, 14)
        + f'<defs><radialGradient id="g1"><stop offset="0" stop-color="{t["azul"]}" stop-opacity=".20"/><stop offset="1" stop-color="{t["azul"]}" stop-opacity="0"/></radialGradient><radialGradient id="g2"><stop offset="0" stop-color="{t["azul"]}" stop-opacity=".14"/><stop offset="1" stop-color="{t["azul"]}" stop-opacity="0"/></radialGradient></defs>'
        + f'<circle cx="1040" cy="190" r="330" fill="url(#g1)"/>'
        + f'<circle cx="170" cy="190" r="300" fill="url(#g2)"/>'
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
        + f'<g class="cadente"><line x1="980" y1="26" x2="1030" y2="-4" stroke="{t["azul"]}" stroke-width="2" stroke-linecap="round"/></g>'
        + f'<g class="rotulo">{texto(1176, 346, "Polaris", 24, 800, t["azul"], "end")}{texto(1176, 368, "a equipe, a estrela e a constelação", 15, 500, t["mudo"], "end")}</g>'
    )
    return cabeca(w, h, "Polar: ocorrências escolares, do registro ao encerramento. Feito pela equipe Polaris.", css, css_depois=".cadente{opacity:0!important}") + corpo + "</svg>"


# =============================================================================================
# ANIMACAO: ferramentas para SVG que repete (tudo em CSS dentro do SVG)
# =============================================================================================
class Anim:
    """Linha do tempo de uma volta (dur segundos). Cada metodo devolve a classe CSS a usar.

    Para ficar leve: so animamos opacity e transform (compostos na GPU) e as telas inteiras
    trocam por corte seco (visibility), sem fundir grupos grandes a cada quadro."""

    def __init__(self, dur):
        self.d = dur
        self.kf = []
        self.cache = {}

    def p(self, s):
        return s / self.d * 100

    def _novo(self, chave, prefixo, corpo, css):
        if chave not in self.cache:
            nome = f"{prefixo}{len(self.cache)}"
            self.cache[chave] = nome
            self.kf.append(f"@keyframes {nome}{{{corpo}}}")
            self.cache[("css", nome)] = css.replace("NOME", nome)
        return self.cache[chave]

    def corte(self, a, b):
        """Visivel de a ate b, sem transicao (visibility)."""
        pa, pb = self.p(a), self.p(b)
        partes = []
        if a > 0:
            partes.append(f"0%,{max(pa - 0.002, 0):.3f}%{{visibility:hidden}}")
        partes.append(f"{pa:.3f}%,{max(pb - 0.002, pa):.3f}%{{visibility:visible}}")
        if b < self.d:
            partes.append(f"{pb:.3f}%,100%{{visibility:hidden}}")
        return self._novo(("corte", a, b), "c", "".join(partes), f".NOME{{visibility:hidden;animation:NOME {self.d}s step-end infinite}}")

    def vis(self, a, b, dy=0, fade=0.4):
        """Aparece em a (opacity e, se dy, subindo dy px) e some em b."""
        pa, pb, f = self.p(a), self.p(b), self.p(fade)
        oculto = f"opacity:0;transform:translateY({dy}px)" if dy else "opacity:0"
        pleno = "opacity:1;transform:none" if dy else "opacity:1"
        partes = []
        if a > 0:
            partes.append(f"0%,{pa:.3f}%{{{oculto}}}")
            partes.append(f"{min(pa + f, 100):.3f}%{{{pleno}}}")
        else:
            partes.append(f"0%{{{pleno}}}")
        if b < self.d:
            partes.append(f"{pb:.3f}%{{{pleno}}}")
            partes.append(f"{min(pb + 0.05, 100):.3f}%,100%{{opacity:0}}")
        else:
            partes.append(f"{100 - f:.3f}%{{{pleno}}}")
            partes.append("100%{opacity:0}")
        return self._novo(("vis", a, b, dy), "v", "".join(partes), f".NOME{{opacity:0;animation:NOME {self.d}s cubic-bezier(.2,.7,.2,1) infinite}}")

    def cresce(self, a, dur=0.8, eixo="x"):
        pa, pb = self.p(a), self.p(a + dur)
        t0 = "scaleX(0)" if eixo == "x" else "scaleY(0)"
        t1 = "scaleX(1)" if eixo == "x" else "scaleY(1)"
        origem = "left center" if eixo == "x" else "center bottom"
        return self._novo(("cresce", a, dur, eixo), "g", f"0%,{pa:.3f}%{{transform:{t0}}}{pb:.3f}%,100%{{transform:{t1}}}",
                          f".NOME{{transform-box:fill-box;transform-origin:{origem};transform:{t0};animation:NOME {self.d}s cubic-bezier(.2,.7,.2,1) infinite}}")

    def digita(self, x, y, w, h, a, b, fundo):
        """Tampa o texto e descobre da esquerda para a direita entre a e b (scaleX, sem repintar o texto)."""
        pa, pb = self.p(a), self.p(b)
        nome = self._novo(("digita", a, b), "d", f"0%,{pa:.3f}%{{transform:scaleX(1)}}{pb:.3f}%,99.9%{{transform:scaleX(0)}}100%{{transform:scaleX(1)}}",
                          f".NOME{{transform-box:fill-box;transform-origin:right center;animation:NOME {self.d}s linear infinite}}")
        return f'<rect class="{nome}" x="{x}" y="{y}" width="{w}" height="{h}" fill="{fundo}"/>'

    def onda(self, x, y, a, cor):
        pa, pb = self.p(a), self.p(a + 0.7)
        nome = self._novo(("onda", a), "o", f"0%,{pa:.3f}%{{opacity:0;transform:scale(.3)}}{pa + 0.01:.3f}%{{opacity:.5;transform:scale(.3)}}{pb:.3f}%,100%{{opacity:0;transform:scale(1.6)}}",
                          ".NOME{transform-box:fill-box;transform-origin:center;opacity:0;animation:NOME " + f"{self.d}s linear infinite}}")
        return f'<circle class="{nome}" cx="{x}" cy="{y}" r="20" fill="{cor}"/>'

    def cursor(self, pontos, cor, contorno):
        """pontos: [(segundo_de_chegada, x, y)]. Move em 1 s e fica parado ate o proximo."""
        ini = pontos[0]
        regras = f"0%{{transform:translate({ini[1]}px,{ini[2]}px)}}"
        for i, (s, x, y) in enumerate(pontos):
            regras += f"{self.p(s):.3f}%{{transform:translate({x}px,{y}px)}}"
            if i + 1 < len(pontos):
                regras += f"{self.p(pontos[i + 1][0] - 1.0):.3f}%{{transform:translate({x}px,{y}px)}}"
        regras += f"100%{{transform:translate({ini[1]}px,{ini[2]}px)}}"
        self.kf.append(f"@keyframes cur{{{regras}}}.cursor{{animation:cur {self.d}s cubic-bezier(.45,0,.25,1) infinite}}")
        return f'<g class="cursor"><path d="M0 0L0 17l4.5-4 3.2 7 2.6-1.2-3.1-6.8H14Z" fill="{cor}" stroke="{contorno}" stroke-width="1.2" stroke-linejoin="round"/></g>'

    def css(self):
        return "".join(self.kf) + "".join(v for k, v in self.cache.items() if k[0] == "css")


# =============================================================================================
# DEMONSTRACAO (passeio animado pelo sistema, 8 telas)
# =============================================================================================
def tc(x, cy, s_, tam=12, peso=400, cor="#000", ancora="start", extra=""):
    """Texto com a linha central em cy: alinha direito com caixas e icones, qualquer que seja a fonte."""
    s_ = s_.replace("&", "&amp;").replace("<", "&lt;")
    return f'<text x="{x}" y="{cy}" font-size="{tam}" font-weight="{peso}" fill="{cor}" text-anchor="{ancora}" dominant-baseline="central" {extra}>{s_}</text>'


def larg_pilula(rot, tam=12, pad=10):
    return len(rot) * tam * 0.58 + pad * 2


def demo(t):
    A = Anim(32)
    w, h = 960, 610
    S = 4.0
    wy = 20
    ax = 214  # esquerda da area de conteudo
    CW = 704  # largura da area de conteudo (214 a 918)
    ver = A.corte

    def T(i, dt):
        return i * S + dt

    def ate_fim(i, dt, dy=0):
        return A.vis(T(i, dt), T(i + 1, 0), dy)

    def botao(x, y, bw, bh, rot, fundo, cor, borda=None, tam=12, peso=700):
        return caixa(x, y, bw, bh, fundo, borda, bh / 2) + rotulo_central(x + bw / 2, y + bh / 2 + 0.5, rot, tam, peso, cor)

    def pil_c(cx, y, rot, fundo, cor, tam=12, pad=12, borda=None):
        lg = larg_pilula(rot, tam, pad)
        return pilula(cx - lg / 2, y, rot, fundo, cor, tam, pad, borda)[0]

    def pil_d(xr, y, rot, fundo, cor, tam=11, pad=10, borda=None):
        lg = larg_pilula(rot, tam, pad)
        return pilula(xr - lg, y, rot, fundo, cor, tam, pad, borda)[0], lg

    def check(cx, cy, cor, tam=1.0):
        return f'<path d="M{cx - 5 * tam:.1f} {cy:.1f}l{4 * tam:.1f} {4 * tam:.1f} {8 * tam:.1f}-{8 * tam:.1f}" fill="none" stroke="{cor}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'

    def aviso(i, dt, x, y, aw, cor, suave, msg):
        return (
            f'<g class="{ate_fim(i, dt, -8)}">' + caixa(x, y, aw, 40, suave, cor, 8) + check(x + 24, y + 20, cor)
            + tc(x + 44, y + 20, msg, 13, 700, cor) + "</g>"
        )

    def selo_ok(cx, cy, cor):
        return f'<circle cx="{cx}" cy="{cy}" r="11" fill="{cor}"/>' + check(cx, cy, "#ffffff", 0.9)

    quadro = (
        caixa(0.5, 0.5, w - 1, h - 1, t["painel"], t["borda"], 14)
        + caixa(20, wy, w - 40, 500, t["bg"], t["borda"], 10)
        + caixa(20, wy, w - 40, 36, t["painel"], None, 10)
        + f'<rect x="20" y="{wy + 26}" width="{w - 40}" height="10" fill="{t["painel"]}"/>'
        + f'<line x1="20" x2="{w - 20}" y1="{wy + 36}" y2="{wy + 36}" stroke="{t["borda"]}"/>'
        + "".join(f'<circle cx="{40 + i * 18}" cy="{wy + 18}" r="5" fill="{c}"/>' for i, c in enumerate(["#ff5f56", "#ffbd2e", "#27c93f"]))
        + caixa(300, wy + 8, 360, 20, t["bg"], t["borda"], 10)
        + rotulo_central(480, wy + 18.5, "polarescolar.vercel.app", 11, 500, t["mudo"])
    )

    itens = ["Início", "Pendências", "Ocorrências", "Alunos", "Turmas", "Relatórios"]
    ativo = {1: 2, 2: 0, 3: 1, 4: 2, 5: 2, 6: 2, 7: 5}  # cena -> indice do item ativo

    def menu(cena, quem, iniciais):
        m = (
            f'<rect x="20" y="{wy + 36}" width="170" height="464" fill="{t["painel"]}"/>'
            + f'<line x1="190" x2="190" y1="{wy + 36}" y2="{wy + 500}" stroke="{t["borda"]}"/>'
            + marca(38, wy + 52, 28, t, fundo=t["painel"])
            + tc(68, wy + 66, "Polar", 18, 800, t["texto"])
            + botao(34, wy + 92, 142, 32, "Registrar ocorrência", t["azul"], "#ffffff", None, 11)
        )
        for i, nome in enumerate(itens):
            cy = wy + 154 + i * 34
            on = ativo.get(cena) == i
            if on:
                m += caixa(34, cy - 15, 142, 30, t["azul_suave"], None, 6)
            m += caixa(46, cy - 5, 10, 10, "none", t["azul"] if on else t["mudo"], 3) + tc(66, cy, nome, 12, 700 if on else 500, t["azul"] if on else t["mudo"])
        m += (
            f'<line x1="34" x2="176" y1="{wy + 436}" y2="{wy + 436}" stroke="{t["borda"]}"/>'
            + f'<circle cx="52" cy="{wy + 466}" r="14" fill="{t["azul_suave"]}"/>'
            + rotulo_central(52, wy + 466.5, iniciais, 10, 800, t["azul"])
            + tc(74, wy + 466, quem, 12, 600, t["texto"])
        )
        return m

    cenas = []

    # ---- 0 login ------------------------------------------------------------------------------
    cenas.append(
        f'<rect x="20" y="{wy + 36}" width="{w - 40}" height="464" fill="{t["bg"]}"/>'
        + caixa(330, 84, 300, 412, t["painel"], t["borda"], 12)
        + marca(466.7, 108, 40, t, fundo=t["painel"])
        + rotulo_central(480, 178, "Entrar no Polar", 21, 800, t["texto"])
        + tc(350, 222, "E-mail", 11, 700, t["mudo"])
        + caixa(350, 234, 260, 36, t["bg"], t["borda"], 6)
        + tc(363, 252, "professor@escola.polar", 13, 400, t["texto"])
        + A.digita(356, 240, 250, 24, 0.6, 1.8, t["bg"])
        + tc(350, 298, "Senha", 11, 700, t["mudo"])
        + caixa(350, 310, 260, 36, t["bg"], t["borda"], 6)
        + tc(363, 328, "••••••••••", 13, 400, t["texto"])
        + A.digita(356, 316, 250, 24, 1.8, 2.6, t["bg"])
        + botao(350, 362, 260, 38, "Entrar", t["azul"], "#ffffff", None, 13)
        + rotulo_central(480, 432, "Use o e-mail cadastrado pela escola.", 11, 400, t["mudo"])
    )

    # ---- 1 registrar (professor) -------------------------------------------------------------------
    cats = ["Atraso", "Desrespeito", "Briga", "Uso de celular"]
    chips = ""
    cx = ax + 16
    for i, rot in enumerate(cats):
        lg = larg_pilula(rot, 12, 12)
        chips += pilula(cx, 226, rot, t["bg"], t["mudo"], 12, 12, t["borda"])[0]
        if i == 0:
            chips += f'<g class="{ate_fim(1, 1.0)}">{pilula(cx, 226, rot, t["azul_suave"], t["azul"], 12, 12, t["azul"])[0]}</g>'
        cx += lg + 8
    pri = ""
    cx = ax + 16
    for rot, cor, suave in [("Baixa", t["verde"], t["verde_suave"]), ("Média", t["amarelo"], t["amarelo_suave"]), ("Alta", t["vermelho"], t["painel2"])]:
        lg = larg_pilula(rot, 12, 12)
        pri += pilula(cx, 290, rot, t["bg"], t["mudo"], 12, 12, t["borda"])[0]
        if rot == "Alta":
            pri += f'<g class="{ate_fim(1, 1.5)}">{pilula(cx, 290, rot, suave, cor, 12, 12, cor)[0]}</g>'
        cx += lg + 8
    cenas.append(
        texto(ax, 100, "Registrar ocorrência", 22, 800, t["texto"])
        + texto(ax, 122, "Leva cerca de um minuto. Os campos com * são obrigatórios.", 12, 400, t["mudo"])
        + caixa(ax, 138, CW, 312, t["painel"], t["borda"], 10)
        + tc(ax + 16, 164, "ALUNO", 10, 700, t["mudo"]) + tc(ax + 66, 164, "Ana Souza · 8ºA", 12, 700, t["azul"])
        + tc(ax + 16, 206, "CATEGORIA", 10, 700, t["mudo"]) + chips
        + tc(ax + 16, 270, "GRAVIDADE", 10, 700, t["mudo"]) + pri
        + caixa(ax + 16, 334, CW - 32, 64, t["bg"], t["borda"], 6)
        + tc(ax + 30, 355, "Chegou 20 minutos depois do início da aula.", 12, 400, t["texto"])
        + tc(ax + 30, 377, "Não é a primeira vez no mês.", 12, 400, t["texto"])
        + A.digita(ax + 22, 340, CW - 44, 52, 1.9, 3.1, t["bg"])
        + botao(ax + CW - 16 - 120, 410, 120, 30, "Registrar", t["azul"], "#ffffff")
        + aviso(1, 3.3, ax + CW - 270, 78, 270, t["verde"], t["verde_suave"], "Ocorrência registrada")
    )

    # ---- 2 inicio (coordenacao) ---------------------------------------------------------------------
    stats = [("13", "Total", t["azul"]), ("4", "Em análise", t["amarelo"]), ("2", "Graves ou urgentes", t["vermelho"]), ("3", "Encerradas", t["verde"])]
    cartoes = ""
    for i, (n, rot, cor) in enumerate(stats):
        x = ax + i * 180
        cartoes += (
            f'<g class="{ate_fim(2, 0.3 + i * 0.18, 10)}">'
            + caixa(x, 150, 164, 84, t["painel"], t["borda"], 10)
            + f'<rect x="{x + 1}" y="231" width="162" height="3" fill="{cor}"/>'
            + texto(x + 16, 196, n, 34, 800, t["texto"])
            + tc(x + 16, 216, rot, 12, 500, t["mudo"])
            + "</g>"
        )
    ultimas = [("Ana Souza", "8ºA · Atraso", "Alta", t["vermelho"]), ("Bruno Lima", "9ºB · Desrespeito", "Média", t["amarelo"]), ("Caio Reis", "7ºC · Uso de celular", "Baixa", t["verde"])]
    lin = ""
    for i, (nome, sub, prio, cor) in enumerate(ultimas):
        cy = 322 + i * 48
        pil, _ = pil_d(ax + 484, cy - 13, prio, t["bg"], cor, 11, 10, cor)
        lin += (
            f'<g class="{ate_fim(2, 1.2 + i * 0.25, 8)}">'
            + (f'<line x1="{ax + 16}" x2="{ax + 484}" y1="{cy - 24}" y2="{cy - 24}" stroke="{t["borda"]}"/>' if i else "")
            + tc(ax + 16, cy - 7, nome, 13, 700, t["texto"]) + tc(ax + 16, cy + 11, sub, 11, 400, t["mudo"])
            + pil + "</g>"
        )
    cenas.append(
        f'<g class="{ate_fim(2, 0, 8)}">'
        + f'<circle cx="{ax + 22}" cy="96" r="22" fill="{t["azul_suave"]}"/>' + rotulo_central(ax + 22, 96.5, "PR", 13, 800, t["azul"])
        + texto(ax + 58, 94, "Boa tarde, Paulo", 24, 800, t["texto"]) + tc(ax + 58, 113, "Coordenação · segunda-feira, 2 de novembro", 12, 400, t["mudo"])
        + "</g>"
        + cartoes
        + caixa(ax, 254, 500, 196, t["painel"], t["borda"], 10) + tc(ax + 16, 276, "Últimas ocorrências", 13, 700, t["texto"])
        + lin
        + caixa(ax + 516, 254, 188, 196, t["painel"], t["borda"], 10) + tc(ax + 532, 276, "Atalhos", 13, 700, t["texto"])
        + pil_c(ax + 610, 296, "Ver ocorrências", t["bg"], t["azul"], 11, 12, t["azul"])
        + pil_c(ax + 610, 332, "Ver relatórios", t["bg"], t["azul"], 11, 12, t["azul"])
        + f'<g class="{ate_fim(2, 2.0, 6)}">{caixa(ax + 530, 378, 160, 54, t["amarelo_suave"], t["amarelo"], 8)}{rotulo_central(ax + 610, 396, "3 pendências novas", 12, 700, t["amarelo"])}{rotulo_central(ax + 610, 415, "esperam a sua análise", 11, 400, t["mudo"])}</g>'
    )

    # ---- 3 pendencias ------------------------------------------------------------------------------------
    dados = [("Ana Souza", "8ºA · Atraso", "Alta", t["vermelho"], "Registrada"), ("Bruno Lima", "9ºB · Desrespeito", "Média", t["amarelo"], "Em análise"), ("Caio Reis", "7ºC · Uso de celular", "Baixa", t["verde"], "Em análise")]
    pend = ""
    for i, (nome, sub, prio, cor, st) in enumerate(dados):
        y = 164 + i * 72
        cy = y + 30
        p2, l2 = pil_d(ax + CW - 28, cy - 14, st, t["azul_suave"], t["azul"], 11, 10)
        p1, _ = pil_d(ax + CW - 28 - l2 - 8, cy - 14, prio, t["bg"], cor, 11, 10, cor)
        pend += (
            f'<g class="{ate_fim(3, 0.3 + i * 0.25, 10)}">'
            + caixa(ax, y, CW, 60, t["painel"], t["azul"] if i == 0 else t["borda"], 8)
            + f'<circle cx="{ax + 28}" cy="{cy}" r="14" fill="{t["azul"] if i == 0 else t["painel2"]}"/>'
            + rotulo_central(ax + 28, cy + 0.5, str(i + 1), 13, 800, "#ffffff" if i == 0 else t["mudo"])
            + tc(ax + 56, cy - 9, nome, 14, 700, t["texto"]) + tc(ax + 56, cy + 11, sub, 11, 400, t["mudo"])
            + (tc(ax + 170, cy - 9, "Comece por esta", 11, 700, t["azul"], extra='font-style="italic"') if i == 0 else "")
            + p1 + p2
            + f'<g class="{A.vis(T(3, 0.3 + i * 0.25), T(3, 2.6), 0, 0.2)}"><circle cx="{ax + CW - 12}" cy="{y + 12}" r="4.5" fill="{t["azul"]}"/></g>'
            + "</g>"
        )
    cenas.append(
        texto(ax, 100, "Pendências", 22, 800, t["texto"])
        + texto(ax, 122, "3 ocorrências esperam a sua análise, da mais urgente para a menos.", 12, 400, t["mudo"])
        + f'<g class="{A.vis(T(3, 0), T(3, 2.6), 0, 0.2)}">{botao(ax + CW - 196, 96, 196, 30, "Marcar tudo como visto", t["bg"], t["azul"], t["azul"], 11)}</g>'
        + f'<g class="{A.vis(T(3, 2.6), T(4, 0), 0, 0.2)}">{botao(ax + CW - 224, 96, 224, 30, "Marcar tudo como não visto", t["bg"], t["mudo"], t["borda"], 11)}</g>'
        + pend
        + aviso(3, 2.9, ax + 170, 396, 364, t["verde"], t["verde_suave"], "Tudo marcado como visto")
    )

    # ---- 4 resolver / 5 encerrar (mesmo desenho do estagio) ---------------------------------------------------
    nomes_est = ["Registrada", "Em análise", "Resolvida", "Encerrada"]
    cxs = [ax + 90 + i * 176 for i in range(4)]
    cy_est = 198

    def estagios(base_ate, quando, cor_fim=None):
        """base_ate: quantos estagios ja estao feitos desde o inicio; quando: {indice: segundo} dos que acendem durante a cena."""
        s_ = ""
        for i, nome in enumerate(nomes_est):
            s_ += f'<circle cx="{cxs[i]}" cy="{cy_est}" r="12" fill="{t["bg"]}" stroke="{t["borda"]}" stroke-width="2"/>' + rotulo_central(cxs[i], cy_est + 36, nome, 12, 500, t["mudo"])
            if i < 3:
                s_ += f'<line x1="{cxs[i] + 14}" x2="{cxs[i + 1] - 14}" y1="{cy_est}" y2="{cy_est}" stroke="{t["borda"]}" stroke-width="2"/>'
        for i in range(4):
            if i < base_ate or i in quando:
                inicio = 0 if i < base_ate else quando[i]
                cor = cor_fim if (cor_fim and i == 3) else t["azul"]
                cena_i = 4 if base_ate <= 2 and not cor_fim else 5
                clas = A.vis(T(cena_i, inicio), T(cena_i + 1, 0), 0, 0.25)
                blocos = f'<circle cx="{cxs[i]}" cy="{cy_est}" r="12" fill="{cor}"/>' + check(cxs[i], cy_est, "#ffffff", 0.9) + rotulo_central(cxs[i], cy_est + 36, nome_est(i), 12, 700, t["texto"])
                if i > 0:
                    blocos += f'<line x1="{cxs[i - 1] + 14}" x2="{cxs[i] - 14}" y1="{cy_est}" y2="{cy_est}" stroke="{cor}" stroke-width="2"/>'
                s_ += f'<g class="{clas}">{blocos}</g>'
        return s_

    def nome_est(i):
        return nomes_est[i]

    cenas.append(
        texto(ax, 100, "Ana Souza · Atraso", 22, 800, t["texto"])
        + tc(ax, 120, "8ºA · registrada pela professora Marta", 12, 400, t["mudo"])
        + caixa(ax, 144, CW, 108, t["painel"], t["borda"], 10)
        + estagios(2, {2: 3.4})
        + caixa(ax, 268, CW, 140, t["painel"], t["borda"], 10)
        + tc(ax + 16, 290, "OBSERVAÇÃO", 10, 700, t["mudo"])
        + tc(ax + 16, 318, "Conversei com a família. Combinamos acompanhar a semana.", 12, 400, t["texto"])
        + A.digita(ax + 16, 306, CW - 32, 24, 1.0, 2.8, t["painel"])
        + f'<g class="{A.vis(T(4, 0), T(4, 3.2), 0, 0.2)}">{botao(ax + CW - 16 - 150, 360, 150, 32, "Marcar resolvida", t["verde"], "#ffffff")}</g>'
        + aviso(4, 3.4, ax + CW - 270, 78, 270, t["verde"], t["verde_suave"], "Status: resolvida")
        + tc(ax, 434, "Quem analisa e resolve é a coordenação. A direção encerra.", 12, 400, t["mudo"])
    )

    cenas.append(
        texto(ax, 100, "Ana Souza · Atraso", 22, 800, t["texto"])
        + tc(ax, 120, "8ºA · direção", 12, 400, t["mudo"])
        + caixa(ax, 144, CW, 108, t["painel"], t["borda"], 10)
        + estagios(3, {3: 2.8}, t["roxo"])
        + caixa(ax, 268, CW, 140, t["painel"], t["borda"], 10)
        + tc(ax + 16, 290, "SITUAÇÃO", 10, 700, t["mudo"])
        + f'<g class="{A.vis(T(5, 0), T(5, 2.8), 0, 0.25)}">{pilula(ax + 16, 304, "Resolvida", t["verde_suave"], t["verde"], 12, 12, t["verde"])[0]}{tc(ax + 120, 318, "Falta o ato formal de encerramento.", 12, 400, t["mudo"])}{botao(ax + CW - 16 - 120, 356, 120, 32, "Encerrar", t["azul"], "#ffffff")}</g>'
        + f'<g class="{ate_fim(5, 2.8)}">{pilula(ax + 16, 304, "Encerrada", t["roxo_suave"], t["roxo"], 12, 12, t["roxo"])[0]}{tc(ax + 120, 318, "Somente leitura, para sempre.", 12, 400, t["mudo"])}'
        + f'<g transform="translate({ax + 16} 354)"><rect x="0" y="9" width="18" height="14" rx="3" fill="none" stroke="{t["mudo"]}" stroke-width="2"/><path d="M3.5 9V6a5.5 5.5 0 0 1 11 0v3" fill="none" stroke="{t["mudo"]}" stroke-width="2"/></g>{tc(ax + 44, 369, "Ninguém edita, ninguém apaga.", 12, 600, t["mudo"])}</g>'
        + aviso(5, 3.0, ax + CW - 270, 78, 270, t["roxo"], t["roxo_suave"], "Ocorrência encerrada")
    )

    # ---- 6 historico -----------------------------------------------------------------------------------------------
    eventos = [("Registrada", "Marta Alves · professora", "02/11, 08:12", t["azul"]), ("Em análise", "Paulo Reis · coordenação", "02/11, 09:40", t["amarelo"]), ("Resolvida", "Paulo Reis · coordenação", "03/11, 10:05", t["verde"]), ("Encerrada", "Helena Prado · direção", "03/11, 15:30", t["roxo"])]
    tl = f'<g class="{A.cresce(T(6, 0.4), 2.6, "y")}"><rect x="{ax + 13}" y="170" width="2" height="226" fill="{t["borda"]}"/></g>'
    for i, (acao, quem, quando, cor) in enumerate(eventos):
        y = 150 + i * 76
        cy = y + 29
        tl += (
            f'<g class="{ate_fim(6, 0.4 + i * 0.7, 8)}">'
            + f'<circle cx="{ax + 14}" cy="{cy}" r="8" fill="{cor}"/>'
            + caixa(ax + 40, y, CW - 40, 58, t["painel"], t["borda"], 8)
            + tc(ax + 56, cy - 9, acao, 14, 700, t["texto"]) + tc(ax + 56, cy + 11, quem, 12, 400, t["mudo"])
            + tc(ax + CW - 16, cy, quando, 12, 500, t["mudo"], "end")
            + "</g>"
        )
    cenas.append(
        texto(ax, 100, "Histórico", 22, 800, t["texto"])
        + texto(ax, 122, "Cada passo, com autor, data e hora. Ninguém edita nem apaga.", 12, 400, t["mudo"])
        + tl
    )

    # ---- 7 relatorios ------------------------------------------------------------------------------------------------
    barras = ""
    for i, (nome, val, larg) in enumerate([("1ºA · Informática", "5", 292), ("2ºB · Desenvolvimento", "4", 234), ("3ºB · Desenvolvimento", "4", 234)]):
        y = 246 + i * 46
        barras += (
            tc(ax + 16, y, nome, 12, 500, t["texto"]) + tc(ax + 324, y, val, 12, 800, t["texto"], "end")
            + f'<rect x="{ax + 16}" y="{y + 12}" width="308" height="8" rx="4" fill="{t["painel2"]}"/>'
            + f'<rect class="{A.cresce(T(7, 0.5 + i * 0.25), 0.9)}" x="{ax + 16}" y="{y + 12}" width="{larg}" height="8" rx="4" fill="{t["azul"]}"/>'
        )
    cols = ""
    for i, (mes, alt) in enumerate([("jun", 40), ("jul", 70), ("ago", 52), ("set", 96), ("out", 120), ("nov", 64)]):
        x = ax + 356 + 20 + i * 52
        cols += (
            f'<rect class="{A.cresce(T(7, 0.6 + i * 0.15), 0.7, "y")}" x="{x}" y="{380 - alt}" width="28" height="{alt}" rx="3" fill="{t["azul"]}" opacity="{0.5 + i * 0.1:.2f}"/>'
            + rotulo_central(x + 14, 394, mes, 10, 500, t["mudo"])
        )
    filtros = ""
    for i, rot in enumerate(["Ano: 2026", "Bimestre: todos", "Turma: todas"]):
        filtros += caixa(ax + i * 150, 142, 138, 30, t["bg"], t["borda"], 6) + tc(ax + 14 + i * 150, 157, rot, 11, 500, t["texto"])
    cenas.append(
        texto(ax, 100, "Relatórios", 22, 800, t["texto"])
        + texto(ax, 122, "Mostrando ocorrências do ano de 2026.", 12, 400, t["mudo"])
        + filtros
        + botao(ax + CW - 188, 142, 188, 30, "Baixar planilha (Excel)", t["azul"], "#ffffff", None, 11)
        + caixa(ax, 192, 340, 224, t["painel"], t["borda"], 10) + tc(ax + 16, 214, "Por turma", 13, 700, t["texto"])
        + barras
        + caixa(ax + 356, 192, 348, 224, t["painel"], t["borda"], 10) + tc(ax + 372, 214, "Mês a mês", 13, 700, t["texto"])
        + cols
        + aviso(7, 3.1, ax + CW - 300, 78, 300, t["verde"], t["verde_suave"], "ocorrencias-2026.xlsx baixada")
    )

    quem = {1: ("Marta Alves", "MA"), 2: ("Paulo Reis", "PR"), 3: ("Paulo Reis", "PR"), 4: ("Paulo Reis", "PR"), 5: ("Helena Prado", "HP"), 6: ("Helena Prado", "HP"), 7: ("Paulo Reis", "PR")}
    primeira = ver(0, S)
    corpo = ""
    for i, c in enumerate(cenas):
        corpo += f'<g class="{ver(i * S, (i + 1) * S)}">' + (menu(i, *quem[i]) if i > 0 else "") + c + "</g>"

    legendas = ["1  Professor entra", "2  Professor registra", "3  Coordenação abre o início", "4  A fila chega por urgência", "5  Coordenação analisa e resolve", "6  Direção encerra", "7  Tudo fica no histórico", "8  Relatórios do ano, em planilha"]
    leg = "".join(f'<g class="{ver(i * S, (i + 1) * S)}">{rotulo_central(w / 2, 556, l, 15, 700, t["texto"])}</g>' for i, l in enumerate(legendas))
    bol = "".join(
        f'<circle cx="{w / 2 - 70 + i * 20}" cy="580" r="4" fill="{t["borda"]}"/><circle class="{ver(i * S, (i + 1) * S)}" cx="{w / 2 - 70 + i * 20}" cy="580" r="4" fill="{t["azul"]}"/>'
        for i in range(8)
    )

    # cursor: centro de cada alvo e o segundo (dentro da cena) em que o clique acontece
    alvos = [
        (480, 381, 2.9),  # Entrar
        (ax + CW - 16 - 60, 425, 3.1),  # Registrar
        (106, wy + 154 + 34, 3.0),  # menu Pendencias
        (ax + CW - 98, 111, 2.6),  # Marcar tudo como visto
        (ax + CW - 16 - 75, 376, 3.2),  # Marcar resolvida
        (ax + CW - 16 - 60, 372, 2.6),  # Encerrar
        (ax + 380, 290, None),  # historico (so passa)
        (ax + CW - 94, 157, 3.0),  # Baixar planilha
    ]
    pontos = [(i * S + 1.2, x, y) for i, (x, y, _) in enumerate(alvos)]
    ondas = "".join(A.onda(x, y, i * S + c, t["azul"]) for i, (x, y, c) in enumerate(alvos) if c is not None)
    # movimento reduzido: fica so a tela de entrada, sem aneis de clique nem cursor
    reduzido = f".{primeira}{{visibility:visible!important}}.cursor,circle[class^=o]{{display:none}}"
    seta = A.cursor(pontos, t["texto"], t["bg"])
    css = A.css()
    return cabeca(w, h, "Passeio animado pelo Polar: login, registro, início, fila de pendências, resolução, encerramento, histórico e relatórios.", css, css_depois=reduzido) + quadro + corpo + ondas + leg + bol + seta + "</svg>"


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
.viaja{{animation:viaja 7s linear infinite}}
@keyframes viaja{{0%{{transform:translateX(-80px);opacity:0}}6%{{opacity:1}}94%{{opacity:1}}100%{{transform:translateX(815px);opacity:0}}}}
"""
    corpo = ""
    linhas = ""
    cards = ""
    for i, ((nome, cor, suave), q) in enumerate(zip(estados, quem)):
        x = 30 + i * 245
        cards += caixa(x, 78, 175, 64, suave, cor, 12)
        cards += texto(x + 87, 116, nome, 15, 800, cor, "middle")
        cards += texto(x + 87, 56, q, 14, 600, t["mudo"], "middle")
        cards += texto(x + 87, 172, f"passo {i + 1} de 4" if i < 3 else "somente leitura", 12, 400, t["mudo"], "middle")
        if i < 3:
            linhas += f'<line class="fio" x1="{x + 181}" x2="{x + 234}" y1="110" y2="110" stroke="{t["borda"]}" stroke-width="2"/>'
            linhas += f'<path d="M{x + 228} 104l8 6-8 6" fill="none" stroke="{t["mudo"]}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    # ordem de desenho: fio, bolinha, cards. Assim a bolinha passa por tras dos cards e aparece so nos vaos.
    corpo = caixa(0, 0, w, h, t["bg"], None, 14) + linhas + f'<circle class="viaja" cx="117" cy="110" r="6" fill="{t["azul"]}"/>' + cards
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
    itens_api = [("JWT + bcrypt", t["amarelo"], t["amarelo_suave"]), ("Permissão por papel", t["roxo"], t["roxo_suave"]), ("Zod", t["azul"], t["azul_suave"])]
    larguras = [pilula(0, 0, r_, "x", "x", 12, 12)[1] for r_, _, _ in itens_api]
    folga = 10
    x0 = 262 + (336 - (sum(larguras) + folga * (len(itens_api) - 1))) / 2  # centrado no cartao da API (x 262, largura 336)
    for i, (rot, cor, suave) in enumerate(itens_api):
        corpo += f'<g class="p" style="animation-delay:{0.5 + i * 0.1:.1f}s">{pilula(x0, 232, rot, suave, cor, 12, 12, cor)[0]}</g>'
        x0 += larguras[i] + folga
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
    pontos = "".join(f'<circle class="br" cx="{p(x, y)[0]:.1f}" cy="{p(x, y)[1]:.1f}" r="{r * 1.3:.1f}" fill="{t["azul"]}" style="animation-delay:{i * 0.7:.1f}s"/>' for i, (x, y, r) in enumerate(URSA))
    px, py = p(*POLARIS)
    css = ".tw{opacity:.1;animation:tw 4s ease-in-out infinite}@keyframes tw{50%{opacity:.5}}.br{transform-box:fill-box;transform-origin:center;animation:br 4.2s ease-in-out infinite}@keyframes br{50%{transform:scale(1.5)}}.lin{stroke-dasharray:1;stroke-dashoffset:1;animation:desenha 2.6s .3s ease-out forwards}@keyframes desenha{to{stroke-dashoffset:0}}.pol{transform-box:fill-box;transform-origin:center;animation:pol 5s ease-in-out infinite}@keyframes pol{50%{transform:scale(1.2) rotate(15deg)}}"
    corpo = (
        caixa(0, 0, w, h, t["bg"], None, 14)
        + estrelas
        + f'<path class="lin" pathLength="1" d="{linha}" fill="none" stroke="{t["azul"]}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>'
        + pontos
        + f'<g transform="translate({px - POLARIS[0] * esc * 0.9:.1f} {py - POLARIS[1] * esc * 0.9:.1f}) scale({esc * 0.9})"><g class="pol"><path d="{POLARIS_BRILHO}" fill="{t["azul"]}"/></g></g>'
        + texto(260, 82, "Feito pela equipe Polaris", 30, 800, t["texto"])
        + texto(260, 114, "Trabalho de conclusão de curso, turma 3ºB 2026.", 16, 400, t["mudo"])
        + texto(260, 140, "A Polaris é a estrela que guia a navegação. O Polar é o nosso norte.", 14, 400, t["mudo"])
    )
    return cabeca(w, h, "Feito pela equipe Polaris, a constelação da Ursa Menor com a estrela do norte.", css) + corpo + "</svg>"


# =============================================================================================
# TERMINAL (janela do Terminal do macOS)
# =============================================================================================
MONO = "'SF Mono',SFMono-Regular,ui-monospace,Menlo,Monaco,Consolas,'Liberation Mono',monospace"


def barra_terminal(t, titulo_janela):
    """So a barra da janela do Terminal do macOS: o codigo logo abaixo e um bloco de codigo de verdade (selecionavel, com botao de copiar)."""
    w, h = 1000, 40
    corpo = (
        f'<path d="M0.5 {h}V10.5a10 10 0 0 1 10-10H{w - 10.5}a10 10 0 0 1 10 10V{h}z" fill="{t["painel2"]}" stroke="{t["borda"]}"/>'
        + "".join(f'<circle cx="{22 + i * 22}" cy="{h / 2}" r="6.5" fill="{c}"/>' for i, c in enumerate(["#ff5f56", "#ffbd2e", "#27c93f"]))
        + rotulo_central(w / 2, h / 2 + 1, titulo_janela, 14, 500, t["mudo"])
    )
    return cabeca(w, h, f"Janela do Terminal: {titulo_janela}", "") + corpo + "</svg>"


def terminal(t, titulo_janela, linhas, aria):
    """Terminal animado (so para mostrar, sem comando para copiar). Usa a mesma paleta da demonstracao."""
    w = 1000
    alt_l = 26
    h = 60 + alt_l * len(linhas)
    A = Anim(3 + 0.55 * len(linhas) + 4)
    cont = (
        caixa(0.5, 0.5, w - 1, h - 1, t["painel"], t["borda"], 10)
        + f'<path d="M0.5 40V10.5a10 10 0 0 1 10-10H{w - 10.5}a10 10 0 0 1 10 10V40z" fill="{t["painel2"]}" stroke="{t["borda"]}"/>'
        + "".join(f'<circle cx="{22 + i * 22}" cy="20" r="6.5" fill="{c}"/>' for i, c in enumerate(["#ff5f56", "#ffbd2e", "#27c93f"]))
        + rotulo_central(w / 2, 21, titulo_janela, 14, 500, t["mudo"])
    )
    y = 72
    for i, (tipo, s_) in enumerate(linhas):
        s_ = s_.replace("&", "&amp;").replace("<", "&lt;")
        quando = 0.5 + i * 0.55
        if tipo == "vazio":
            y += alt_l
            continue
        if tipo == "cmd":
            conteudo = f'<tspan fill="{t["verde"]}" font-weight="700">polar</tspan><tspan fill="{t["mudo"]}"> %</tspan><tspan fill="{t["texto"]}"> {s_}</tspan>'
        else:
            conteudo = f'<tspan fill="{t["texto"]}">{s_}</tspan>'
        cont += f'<g class="{A.vis(quando, A.d, 4, 0.3)}"><text x="24" y="{y}" font-size="15" style="font-family:{MONO}" xml:space="preserve">{conteudo}</text></g>'
        y += alt_l
    cont += f'<rect class="cursor-t" x="24" y="{y - 14}" width="9" height="18" fill="{t["texto"]}"/>'
    css = A.css() + ".cursor-t{animation:pisca 1.1s steps(1) infinite}@keyframes pisca{50%{opacity:0}}"
    return cabeca(w, h, aria, css) + cont + "</svg>"


# =============================================================================================
# CARTAO DE DOCUMENTO (cada um vira um link no README)
# =============================================================================================
DOCS = [
    ("visao-geral", "Visão geral", "Problema, papéis, escopo e critério de aceite"),
    ("manual", "Manual do usuário", "Como usar, por papel"),
    ("arquitetura", "Arquitetura", "Camadas, padrões e diagramas"),
    ("postgres", "Por que PostgreSQL", "A decisão de arquitetura"),
    ("modelo", "Modelo relacional", "DER e dicionário de dados"),
    ("endpoints", "Endpoints", "A tabela completa da API"),
    ("fluxo-ocorrencias", "Fluxo das ocorrências", "Máquina de estados e regras"),
    ("testes", "Plano de testes", "T01 a T16 com evidências"),
    ("seguranca-lgpd", "Segurança e LGPD", "OWASP e dados de menores"),
    ("uso-de-ia", "Uso de IA", "Declaração de uso"),
    ("roteiro", "Roteiro da apresentação", "Para ensaiar a banca"),
    ("changelog", "Histórico de versões", "Do v1.0 ao v3.2"),
]


def doc_card(t, titulo, desc):
    w, h = 480, 84
    css = ".c{transition:none}.seta{animation:vai 2.4s ease-in-out infinite}@keyframes vai{50%{transform:translateX(4px)}}"
    corpo = (
        caixa(0.5, 0.5, w - 1, h - 1, t["painel"], t["borda"], 10)
        + f'<rect x="18" y="22" width="30" height="40" rx="4" fill="none" stroke="{t["azul"]}" stroke-width="2"/>'
        + f'<path d="M25 34h16M25 42h16M25 50h10" stroke="{t["azul"]}" stroke-width="2" stroke-linecap="round"/>'
        + texto(66, 40, titulo, 17, 700, t["texto"])
        + texto(66, 62, desc, 13, 400, t["mudo"])
        + f'<path class="seta" d="M{w - 40} 36l8 6-8 6" fill="none" stroke="{t["azul"]}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'
    )
    return cabeca(w, h, f"{titulo}: {desc}", css) + corpo + "</svg>"


def estrutura():
    return ("polar : zsh", [
        ("cmd", "tree -L 2 -d"),
        ("out", "."),
        ("out", "├── apps"),
        ("out", "│   ├── api        Express + TypeScript: auth, usuários, turmas, alunos,"),
        ("out", "│   │              ocorrências, notas, faltas, dashboard, relatórios, auditoria"),
        ("out", "│   └── web        React + TypeScript: telas, componentes, estúdio de avatar"),
        ("out", "├── database       schema.sql, contas e dados de demonstração"),
        ("out", "├── docs           produto, arquitetura, banco, testes, segurança, deploy"),
        ("out", "└── scripts        migração de dados, roteiro dos 6 passos e imagens do README"),
    ], "Terminal: a estrutura de pastas do repositório.")


def main():
    SAIDA.mkdir(parents=True, exist_ok=True)
    pecas = dict(banner=banner, demo=demo, fluxo=fluxo, recursos=recursos, papeis=papeis, seguranca=seguranca, arquitetura=arquitetura, polaris=polaris, entrega=entrega, regras=regras, passeio=passeio)
    for nome_tema, t in TEMAS.items():
        for nome, fn in pecas.items():
            svg = fn(t)
            (SAIDA / f"{nome}-{nome_tema}.svg").write_text(svg, encoding="utf-8")
            print(f"{nome}-{nome_tema}.svg  {len(svg) / 1024:.1f} KB")
        for nome, titulo in [("barra-comece", "polar : começar"), ("barra-postgres", "polar : postgresql"), ("barra-qualidade", "polar : qualidade")]:
            (SAIDA / f"{nome}-{nome_tema}.svg").write_text(barra_terminal(t, titulo), encoding="utf-8")
        janela, linhas, aria = estrutura()
        (SAIDA / f"terminal-estrutura-{nome_tema}.svg").write_text(terminal(t, janela, linhas, aria), encoding="utf-8")
        for slug, titulo, desc in DOCS:
            (SAIDA / f"doc-{slug}-{nome_tema}.svg").write_text(doc_card(t, titulo, desc), encoding="utf-8")
    return 0


def passeio(t):
    return tabela(
        t,
        "As 8 telas do passeio: entrada, início, registro, pendências, resolução, encerramento, histórico e relatórios.",
        ["^#", "Tela", "O que você vê"],
        [
            ["*1", "Entrada", "O professor entra com o e-mail da escola."],
            ["*2", "Início", "O painel do dia: números, últimas ocorrências e o aviso de pendências."],
            ["*3", "Registro", "Aluno, categoria, gravidade e relato numa tela só. O aviso confirma."],
            ["*4", "Pendências", "A fila chega em ordem de urgência, e a primeira vem marcada."],
            ["*5", "Resolução", "A coordenação analisa, escreve a observação e marca como resolvida."],
            ["*6", "Encerramento", "A direção encerra. Dali em diante a ocorrência é só leitura."],
            ["*7", "Histórico", "Cada passo, com autor, data e hora. Ninguém edita nem apaga."],
            ["*8", "Relatórios", "Gráficos do ano e planilha do Excel para baixar."],
        ],
        [80, 200, 720],
        linha_h=46,
    )


def entrega(t):
    return tabela(
        t,
        "Entrega: site e API na Vercel, banco no Supabase, fluxo develop, release e master, e passo a passo dos deploys.",
        ["Item", "Como é"],
        [
            ["Site e API", "polarescolar.vercel.app, na Vercel, com uma prévia para cada pull request."],
            ["Banco", "PostgreSQL gratuito no Supabase."],
            ["Fluxo", "develop, release e master. Mudança de banco entra pelo database/schema.sql antes da master."],
            ["Passo a passo", "docs/deploy/supabase.md (banco, primeiro) e docs/deploy/vercel.md (aplicação)."],
        ],
        [200, 800],
    )


def regras(t):
    return tabela(
        t,
        "Regras que não mudam: quatro estados e três transições, histórico que só cresce, nada é apagado, o servidor decide a permissão.",
        ["#", "Regra"],
        [
            ["*1", "Só existem 4 estados e 3 transições, cada uma de um papel. Pular etapa dá erro 409."],
            ["*2", "Professor não muda status e só vê as próprias ocorrências."],
            ["*3", "Editar: só o autor, só em REGISTRADA, sempre com histórico."],
            ["*4", "O histórico só cresce. Tentativa de editar devolve 405."],
            ["*5", "Ocorrência ENCERRADA é somente leitura, para sempre."],
            ["*6", "Nada é apagado de verdade: alunos, turmas e usuários são inativados."],
            ["*7", "Autor e data vêm do servidor, nunca do formulário."],
            ["*8", "O servidor é a única autoridade de permissão."],
            ["*9", "Aluno nunca é usuário do sistema."],
            ["*10", "Acentuação em português é válida em todo lugar, inclusive no login."],
        ],
        [90, 910],
        linha_h=44,
    )


if __name__ == "__main__":
    sys.exit(main())
