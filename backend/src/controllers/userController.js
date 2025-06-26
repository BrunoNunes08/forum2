const pool = require("../../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWT_SECRET || "senhajwt";

exports.getMe = async (req, res) => {
    const userId = req.user.id;

    try {
        const [rows] = await pool.query(
            "SELECT id, username, email, profile_picture_url, created_at FROM users WHERE id = ?;",
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Usuário não encontrado",
            });
        }

        res.status(200).json(rows[0]);
    } catch (err) {
        console.error("Erro ao buscar usuários", err);
        res.status(500).json({
            message: "Erro interno do server",
        });
    }
};

exports.getMyPosts = async (req, res) => {
    const userId = req.user.id;

    try {
        const [rows] = await pool.query(
            `
            SELECT
                p.id, p.title, p.content, p.image_url, p.created_at, p.updated_at,
                u.id AS user_id, u.username, u.profile_picture_url,
                (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS likes_count,
                (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comments_count,
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.user_id = ?
            ORDER BY p.created_at DESC
        `,
            [userId]
        );

        res.status(200).json(rows);
    } catch (err) {
        console.error("Erro ao buscar posts", err);
        res.status(500).json({
            message: "Erro interno do server",
        });
    }
};
