---
slug: auditoria-automatica-ef-core-interceptor
title: Auditoria automática com interceptor do EF Core
authors: [claudio]
tags: [dotnet, ef-core, nuget, auditoria]
description: Como o AuditLogCM usa SaveChangesInterceptor para registrar quem alterou o quê, quando e qual era o valor anterior, sem código de auditoria espalhado pela aplicação.
---

"Quem mudou esse valor?" é uma pergunta que todo sistema de negócio ouve um dia. Para responder, criei o
[AuditLogCM](/projetos/auditlogcm/), uma biblioteca publicada no NuGet que registra a auditoria
automaticamente a partir do Entity Framework Core. Neste post explico como ela funciona e os detalhes que
deram mais trabalho.

<!-- truncate -->

## Por que não auditar à mão

A forma mais direta é gravar um log em cada serviço:

```csharp
produto.Preco = novoPreco;
await _context.SaveChangesAsync();
await _auditoria.RegistrarAsync("Produtos", produto.Id, "Update", ...);
```

Isso tem três problemas. O código se repete em todo lugar. Basta uma operação nova esquecer a chamada
para a auditoria ficar incompleta. E o valor anterior precisa ser lido antes da alteração, manualmente.

O EF Core já sabe tudo isso. O `ChangeTracker` conhece cada entidade alterada, o estado dela e os valores
originais e atuais. Falta só um ponto para interceptar.

## O ponto de extensão: `SaveChangesInterceptor`

Desde o EF Core 5 existe o `SaveChangesInterceptor`, que permite executar código em momentos específicos
do `SaveChanges`. O AuditLogCM usa três deles:

| Método | Quando roda | O que o AuditLogCM faz |
| --- | --- | --- |
| `SavingChanges` | Antes dos comandos irem ao banco | Captura as alterações |
| `SavedChanges` | Depois do sucesso | Grava a auditoria |
| `SaveChangesFailed` | Depois de uma falha | Descarta o que foi capturado |

Todos têm versão síncrona e assíncrona, e a biblioteca implementa as duas.

## Capturar antes, gravar depois

A primeira versão gravava a auditoria já em `SavingChanges`. O problema: se o `SaveChanges` principal
falhasse (violação de chave estrangeira, por exemplo), a auditoria registrava uma alteração que nunca aconteceu.

A solução foi separar captura e gravação. Em `SavingChanges` o interceptor só monta as entradas e guarda
em memória:

```csharp
foreach (var entry in context.ChangeTracker.Entries())
{
    if (!_opcoes.DeveAuditar(entry.Entity.GetType())) continue;

    if (entry.State is EntityState.Added or EntityState.Modified or EntityState.Deleted)
        _entradasPendentes.Add(ConstruirAuditEntry(entry));
}
```

A captura precisa acontecer aqui porque é o último momento em que `OriginalValues` ainda tem os valores
antigos. Depois do `SaveChanges`, o EF Core aceita as alterações e os originais passam a ser os novos.

A gravação só acontece em `SavedChanges`, e `SaveChangesFailed` limpa a lista. Assim a auditoria só
existe para alterações que de fato foram confirmadas.

## O detalhe das chaves `IDENTITY`

Esse foi o bug mais sutil. Em uma entidade nova com chave gerada pelo banco, no momento do `SavingChanges`
o EF Core ainda usa um **valor temporário** para a chave. O ID real só existe depois do `INSERT`.
A auditoria de criação saía com um ID que não correspondia a nenhum registro.

A correção foi guardar, junto com cada entrada pendente, uma referência à `EntityEntry` quando a chave
ainda é temporária:

```csharp
var chaveTemporaria = entry.State == EntityState.Added
    && entry.Properties.Any(p => p.Metadata.IsPrimaryKey() && p.IsTemporary);

_entradasPendentes.Add(new AuditoriaPendente
{
    Entrada = auditEntry,
    EntradaOrigem = chaveTemporaria ? entry : null
});
```

Em `SavedChanges`, antes de gravar, o interceptor relê a chave real e os valores finais dessas entradas.
O mesmo código também resolve chaves compostas, que são gravadas separadas por vírgula.

## Dados sensíveis

Auditoria que grava `SenhaHash` ou tokens em texto é um vazamento esperando para acontecer. Criei o
atributo `[AuditIgnore]`, e o interceptor filtra essas propriedades tanto dos valores anteriores quanto dos novos:

```csharp
private static bool DeveIgnorarPropriedade(IProperty propriedade) =>
    propriedade.PropertyInfo?.GetCustomAttribute<AuditIgnoreAttribute>() != null;
```

Para entidades inteiras que não precisam de auditoria, como tabelas de log, existe `Ignorar<T>()` na configuração.

## Por que um `DbContext` separado

As entradas são gravadas em um `AuditDbContext` próprio, e não no contexto da aplicação, por dois motivos:

1. Gravar no mesmo contexto dispararia o interceptor de novo, auditando a própria auditoria.
2. Permite apontar a auditoria para outro banco, algo comum quando o log precisa ser retido por mais tempo.

Isso tem um custo, e prefiro deixá-lo explícito: as duas gravações não estão na mesma transação. Se o
banco de auditoria falhar depois que a operação principal foi confirmada, a alteração existe sem auditoria.
O interceptor registra o erro no log e propaga a exceção, para que a falha não passe despercebida.
Para um sistema que exige garantia total, o próximo passo seria uma transação compartilhada ou o padrão
outbox.

## Como usar

```bash
dotnet add package AuditLogCM.EFCore
```

```csharp
builder.Services.AddAuditLog<HttpContextUserResolver>(
    options => options.UseSqlServer(builder.Configuration.GetConnectionString("AuditConnection")));

builder.Services.AddDbContext<AppDbContext>((sp, options) =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
           .UseAuditLog(sp));
```

A partir daí, todo `SaveChanges` do `AppDbContext` gera auditoria. A [documentação](/projetos/auditlogcm/)
mostra a configuração completa.

## O que aprendi

- O momento certo de capturar é diferente do momento certo de gravar.
- Chaves geradas pelo banco são temporárias até o `INSERT`, e isso afeta qualquer coisa que leia o
  `ChangeTracker` antes do `SaveChanges`.
- Publicar no NuGet obriga a pensar em quem vai usar: o `Core` não depende do EF Core, a configuração cabe
  em duas linhas e a publicação é automática por GitHub Actions.

O código está no [repositório do AuditLogCM](https://github.com/ClaudioMatheusDev/AuditLogCM).
