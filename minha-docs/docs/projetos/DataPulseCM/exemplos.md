---
slug: /projetos/datapulsecm/exemplos
sidebar_position: 5
title: Exemplos Práticos
---

# 💡 Exemplos Práticos de Uso da API

Exemplos reais de como integrar e usar a API DataPulseCM.

## 🎯 Cenário 1: Job Simples

Exemplo de um job ETL básico que registra início e fim.

### C# (.NET)

```csharp
using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

public class EtlJob
{
    private readonly HttpClient _httpClient;
    private const string API_BASE = "http://localhost:5105/api";

    public EtlJob()
    {
        _httpClient = new HttpClient();
    }

    public async Task ExecutarJob()
    {
        long executionId = 0;
        
        try
        {
            // 1. Iniciar execução
            var startResponse = await _httpClient.PostAsJsonAsync(
                $"{API_BASE}/jobs/start",
                new { jobName = "ETL_ImportarVendas" }
            );
            
            var startResult = await startResponse.Content.ReadFromJsonAsync<dynamic>();
            executionId = startResult.executionId;
            
            Console.WriteLine($"Job iniciado. ExecutionId: {executionId}");

            // 2. Executar o job (sua lógica aqui)
            await ProcessarVendas();

            // 3. Finalizar com sucesso
            await _httpClient.PostAsJsonAsync(
                $"{API_BASE}/jobs/{executionId}/finish",
                new { status = "Sucesso", errorMessage = (string)null }
            );
            
            Console.WriteLine("Job finalizado com sucesso!");
        }
        catch (Exception ex)
        {
            // 4. Finalizar com falha
            if (executionId > 0)
            {
                await _httpClient.PostAsJsonAsync(
                    $"{API_BASE}/jobs/{executionId}/finish",
                    new { status = "Falha", errorMessage = ex.Message }
                );
            }
            
            Console.WriteLine($"Erro: {ex.Message}");
            throw;
        }
    }

    private async Task ProcessarVendas()
    {
        // Sua lógica de ETL aqui
        await Task.Delay(5000); // Simulando processamento
    }
}
```

### Python

```python
import requests
import time
from datetime import datetime

API_BASE = "http://localhost:5105/api"

def executar_job():
    execution_id = None
    
    try:
        # 1. Iniciar execução
        response = requests.post(
            f"{API_BASE}/jobs/start",
            json={"jobName": "ETL_ImportarVendas"}
        )
        result = response.json()
        execution_id = result['executionId']
        
        print(f"Job iniciado. ExecutionId: {execution_id}")

        # 2. Executar o job
        processar_vendas()

        # 3. Finalizar com sucesso
        requests.post(
            f"{API_BASE}/jobs/{execution_id}/finish",
            json={"status": "Sucesso", "errorMessage": None}
        )
        
        print("Job finalizado com sucesso!")
        
    except Exception as e:
        # 4. Finalizar com falha
        if execution_id:
            requests.post(
                f"{API_BASE}/jobs/{execution_id}/finish",
                json={"status": "Falha", "errorMessage": str(e)}
            )
        
        print(f"Erro: {str(e)}")
        raise

def processar_vendas():
    # Sua lógica de ETL aqui
    time.sleep(5)  # Simulando processamento

if __name__ == "__main__":
    executar_job()
```

---

## 🔄 Cenário 2: Job com Steps Detalhados

Job que registra cada etapa do processo.

### C# (.NET)

