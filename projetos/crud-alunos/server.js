
const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const PORTA = 3000;

// Conexão com o MySQL
const db = mysql.createPool({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '',
  database: 'escola'
});

app.use(express.json());
app.use(express.static('public'));

// Testa a conexão e inicia o servidor
async function iniciarServidor() {
  try {
    await db.query('SELECT 1');
    console.log('Conexão com MySQL funcionando!');

    app.get('/alunos', async (req, res) => {
      try {
        const [alunos] = await db.query(
          'SELECT * FROM alunos ORDER BY id'
        );
        res.json(alunos);
      } catch (erro) {
        console.error('Erro ao listar:', erro.message);
        res.status(500).json({
          erro: 'Erro ao consultar alunos.'
        });
      }
    });

    app.post('/alunos', async (req, res) => {
      const { nome, matricula, login } = req.body;

      if (
        typeof nome !== 'string' || !nome.trim() ||
        typeof matricula !== 'string' || !matricula.trim() ||
        typeof login !== 'string' || !login.trim()
      ) {
        return res.status(400).json({
          erro: 'Preencha todos os campos.'
        });
      }

      try {
        const [resultado] = await db.query(
          'INSERT INTO alunos (nome, matricula, login) VALUES (?, ?, ?)',
          [nome.trim(), matricula.trim(), login.trim()]
        );

        res.status(201).json({
          id: resultado.insertId,
          nome: nome.trim(),
          matricula: matricula.trim(),
          login: login.trim()
        });
      } catch (erro) {
        if (erro.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({
            erro: 'Matrícula ou login já cadastrado.'
          });
        }

        console.error('Erro ao cadastrar:', erro.message);
        res.status(500).json({
          erro: 'Erro ao cadastrar aluno.'
        });
      }
    });

    app.listen(PORTA, () => {
      console.log(`Servidor em http://localhost:${PORTA}`);
    });
  } catch (erro) {
    console.error('Não foi possível conectar ao MySQL.');
    console.error(erro.message);
    process.exitCode = 1;
  }
}

iniciarServidor();
