import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:3000/pessoa";

function App() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");

  const [mensagem, setMensagem] = useState("");
  const [deuErro, setDeuErro] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const [pessoas, setPessoas] = useState([]);
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [erroLista, setErroLista] = useState("");
  const [excluindoId, setExcluindoId] = useState(null);
  const [editandoId, setEditandoId] = useState(null);




  async function buscarPessoas() {
    setCarregandoLista(true);
    setErroLista("");
    try {
      const resposta = await fetch(API);
      const dados = await resposta.json();
      if (resposta.ok) {
        setPessoas(dados);
      } else {
        setErroLista(dados.erro || "Erro ao carregar a lista.");
      }
    } catch {
      setErroLista("Não foi possível conectar ao backend (porta 3000).");
    } finally {
      setCarregandoLista(false);
    }
  }

 
  useEffect(() => {
    async function carregar() {
      try {
        const resposta = await fetch(API);
        const dados = await resposta.json();
        if (resposta.ok) {
          setPessoas(dados);
        } else {
          setErroLista(dados.erro || "Erro ao carregar a lista.");
        }
      } catch {
        setErroLista("Não foi possível conectar ao backend (porta 3000).");
      } finally {
        setCarregandoLista(false);
      }
    }
    carregar();
  }, []);

  async function cadastrar(e) {
    e.preventDefault();
    setMensagem("");
    setEnviando(true);

    try {
      const url = editandoId ? `${API}/${editandoId}` : API;
      const metodo = editandoId ? "PUT" : "POST";

      const resposta = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, cpf }),
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        setDeuErro(false);
        setMensagem(
          editandoId ? "Pessoa atualizada com sucesso!" : "Cadastrado com sucesso!"
        );
        setEditandoId(null);
        setNome("");
        setEmail("");
        setCpf("");
        buscarPessoas(); 
      } else {
        setDeuErro(true);
        setMensagem(dados.erro || "Erro ao cadastrar.");
      }
    } catch {
      setDeuErro(true);
      setMensagem("Não conectou ao backend. Rode o backend na porta 3000");
    } finally {
      setEnviando(false);
    }
  }

   async function excluir(id) {
    const confirmar = window.confirm("Deseja realmente excluir esta pessoa?");
    if (!confirmar) return;

    setExcluindoId(id);
    try {
      const resposta = await fetch(`${API}/${id}`, { method: "DELETE" });
      const dados = await resposta.json().catch(() => ({}));

      if (resposta.ok) {
        buscarPessoas(); // recarrega a lista sem a pessoa
      } else {
        alert(dados.erro || "Erro ao excluir.");
      }
    } catch {
      alert("Não conectou ao backend. Rode o backend na porta 3000");
    } finally {
      setExcluindoId(null);
    }
  }

  function atualizar(p) {
    setEditandoId(p.id);
    setNome(p.nome);
    setEmail(p.email);
    setCpf(p.cpf ? p.cpf.numero_cpf : "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setNome("");
    setEmail("");
    setCpf("");
    setMensagem("");
  }

  return (
    <main className="tela">
      <form className="cartao" onSubmit={cadastrar}>
        <h1>{editandoId ? "Atualizar" : "Cadastro"}</h1>
        <p className="sub">
          {editandoId
            ? "Ajuste os dados da pessoa e clique em Salvar."
            : "Preencha nome, email e CPF e clique em Cadastrar."}
        </p>

        <label>
          Nome
          <input
            type="text"
            placeholder="Seu Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </label>

        <label>
          Email
          <input
            type="email"
            placeholder="seuemail@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label>
          CPF
          <input
            type="text"
            placeholder="Apenas números"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
          />
        </label>

        <button type="submit" disabled={enviando}>
          {enviando
            ? editandoId
              ? "Salvando..."
              : "Cadastrando..."
            : editandoId
              ? "Salvar"
              : "Cadastrar"}
        </button>

        {editandoId && (
          <button type="button" onClick={cancelarEdicao} disabled={enviando}>
            Cancelar
          </button>
        )}

        {mensagem && (
          <p className={deuErro ? "msg erro" : "msg ok"}>{mensagem}</p>
        )}
      </form>

     
      <section className="cartao lista">
        <div className="lista-cabecalho">
          <h2>Pessoas cadastradas</h2>
        </div>

        {erroLista && <p className="msg erro">{erroLista}</p>}

        {!erroLista && carregandoLista && <p className="sub">Carregando...</p>}

        {!erroLista && !carregandoLista && pessoas.length === 0 && (
          <p className="sub">Nenhuma pessoa cadastrada ainda.</p>
        )}

        {!erroLista && !carregandoLista && pessoas.length > 0 && (
          <table className="tabela">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Email</th>
                <th>CPF</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pessoas.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.nome}</td>
                  <td>{p.email}</td>
                  <td>{p.cpf ? p.cpf.numero_cpf : "—"}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => excluir(p.id)}
                      disabled={excluindoId === p.id}
                    >
                      {excluindoId === p.id ? "Excluindo..." : "Excluir"}
                    </button>
                    <button
                      type="button"
                      onClick={() => atualizar(p)}
                    >
                      Atualizar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}

export default App;