```csharp
public class EtlJobComSteps
{
    private readonly HttpClient _httpClient;
    private const string API_BASE = "http://localhost:5105/api";

    public async Task ExecutarJobCompleto()
    {
        long executionId = 0;
        
        try
        {
            // 1. Iniciar execução
            var startResponse = await _httpClient.PostAsJsonAsync(
                $"{API_BASE}/jobs/start",
                new { jobName = "ETL_ImportarVendas_Completo" }
            );
            
            var startResult = await startResponse.Content.ReadFromJsonAsync<dynamic>();
            executionId = startResult.executionId;

            // 2. Step 1: Extrair dados
            await ExecutarStep(executionId, "Extrair dados da API", 1, async () =>
            {
                // Lógica de extração
                await Task.Delay(2000);
                return 5000; // registros extraídos
            });

            // 3. Step 2: Transformar dados
            await ExecutarStep(executionId, "Transformar dados", 2, async () =>
            {
                // Lógica de transformação
                await Task.Delay(3000);
                return 5000; // registros transformados
            });

            // 4. Step 3: Carregar no banco
            await ExecutarStep(executionId, "Carregar no banco", 3, async () =>
            {
                // Lógica de carga
                await Task.Delay(2000);
                return 5000; // registros carregados
            });

            // 5. Finalizar execução
            await _httpClient.PostAsJsonAsync(
                $"{API_BASE}/jobs/{executionId}/finish",
                new { status = "Sucesso", errorMessage = (string)null }
            );
        }
        catch (Exception ex)
        {
            if (executionId > 0)
            {
                await _httpClient.PostAsJsonAsync(
                    $"{API_BASE}/jobs/{executionId}/finish",
                    new { status = "Falha", errorMessage = ex.Message }
                );
            }
            throw;
        }
    }

    private async Task ExecutarStep(long executionId, string stepName, int stepOrder, Func<Task<int>> action)
    {
        long detailId = 0;
        
        try
        {
            // Iniciar step
            var startStepResponse = await _httpClient.PostAsJsonAsync(
                $"{API_BASE}/jobs/{executionId}/details/start",
                new { stepName, stepOrder, stepMessage = $"Iniciando {stepName}" }
            );
            
            var startStepResult = await startStepResponse.Content.ReadFromJsonAsync<dynamic>();
            detailId = startStepResult.detailId;

            // Executar ação
            int recordsProcessed = await action();

            // Finalizar step
            await _httpClient.PostAsJsonAsync(
                $"{API_BASE}/jobs/details/{detailId}/finish",
                new 
                { 
                    stepStatus = "Sucesso", 
                    stepMessage = $"{recordsProcessed} registros processados" 
                }
            );
        }
        catch (Exception ex)
        {
            if (detailId > 0)
            {
                await _httpClient.PostAsJsonAsync(
                    $"{API_BASE}/jobs/details/{detailId}/finish",
                    new { stepStatus = "Falha", stepMessage = ex.Message }
                );
            }
            throw;
        }
    }
}
```

---

## 📊 Cenário 3: Consulta e Análise

Como consultar dados para análise.

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const API_BASE = 'http://localhost:5105/api';

// Obter estatísticas gerais
async function obterEstatisticas() {
  const { data } = await axios.get(`${API_BASE}/jobs/statistics`);
  
  console.log(`Total de execuções: ${data.total}`);
  console.log(`Taxa de sucesso: ${data.successRate.toFixed(2)}%`);
  console.log(`Falhas: ${data.failed}`);
  
  return data;
}

// Verificar jobs com falha nas últimas 24h
async function verificarFalhasRecentes() {
  const { data } = await axios.get(`${API_BASE}/jobs/failed?limit=50`);
  
  const ultimasFalhas = data.data.filter(job => {
    const diff = Date.now() - new Date(job.startDate).getTime();
    return diff < 24 * 60 * 60 * 1000; // 24 horas
  });
  
  console.log(`Falhas nas últimas 24h: ${ultimasFalhas.length}`);
  
  ultimasFalhas.forEach(job => {
    console.log(`- ${job.jobName}: ${job.errorMessage}`);
  });
  
  return ultimasFalhas;
}

// Analisar performance de um job específico
async function analisarPerformanceJob(jobName: string) {
  const { data } = await axios.get(
    `${API_BASE}/jobs/by-name/${jobName}/history?limit=100`
  );
  
  const execucoes = data.data;
  
  // Calcular duração média
  const duracoes = execucoes
    .filter(e => e.duration > 0)
    .map(e => e.duration);
  
  const duracaoMedia = duracoes.reduce((a, b) => a + b, 0) / duracoes.length;
  
  console.log(`Job: ${jobName}`);
  console.log(`Execuções analisadas: ${execucoes.length}`);
  console.log(`Duração média: ${Math.round(duracaoMedia)}s`);
  
  // Taxa de sucesso
  const { data: taxaData } = await axios.get(
    `${API_BASE}/jobs/by-name/${jobName}/success-rate`
  );
  
  console.log(`Taxa de sucesso: ${taxaData.successRate.toFixed(2)}%`);
  
  return {
    totalExecucoes: execucoes.length,
    duracaoMedia,
    taxaSucesso: taxaData.successRate
  };
}

// Uso
(async () => {
  await obterEstatisticas();
  await verificarFalhasRecentes();
  await analisarPerformanceJob('ETL_ImportarVendas');
})();
```

---

## 🔔 Cenário 4: Monitoring e Alertas

Implementar monitoramento proativo.

### C# (.NET) - Background Service

```csharp
using Microsoft.Extensions.Hosting;
using System.Net.Http;
using System.Net.Http.Json;

