import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage'
//npx expo install @react-native-async-storage/async-storage

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    //isLoading é para carregar o token ao iniciar

    //função pra salvar o token e o usuario se necessário
    const signIn = async (token, userData) => {
        try {
            await AsyncStorage.setItem('userToken', token)
            setUserToken(token)
        } catch (e) {
            console.error('Erro ao salvar token/dados no AsyncStorage', e)
        }
    }

    const signOut = async () => {
        try {
            console.log('AuthContext: Iniciando signOut(). Removendo token.');
            await AsyncStorage.removeItem('userToken')
            setUserToken(null)
            console.log('usertoken definido para null e asyncstorage limpo');
        } catch (e) {
            console.error('AuthContext: Erro no signOut(). Remover token falhou.', e);
        }
    }

    //função que carrega o token sempre que inicia o app
    useEffect(() => {
        const loadToken = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken')
                if (token) {
                    setUserToken(token)
                }
            } catch (e) {
                console.error('Erro ao carregar token', e)
            } finally {
                setIsLoading(false)
            }
        }

        loadToken()
    }, [])

    return (
        <AuthContext.Provider value={{ userToken, isLoading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}
export default AuthContext