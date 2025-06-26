CREATE DATABASE forum_db;
USE forum_db;

CREATE TABLE users(
	id int auto_increment primary key,
    username varchar(255) unique not null,
    email varchar(255) unique not null,
    password varchar(255) not null,
    profile_picture_url varchar(255),
    created_at timestamp default now()
);

CREATE TABLE posts(
	id int auto_increment primary key,
    user_id int not null,
    title varchar(255) not null,
    content text,
    image_url varchar(255),
    created_at timestamp default now(),
    updated_at timestamp default now() on update now(),
    foreign key (user_id) references users(id) on delete cascade
);

CREATE TABLE comments(
	id int auto_increment primary key,
    user_id int not null,
    post_id int not null,
    content text not null,
    created_at timestamp default now(),
    updated_at timestamp default now() on update now(),
    foreign key (user_id) references users(id) on delete cascade,
    foreign key (post_id) references posts(id) on delete cascade
);

CREATE TABLE likes (
	id int auto_increment primary key,
    user_id int not null,
    post_id int not null,
    created_at timestamp default now(),
    foreign key (user_id) references users(id) on delete cascade,
    foreign key (post_id) references posts(id) on delete cascade,
    unique(user_id, post_id)
);

CREATE TABLE favorites (
	id int auto_increment primary key,
    user_id int not null,
    post_id int not null,
    created_at timestamp default now(),
    foreign key (user_id) references users(id) on delete cascade,
    foreign key (post_id) references posts(id) on delete cascade,
    unique(user_id, post_id)
);