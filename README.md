# Techmarket

Atividade avaliativa solicitada pelo professor Ítalo na disciplina de tópicos Avançados de Bancos de Dados visando demonstrar as diferenças entre bancos Relacionais e noSQL.

## Alunos

- José Bezerra Pinheiro Neto
- Luis Gabriel da Costa Silva

## Como rodar

1. Copie o conteúdo do arquivo [./.env.example](./.env.example) para um novo arquivo nomeado `.env` neste mesmo diretório (realize as alterações que se vejam necessárias).
2. Execute o comando:
   ```bash
   docker compose up -d
   ```
   - Isso deverá iniciar os containers do mongo, cassandra e postgres, assim como um utilitário que realizará as migrations e inserções dos dados que se fizerem necessários
