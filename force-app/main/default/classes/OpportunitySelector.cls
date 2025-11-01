public inherited sharing class OpportunitySelector {
    
    public static List<Opportunity> getAllOpportunities() {
        return [SELECT Id, Account.Name, Name, Amount, CloseDate, StageName, IsClosed FROM Opportunity];
    }

    public static List<Opportunity> getOpportunityById(String idOpp){
        return [SELECT Id FROM Opportunity WHERE Id =: idOpp];
    }

    public static void updateOpp(Opportunity opp){
        Database.update(opp);
    }

    public static List<Opportunity> getOpportunitiesByAccountFilter(String accountName) {
        String filter = '%' + accountName + '%';
        return [SELECT Id, Account.Name, Name, Amount, CloseDate, StageName, IsClosed FROM Opportunity WHERE Account.Name LIKE :filter];
    }

}