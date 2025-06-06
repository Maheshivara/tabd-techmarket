CREATE TABLE IF NOT EXISTS payment_by_type(
    tipo TEXT,                
    ano_mes TEXT,             
    data_pagamento TIMESTAMP,
    id_pagamento UUID,
    id_pedido UUID,
    status TEXT,
    valor DECIMAL,
    PRIMARY KEY ((tipo, ano_mes), data_pagamento, id_pagamento)
) WITH CLUSTERING ORDER BY (data_pagamento DESC);