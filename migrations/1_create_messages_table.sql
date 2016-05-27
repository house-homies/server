CREATE TABLE messages (
    id SERIAL NOT NULL,
    room_id INT NOT NULL,
    name TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP default current_timestamp,
    PRIMARY KEY (id)
);
