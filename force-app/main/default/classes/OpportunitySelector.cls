public inherited sharing class OpportunitySelector {
    
    public static List<Opportunity> getAllOpportunities() {
        return [SELECT Id, Account.Name, Name, Amount, CloseDate, StageName FROM Opportunity];
    }

}