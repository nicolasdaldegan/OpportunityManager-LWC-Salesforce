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
```
- Cobre todos os caminhos: sucesso, erro e exceções