public class JobMonitorService : BackgroundService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<JobMonitorService> _logger;
    private const string API_BASE = "http://localhost:5105/api";

    public JobMonitorService(IHttpClientFactory httpClientFactory, ILogger<JobMonitorService> logger)
    {
        _httpClient = httpClientFactory.CreateClient();
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await VerificarFalhas();
                await VerificarJobsLentos();
                
                // Aguardar 5 minutos antes da próxima verificação
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro no monitoramento");
            }
        }
    }

    private async Task VerificarFalhas()
    {
        var response = await _httpClient.GetFromJsonAsync<dynamic>(
            $"{API_BASE}/jobs/failed?limit=20"
        );

        var falhas = response.data;
        
        foreach (var falha in falhas)
        {
            var dataFalha = DateTime.Parse(falha.startDate.ToString());
            
            // Alertar se falha ocorreu na última hora
            if (DateTime.Now - dataFalha < TimeSpan.FromHours(1))
            {
                _logger.LogWarning(
                    "ALERTA: Job {JobName} falhou. Erro: {ErrorMessage}",
                    falha.jobName,
                    falha.errorMessage
                );
                
                // Aqui você pode enviar email, SMS, webhook, etc.
                await EnviarAlerta(falha);
            }
        }
    }

    private async Task VerificarJobsLentos()
    {
        var response = await _httpClient.GetFromJsonAsync<dynamic>(
            $"{API_BASE}/jobs?limit=50"
        );

        var execucoes = response.data;
        
        foreach (var exec in execucoes)
        {
            // Alertar se duração > 30 minutos
            if (exec.duration != null && exec.duration > 1800)
            {
                _logger.LogWarning(
                    "ALERTA: Job {JobName} está demorando {Duration}s",
                    exec.jobName,
                    exec.duration
                );
            }
        }
    }

    private async Task EnviarAlerta(dynamic falha)
    {
        // Implementar envio de email, Slack, Teams, etc.
        _logger.LogInformation("Alerta enviado para: {JobName}", falha.jobName);
        await Task.CompletedTask;
    }
}
```

---

## 📦 Classe Helper Reutilizável

Classe C# para facilitar integração:

```csharp
using System.Net.Http;
using System.Net.Http.Json;

public class DataPulseCMClient
{
    private readonly HttpClient _httpClient;
    private readonly string _apiBase;

    public DataPulseCMClient(string apiBase = "http://localhost:5105/api")
    {
        _httpClient = new HttpClient();
        _apiBase = apiBase;
    }

    public async Task<long> IniciarJob(string jobName)
    {
        var response = await _httpClient.PostAsJsonAsync(
            $"{_apiBase}/jobs/start",
            new { jobName }
        );
        
        var result = await response.Content.ReadFromJsonAsync<StartJobResponse>();
        return result.ExecutionId;
    }

    public async Task FinalizarJob(long executionId, string status, string errorMessage = null)
    {
        await _httpClient.PostAsJsonAsync(
            $"{_apiBase}/jobs/{executionId}/finish",
            new { status, errorMessage }
        );
    }

    public async Task<long> IniciarStep(long executionId, string stepName, int stepOrder)
    {
        var response = await _httpClient.PostAsJsonAsync(
            $"{_apiBase}/jobs/{executionId}/details/start",
            new { stepName, stepOrder, stepMessage = $"Iniciando {stepName}" }
        );
        
        var result = await response.Content.ReadFromJsonAsync<StartStepResponse>();
        return result.DetailId;
    }

    public async Task FinalizarStep(long detailId, string status, string message = null)
    {
        await _httpClient.PostAsJsonAsync(
            $"{_apiBase}/jobs/details/{detailId}/finish",
            new { stepStatus = status, stepMessage = message }
        );
    }
}

// DTOs
public class StartJobResponse
{
    public long ExecutionId { get; set; }
    public string JobName { get; set; }
    public string Message { get; set; }
}

public class StartStepResponse
{
    public long DetailId { get; set; }
    public long ExecutionId { get; set; }
    public string StepName { get; set; }
    public string Message { get; set; }
}

// Uso
var client = new DataPulseCMClient();
var jobId = await client.IniciarJob("MeuJob");
// ... processar ...
await client.FinalizarJob(jobId, "Sucesso");
```

---

## 📚 Próximos Passos

Continue explorando a documentação para aprender mais sobre o DataPulseCM.
