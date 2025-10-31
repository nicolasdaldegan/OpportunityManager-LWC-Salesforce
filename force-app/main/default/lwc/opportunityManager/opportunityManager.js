import { LightningElement, track, wire } from 'lwc';
import getAllOpportunities from '@salesforce/apex/OpportunityController.getAllOpportunities';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'

export default class OpportunityManager extends NavigationMixin(LightningElement) {

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
            { label: 'Data de Fechamento', fieldName: 'closeDate', type: 'date' },
            {
                type: 'button',
                label: 'Ações',
                initialWidth: 200,
                typeAttributes: {
                    label: 'Ver Detalhes',
                    name: 'view_details',
                    title: 'Ver Detalhes',
                    variant: 'brand',
                }
            }
        ];
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        switch (actionName) {
            case 'view_details':
                this.navigateToOpportunity(row.idOpp);
                break;
            default:
                break;
        }
    }

    navigateToOpportunity(opportunityId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: opportunityId,
                objectApiName: 'Opportunity',
                actionName: 'view'
            }
        });
    }

    showToast(title, message, variant = 'info'){
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}