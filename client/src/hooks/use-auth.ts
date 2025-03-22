
import { useState, useEffect } from "react";
import { useToast } from "./use-toast";
import { apiRequest, queryClient } from "../lib/queryClient";

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const { toast } = useToast();

    useEffect(() => {
        // Fetch user on mount
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/user', {
                    credentials: 'include'
                });
                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };
        fetchUser();
    }, []);

    const loginMutation = {
        mutate: async (data) => {
            try {
                const response = await apiRequest('POST', '/api/login', data);
                const userData = await response.json();
                setUser(userData);
                toast({
                    title: "Success",
                    description: "Logged in successfully",
                });
                return userData;
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to login. Please check your credentials.",
                    variant: "destructive",
                });
                throw error;
            }
        },
    };

    const registerMutation = {
        mutate: async (data) => {
            try {
                const response = await apiRequest('POST', '/api/register', data);
                const userData = await response.json();
                setUser(userData);
                toast({
                    title: "Success",
                    description: "Registered successfully",
                });
                return userData;
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to register. Please try again.",
                    variant: "destructive",
                });
                throw error;
            }
        },
    };

    const redirectToDashboard = () => {
        return "/dashboard";
    };

    return { user, loginMutation, registerMutation, redirectToDashboard };
};
