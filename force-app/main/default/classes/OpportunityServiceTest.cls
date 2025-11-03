@IsTest
public class OpportunityServiceTest {

    @TestSetup
    static void setupTestData() {
        Account acc = new Account(Name = 'Conta Service Teste');
        insert acc;

        List<Opportunity> opps = new List<Opportunity>{
            new Opportunity(
                Name = 'Opp Aberta',
                StageName = 'Prospecting',
                Amount = 3000,
                CloseDate = Date.today().addDays(10),
                AccountId = acc.Id
            ),
            new Opportunity(
                Name = 'Opp Fechada',
                StageName = 'Closed Won',
                Amount = 9000,
                CloseDate = Date.today().addDays(-3),
                AccountId = acc.Id
            )
        };
        insert opps;
    }

    @IsTest
    static void testGetAllOpportunities() {
        OpportunityService service = new OpportunityService();

        Test.startTest();
        List<OpportunityService.DataResult> result = service.getAllOpportunities();
        Test.stopTest();

        System.assertEquals(2, result.size(), 'Deve retornar 2 registros');
        System.assertEquals('Opp Aberta', result[0].name);
    }

    @IsTest
    static void testGetOpportunitiesByAccountFilter() {
        OpportunityService service = new OpportunityService();

        Test.startTest();
        List<OpportunityService.DataResult> result = service.getOpportunitiesByAccountFilter('Service');
        Test.stopTest();

        System.assert(result.size() > 0, 'Filtro deve retornar registro');
        System.assertEquals('Conta Service Teste', result[0].accountName);
    }

    @IsTest
    static void testCloseOpportunity_success() {
        Opportunity opp = [SELECT Id FROM Opportunity WHERE IsClosed = FALSE LIMIT 1];
        OpportunityService service = new OpportunityService();

        Test.startTest();
        OpportunityService.ClosedOpportunityResult result = service.closeOpportunity(opp.Id);
        Test.stopTest();

        System.assertEquals('success', result.type);
        System.assertEquals('Oportunidade atualizada com sucesso', result.message);

        Opportunity updatedOpp = [SELECT StageName, IsClosed FROM Opportunity WHERE Id = :opp.Id];
        System.assertEquals('Closed Won', updatedOpp.StageName);
        System.assertEquals(true, updatedOpp.IsClosed);
    }

    @IsTest
    static void testCloseOpportunity_notFound() {
        OpportunityService service = new OpportunityService();

        Test.startTest();
        OpportunityService.ClosedOpportunityResult result = service.closeOpportunity('00XFakeId');
        Test.stopTest();

        System.assertEquals('error', result.type);
        System.assertEquals('Oportunidade não existe.', result.message);
    }

}
