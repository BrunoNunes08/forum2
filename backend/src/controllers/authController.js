const pool = require("../../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWT_SECRET || "senhajwt";

exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Todos os campos são obrigatórios!",
        });
    }

    if (!/[^a-zA-Z0-9]/.test(username)) {
        return res.status(400).json({
            message:
                "Nome de usuário inválido. Não pode conter caracteres especiais!",
        });
    }

    try {
        const [existingUsers] = pool.query(
            "SELECT id FROM users WHERE username = ? OR email = ?",
            [username, email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                message: "Usuário com esse nome ou email já existe!",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
            [username, email, password]
        );

        const token = jwt.sign(
            { id: result.insertId, username: username },
            jwtSecret,
            { expiresIn: "1h" }
        );

        res.status(201).json({
            message: "Usuário registrado com sucesso!",
        });
    } catch (err) {
        console.error("Erro ao cadastrar", err);
        res.status(500).json({
            message: "Erro ao cadastrar",
        });
    }
};

exports.login = async (req, res) => {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
        return res.status(400).json({
            message: "Todos os campos são obrigatórios!",
        });
    }

    try {
        const condition = identifier.contains("@")
            ? "email = ?"
            : "username = ?";
        const [users] = await pool.query(
            `SELECT id, username, password, profile_picture_url FROM users WHERE ${identifier}`,
            [identifier, identifier]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Credenciais inválidas",
            });
        }

        const [user] = users;

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Credenciais inválidas",
            });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            jwtSecret,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "Login, bem sucedido!",
            token,
            user: {
                id: user.id,
                username: user.username,
                profilePictureUrl: user.profile_picture_url,
            },
        });
    } catch (err) {
        console.error("Erro ao logar", err);
        res.status(500).json({
            message: "Erro ao logar",
        });
    }
};
