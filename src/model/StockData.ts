export interface EstoqueFinanceiroBase {
    id: number;
    datamodificacao: string;
    produto: string;
}

export interface EstoqueFinanceiroMes extends EstoqueFinanceiroBase {
    id_total: number;
    movimentos_mes: string;
    quantidade_mes: number;
    destino_origem_mes: string;
    responsavel_mes: string;
    observacoes_mes: string;
}

export interface EstoqueFinanceiroTotal extends EstoqueFinanceiroBase {
    unidade_total: string;
    vencimento_total: Date;
    entrada_total: number;
    saida_total: number;
    saldo_total: number;
    setor_total: string;
}