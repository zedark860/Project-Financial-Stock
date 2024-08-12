export interface EstoqueFinanceiroBase {
    id: number;
    data_modificacao: string;
    produto: string;
}

export interface EstoqueFinanceiroMes extends EstoqueFinanceiroBase {
    id_total: number;
    movimento: string;
    quantidade: number;
    destino_origem: string;
    responsavel: string;
    observacao: string;
}

export interface EstoqueFinanceiroTotal extends EstoqueFinanceiroBase {
    unidade: string;
    vencimento: Date;
    entrada: number;
    saida: number;
    saldo: number;
    setor: string;
}