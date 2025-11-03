@IsTest
public class OpportunitySelectorTest {

    @TestSetup
    static void setup() {
        Account acc = new Account(Name = 'Conta Selector Teste');
        insert acc;

        Opportunity opp = new Opportunity(
            Name = 'Opp Selector',
            StageName = 'Prospecting',
            Amount = 2000,
            CloseDate = Date.today().addDays(5),
            AccountId = acc.Id
        );

        insert opp;
    }

    @IsTest
    static void testGetAllOpportunities() {
        Test.startTest();
        List<Opportunity> result = OpportunitySelector.getAllOpportunities();
        Test.stopTest();

        System.assert(!result.isEmpty(), 'Deve retornar dados');
        System.assertEquals('Opp Selector', result[0].Name);
    }

    @IsTest
    static void testGetOpportunityById() {
        Opportunity opp = [SELECT Id FROM Opportunity LIMIT 1];

        Test.startTest();
        List<Opportunity> result = OpportunitySelector.getOpportunityById(opp.Id);
        Test.stopTest();

        System.assertEquals(1, result.size(), 'Deve retornar apenas 1');
        System.assertEquals(opp.Id, result[0].Id);
    }

    @IsTest
    static void testUpdateOpp() {
        Opportunity opp = [SELECT Id, StageName FROM Opportunity LIMIT 1];
        opp.StageName = 'Qualification';

        Test.startTest();
        OpportunitySelector.updateOpp(opp);
        Test.stopTest();

        Opportunity updated = [SELECT StageName FROM Opportunity WHERE Id = :opp.Id];
        System.assertEquals('Qualification', updated.StageName);
    }

    @IsTest
    static void testGetOpportunitiesByAccountFilter() {
        Test.startTest();
        List<Opportunity> result = OpportunitySelector.getOpportunitiesByAccountFilter('Selector');
        Test.stopTest();

        System.assert(!result.isEmpty(), 'Filtro deve retornar registro');
        System.assertEquals('Opp Selector', result[0].Name);
    }

}
