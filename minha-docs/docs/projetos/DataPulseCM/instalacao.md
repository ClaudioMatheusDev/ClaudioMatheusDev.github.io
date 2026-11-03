---
slug: /projetos/datapulsecm/instalacao
sidebar_position: 2
title: Instalação
---

# 🚀 Instalação do DataPulseCM

Este guia mostra como instalar e configurar o DataPulseCM do zero.

## 📋 Pré-requisitos

### Software Necessário

| Software | Versão Mínima | Download |
|----------|---------------|----------|
| .NET SDK | 9.0 | [dotnet.microsoft.com](https://dotnet.microsoft.com/download) |
| SQL Server | 2019 | [microsoft.com/sql-server](https://www.microsoft.com/sql-server) |
| Node.js | 18.x | [nodejs.org](https://nodejs.org/) |
| Git | 2.x | [git-scm.com](https://git-scm.com/) |

### Opcionais

- **Visual Studio 2022** - Para desenvolvimento no Windows
- **VS Code** - IDE multiplataforma
- **Docker** - Para executar Seq (visualização de logs)

## 📥 Passo 1: Clonar o Repositório

```bash
git clone https://github.com/ClaudioMatheusDev/DataPulseCM.git
cd DataPulseCM
```

## 🗄️ Passo 2: Configurar o Banco de Dados

### 2.1 Criar o Banco de Dados

Conecte-se ao SQL Server usando SQL Server Management Studio (SSMS) ou Azure Data Studio.

Execute os scripts na seguinte ordem:

```sql
-- 1. Criar banco e tabelas
-- Execute: database/scripts/01-create-tables.sql

-- 2. Criar stored procedures
-- Execute: database/scripts/02-create-stored-procedures.sql

-- 3. (Opcional) Inserir dados de exemplo
-- Execute: database/scripts/03-seed-data.sql
```

### 2.2 Verificar a Instalação

Execute esta query para confirmar:

```sql
USE DataPulseCM;

SELECT COUNT(*) AS TotalTables 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE';

-- Deve retornar 2 tabelas
```

## ⚙️ Passo 3: Configurar a API

### 3.1 Connection String

Edite o arquivo `src/EtlMonitoring.Api/appsettings.json`:

**Para autenticação Windows:**

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=DataPulseCM;Integrated Security=true;TrustServerCertificate=true;"
  }
}
```

**Para autenticação SQL Server:**

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=DataPulseCM;User Id=seu_usuario;Password=sua_senha;TrustServerCertificate=true;"
  }
}
```

### 3.2 Configurar Logging (Opcional)

Se quiser usar Seq para logs avançados:

```bash
# Com Docker
docker run --name seq -d --restart unless-stopped \
  -e ACCEPT_EULA=Y \
  -p 5341:80 \
  datalust/seq:latest
```

Acesse: http://localhost:5341

### 3.3 Restaurar Dependências

```bash
cd src/EtlMonitoring.Api
dotnet restore
```

### 3.4 Compilar o Projeto

```bash
dotnet build
```

### 3.5 Executar a API

```bash
dotnet run
```

✅ **Sucesso!** A API estará rodando em:
- HTTP: http://localhost:5105
- HTTPS: https://localhost:7268
- Swagger: https://localhost:7268/swagger

## 🎨 Passo 4: Configurar o Frontend

### 4.1 Instalar Dependências

```bash
cd ../../frontend
npm install
```

### 4.2 Configurar URL da API (se necessário)

Se a API estiver em outra porta, edite `frontend/src/services/api.ts`:

```typescript
const API_BASE = 'http://localhost:SUA_PORTA/api';
```

### 4.3 Executar o Frontend

```bash
npm run dev
```

✅ **Sucesso!** O dashboard estará em:
- http://localhost:5173

## 🧪 Passo 5: Verificar Instalação

### Testar a API

```bash
# Health Check
curl http://localhost:5105/health

# Obter estatísticas
curl http://localhost:5105/api/jobs/statistics
```

### Testar o Dashboard

1. Abra http://localhost:5173 no navegador
2. Você deve ver:
   - Cards com estatísticas
   - Tabela de execuções
3. Clique em uma execução para ver os detalhes

## 🐛 Solução de Problemas

### Erro: "Connection string não encontrada"

**Causa:** Arquivo `appsettings.json` não foi configurado.

**Solução:**
```bash
cd src/EtlMonitoring.Api
# Edite appsettings.json com a connection string correta
```

### Erro: "Cannot connect to SQL Server"

**Causa:** SQL Server não está rodando ou connection string incorreta.

**Solução:**
1. Verifique se SQL Server está rodando
2. Confirme o nome do servidor em SSMS
3. Teste a conexão manualmente

### Erro: "CORS policy"

**Causa:** CORS não configurado corretamente.

**Solução:** Já está corrigido em `Program.cs`. Reinicie a API:
```bash
# Pare com Ctrl+C
dotnet run
```

### Erro: "Module not found" no Frontend

**Causa:** Dependências não instaladas.

**Solução:**
```bash
cd frontend
rm -rf node_modules
npm install
```

### API não retorna dados

**Causa:** Banco de dados vazio.

**Solução:**
```bash
# Execute o script de seed
# database/scripts/03-seed-data.sql
```

## 🔄 Atualização

Para atualizar para a versão mais recente:

```bash
# 1. Puxar alterações
git pull origin main

# 2. Atualizar API
cd src/EtlMonitoring.Api
dotnet restore
dotnet build

# 3. Atualizar Frontend
cd ../../frontend
npm install

# 4. Executar migrations (se houver)
# Execute scripts novos em database/scripts/
```

## 📦 Build para Produção

### API

```bash
cd src/EtlMonitoring.Api
dotnet publish -c Release -o ./publish
```

### Frontend

```bash
cd frontend
npm run build
# Os arquivos estarão em frontend/dist/
```

## 🐳 Docker (Opcional)

Em breve: Dockerfile e docker-compose para deployment simplificado.

## ✅ Checklist de Instalação

- [ ] .NET 9.0 SDK instalado
- [ ] SQL Server instalado e rodando
- [ ] Node.js 18+ instalado
- [ ] Repositório clonado
- [ ] Scripts SQL executados
- [ ] Connection string configurada
- [ ] API compilando sem erros
- [ ] API rodando e acessível
- [ ] Frontend com dependências instaladas
- [ ] Frontend rodando
- [ ] Dashboard carregando dados
- [ ] Swagger funcionando

## 📞 Precisa de Ajuda?

Se encontrar problemas durante a instalação:
- Verifique os logs da API e do frontend
- Confirme que todas as dependências foram instaladas
- Teste a conexão com o banco de dados separadamente
