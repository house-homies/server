CREATE TABLE rooms (
    id SERIAL NOT NULL,
    name TEXT NOT NULL,
    aes_key TEXT NOT NULL,
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX name_unique_idx ON rooms (name);
