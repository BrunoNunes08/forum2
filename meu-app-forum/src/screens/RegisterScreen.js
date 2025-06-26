import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    Alert,
    TouchableOpacity,
} from "react-native";
import api from "../services/api";

const RegisterScreen = ({ navigation }) => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async () => {
        try {
            const response = await api.post("/auth/register", {
                username,
                email,
                password,
            });
            Alert.alert("Sucesso", "Usuário Cadastrado com Sucesso!");
            navigation.navigate("Login");
        } catch (err) {
            const errorMessage = err.response?.data ?? err.message;
            console.error("Erro no cadastro", errorMessage);
            Alert.alert(
                "Erro no cadastro",
                errorMessage ?? "Erro ao cadastrar"
            );
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Crie sua Conta</Text>
            <TextInput
                style={styles.input}
                placeholder="Nome de Usuário"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Button title="Cadastrar" onPress={handleRegister} />
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginText}>
                    Já possui uma conta? Faça login
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#f5f5f5",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 30,
        color: "#333",
    },
    input: {
        width: "100%",
        padding: 15,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        marginBottom: 15,
        backgroundColor: "#fff",
    },
    loginText: {
        marginTop: 20,
        color: "#007bff",
        textDecorationLine: "underline",
    },
});

export default RegisterScreen;