import { Link } from "react-router-dom";
import { MarcaPolar } from "../../components/ui/Marca";

// Aviso de privacidade (LGPD, Lei 13.709/2018). Publico: vale para equipe, alunos e responsaveis.
export function PrivacidadePage() {
  return (
    <main className="pagina-publica">
      <article className="pagina-publica__texto">
        <div className="login-brand">
          <MarcaPolar size={40} />
          <div>
            <strong>Polar</strong>
          </div>
        </div>

        <h1>Privacidade e proteção de dados</h1>
        <p>
          O Polar guarda o registro de ocorrências escolares. A escola que usa o Polar é a <strong>controladora</strong> dos
          dados (LGPD, art. 5º, VI) e responde pelos pedidos dos titulares. O sistema só trata os dados para essa finalidade.
        </p>

        <h2>Quais dados</h2>
        <ul>
          <li>Equipe da escola: nome, e-mail, perfil de acesso e registro das ações no sistema.</li>
          <li>Alunos: nome, matrícula, turma e as ocorrências registradas sobre eles.</li>
          <li>Responsáveis: nome, telefone e e-mail, usados só para avisar sobre ocorrências.</li>
        </ul>

        <h2>Para quê</h2>
        <p>
          Registrar, acompanhar e encerrar ocorrências, avisar os responsáveis e produzir relatórios da própria escola. Como
          são dados de crianças e adolescentes, o tratamento segue o melhor interesse do estudante (art. 14). Os dados não são
          vendidos nem usados para propaganda.
        </p>

        <h2>Quem vê</h2>
        <p>
          Cada pessoa vê só o que o perfil permite: o professor vê as ocorrências que registrou; coordenação e direção veem as
          da escola. O responsável recebe apenas um aviso curto, sem o relato escrito pelo professor. Toda ação fica
          registrada, com autor, data e hora.
        </p>

        <h2>Por quanto tempo</h2>
        <p>
          Enquanto o aluno estiver matriculado, e depois pelo prazo de guarda definido pela escola. Passado o prazo, a
          administração apaga os dados pessoais: o nome do aluno, os dados do responsável e o texto das ocorrências. Ficam só
          números sem identificação (categoria, data, situação), para as estatísticas da escola.
        </p>

        <h2>Seus direitos</h2>
        <p>
          Alunos, responsáveis e funcionários podem pedir à escola para confirmar, ver, corrigir ou apagar seus dados (art.
          18). O pedido é feito na secretaria ou na direção da escola.
        </p>

        <p className="login-access__help">
          <Link to="/login">Voltar para o Polar</Link>
        </p>
      </article>
    </main>
  );
}
