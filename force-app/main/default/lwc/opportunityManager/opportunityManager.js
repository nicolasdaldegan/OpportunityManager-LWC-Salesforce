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
            this.processOpportunities(data);
            this.recalculatePagination();
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
                initialWidth: 125,
                typeAttributes: {
                    label: 'Ver Detalhes',
                    name: 'view_details',
                    title: 'Ver Detalhes',
                    variant: 'brand',
                }
            },
            {
                type: 'button',
                initialWidth: 190,
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
        return this.pageNumber === 1 || this.pageNumber === 0;
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

        if (actionName === 'view_details') {
            this.navigateToOpportunity(row.idOpp);
            return;
        }

        if (actionName === 'mark_closed') {
            this.markAsClosed(row);
            return;
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

    processOpportunities(data) {
        this.allOpportunities = data.map((opp) => ({
            ...opp,
            buttonVariant: opp.IsClosed ? 'neutral' : 'success'
        }));
        this.recalculatePagination();
    }

    recalculatePagination() {
        this.totalPages = Math.ceil(this.allOpportunities.length / this.pageSize);
        this.pageNumber = this.totalPages > 0 ? 1 : 0;
        this.setPageData();
    }

    clearOpportunities() {
        this.allOpportunities = [];
        this.opportunities = [];
        this.pageNumber = 0;
        this.totalPages = 0;
    }

    async markAsClosed(opportunity) {
        try {
            const response = await closeOpportunity({ idOpp : opportunity.idOpp });

            if(response.type == 'success'){
                const updatedFields = {
                    buttonVariant: 'neutral',
                    isClosed: true,
                    stageName: 'Closed Won'
                };

                this.opportunities = this.opportunities.map(
                    opp => opp.idOpp === opportunity.idOpp ? { ...opp, ...updatedFields } : opp
                );

                this.allOpportunities = this.allOpportunities.map(
                    opp => opp.idOpp === opportunity.idOpp ? { ...opp, ...updatedFields } : opp
                );
            }

            this.showToast('Resultado', response.message, response.type);
        } catch (e) {
            this.showToast('Erro', e.body?.message || e.message, 'error');
        }
    }

    async handleChangeFilter(event){

        const accountName = event.target.value;

        try {
            const response = await getOpportunitiesByAccountFilter({ accountName : accountName });

            if(response.length  === 0){
                this.clearOpportunities();
                return;
            }

            this.processOpportunities(response);
            this.recalculatePagination();
        } catch (e) {
            this.showToast('Erro', e.body?.message || e.message, 'error');
        }

    }

    showToast(title, message, variant = 'info'){
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}