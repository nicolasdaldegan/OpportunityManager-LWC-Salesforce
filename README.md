# Opportunity Manager

Componente Lightning Web Component (LWC) para listar, filtrar, paginar e fechar oportunidades no Salesforce. Utiliza arquitetura em camadas com Apex Controller → Service → Selector, além de testes unitários em LWC e Apex.

## Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| Listagem de Oportunidades | Carrega e exibe oportunidades com paginação |
| Filtro por Conta | Filtra oportunidades pelo nome da conta (parcial ou completo) |
| Ver Detalhes | Navegação para a página da oportunidade |
| Marcar como Fechada | Atualiza estágio para Closed Won |
| Tratamento de Erro | Exibe toast quando há falha no carregamento ou atualização |
| Testes | LWC + Apex Test garantindo cobertura e qualidade |

## Arquitetura

```
LWC (opportunityManager)
    ↓ chama
Apex Controller (OpportunityController)
    ↓ delega para
OpportunityService (Regras de Negócio)
    ↓ acessa
OpportunitySelector (Consultas e DML)
```

## Paginação — Decisão de Implementação
A paginação foi implementada **no front-end**, para simplificar o projeto e evitar requisições extras ao servidor.

Entretanto, em casos de grande volume de registros, o ideal é fazer **paginação no Apex**. Possíveis abordagens:

| Cenário | Estratégia recomendada |
|--------|------------------------|
| Até ~2.000 registros | `OFFSET` no SOQL |
| Muito volume (milhares+) | Paginação por chave → `WHERE Id > :lastId LIMIT X` |

Isso evita carregar todos os registros na memória do navegador.

## Testes

### LWC
Localizados em:
```
lwc/opportunityManager/__tests__/opportunityManager.test.js
```
- Mock de Apex
- Simulação de eventos da UI
- Testes de paginação, filtro, navegação e atualização

### Apex
```
classes/OpportunityControllerTest.cls
classes/OpportunityServiceTest.cls
classes/OpportunitySelectorTest.cls
```
- Cobre todos os caminhos: sucesso, erro e exceções

## Melhorias Futuras
| Item | Descrição |
|------|-----------|
| **Uso de Labels** | Substituir mensagens hardcoded por **Custom Labels**. |
| **Paginação no Apex** | Alterar para `OFFSET` ou paginação por Id conforme volume de registros. |
| **fflib (Apex Enterprise Patterns)** | Aplicar mocks de forma mais robusta usando `fflib_ApexMocks` para testes unitários em grandes equipes. |
