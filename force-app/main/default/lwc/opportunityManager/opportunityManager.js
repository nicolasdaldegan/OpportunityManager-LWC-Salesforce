import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
import getAllOpportunities from '@salesforce/apex/OpportunityController.getAllOpportunities';
import closeOpportunity from '@salesforce/apex/OpportunityController.closeOpportunity';


export default class OpportunityManager extends NavigationMixin(LightningElement) {

    @track isLoadedOpportunities = false;
    @track opportunities = [];
    @track columns = [];

    @wire(getAllOpportunities, {})
    getOpportunities({ data, error }) {
        if (data) {
            this.opportunities = data.map((opp) => {
                return {
                    ...opp,
                    buttonVariant: opp.IsClosed ? 'neutral' : 'success' 
                };
            });
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
            },
            {
                type: 'button',
                initialWidth: 200,
                typeAttributes: {
                    label: 'Marcar como Fechada',
                    name: 'mark_closed',
                    title: 'Marcar como Fechada',
                    disabled: { fieldName: 'isClosed' },
                    variant: { fieldName: 'buttonVariant' }                     
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
            case 'mark_closed':
                this.markAsClosed(row);
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

    async markAsClosed(opportunity) {
        try {
            const response = await closeOpportunity({ idOpp : opportunity.idOpp });

            if(response.type == 'success'){
                opportunity.buttonVariant = 'neutral';
                opportunity.isClosed = true;
                opportunity.stageName = 'Closed Won';
            }

            this.buildColumns();

            this.showToast('Resultado', response.message, response.type);
        } catch (e) {
            this.showToast('Erro', e.body?.message || e.message, 'error');
        }
    }

    showToast(title, message, variant = 'info'){
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}