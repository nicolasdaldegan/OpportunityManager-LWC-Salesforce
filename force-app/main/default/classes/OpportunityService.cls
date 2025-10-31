public inherited sharing class OpportunityService {

    public List<DataResult> getAllOpportunities(){
        
        List<Opportunity> opps = OpportunitySelector.getAllOpportunities();

        List<DataResult> listReturn = new List<DataResult>();

        for(Opportunity opp : opps){
            listReturn.add(new DataResult(opp));
        }

        return listReturn;
    }

    public ClosedOpportunityResult closeOpportunity(String idOpp){

        List<Opportunity> opps = OpportunitySelector.getOpportunityById(idOpp);

        if(opps.isEmpty()){
            return new ClosedOpportunityResult('error', 'Oportunidade não existe.');
        }

        Opportunity opp = opps[0];

        opp.StageName = 'Closed Won';
        opp.CloseDate = Date.today();

        try{
            OpportunitySelector.updateOpp(opp);
        }catch(Exception e){
            return new ClosedOpportunityResult('error', 'Oportunidade não existe.');
        }

        return new ClosedOpportunityResult('success', 'Oportunidade atualizada com sucesso');
    }

    public class DataResult {
        @AuraEnabled public Id idOpp;
        @AuraEnabled public String accountName;
        @AuraEnabled public String name;
        @AuraEnabled public Decimal amount;
        @AuraEnabled public String stageName;
        @AuraEnabled public Date closeDate;
        @AuraEnabled public Boolean isClosed;

        public DataResult(Opportunity opp){
            this.idOpp = opp.Id;
            this.accountName = opp.Account.Name;
            this.name = opp.Name;
            this.amount = opp.Amount;
            this.stageName = opp.StageName;
            this.closeDate = opp.CloseDate;
            this.isClosed = opp.IsClosed;
        }
    }

    public class ClosedOpportunityResult {
        //Aqui eu poderia ter usado o Label do salesforce para não precisar dar deploy em código para mudar mensagem
        @AuraEnabled public String type;
        @AuraEnabled public String message;

        public ClosedOpportunityResult(String type, String message){
            this.type = type;
            this.message = message;
        }
    }
    
}