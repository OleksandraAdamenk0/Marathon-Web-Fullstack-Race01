function executeQuery(connection, query, params = []) {
    return new Promise((resolve, reject) => {
        connection.execute(query, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}

module.exports = executeQuery;