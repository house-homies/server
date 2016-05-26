CREATE TABLE messages (
    id INT NOT NULL AUTO_INCREMENT,
    room_id INT NOT NULL,
    body TEXT NOT NULL,
    PRIMARY KEY (`id`),
);
