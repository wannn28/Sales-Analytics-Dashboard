-- Deterministic, idempotent demo data. Amounts use exact decimal cents.
INSERT INTO employees VALUES
 (1,'Armin A.','AA','#bca68a',118,0.84),
 (2,'Mikasa A.','MA','#40c6df',103,0.89),
 (3,'Eren Y.','EY','#c89d65',84,0.79),
 (4,'Levi A.','LA','#868b86',40,0.82) ON CONFLICT DO NOTHING;
INSERT INTO platforms VALUES (1,'Dribbble'),(2,'Instagram'),(3,'Behance'),(4,'Google'),(5,'Other') ON CONFLICT DO NOTHING;
INSERT INTO customers VALUES (1,'Rolf Inc.'),(2,'Cargo2go'),(3,'Cloud3r'),(4,'Idioma'),(5,'Syllables'),(6,'North Studio') ON CONFLICT DO NOTHING;
WITH targets(employee_id, total, count) AS (VALUES (1,209633.00,80),(2,156841.00,72),(3,117115.00,54),(4,45387.82,22)),
raw AS (
 SELECT t.*, n, CASE WHEN n=1 THEN 42300.00 ELSE trunc((total-42300)/(count-1),2) END AS base
 FROM targets t CROSS JOIN LATERAL generate_series(1,t.count) n
)
INSERT INTO deals (id, employee_id, platform_id, customer_id, amount, status, closed_at)
SELECT employee_id*1000+n, employee_id,
 CASE WHEN n%100<43 THEN 1 WHEN n%100<70 THEN 2 WHEN n%100<81 THEN 3 WHEN n%100<96 THEN 4 ELSE 5 END,
 CASE WHEN n=1 THEN 1 ELSE n%5+2 END,
 CASE WHEN n=count THEN total-42300-trunc((total-42300)/(count-1),2)*(count-2) ELSE base END,
 'won', DATE '2023-09-01' + ((n*37+employee_id*11)%91)
FROM raw ON CONFLICT DO NOTHING;
-- Balance acquisition channels across the whole team.
UPDATE deals SET platform_id = CASE WHEN (id*17)%100<43 THEN 1 WHEN (id*17)%100<70 THEN 2 WHEN (id*17)%100<81 THEN 3 WHEN (id*17)%100<96 THEN 4 ELSE 5 END
WHERE id BETWEEN 1001 AND 4022;
INSERT INTO deals
SELECT 10000+n, n%4+1, n%5+1, n%6+1, 250+n*11, 'lost', DATE '2023-09-01'+n%91
FROM generate_series(1,285) n ON CONFLICT DO NOTHING;
WITH raw AS (SELECT n, trunc(501641.73/240,2) amount FROM generate_series(1,240) n)
INSERT INTO deals
SELECT 20000+n, n%4+1, n%5+1, n%6+1,
CASE WHEN n=240 THEN 501641.73-trunc(501641.73/240,2)*239 ELSE amount END,
'won', DATE '2023-06-01'+((n*13)%92) FROM raw ON CONFLICT DO NOTHING;
