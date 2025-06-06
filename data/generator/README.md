# Generator

Ferramenta responsável por gerar as seeds usadas nos bancos de dados.

## Como rodar

1. Instale as dependências com:
   ```bash
   yarn install
   ```
2. Execute com:
   ```bash
   yarn dev
   ```

## Qual o resultado?

A execução dessa ferramenta deve gerar 3 diretórios no diretório [../seed/](../seed/) contendo as seeds geradas via [FakerJS](https://www.npmjs.com/package/@faker-js/faker) em CSV para PostgreSQL, CQL para Cassandra e JSON para o MongoDB.
