---
slug: /projetos/ecommercecm
title: E-commerce Microservices com ASP.NET
sidebar_label: ECommerceCM
description: Projeto de E-commerce em ASP.NET Core com arquitetura de microsserviços, IdentityServer, JWT, Docker e RabbitMQ.
---

# E-commerce Microservices com ASP.NET

O ECommerceCM é um e-commerce desenvolvido em ASP.NET Core com arquitetura de microsserviços. Ele implementa autenticação com IdentityServer e JWT e segue boas práticas como DTOs, migrations e comunicação assíncrona entre serviços.

> **Código-fonte:** [github.com/ClaudioMatheusDev/ECommerceCM](https://github.com/ClaudioMatheusDev/ECommerceCM)

## Tecnologias Utilizadas

- ASP.NET Core
- Entity Framework Core (com Migrations)
- IdentityServer4 (para autenticação e autorização)
- JWT (JSON Web Token) (para autenticação segura)
- DTO (Data Transfer Object) (para transferência de dados)
- Docker (para conteinerização)
- RabbitMQ (para comunicação entre microservices)
- Swagger (para documentação da API)

## Estrutura do Projeto

O sistema é composto por vários microservices, cada um responsável por uma funcionalidade específica:

```text
EcommerceMS/
└── src/                     # Código dos microsserviços
    ├── IdentityServer/      # Autenticação e gestão de usuários (JWT + IdentityServer)
    ├── CMShop.ProductAPI/   # Gestão de produtos, categorias, estoque e preços
    ├── CMShop.CartAPI/      # Carrinho de compras
    ├── CMShop.DescontAPI/   # Cupons e regras de desconto
    ├── CMShop.OrderAPI/     # Processamento e status dos pedidos
    ├── CMShop.PaymentAPI/   # Processamento de pagamentos (Pix, Cartão, Boleto)

├── docker/                  # Configurações dos containers
│   ├── sqlserver/           # Scripts e configs do banco
│   └── rabbitmq/            # Configurações do RabbitMQ
│
├── tests/                   # Testes unitários e de integração
├── docs/                    # Documentação do sistema
├── .gitignore               # Arquivos/dirs ignorados pelo Git
├── docker-compose.yml       # Orquestração de serviços com Docker
├── README.md                # Documentação inicial do projeto
└── CHANGELOG.md             # Histórico de mudanças
```

## Como executar

Para rodar todos os microserviços localmente (Windows PowerShell):

```powershell
.\start-all-services.bat
```
