---
slug: /projetos/cmpay/api
sidebar_position: 2
title: Referência da API
description: Endpoints, autenticação por API Key, Idempotency-Key e formato de erros do CMPay.
---

# Referência da API

## Autenticação

Todas as rotas exigem o header `X-Api-Key`, exceto o cadastro de cliente.

1. `POST /api/clientes` cria o cliente e gera uma API Key aleatória.
2. A chave é devolvida **uma única vez** na resposta. O banco guarda apenas o hash SHA-256 dela.
3. Nas próximas requisições, envie a chave no header:

```http
GET /api/pagamento HTTP/1.1
X-Api-Key: <sua-chave>
```

Requisições sem chave ou com chave inválida recebem `401`. A autenticação é um `AuthenticationHandler`
customizado, integrado ao pipeline do ASP.NET Core. Por isso `[Authorize]` e `[AllowAnonymous]` funcionam normalmente.

## Endpoints

| Recurso | Método e rota | Descrição |
| --- | --- | --- |
| Cliente | `POST /api/clientes` | Cria cliente e devolve `{ idCliente, apiKey }` (público) |
| | `GET /api/clientes` · `GET /api/clientes/{id}` | Lista ou busca |
| | `PUT /api/clientes/{id}` · `DELETE /api/clientes/{id}` | Atualiza ou exclui |
| Endereço | `/api/endereco` | CRUD do endereço do cliente |
| Cartão | `/api/Cartao` | CRUD de cartões |
| Pagamento | `POST /api/pagamento` | Cria pagamento (exige `Idempotency-Key`) |
| | `GET /api/pagamento` · `GET /api/pagamento/{id}` | Lista ou busca |
| | `GET /api/pagamento/{id}/detalhes` | Pagamento com o histórico de transações |
| | `POST /api/pagamento/{id}/processar` | Processa um pagamento pendente |
| | `POST /api/pagamento/{id}/cancelar` | Cancela um pagamento pendente |
| | `POST /api/pagamento/{id}/estornar` | Estorna um pagamento aprovado |
| Saúde | `GET /health` | Verifica a conexão com o banco |

## Criar pagamento

```http
POST /api/pagamento HTTP/1.1
X-Api-Key: <sua-chave>
Idempotency-Key: 6f1c2a9e-pedido-1234
Content-Type: application/json

{
  "idCliente": 1,
  "valorBruto": 150.00,
  "moeda": 1,
  "tipoMetodoPagamento": 1
}
```

`moeda`: 1 = BRL, 2 = USD, 3 = EUR. `tipoMetodoPagamento`: 1 = Pix, 2 = cartão de crédito, 3 = cartão de débito.

Resposta:

```json
{ "idPagamento": 10 }
```

### Idempotency-Key

O header é obrigatório, não pode ser vazio e aceita até 100 caracteres.

| Situação | Resultado |
| --- | --- |
| Chave nova | Cria o pagamento |
| Mesma chave e mesmo corpo | Devolve o pagamento já criado, sem duplicar |
| Mesma chave e corpo diferente | `409 Conflict` |
| Duas requisições simultâneas com a mesma chave | Apenas uma cria; a outra recebe o mesmo pagamento |

A chave é escopada por cliente. O artigo
[Como implementei idempotência no CMPay](/blog/idempotencia-no-cmpay/) explica a implementação.

## Validações de entrada

- **CPF/CNPJ:** dígitos verificadores validados por um `ValidationAttribute` próprio.
- **E-mail e telefone:** `[EmailAddress]` e `[Phone]`.
- **Cartão:** mês entre 1 e 12 e data de validade não vencida (`IValidatableObject`).
- **Enums:** `[EnumDataType]` rejeita valores numéricos fora do enum, que o `System.Text.Json` aceitaria por padrão.

## Formato de erros

Um middleware global converte as exceções em respostas JSON com o mesmo formato:

```json
{ "message": "Somente pagamentos aprovados podem ser estornados." }
```

| Exceção | Status |
| --- | --- |
| `NotFoundException` | `404 Not Found` |
| `BusinessException` | `400 Bad Request` |
| `ConflictException` | `409 Conflict` |
| Qualquer outra | `500 Internal Server Error` (mensagem genérica, detalhes só no log) |
