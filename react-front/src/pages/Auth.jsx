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
      // Preusmeri prema tipu korisnika
      if (user.role === "admin") navigate("/admin/stats");
      else if (user.tip === "patron") navigate("/home-patron");
      else if (user.tip === "kreator") navigate("/home-creator");
      else if (user.tip === "oba") navigate("/home-patron");
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

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <Paper withBorder shadow="md" p={30} radius="md" style={{ width: "100%", maxWidth: 450 }}>
        <Title order={2} mb="md">
          Dobrodošli
        </Title>
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List grow>
            <Tabs.Tab value="login">Prijava</Tabs.Tab>
            <Tabs.Tab value="register">Registracija</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="login" pt="lg">
            <form onSubmit={handleLogin}>
              <Stack>
                <TextInput
                  label="Email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
                <PasswordInput
                  label="Lozinka"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <Button type="submit" loading={loading}>Prijavi se</Button>
              </Stack>
            </form>
          </Tabs.Panel>

          <Tabs.Panel value="register" pt="lg">
            <form onSubmit={handleRegister}>
              <Stack>
                <TextInput
                  label="Ime i prezime"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />
                <TextInput
                  label="Email"
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
                <PasswordInput
                  label="Lozinka"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
                {/* Opciono: Select za tip */}
                <Text size="sm">Tip korisnika</Text>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    variant={regTip === "patron" ? "filled" : "light"}
                    onClick={() => setRegTip("patron")}
                    compact
                  >
                    Patron
                  </Button>
                  <Button
                    variant={regTip === "kreator" ? "filled" : "light"}
                    onClick={() => setRegTip("kreator")}
                    compact
                  >
                    Kreator
                  </Button>
                  <Button
                    variant={regTip === "oba" ? "filled" : "light"}
                    onClick={() => setRegTip("oba")}
                    compact
                  >
                    Oba
                  </Button>
                </div>
                <Button type="submit" loading={loading}>Registruj se</Button>
              </Stack>
            </form>
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </div>
  );
}