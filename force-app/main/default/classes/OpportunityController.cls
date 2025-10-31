public with sharing class OpportunityController {

    private static OpportunityService oppService = new OpportunityService();

    @AuraEnabled(cacheable=true)
    public static List<OpportunityService.DataResult> getAllOpportunities(){
        return oppService.getAllOpportunities();
    }
    
    @AuraEnabled
    public static OpportunityService.ClosedOpportunityResult closeOpportunity(String idOpp){

        if(String.isBlank(idOpp)){
            throw new AuraHandledException('Id da oportunidade não enviado.');
        }

        return oppService.closeOpportunity(idOpp);
    }

}