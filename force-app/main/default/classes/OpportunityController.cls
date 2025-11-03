public with sharing class OpportunityController {

    private static OpportunityService oppService = new OpportunityService();

    @AuraEnabled(cacheable=true)
    public static List<OpportunityService.DataResult> getAllOpportunities(){
        return oppService.getAllOpportunities();
    }

    @AuraEnabled(cacheable=true)
    public static List<OpportunityService.DataResult> getOpportunitiesByAccountFilter(String accountName){
        return oppService.getOpportunitiesByAccountFilter(accountName);
    }
    
    @AuraEnabled
    public static OpportunityService.ClosedOpportunityResult closeOpportunity(String idOpp){

        if(String.isBlank(idOpp)){
            AuraHandledException e = new AuraHandledException('Id da oportunidade não enviado.');
            e.setMessage('Id da oportunidade não enviado.');
            throw e;
        }

        return oppService.closeOpportunity(idOpp);
    }

}