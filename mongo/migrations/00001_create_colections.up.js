[
  {
    "create": "pedido",
    "validator": {
      "$jsonSchema": {
        "bsonType": "object",
        "title": "pedido",
        "required": ["_id", "cliente_id_fk", "status", "itens", "total", "created_at", "pagamento"],
        "properties": {
          "_id": { "bsonType": "objectId" },
          "cliente_id_fk": { "bsonType": "objectId" },
          "status": { "bsonType": "array", "items": { "bsonType": "object" } },
          "itens": { "bsonType": "array", "items": { "bsonType": "object" } },
          "total": { "bsonType": "double" },
          "created_at": { "bsonType": "timestamp" },
          "pagamento": { "bsonType": "array", "items": { "bsonType": "object" } }
        }
      }
    }
  },
  {
    "create": "produto",
    "validator": {
      "$jsonSchema": {
        "bsonType": "object",
        "title": "produto",
        "required": ["_id", "nome", "categoria", "preco", "estoque"],
        "properties": {
          "_id": { "bsonType": "objectId" },
          "nome": { "bsonType": "string" },
          "categoria": {
            "bsonType": "object",
            "title": "categoria",
            "properties": {
              "_id": { "bsonType": "objectId" },
              "nome": { "bsonType": "string" }
            }
          },
          "preco": { "bsonType": "double" },
          "estoque": { "bsonType": "int" }
        }
      }
    }
  },
  {
    "create": "cliente",
    "validator": {
      "$jsonSchema": {
        "bsonType": "object",
        "title": "cliente",
        "required": ["_id", "cpf", "nome", "email", "phone", "created_at"],
        "properties": {
          "_id": { "bsonType": "objectId" },
          "cpf": { "bsonType": "string" },
          "nome": { "bsonType": "string" },
          "email": { "bsonType": "string" },
          "phone": { "bsonType": "string" },
          "created_at": { "bsonType": "timestamp" }
        }
      }
    }
  }
]