export const markdownTableExample = `| Name | Description | Example | Nullable |
|-|-|-|-|
| id | - | 1 | false |
| name | - | d3fau1t | false |
| age | - | 30 | true |
| email | - | T00LK1T@d3fau1t.net | true |
| phone | - | +821012349876 | true |
| address | - | 1234 Main St. | true |`

export const markdownTableStringExample = `\`\`\`Name       Description    Example                Nullable
id         -              1                      false   
name       -              d3fau1t                false   
age        -              30                     true    
email      -              T00LK1T@d3fau1t.net    true    
phone      -              +821012349876          true    
address    -              1234 Main St.          true    
\`\`\``

export const queryInputExample = `SELECT DISTINCT healthcheck_goods.id, healthcheck_goods.name, healthcheck_goods.goods_type, healthcheck_goods.price, healthcheck_goods.cost, healthcheck_center.id AS id_1
FROM healthcheck_goods JOIN healthcheck_goods_detail ON healthcheck_goods.id = healthcheck_goods_detail.healthcheck_goods_id JOIN healthcheck_center_customers_mapping ON healthcheck_goods.healthcheck_center_customers_mapping_id = healthcheck_center_customers_mapping.id JOIN customers ON healthcheck_center_customers_mapping.customers_id = customers.id JOIN customers_by_years ON healthcheck_center_customers_mapping.customers_by_years_id = customers_by_years.id JOIN healthcheck_center_by_years ON healthcheck_center_customers_mapping.healthcheck_center_by_years_id = healthcheck_center_by_years.id JOIN healthcheck_center ON healthcheck_center_by_years.healthcheck_center_id = healthcheck_center.id JOIN company ON customers.company_id = company.id JOIN healthcheck_item_name ON healthcheck_center_customers_mapping.id = healthcheck_item_name.healthcheck_center_customers_mapping_id JOIN healthcheck_item ON healthcheck_item_name.healthcheck_item_id = healthcheck_item.id
WHERE healthcheck_center.id = 1 AND healthcheck_goods.goods_type = 21 AND healthcheck_goods.use_yn = 1 AND healthcheck_item.use_yn = 1 ORDER BY healthcheck_goods.id DESC`

export const queryOutputExample = `SELECT DISTINCT healthcheck_goods.id,
                healthcheck_goods.name,
                healthcheck_goods.goods_type,
                healthcheck_goods.price,
                healthcheck_goods.cost,
                healthcheck_center.id AS id_1
FROM healthcheck_goods
JOIN healthcheck_goods_detail ON healthcheck_goods.id = healthcheck_goods_detail.healthcheck_goods_id
JOIN healthcheck_center_customers_mapping ON healthcheck_goods.healthcheck_center_customers_mapping_id = healthcheck_center_customers_mapping.id
JOIN customers ON healthcheck_center_customers_mapping.customers_id = customers.id
JOIN customers_by_years ON healthcheck_center_customers_mapping.customers_by_years_id = customers_by_years.id
JOIN healthcheck_center_by_years ON healthcheck_center_customers_mapping.healthcheck_center_by_years_id = healthcheck_center_by_years.id
JOIN healthcheck_center ON healthcheck_center_by_years.healthcheck_center_id = healthcheck_center.id
JOIN company ON customers.company_id = company.id
JOIN healthcheck_item_name ON healthcheck_center_customers_mapping.id = healthcheck_item_name.healthcheck_center_customers_mapping_id
JOIN healthcheck_item ON healthcheck_item_name.healthcheck_item_id = healthcheck_item.id
WHERE healthcheck_center.id = 1
  AND healthcheck_goods.goods_type = 21
  AND healthcheck_goods.use_yn = 1
  AND healthcheck_item.use_yn = 1
ORDER BY healthcheck_goods.id DESC`
