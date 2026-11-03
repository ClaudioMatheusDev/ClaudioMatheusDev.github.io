---
slug: idempotencia-no-cmpay
title: Como implementei idempotência no CMPay
authors: [claudio]
tags: [dotnet, aspnet-core, ef-core, api-design]
description: Como a API de pagamentos do CMPay evita cobranças duplicadas com Idempotency-Key, hash do payload e índice único no banco.
---

Em uma API de pagamentos, a pior falha não é o erro 500. É cobrar o cliente duas vezes.
Neste post mostro como o [CMPay](/projetos/cmpay/) evita isso com uma `Idempotency-Key`, e por que
a verificação no código sozinha não basta.

<!-- truncate -->

## O problema

O cliente envia `POST /api/pagamento`. O servidor cria o pagamento, mas a resposta se perde: timeout,
queda de rede, o app fechou. O cliente não sabe se o pagamento foi criado e faz o que qualquer cliente
HTTP bem-comportado faz: **tenta de novo**.

Sem proteção, a segunda requisição cria um segundo pagamento. `GET`, `PUT` e `DELETE` são idempotentes
por definição, mas `POST` não é. A solução padrão do mercado (Stripe, Adyen, Mercado Pago) é pedir que o
cliente gere uma chave única por operação e a envie em um header:

```http
POST /api/pagamento HTTP/1.1
Idempotency-Key: 6f1c2a9e-pedido-1234
```

Se a mesma chave chegar de novo, o servidor devolve o resultado da primeira vez em vez de repetir a operação.

## As regras que defini

| Situação | Comportamento |
| --- | --- |
| Chave nova | Cria o pagamento |
| Mesma chave, mesmo corpo | Devolve o pagamento existente |
| Mesma chave, corpo diferente | `409 Conflict` |
| Duas requisições simultâneas com a mesma chave | Só uma cria |

A terceira linha é importante. Se o cliente reutiliza a chave com outro valor, provavelmente é um bug do
lado dele. Devolver silenciosamente o pagamento antigo esconderia esse bug, então a API recusa.

## 1. Guardar a chave e um hash do payload

A entidade `Pagamento` ganhou dois campos:

```csharp
public string IdempotencyKey { get; set; } = null!;
public string PayloadHash { get; set; } = null!;
```

Para comparar "mesmo corpo", não guardo o JSON recebido. Calculo um hash SHA-256 de uma versão canônica
apenas com os campos que definem o pagamento:

```csharp
private static string CalcularPayloadHash(PagamentoCriarDto dto)
{
    var payloadCanonico = JsonSerializer.Serialize(new
    {
        dto.IDCliente,
        dto.ValorBruto,
        dto.Moeda,
        dto.TipoMetodoPagamento
    });

    return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(payloadCanonico)));
}
```

Serializar um objeto anônimo com ordem fixa de propriedades garante que diferenças de formatação, espaços
ou ordem dos campos no JSON original não mudem o hash.

## 2. Verificar antes de criar

O fluxo comum é simples: procurar um pagamento com a mesma chave para aquele cliente.

```csharp
var existente = await _pagamentoRepository.BuscarPorIdempotencyKeyAsync(dto.IDCliente, idempotencyKey);

if (existente != null)
{
    if (existente.PayloadHash != payloadHash)
        throw new ConflictException("Essa Idempotency-Key já foi usada com um payload diferente.");

    return existente.IDPagamento;
}
```

A chave é **escopada por cliente**. Dois clientes diferentes podem usar a mesma string sem conflito, o
que é o esperado: cada um gera as próprias chaves.

## 3. O caso que a verificação não cobre: concorrência

O código acima tem uma janela de corrida. Se duas requisições com a mesma chave chegam ao mesmo tempo,
as duas fazem a consulta, as duas não encontram nada e as duas inserem.

```text
Requisição A: busca chave → não existe
Requisição B: busca chave → não existe
Requisição A: INSERT ✔
Requisição B: INSERT ✔   ← pagamento duplicado
```

Um `lock` em memória não resolve, porque a API pode rodar em várias instâncias. Quem precisa garantir
a unicidade é o banco. Por isso criei um **índice único** em `(IDCliente, IdempotencyKey)`:

```csharp
modelBuilder.Entity<Pagamento>()
    .HasIndex(p => new { p.IDCliente, p.IdempotencyKey })
    .IsUnique();
```

Agora a segunda inserção falha no banco. O serviço captura essa falha e a trata como um replay:

```csharp
try
{
    await _pagamentoRepository.SalvarAlteracoesAsync();
}
catch (DbUpdateException)
{
    // A outra requisição venceu a corrida. Busca o pagamento que ela criou.
    var concorrente = await _pagamentoRepository.BuscarPorIdempotencyKeyAsync(dto.IDCliente, idempotencyKey);

    if (concorrente == null)
        throw; // Não era violação de unicidade: erro real, propaga.

    if (concorrente.PayloadHash != payloadHash)
        throw new ConflictException("Essa Idempotency-Key já foi usada com um payload diferente.");

    return concorrente.IDPagamento;
}
```

O `throw` quando nada é encontrado é intencional. Um `DbUpdateException` pode ter outras causas, e só
faz sentido tratá-lo como replay se o pagamento concorrente realmente existir.

## 4. Validar o header na borda

O controller rejeita chaves vazias ou maiores que 100 caracteres, o mesmo tamanho da coluna no banco:

```csharp
if (string.IsNullOrWhiteSpace(idempotencyKey))
    return BadRequest("Idempotency-Key é obrigatória.");

if (idempotencyKey.Length > 100)
    return BadRequest("Idempotency-Key deve ter no máximo 100 caracteres.");
```

## Como testei

Os testes unitários do `PagamentoService` usam Moq para simular o repositório. Para a idempotência, há
dois cenários: replay com o mesmo payload, que verifica que `AdicionarAsync` nunca é chamado
(`Times.Never`), e reuso da chave com payload diferente, que deve lançar `ConflictException`.

## O que eu faria a seguir

- **Expirar chaves.** Hoje a chave vale para sempre. Gateways reais costumam aceitar replays por 24 horas.
- **Devolver a resposta original completa.** Hoje o replay devolve o ID do pagamento. Guardar o status
  e o corpo da primeira resposta tornaria o replay indistinguível da chamada original.
- **Teste de integração da corrida.** O cenário concorrente depende do índice do banco, então ele só é
  testado de verdade com um banco real (por exemplo, Testcontainers com SQL Server).

## Resumo

Idempotência em uma API de pagamentos se apoia em três peças: uma chave enviada pelo cliente, um hash
do payload para detectar reuso indevido e um **índice único no banco** para fechar a corrida que nenhuma
verificação em código consegue fechar sozinha.

O código completo está no [repositório do CMPay](https://github.com/ClaudioMatheusDev/CMPay).
