CREATE TABLE IF NOT EXISTS employees (
 id integer PRIMARY KEY, name text NOT NULL, initials text NOT NULL, color text NOT NULL,
 leads integer NOT NULL CHECK (leads >= 0), kpi numeric(5,2) NOT NULL
);
CREATE TABLE IF NOT EXISTS platforms (id integer PRIMARY KEY, name text NOT NULL UNIQUE);
CREATE TABLE IF NOT EXISTS customers (id integer PRIMARY KEY, name text NOT NULL);
CREATE TABLE IF NOT EXISTS deals (
 id integer PRIMARY KEY,
 employee_id integer NOT NULL REFERENCES employees(id),
 platform_id integer NOT NULL REFERENCES platforms(id),
 customer_id integer NOT NULL REFERENCES customers(id),
 amount numeric(14,2) NOT NULL CHECK (amount >= 0),
 status text NOT NULL CHECK (status IN ('won', 'lost', 'open')),
 closed_at date NOT NULL
);
CREATE INDEX IF NOT EXISTS deals_date_employee_idx ON deals (closed_at, employee_id);
CREATE INDEX IF NOT EXISTS deals_platform_idx ON deals (platform_id);
CREATE TABLE IF NOT EXISTS users (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 email text NOT NULL UNIQUE, name text NOT NULL, password_hash text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sessions (
 token_hash text PRIMARY KEY,
 user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);
