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

export const wordCloudInputExample = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris pharetra gravida libero a malesuada. Cras vitae velit elit. Suspendisse potenti. Cras rutrum sodales justo, consectetur condimentum est. Nam elementum urna ipsum, ut rhoncus ex dapibus a. Nullam eu efficitur lacus, eget vestibulum dolor. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Morbi vel ipsum porta, consectetur ante pretium, molestie nunc. Praesent bibendum ex et massa mattis porttitor.
Integer vel purus augue. Donec cursus nisl id tempus egestas. Sed ac est non elit fringilla vehicula ac eget sem. Nam molestie risus ligula, at lobortis ipsum ultricies pretium. Morbi sed lectus diam. Nam facilisis, velit non imperdiet facilisis, ligula lacus rhoncus nisi, interdum consectetur nisi nibh eget risus. Donec auctor ut nunc a rutrum. Ut dignissim, risus vel interdum imperdiet, risus lectus auctor ligula, et faucibus odio libero eget lorem. Vivamus lacinia venenatis tristique.
Sed elementum nulla eu sem ultrices tempus. Praesent egestas ullamcorper semper. Donec quis mi id diam tincidunt ullamcorper vel nec urna. Vestibulum molestie, ex quis efficitur egestas, lacus lorem bibendum tellus, vitae consequat justo odio sit amet elit. Pellentesque interdum, elit et faucibus sodales, quam magna iaculis eros, ac mollis ex risus sit amet ipsum. Phasellus ac tortor ante. Praesent at pellentesque nisl. Vestibulum non mollis magna. Pellentesque sed rutrum lorem. Praesent vitae dolor vitae libero sodales congue. Sed vel efficitur nibh, in aliquet nisi. Etiam feugiat est at elit aliquam aliquet. Pellentesque odio sem, maximus id urna quis, mollis sodales arcu. Nam maximus aliquet metus, non scelerisque risus pellentesque eget. Aliquam auctor interdum tristique. Proin auctor sapien condimentum lacus bibendum lacinia.
Phasellus vestibulum efficitur nisl id vestibulum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vestibulum porttitor laoreet purus, tincidunt tempus lorem dictum auctor. Integer nisi ex, maximus ut ante nec, efficitur viverra neque. Donec vitae dui eget tortor sollicitudin blandit. Aenean vel neque lacus. Quisque tempus imperdiet odio quis suscipit. Nunc faucibus convallis odio, sit amet tincidunt ex mollis eget.
Ut a efficitur augue, quis dictum lacus. In hac habitasse platea dictumst. Sed non dolor ut tortor semper dapibus. Suspendisse efficitur sodales quam, et commodo leo pharetra nec. Cras congue lectus vitae euismod finibus. Maecenas nec semper odio, sit amet egestas sem. Proin sed eleifend risus, sit amet consectetur leo. Sed bibendum risus vitae ante condimentum consectetur. Praesent varius, leo non rhoncus mollis, metus justo sagittis arcu, vitae mollis elit ante eget lectus. Vivamus convallis ullamcorper diam ut aliquet.`

export const wordCloudStopwordsExample = ``