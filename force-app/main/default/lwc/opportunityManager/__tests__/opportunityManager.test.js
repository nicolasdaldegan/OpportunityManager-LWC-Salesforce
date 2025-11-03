import { createElement } from '@lwc/engine-dom';
import { ShowToastEventName } from 'lightning/platformShowToastEvent';
import { mockNavigate } from 'lightning/navigation';

import OpportunityManager from 'c/opportunityManager';

import getAllOpportunities from '@salesforce/apex/OpportunityController.getAllOpportunities';
import closeOpportunity from '@salesforce/apex/OpportunityController.closeOpportunity';
import getOpportunitiesByAccountFilter from '@salesforce/apex/OpportunityController.getOpportunitiesByAccountFilter';

jest.mock(
  '@salesforce/apex/OpportunityController.getAllOpportunities',
  () => {
    const { createApexTestWireAdapter } = require('@salesforce/sfdx-lwc-jest');
    return {
      default: createApexTestWireAdapter(jest.fn()),
    };
  },
  { virtual: true }
);

jest.mock(
    '@salesforce/apex/OpportunityController.closeOpportunity',
    () => ({
        default: jest.fn()
    }),
    { virtual: true }
);
jest.mock(
    '@salesforce/apex/OpportunityController.getOpportunitiesByAccountFilter',
    () => ({
        default: jest.fn()
    }),
    { virtual: true }
);

jest.mock('lightning/navigation', () => {
    const mockNavigate = jest.fn();
    return {
        NavigationMixin: (Base) => {
            return class extends Base {
                [require('lightning/navigation').NavigationMixin.Navigate](config) {
                    mockNavigate(config);
                }
            };
        },
        CurrentPageReference: jest.fn(),
        mockNavigate
    };
});

const mockOpps = [
    { idOpp: '1', name: 'Opp 1', stageName: 'Prospecting', amount: 1000, closeDate: '2025-11-03', isClosed: false },
    { idOpp: '2', name: 'Opp 2', stageName: 'Closed Won', amount: 2000, closeDate: '2025-12-01', isClosed: true }
];

async function flushPromises() {
    return Promise.resolve();
}

