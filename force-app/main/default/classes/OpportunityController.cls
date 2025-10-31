public with sharing class OpportunityController {

    private static OpportunityService oppService;

    public OpportunityController(){
        oppService = new OpportunityService();
    }
    
    @AuraEnabled(cacheable=true)
    public static List<OpportunityService.DataResult> getAllOpportunities(){
        return oppService.getAllOpportunities();
    }
    
}