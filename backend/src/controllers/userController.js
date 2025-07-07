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

// obter posts favoritados do usuário logado

exports.getMyFavoritePosts = async (req, res) => {
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
            JOIN favorites f ON p.id = f.post_id
            JOIN users u ON p.user_id = u.id
            WHERE f.user_id = ?
            ORDER BY f.created_at DESC
        `,
            [userId]
        );

        res.status(200).json(rows);
    } catch (err) {
        console.error("Erro ao buscar posts favoritos", err);
        res.status(500).json({
            message: "Erro interno do server",
        });
    }
};

exports.updateProfile = async (req, res) => {
    const userId = req.user.id;
    const { username, email, old_password, new_password, profile_picture_url } =
        req.body;

    try {
        let updateQuery = "UPDATE users SET ";
        const updateValue = [];
        const fieldsToUpdate = [];

        // Busca o usuário para verificar a senha antiga
        const [users] = await pool.query(
            "SELECT password FROM users WHERE id = ?",
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "Usuário não encontrado",
                success: false,
            });
        }

        const [user] = users;

        if (username && username.trim() !== "") {
            const [existingUsername] = await pool.query(
                "SELECT id FROM users WHERE username = ? AND id != ?",
                [username, userId]
            );
            if (existingUsername.length > 0) {
                return res.status(409).json({
                    message: "Nome de usuário já existente",
                    success: false,
                });
            }
            fieldsToUpdate.push("username = ?");
            updateValue.push(username);
        }

        if (email && email.trim() !== "") {
            const [existingEmail] = await pool.query(
                "SELECT id FROM users WHERE email = ? AND id != ?",
                [email, userId]
            );
            if (existingEmail.length > 0) {
                return res.status(409).json({
                    message: "Email já existente",
                    success: false,
                });
            }
            fieldsToUpdate.push("email = ?");
            updateValue.push(email);
        }

        if (profile_picture_url !== undefined) {
            fieldsToUpdate.push("profile_picture_url = ?");
            updateValue.push(profile_picture_url || null);
        }

        if (new_password) {
            if (!old_password) {
                return res.status(400).json({
                    message:
                        "Senha antiga é obrigatória para atualizar a senha!",
                });
            }

            const isPasswordValid = await bcrypt.compare(
                old_password,
                user.password
            );

            if (!isPasswordValid) {
                return res.status(401).json({
                    message: "Senha antiga incorreta!",
                });
            }

            const hashedPassword = await bcrypt.hash(new_password, 10);
            fieldsToUpdate.push("password = ?");
            updateValue.push(hashedPassword);
        }

        if (fieldsToUpdate.length === 0) {
            return res.status(400).json({
                message: "Nenhum campo para atualizar fornecido",
            });
        }

        updateQuery += fieldsToUpdate.join(", ") + " WHERE id = ?";
        updateValue.push(userId);

        await pool.query(updateQuery, updateValue);

        res.status(200).json({ message: "Perfil atualizado!" });
    } catch (err) {
        console.error("Erro ao atualizar", err);
        res.status(500).json({ message: "Erro ao atualizar" });
    }
};