describe('c-opportunity-manager', () => {

    let element;

    beforeEach(() => {
        element = createElement('c-opportunity-manager', { is: OpportunityManager });
        document.body.appendChild(element);
    });

    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
    });

    it('renderiza spinner inicialmente e depois tabela com oportunidades', async () => {
        let spinner = element.shadowRoot.querySelector('lightning-spinner');
        expect(spinner).not.toBeNull();

        getAllOpportunities.emit(mockOpps);

        await flushPromises();

        spinner = element.shadowRoot.querySelector('lightning-spinner');
        expect(spinner).toBeNull();

        const datatable = element.shadowRoot.querySelector('lightning-datatable');
        expect(datatable).not.toBeNull();

        expect(datatable.data).toHaveLength(2);
        expect(datatable.data[0].name).toBe('Opp 1');
    });

    it('mostra mensagem de erro se o wire retornar erro', async () => {
        const handler = jest.fn();
        element.addEventListener('lightning__showtoast', handler);

        getAllOpportunities.error({ body: { message: 'Erro simulado' } });

        await flushPromises();

        expect(handler).toHaveBeenCalled();
        const evt = handler.mock.calls[0][0];
        expect(evt.detail.title).toBe('Erro');
        expect(evt.detail.variant).toBe('error');
    });

    it('executa filtro com resultado', async () => {
        getAllOpportunities.emit(mockOpps);
        await flushPromises();

        getOpportunitiesByAccountFilter.mockResolvedValue([
            { idOpp: '1', name: 'Filtrada', stageName: 'Prospecting', isClosed: false, amount: 120 }
        ]);

        const input = element.shadowRoot.querySelector('lightning-input');
        input.value = 'Conta X';
        input.dispatchEvent(new Event('change'));
        await flushPromises();

        expect(getOpportunitiesByAccountFilter).toHaveBeenCalledWith({ accountName: 'Conta X' });

        const datatable = element.shadowRoot.querySelector('lightning-datatable');
        expect(datatable).not.toBeNull();
        expect(datatable.data.length).toBe(1);
        expect(datatable.data[0].name).toBe('Filtrada');
    });

    it('limpa oportunidades quando filtro retorna vazio', async () => {
        getAllOpportunities.emit(mockOpps);
        await flushPromises();

        getOpportunitiesByAccountFilter.mockResolvedValue([]);

        const input = element.shadowRoot.querySelector('lightning-input');
        input.value = 'Nada';
        input.dispatchEvent(new Event('change'));
        await flushPromises();

        const msg = element.shadowRoot.querySelector('.slds-text-color_weak');
        
        expect(msg).not.toBeNull();
        expect(msg.textContent).toContain('Nenhuma oportunidade');
    });

    it('testa navegação entre páginas', async () => {
        const manyOpps = Array.from({ length: 12 }).map((_, i) => ({
            idOpp: String(i + 1),
            name: `Opp ${i + 1}`,
            stageName: 'Prospecting',
            IsClosed: false
        }));

        const adapter = getAllOpportunities;
        adapter.emit(manyOpps);
        await flushPromises();

        const pageInfo = element.shadowRoot.querySelector('.slds-m-horizontal_medium');
        expect(pageInfo).not.toBeNull();
        expect(pageInfo.textContent).toContain('Página 1 de');

        const nextButton = element.shadowRoot.querySelector('lightning-button[data-id="next"]');
        nextButton.click();
        await flushPromises();
        expect(pageInfo.textContent).toContain('Página 2 de');

        const prevButton = element.shadowRoot.querySelector('lightning-button[data-id="prev"]');
        prevButton.click();
        await flushPromises();
        expect(pageInfo.textContent).toContain('Página 1 de');
    });

    it('navega ao clicar em "Ver Detalhes"', async () => {
        const adapter = getAllOpportunities;
        adapter.emit(mockOpps);
        await flushPromises();

        const datatable = element.shadowRoot.querySelector('lightning-datatable');
        expect(datatable).not.toBeNull();

        datatable.dispatchEvent(
            new CustomEvent('rowaction', {
                detail: {
                    action: { name: 'view_details' },
                    row: { idOpp: '1' }
                },
                bubbles: true,
                composed: true
            })
        );

        await flushPromises();

        expect(mockNavigate).toHaveBeenCalled();
        expect(mockNavigate.mock.calls[0][0].attributes.recordId).toBe('1');
    });

    it('marca oportunidade como fechada', async () => {
        getAllOpportunities.emit(mockOpps);
        await flushPromises();

        closeOpportunity.mockResolvedValue({ type: 'success', message: 'Fechada com sucesso' });

        const datatable = element.shadowRoot.querySelector('lightning-datatable');
        expect(datatable).not.toBeNull();

        datatable.dispatchEvent(
            new CustomEvent('rowaction', {
                detail: {
                    action: { name: 'mark_closed' },
                    row: mockOpps[0]
                },
                bubbles: true,
                composed: true
            })
        );

        await flushPromises();

        expect(closeOpportunity).toHaveBeenCalledWith({ idOpp: '1' });
        expect(datatable.data[0].isClosed).toBe(true);
        expect(datatable.data[0].buttonVariant).toBe('neutral');
        expect(datatable.data[0].stageName).toBe('Closed Won');
    });

     it('exibe toast de erro ao falhar em marcar como fechada', async () => {
        getAllOpportunities.emit(mockOpps);
        await flushPromises();

        closeOpportunity.mockRejectedValue({ body: { message: 'Falha ao fechar' } });

        const handler = jest.fn();
        element.addEventListener('lightning__showtoast', handler);

        const datatable = element.shadowRoot.querySelector('lightning-datatable');
        datatable.dispatchEvent(
            new CustomEvent('rowaction', {
                detail: {
                    action: { name: 'mark_closed' },
                    row: mockOpps[0]
                },
                bubbles: true,
                composed: true
            })
        );

        await flushPromises();

        expect(closeOpportunity).toHaveBeenCalled();
        expect(handler).toHaveBeenCalled();

        const evt = handler.mock.calls[0][0];
        expect(evt.detail.title).toBe('Erro');
        expect(evt.detail.message).toBe('Falha ao fechar');
        expect(evt.detail.variant).toBe('error');
    });

    it('exibe erro ao falhar filtro', async () => {
        getAllOpportunities.emit(mockOpps);
        await flushPromises();

        getOpportunitiesByAccountFilter.mockRejectedValue({ body: { message: 'Erro no filtro' } });

        const handler = jest.fn();
        element.addEventListener('lightning__showtoast', handler);

        const input = element.shadowRoot.querySelector('lightning-input');
        input.value = 'Conta Y';
        input.dispatchEvent(new Event('change'));
        await flushPromises();

        expect(getOpportunitiesByAccountFilter).toHaveBeenCalled();
        expect(handler).toHaveBeenCalled();

        const evt = handler.mock.calls[0][0];
        expect(evt.detail.title).toBe('Erro');
        expect(evt.detail.message).toBe('Erro no filtro');
        expect(evt.detail.variant).toBe('error');
    });

    it('define corretamente as colunas no datatable', async () => {
        const element = createElement('c-opportunity-manager', { is: OpportunityManager });
        document.body.appendChild(element);

        getAllOpportunities.emit(mockOpps);
        await flushPromises();

        const datatable = element.shadowRoot.querySelector('lightning-datatable');
        expect(datatable).not.toBeNull();

        const cols = datatable.columns;
        expect(cols).toBeDefined();
        expect(cols.length).toBeGreaterThan(0);

        const detailsBtn = cols.find(
            c => c.typeAttributes && c.typeAttributes.name === 'view_details'
        );
        expect(detailsBtn).toBeDefined();

        const closeBtn = cols.find(
            c => c.typeAttributes && c.typeAttributes.name === 'mark_closed'
        );
        expect(closeBtn).toBeDefined();
    });

});
