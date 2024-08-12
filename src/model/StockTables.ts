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
        sqlAll: `SELECT * FROM estoquefinanceiro_mes ORDER BY id DESC;`,
        sqlAuxId: `SELECT id FROM estoquefinanceiro_total WHERE produto = ?;`,
        sqlInsert: `
            INSERT INTO estoquefinanceiro_mes (id_total, data_modificacao, produto, movimento, quantidade, destino_origem, responsavel, observacao) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        sqlUpdate: `                
            UPDATE estoquefinanceiro_mes 
            SET ? 
            WHERE id = ?;`,
        sqlDelete: `DELETE FROM estoquefinanceiro_mes WHERE id = ?;`,
        sqlCheck: `SELECT 1 FROM estoquefinanceiro_mes WHERE id = ?`,
    },
    estoquefinanceiro_total: {
        sqlAll: `SELECT * FROM estoquefinanceiro_total ORDER BY id DESC;`,
        sqlAuxId: ``,
        sqlInsert: `
            INSERT INTO estoquefinanceiro_total (data_modificacao, produto, unidade, vencimento, entrada, saida, saldo, setor) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        sqlUpdate: `
            UPDATE estoquefinanceiro_total 
            SET ?
            WHERE id = ?;`,
        sqlDelete: `DELETE FROM estoquefinanceiro_total WHERE id = ?;`,
        sqlCheck: `SELECT 1 FROM estoquefinanceiro_total WHERE id = ?`,
    }
};
