const HTTPserver = require('./io');

HTTPserver.listen(process.env.PORT || 3000, () => console.log(`server is running on http://localhost:${process.env.PORT || 3000}/`))
