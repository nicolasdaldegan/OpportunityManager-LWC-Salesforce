import { LightningElement, track, wire, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'

import getAllOpportunities from '@salesforce/apex/OpportunityController.getAllOpportunities';
import closeOpportunity from '@salesforce/apex/OpportunityController.closeOpportunity';
import getOpportunitiesByAccountFilter from '@salesforce/apex/OpportunityController.getOpportunitiesByAccountFilter';

export default class OpportunityManager extends NavigationMixin(LightningElement) {

    @track isLoadedOpportunities = false;
    @track allOpportunities = [];
    @track opportunities = [];
    @track columns = [];

    @api pageSize = 5;
    @track pageNumber = 1;
    @track totalPages = 0;

    @wire(getAllOpportunities, {})
    getOpportunities({ data, error }) {
        if (data) {
            this.allOpportunities = data.map((opp) => {
                return {
                    ...opp,
                    buttonVariant: opp.IsClosed ? 'neutral' : 'success' 
                };
            });
            this.totalPages = Math.ceil(this.allOpportunities.length / this.pageSize);
            this.setPageData();
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

    setPageData() {
        const start = (this.pageNumber - 1) * this.pageSize;
        const end = start + this.pageSize;
        this.opportunities = this.allOpportunities.slice(start, end);
    }

    get isFirstPage() {
        return this.pageNumber === 1;
    }

    get isLastPage() {
        return this.pageNumber === this.totalPages;
    }

    handlePrevious() {
        if (!this.isFirstPage) {
            this.pageNumber--;
            this.setPageData();
        }
    }

    handleNext() {
        if (!this.isLastPage) {
            this.pageNumber++;
            this.setPageData();
        }
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

    async handleChangeFilter(event){

        const accountName = event.target.value;

        try {
            const response = await getOpportunitiesByAccountFilter({ accountName : accountName });

            if(response.size == 0){
                this.allOpportunities = [];
                this.totalPages = 1;
                this.opportunities = [];
                return;
            }

            this.allOpportunities = response.map((opp) => {
                return {
                    ...opp,
                    buttonVariant: opp.IsClosed ? 'neutral' : 'success' 
                };
            });
            this.totalPages = Math.ceil(this.allOpportunities.length / this.pageSize);
            this.setPageData();
            this.buildColumns();
        } catch (e) {
            this.showToast('Erro', e.body?.message || e.message, 'error');
        }

    }

    showToast(title, message, variant = 'info'){
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}