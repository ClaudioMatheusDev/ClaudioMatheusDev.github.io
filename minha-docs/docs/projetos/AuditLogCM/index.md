---
slug: /projetos/auditlogcm
sidebar_position: 1
sidebar_label: Introdução
title: AuditLogCM
description: Biblioteca NuGet que registra automaticamente o histórico de auditoria das alterações feitas pelo Entity Framework Core.
---

O **AuditLogCM** é uma biblioteca .NET que registra automaticamente quem alterou cada registro do banco,
o que mudou, quando e qual era o valor anterior. Ela se conecta ao `SaveChanges` do Entity Framework Core,
então a aplicação não precisa chamar nada manualmente para auditar.

> **Código-fonte:** [github.com/ClaudioMatheusDev/AuditLogCM](https://github.com/ClaudioMatheusDev/AuditLogCM) ·
> **NuGet:** [AuditLogCM.EFCore](https://www.nuget.org/packages/AuditLogCM.EFCore)

## Por que existe

Auditoria costuma ser implementada à mão: cada serviço grava um log antes ou depois de salvar.
Isso espalha código repetido, é fácil esquecer em uma operação nova e não captura o valor anterior
de forma consistente. O AuditLogCM resolve isso em um único ponto, o pipeline do EF Core.

## O que ele registra

Para cada entidade criada, alterada ou excluída em um `SaveChanges`, a biblioteca grava uma linha em `AuditEntries`:

| Campo | Conteúdo |
| --- | --- |
| `IDAuditEntry` | Identificador do registro de auditoria (GUID) |
| `NomeTabelaAfetada` | Tabela da entidade alterada |
| `IDTabelaAfetada` | Valor da chave primária (chaves compostas são separadas por vírgula) |
| `Acao` | `Create`, `Update` ou `Delete` |
| `ValoresAnteriores` | JSON com os valores antes da alteração (em `Update` e `Delete`) |
| `ValoresNovos` | JSON com os valores depois da alteração (em `Create` e `Update`) |
| `IDUsuario` / `NomeUsuario` | Usuário que fez a alteração, obtido pelo seu `ICurrentUserResolver` |
| `DataAlteracao` | Data e hora em UTC |

## Principais características

- Funciona com `SaveChanges` e `SaveChangesAsync`.
- Só grava auditoria **depois** que o `SaveChanges` principal tem sucesso. Se a operação falhar, nenhuma linha de auditoria é criada.
- Captura corretamente a chave de entidades novas com `IDENTITY`, cujo valor real só existe após o `INSERT`.
- Suporta chaves primárias compostas.
- Permite excluir entidades inteiras (`Ignorar<T>()`) e propriedades sensíveis (`[AuditIgnore]`).
- Extensível por interfaces: `ICurrentUserResolver` e `IAuditSerializer`.

## Instalação

```bash
dotnet add package AuditLogCM.EFCore
```

O pacote `AuditLogCM.EFCore` já traz o `AuditLogCM` (modelos e interfaces) como dependência.
Requer .NET 9 e Entity Framework Core 9.

## Configuração

### 1. Informe quem é o usuário atual

Implemente `ICurrentUserResolver`. Em uma API ASP.NET Core, o usuário normalmente vem do `HttpContext`:

```csharp
using System.Security.Claims;
using AuditLogCM.Core.Interfaces;

public class HttpContextUserResolver : ICurrentUserResolver
{
    private readonly IHttpContextAccessor _accessor;

    public HttpContextUserResolver(IHttpContextAccessor accessor) => _accessor = accessor;

    public string? GetCurrentUserId() =>
        _accessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);

    public string? GetCurrentUserName() =>
        _accessor.HttpContext?.User.Identity?.Name;
}
```

### 2. Registre a auditoria e associe ao seu DbContext

```csharp
using AuditLogCM.Core.Configuration;
using AuditLogCM.EFCore.Extensions;

builder.Services.AddHttpContextAccessor();

// Registra o AuditDbContext (onde os logs são gravados), o interceptor e o resolvedor de usuário
builder.Services.AddAuditLog<HttpContextUserResolver>(
    options => options.UseSqlServer(builder.Configuration.GetConnectionString("AuditConnection")),
    configureOptions: audit => audit.Ignorar<LogDeAcesso>());

// Associa o interceptor ao DbContext da aplicação
builder.Services.AddDbContext<AppDbContext>((sp, options) =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
           .UseAuditLog(sp));
```

A tabela de auditoria fica em um `DbContext` próprio (`AuditDbContext`), que pode apontar para o mesmo
banco da aplicação ou para um banco separado.

### 3. Proteja dados sensíveis

Propriedades marcadas com `[AuditIgnore]` nunca aparecem em `ValoresAnteriores` nem em `ValoresNovos`:

```csharp
using AuditLogCM.Core.Attributes;

public class Usuario
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;

    [AuditIgnore]
    public string SenhaHash { get; set; } = string.Empty;
}
```

## Exemplo de registro gerado

Ao alterar o e-mail de um usuário, a auditoria grava algo como:

```json
{
  "NomeTabelaAfetada": "Usuarios",
  "IDTabelaAfetada": "42",
  "Acao": "Update",
  "ValoresAnteriores": "{\"Id\":\"42\",\"Nome\":\"Ana\",\"Email\":\"ana@antigo.com\"}",
  "ValoresNovos": "{\"Id\":42,\"Nome\":\"Ana\",\"Email\":\"ana@novo.com\"}",
  "IDUsuario": "7",
  "NomeUsuario": "admin",
  "DataAlteracao": "2026-08-31T14:12:03Z"
}
```

Veja em [Como funciona](/projetos/auditlogcm/como-funciona/) os detalhes do interceptor.
