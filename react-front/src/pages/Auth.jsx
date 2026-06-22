import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Paper,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Tabs,
  Text,
  Stack,
  Group,
  Divider,
  Box,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import api from "../api/api";
import { saveAuth } from "../utils/auth";

export default function Auth() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regTip, setRegTip] = useState("patron");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/login", {
        email: loginEmail,
        password: loginPassword,
      });
      const { user, token } = res.data;
      saveAuth({ user, token });
      notifications.show({ title: "Uspeh", message: "Prijavljeni ste", color: "green" });
      if (user.role === "admin") navigate("/admin/stats");
      else if (user.tip === "patron") navigate("/home-patron");
      else if (user.tip === "kreator") navigate("/home-creator");
      else navigate("/");
    } catch (err) {
      notifications.show({ title: "Greška", message: "Neispravni podaci", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/register", {
        name: regName,
        email: regEmail,
        password: regPassword,
        tip: regTip,
      });
      notifications.show({ title: "Uspeh", message: "Registracija uspešna, sada se prijavite", color: "green" });
      setActiveTab("login");
      setLoginEmail(regEmail);
      setRegPassword("");
    } catch (err) {
      notifications.show({ title: "Greška", message: "Registracija nije uspela", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    navigate("/guest-home");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Group grow align="stretch" style={{ maxWidth: 1000, width: "100%" }}>
        {/* Leva kolona – info i gost */}
        <Paper withBorder shadow="md" p={30} radius="md" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <img src="/logo512.png" alt="Patron Star" style={{ width: 180, marginBottom: 24 }} />
            <Title order={2} mb="sm">Podržite kreatore</Title>
            <Text size="sm" c="dimmed" mb="lg">
              Patron Star platforma povezuje kreatore i njihove pratioce. 
              Pretplatite se na ekskluzivni sadržaj, podržite rad svojih omiljenih autora i budite deo zajednice.
            </Text>
          </div>
          <Button variant="light" size="md" onClick={handleGuest} fullWidth>
            Nastavi kao gost
          </Button>
        </Paper>

        {/* Desna kolona – login/registracija */}
        <Paper withBorder shadow="md" p={30} radius="md" style={{ width: "100%", maxWidth: 450 }}>
          <Title order={2} mb="md">Dobrodošli</Title>
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List grow>
              <Tabs.Tab value="login">Prijava</Tabs.Tab>
              <Tabs.Tab value="register">Registracija</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="login" pt="lg">
              <form onSubmit={handleLogin}>
                <Stack>
                  <TextInput label="Email" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                  <PasswordInput label="Lozinka" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                  <Button type="submit" loading={loading}>Prijavi se</Button>
                </Stack>
              </form>
            </Tabs.Panel>

            <Tabs.Panel value="register" pt="lg">
              <form onSubmit={handleRegister}>
                <Stack>
                  <TextInput label="Ime i prezime" value={regName} onChange={(e) => setRegName(e.target.value)} required />
                  <TextInput label="Email" type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
                  <PasswordInput label="Lozinka" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
                  <Text size="sm">Tip korisnika</Text>
                  <Group grow>
                    <Button variant={regTip === "patron" ? "filled" : "light"} onClick={() => setRegTip("patron")} compact>Patron</Button>
                    <Button variant={regTip === "kreator" ? "filled" : "light"} onClick={() => setRegTip("kreator")} compact>Kreator</Button>
                    
                  </Group>
                  <Button type="submit" loading={loading}>Registruj se</Button>
                </Stack>
              </form>
            </Tabs.Panel>
          </Tabs>
        </Paper>
      </Group>
    </div>
  );
}