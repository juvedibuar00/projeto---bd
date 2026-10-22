
const form = document.getElementById('form');
const lista = document.getElementById('lista');
const mensagem = document.getElementById('mensagem');
const btnCadastrar = document.getElementById('btnCadastrar');

async function carregar() {
  try {
    const resposta = await fetch('/alunos');

    if (!resposta.ok) {
      throw new Error('Erro HTTP ' + resposta.status);
    }

    const alunos = await resposta.json();
    lista.innerHTML = '';

    if (alunos.length === 0) {
      lista.innerHTML = `
        <tr>
          <td colspan="4">Nenhum aluno cadastrado.</td>
        </tr>`;
      return;
    }

    alunos.forEach(aluno => {
      const tr = document.createElement('tr');

      [aluno.id, aluno.nome, aluno.matricula, aluno.login]
        .forEach(valor => {
          const td = document.createElement('td');
          td.textContent = valor;
          tr.appendChild(td);
        });

      lista.appendChild(tr);
    });
  } catch (erro) {
    console.error(erro);
    lista.innerHTML = `
      <tr>
        <td colspan="4">Não foi possível carregar os alunos.</td>
      </tr>`;
  }
}

form.addEventListener('submit', async evento => {
  evento.preventDefault();

  mensagem.textContent = '';
  mensagem.style.color = '#b91c1c';
  btnCadastrar.disabled = true;

  const dados = {
    nome: form.elements.nome.value.trim(),
    matricula: form.elements.matricula.value.trim(),
    login: form.elements.login.value.trim()
  };

  try {
    const resposta = await fetch('/alunos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dados)
    });

    const resultado = await resposta.json();

    if (!resposta.ok) {
      mensagem.textContent =
        resultado.erro || 'Não foi possível cadastrar o aluno.';
      return;
    }

    form.reset();
    await carregar();

    mensagem.style.color = '#15803d';
    mensagem.textContent = 'Aluno cadastrado com sucesso!';
  } catch (erro) {
    console.error(erro);
    mensagem.textContent =
      'Falha na comunicação com o servidor.';
  } finally {
    btnCadastrar.disabled = false;
  }
});

carregar();
