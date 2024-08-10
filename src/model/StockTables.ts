export interface SQLCommands {
    sqlAll: string;
    sqlAuxId: string;
    sqlInsert: string;
    sqlUpdate: string;
    sqlDelete: string;
    sqlCheck: string;
}

export interface Tables {
    estoquefinanceiro_mes: SQLCommands;
    estoquefinanceiro_total: SQLCommands;
}

export const comandsTables: Tables = {
    estoquefinanceiro_mes: {
        sqlAll: `SELECT * FROM estoquefinanceiro_mes ORDER BY id_mes DESC;`,
        sqlAuxId: `SELECT id_total FROM estoquefinanceiro_total WHERE produto_total = ?;`,
        sqlInsert: `
            INSERT INTO estoquefinanceiro_mes (id_total, datamodificacao_mes, produto_mes, quantidade_mes, destino_origem_mes, responsavel_mes, observacoes_mes) 
            VALUES (?, ?, ?, ?, ?, ?, ?);`,
        sqlUpdate: `UPDATE estoquefinanceiro_mes SET ? WHERE id_mes = ?;`,
        sqlDelete: `DELETE FROM estoquefinanceiro_mes WHERE id_mes = ?;`,
        sqlCheck: `SELECT 1 FROM estoquefinanceiro_mes WHERE id_mes = ?`,
    },
    estoquefinanceiro_total: {
        sqlAll: `SELECT * FROM estoquefinanceiro_total ORDER BY id_total DESC;`,
        sqlAuxId: ``,
        sqlInsert: `
            INSERT INTO estoquefinanceiro_total (datamodificacao_total, unidade_total, vencimento_total, entrada_total, saida_total, saldo_total, setor_total) 
            VALUES (?, ?, ?, ?, ?, ?, ?);`,
        sqlUpdate: `UPDATE estoquefinanceiro_total SET ? WHERE id_total = ?;`,
        sqlDelete: `DELETE FROM estoquefinanceiro_total WHERE id_total = ?;`,
        sqlCheck: `SELECT 1 FROM estoquefinanceiro_total WHERE id_total = ?`,
    }
};
