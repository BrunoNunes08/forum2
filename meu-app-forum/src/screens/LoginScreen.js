import React, { useState, useContext } from "react";
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
import AuthContext from "../context/AuthContext";

const LoginScreen = ({ navigation }) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const { signIn } = useContext(AuthContext);

  const handleLogin = async () => {
    try {
      const response = await api.post("/auth/login", { identifier, password });
      Alert.alert("Sucesso!", "Login realizado com sucesso");
      //chamar signin para salvar/atualizar o token global
      await signIn(response.data.token, response.data.user);
      //não preciso redirecionar pois o appnavigator já o faz
    } catch (e) {
      console.error("Erro no login", e.response?.data || e.message);
      Alert.alert("Erro no login", "Ocorreu um erro ao logar :(");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}> Bem-vindo! </Text>
      <TextInput
        style={styles.input}
        placeholder="Usuário ou Email"
        value={identifier}
        onChangeText={setIdentifier}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Entrar" onPress={handleLogin} />
      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.registerText}>Não tem uma conta? Cadastre-se</Text>
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
  registerText: {
    marginTop: 20,
    color: "#007bff",
    textDecorationLine: "underline",
  },
});

export default LoginScreen;
