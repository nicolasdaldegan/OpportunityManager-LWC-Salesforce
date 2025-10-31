import { LightningElement, track, wire } from 'lwc';
import getAllOpportunities from '@salesforce/apex/OpportunityController.getAllOpportunities';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'

export default class OpportunityManager extends LightningElement {

    @track isLoadedOpportunities = false;
    @track opportunities = [];
    @track columns = [];

    @wire(getAllOpportunities, {})
    getOpportunities({ data, error }) {
        if (data) {
            this.opportunities = data;
            this.isLoadedOpportunities = true;
        } else if (error) {
            this.showToast('Erro', 'Houve um erro ao carregar as oportunidades.', 'error');
        }
    }

    connectedCallback() {
        this.buildColumns();
    }

    buildColumns() {
        this.columns = [
            { label: 'Nome', fieldName: 'name', type: 'text' },
            { label: 'Fase', fieldName: 'stageName', type: 'text' },
            { label: 'Valor', fieldName: 'amount', type: 'currency' },
            { label: 'Data de Fechamento', fieldName: 'closeDate', type: 'date' }
        ];
    }

    showToast(title, message, variant = 'info'){
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}