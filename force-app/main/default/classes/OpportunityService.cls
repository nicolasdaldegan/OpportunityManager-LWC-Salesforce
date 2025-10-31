public inherited sharing class OpportunityService {

    public List<DataResult> getAllOpportunities(){
        
        List<Opportunity> opps = OpportunitySelector.getAllOpportunities();

        List<DataResult> listReturn = new List<DataResult>();

        for(Opportunity opp : opps){
            listReturn.add(new DataResult(opp));
        }

        return listReturn;
    }

    public class DataResult {
        @AuraEnabled public Id idOpp;
        @AuraEnabled public String accountName;
        @AuraEnabled public String name;
        @AuraEnabled public Decimal amount;
        @AuraEnabled public String stageName;
        @AuraEnabled public Date closeDate;

        public DataResult(Opportunity opp){
            this.idOpp = opp.Id;
            this.accountName = opp.Account.Name;
            this.name = opp.Name;
            this.amount = opp.Amount;
            this.stageName = opp.StageName;
            this.closeDate = opp.CloseDate;
        }
    }
    
}