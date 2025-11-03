@IsTest
public class OpportunityControllerTest {

    @TestSetup
    static void setupTestData() {
        Account acc = new Account(Name = 'Conta Teste Principal');
        insert acc;

        List<Opportunity> opps = new List<Opportunity>{
            new Opportunity(
                Name = 'Oportunidade Aberta',
                StageName = 'Prospecting',
                Amount = 5000,
                CloseDate = Date.today().addDays(15),
                AccountId = acc.Id
            ),
            new Opportunity(
                Name = 'Oportunidade Fechada',
                StageName = 'Closed Won',
                Amount = 8000,
                CloseDate = Date.today().addDays(-2),
                AccountId = acc.Id
            )
        };
        insert opps;
    }

    @IsTest
    static void testGetAllOpportunities_success() {
        Test.startTest();
        List<OpportunityService.DataResult> result = OpportunityController.getAllOpportunities();
        Test.stopTest();

        System.assertNotEquals(0, result.size(), 'Deve retornar oportunidades');
        System.assertEquals(2, result.size(), 'Deve retornar exatamente 2 oportunidades');
        System.assertNotEquals(null, result[0].name, 'Nome da oportunidade deve ser retornado');
    }

    @IsTest
    static void testGetOpportunitiesByAccountFilter_success() {
        Test.startTest();
        List<OpportunityService.DataResult> result = OpportunityController.getOpportunitiesByAccountFilter('Principal');
        Test.stopTest();

        System.assert(!result.isEmpty(), 'Deve retornar pelo menos uma oportunidade');
        System.assertEquals('Conta Teste Principal', result[0].accountName, 'Conta deve bater com o filtro');
    }

    @IsTest
    static void testGetOpportunitiesByAccountFilter_empty() {
        Test.startTest();
        List<OpportunityService.DataResult> result = OpportunityController.getOpportunitiesByAccountFilter('Inexistente');
        Test.stopTest();

        System.assertEquals(0, result.size(), 'Filtro inválido deve retornar lista vazia');
    }

    @IsTest
    static void testCloseOpportunity_success() {
        Opportunity opp = [SELECT Id FROM Opportunity WHERE IsClosed = FALSE LIMIT 1];

        Test.startTest();
        OpportunityService.ClosedOpportunityResult result = OpportunityController.closeOpportunity(opp.Id);
        Test.stopTest();

        System.assertEquals('success', result.type, 'Deve retornar sucesso ao fechar oportunidade');
        System.assertEquals('Oportunidade atualizada com sucesso', result.message);
    }

    @IsTest
    static void testCloseOpportunity_notFound() {
        Test.startTest();
        OpportunityService.ClosedOpportunityResult result = OpportunityController.closeOpportunity('testeId');
        Test.stopTest();

        System.assertEquals('error', result.type, 'Deve retornar erro se a oportunidade não existe');
        System.assertEquals('Oportunidade não existe.', result.message);
    }

    @IsTest
    static void testCloseOpportunity_blankId() {
        Test.startTest();
        try {
            OpportunityController.closeOpportunity('');
            System.assert(false, 'Deveria lançar AuraHandledException quando idOpp é vazio');
        } catch (AuraHandledException e) {
            System.assertEquals('Id da oportunidade não enviado.',e.getMessage(),'Mensagem da exceção deve ser a mesma definida no controller');
        }
        Test.stopTest();
    }

}